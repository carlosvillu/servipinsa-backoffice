import { eq, desc, count, sql } from 'drizzle-orm'
import { db } from '~/db'
import {
  workOrders,
  workOrderValidations,
} from '~/db/schema/work-orders'
import type { UserRole } from '~/db/schema/users'

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
