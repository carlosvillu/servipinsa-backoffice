import { eq, desc, count, sql } from 'drizzle-orm'
import { db } from '~/db'
import {
  workOrders,
  workOrderTasks,
  workOrderLabor,
  workOrderMaterials,
  workOrderValidations,
} from '~/db/schema/work-orders'
import type { UserRole } from '~/db/schema/users'
import type { WorkOrderFormData } from '~/schemas/workOrder'

export type WorkOrderFull = NonNullable<
  Awaited<ReturnType<typeof getWorkOrderById>>
>

export type WorkOrderListItem = {
  id: string
  createdAt: Date
  client: string
  address: string
  createdBy: string
  validationCount: number
}

export type ListWorkOrdersParams = {
  userId: string
  role: UserRole
  page: number
  pageSize: number
}

export type ListWorkOrdersResult = {
  items: WorkOrderListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function listWorkOrders(
  params: ListWorkOrdersParams
): Promise<ListWorkOrdersResult> {
  const { userId, role, page, pageSize } = params
  const whereClause =
    role === 'EMPLEADO' ? eq(workOrders.createdBy, userId) : undefined

  const totalQuery = db.select({ count: count() }).from(workOrders)

  const validationCountSq = db
    .select({
      workOrderId: workOrderValidations.workOrderId,
      validationCount: count().as('validation_count'),
    })
    .from(workOrderValidations)
    .groupBy(workOrderValidations.workOrderId)
    .as('vc')

  const baseQuery = db
    .select({
      id: workOrders.id,
      createdAt: workOrders.createdAt,
      client: workOrders.client,
      address: workOrders.address,
      createdBy: workOrders.createdBy,
      validationCount:
        sql<number>`COALESCE(${validationCountSq.validationCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(workOrders)
    .leftJoin(
      validationCountSq,
      eq(workOrders.id, validationCountSq.workOrderId)
    )
    .orderBy(desc(workOrders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const [countResult, items] = await Promise.all([
    whereClause ? totalQuery.where(whereClause) : totalQuery,
    whereClause ? baseQuery.where(whereClause) : baseQuery,
  ])

  const total = countResult[0].count
  const totalPages = Math.ceil(total / pageSize)

  return { items, total, page, pageSize, totalPages }
}

function timeStringToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

function insertWorkOrderChildren(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  workOrderId: string,
  data: WorkOrderFormData
): Promise<unknown[]> {
  const inserts: Promise<unknown>[] = [
    tx.insert(workOrderTasks).values(
      data.tasks.map((task) => ({
        workOrderId,
        description: task.description,
        startTime: timeStringToDate(task.startTime),
        endTime: timeStringToDate(task.endTime),
      }))
    ),
    tx.insert(workOrderLabor).values(
      data.labor.map((entry) => ({
        workOrderId,
        technicianName: entry.technicianName,
        entryTime: timeStringToDate(entry.entryTime),
        exitTime: timeStringToDate(entry.exitTime),
      }))
    ),
  ]

  if (data.materials.length > 0) {
    inserts.push(
      tx.insert(workOrderMaterials).values(
        data.materials.map((material) => ({
          workOrderId,
          units: material.units,
          description: material.description,
          project: material.project || null,
          supply: material.supply || null,
        }))
      )
    )
  }

  return Promise.all(inserts)
}

export async function createWorkOrder(
  data: WorkOrderFormData,
  createdBy: string
): Promise<string> {
  return db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(workOrders)
      .values({
        client: data.client,
        address: data.address,
        carNumber: data.carNumber || null,
        driverOut: data.driverOut || null,
        driverReturn: data.driverReturn || null,
        createdBy,
      })
      .returning({ id: workOrders.id })

    await insertWorkOrderChildren(tx, inserted.id, data)

    return inserted.id
  })
}

export async function getWorkOrderById(id: string) {
  return db.query.workOrders.findFirst({
    where: eq(workOrders.id, id),
    with: {
      tasks: true,
      labor: true,
      materials: true,
      validations: {
        with: {
          validator: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
      creator: {
        columns: { id: true, name: true, email: true },
      },
    },
  })
}

export function dateToTimeString(date: Date | null): string {
  if (!date) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function canEditWorkOrder(
  workOrder: WorkOrderFull,
  userId: string,
  role: UserRole
): boolean {
  if (workOrder.validations.length > 0) return false
  if (role === 'MANAGER') return true
  if (role === 'EMPLEADO' && workOrder.createdBy === userId) return true
  return false
}

export async function updateWorkOrder(
  id: string,
  data: WorkOrderFormData,
  userId: string,
  role: UserRole
): Promise<void> {
  const workOrder = await getWorkOrderById(id)
  if (!workOrder) throw new Response('No encontrado', { status: 404 })
  if (!canEditWorkOrder(workOrder, userId, role))
    throw new Response('Sin permisos', { status: 403 })

  await db.transaction(async (tx) => {
    await Promise.all([
      tx
        .update(workOrders)
        .set({
          client: data.client,
          address: data.address,
          carNumber: data.carNumber || null,
          driverOut: data.driverOut || null,
          driverReturn: data.driverReturn || null,
        })
        .where(eq(workOrders.id, id)),
      tx.delete(workOrderTasks).where(eq(workOrderTasks.workOrderId, id)),
      tx.delete(workOrderLabor).where(eq(workOrderLabor.workOrderId, id)),
      tx.delete(workOrderMaterials).where(eq(workOrderMaterials.workOrderId, id)),
    ])

    await insertWorkOrderChildren(tx, id, data)
  })
}
