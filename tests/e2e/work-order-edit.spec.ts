import {
  test,
  expect,
  seedWorkOrder,
  seedWorkOrderTask,
  seedWorkOrderLabor,
  seedWorkOrderValidation,
} from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Edicion de parte de trabajo', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('EMPLEADO edita su parte y ve los cambios en detalle', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'edit@test.com',
      password: 'TestPassword123!',
      name: 'Edit User',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Original', address: 'Direccion Original' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, user.token)
    await page.goto(`/work-orders/${orderId}/edit`)

    // Verify form is pre-filled
    await expect(page.getByLabel(/cliente/i)).toHaveValue('Cliente Original')
    await expect(page.getByLabel(/direccion/i)).toHaveValue(
      'Direccion Original'
    )

    // Change client name
    await page.getByLabel(/cliente/i).fill('Cliente Editado')
    await page.getByRole('button', { name: /guardar cambios/i }).click()

    // Should redirect to detail
    await expect(page).toHaveURL(new RegExp(`/work-orders/${orderId}$`), {
      timeout: 10000,
    })

    // Verify change in detail
    await expect(
      page.getByRole('heading', { name: 'Cliente Editado' })
    ).toBeVisible()
  })

  test('editar parte validado redirige a detalle', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'edit-val@test.com',
      password: 'TestPassword123!',
      name: 'Edit Val User',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-edit@test.com',
      password: 'TestPassword123!',
      name: 'Manager Edit',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Validado Edit' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await seedWorkOrderValidation(dbContext, {
      workOrderId: orderId,
      validatedBy: manager.userId,
    })

    await setAuthCookie(context, user.token)
    await page.goto(`/work-orders/${orderId}/edit`)

    // Should redirect to detail page (not edit)
    await expect(page).toHaveURL(new RegExp(`/work-orders/${orderId}$`), {
      timeout: 10000,
    })

    // Should see detail, not form
    await expect(
      page.getByRole('heading', { name: 'Cliente Validado Edit' })
    ).toBeVisible()
  })

  test('EMPLEADO no puede editar parte de otro usuario', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const alice = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'alice-edit@test.com',
      password: 'TestPassword123!',
      name: 'Alice Edit',
      role: 'EMPLEADO',
    })

    const bob = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'bob-edit@test.com',
      password: 'TestPassword123!',
      name: 'Bob Edit',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: bob.userId },
      { client: 'Cliente de Bob Edit' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, alice.token)
    await page.goto(`/work-orders/${orderId}/edit`)

    // Should redirect to detail (which will 403 for another user's order)
    // The redirect goes to /work-orders/:id which returns 403 for wrong user
    await expect(page).not.toHaveURL(/\/edit$/, { timeout: 10000 })
  })

  test('MANAGER puede editar cualquier parte no validado', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-edit@test.com',
      password: 'TestPassword123!',
      name: 'Empleado Edit',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-edit2@test.com',
      password: 'TestPassword123!',
      name: 'Manager Edit2',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: empleado.userId },
      { client: 'Cliente Emp', address: 'Direccion Emp' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, manager.token)
    await page.goto(`/work-orders/${orderId}/edit`)

    // Manager can see the form
    await expect(page.getByLabel(/cliente/i)).toHaveValue('Cliente Emp')

    // Edit address
    await page.getByLabel(/direccion/i).fill('Direccion Manager Edit')
    await page.getByRole('button', { name: /guardar cambios/i }).click()

    // Should redirect to detail
    await expect(page).toHaveURL(new RegExp(`/work-orders/${orderId}$`), {
      timeout: 10000,
    })

    // Verify change
    await expect(page.getByText('Direccion Manager Edit')).toBeVisible()
  })
})
