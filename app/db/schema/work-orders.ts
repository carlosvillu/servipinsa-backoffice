import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { WORK_TYPE_VALUES } from '~/schemas/workOrder'

export const workTypeEnum = pgEnum('work_type', WORK_TYPE_VALUES)

export const workOrders = pgTable('work_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  client: text('client').notNull(),
  address: text('address').notNull(),
  carNumber: text('car_number'),
  driverOut: text('driver_out'),
  driverReturn: text('driver_return'),
})

export const workOrderTasks = pgTable('work_order_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workOrderId: uuid('work_order_id')
    .notNull()
    .references(() => workOrders.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  projectNumber: text('project_number'),
  workType: workTypeEnum('work_type'),
})

export const workOrderLabor = pgTable('work_order_labor', {
  id: uuid('id').primaryKey().defaultRandom(),
  workOrderId: uuid('work_order_id')
    .notNull()
    .references(() => workOrders.id, { onDelete: 'cascade' }),
  technicianName: text('technician_name').notNull(),
  entryTime: timestamp('entry_time'),
  exitTime: timestamp('exit_time'),
})

export const workOrderMaterials = pgTable('work_order_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  workOrderId: uuid('work_order_id')
    .notNull()
    .references(() => workOrders.id, { onDelete: 'cascade' }),
  units: integer('units').notNull(),
  description: text('description').notNull(),
  project: text('project'),
  supply: text('supply'),
})

export const workOrderValidations = pgTable(
  'work_order_validations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workOrderId: uuid('work_order_id')
      .notNull()
      .references(() => workOrders.id, { onDelete: 'cascade' }),
    validatedBy: uuid('validated_by')
      .notNull()
      .references(() => users.id),
    validatedAt: timestamp('validated_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.workOrderId, t.validatedBy)]
)

export type WorkOrder = typeof workOrders.$inferSelect
export type NewWorkOrder = typeof workOrders.$inferInsert
export type WorkOrderTask = typeof workOrderTasks.$inferSelect
export type NewWorkOrderTask = typeof workOrderTasks.$inferInsert
export type WorkOrderLaborEntry = typeof workOrderLabor.$inferSelect
export type NewWorkOrderLaborEntry = typeof workOrderLabor.$inferInsert
export type WorkOrderMaterial = typeof workOrderMaterials.$inferSelect
export type NewWorkOrderMaterial = typeof workOrderMaterials.$inferInsert
export type WorkOrderValidation = typeof workOrderValidations.$inferSelect
export type NewWorkOrderValidation = typeof workOrderValidations.$inferInsert
