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

    const workOrderId = inserted.id

    await tx.insert(workOrderTasks).values(
      data.tasks.map((task) => ({
        workOrderId,
        description: task.description,
        startTime: timeStringToDate(task.startTime),
        endTime: timeStringToDate(task.endTime),
      }))
    )

    await tx.insert(workOrderLabor).values(
      data.labor.map((entry) => ({
        workOrderId,
        technicianName: entry.technicianName,
        entryTime: timeStringToDate(entry.entryTime),
        exitTime: timeStringToDate(entry.exitTime),
      }))
    )

    if (data.materials.length > 0) {
      await tx.insert(workOrderMaterials).values(
        data.materials.map((material) => ({
          workOrderId,
          units: material.units,
          description: material.description,
          project: material.project || null,
          supply: material.supply || null,
        }))
      )
    }

    return workOrderId
  })
}

export async function getWorkOrderById(id: string) {
  return db.query.workOrders.findFirst({
    where: eq(workOrders.id, id),
    with: {
      tasks: true,
      labor: true,
      materials: true,
      validations: true,
      creator: {
        columns: { id: true, name: true, email: true },
      },
    },
  })
}
