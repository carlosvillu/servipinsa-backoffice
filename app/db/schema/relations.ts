import { relations } from 'drizzle-orm'
import { users } from './users'
import { sessions } from './sessions'
import { accounts } from './accounts'
import {
  workOrders,
  workOrderTasks,
  workOrderLabor,
  workOrderMaterials,
  workOrderValidations,
} from './work-orders'

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  workOrders: many(workOrders),
  validations: many(workOrderValidations),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  creator: one(users, {
    fields: [workOrders.createdBy],
    references: [users.id],
  }),
  tasks: many(workOrderTasks),
  labor: many(workOrderLabor),
  materials: many(workOrderMaterials),
  validations: many(workOrderValidations),
}))

export const workOrderTasksRelations = relations(workOrderTasks, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderTasks.workOrderId],
    references: [workOrders.id],
  }),
}))

export const workOrderLaborRelations = relations(workOrderLabor, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderLabor.workOrderId],
    references: [workOrders.id],
  }),
}))

export const workOrderMaterialsRelations = relations(
  workOrderMaterials,
  ({ one }) => ({
    workOrder: one(workOrders, {
      fields: [workOrderMaterials.workOrderId],
      references: [workOrders.id],
    }),
  })
)

export const workOrderValidationsRelations = relations(
  workOrderValidations,
  ({ one }) => ({
    workOrder: one(workOrders, {
      fields: [workOrderValidations.workOrderId],
      references: [workOrders.id],
    }),
    validator: one(users, {
      fields: [workOrderValidations.validatedBy],
      references: [users.id],
    }),
  })
)
