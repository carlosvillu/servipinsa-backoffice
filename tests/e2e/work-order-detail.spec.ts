import {
  test,
  expect,
  seedWorkOrder,
  seedWorkOrderTask,
  seedWorkOrderLabor,
  seedWorkOrderMaterials,
  seedWorkOrderValidation,
} from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Detalle de parte de trabajo', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('EMPLEADO ve detalle completo de su parte', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'detalle@test.com',
      password: 'TestPassword123!',
      name: 'Detalle User',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Detalle', address: 'Calle Test 123' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })
    await seedWorkOrderMaterials(dbContext, 'sampleMaterial', {
      workOrderId: orderId,
    })

    await setAuthCookie(context, user.token)
    await page.goto(`/work-orders/${orderId}`)

    // General data
    await expect(
      page.getByRole('heading', { name: 'Cliente Detalle' })
    ).toBeVisible()
    await expect(page.getByText('Calle Test 123')).toBeVisible()

    // Sections visible
    await expect(page.getByText('Datos Generales')).toBeVisible()
    await expect(page.getByText('Trabajos Realizados')).toBeVisible()
    await expect(page.getByText('Mano de Obra')).toBeVisible()
    await expect(page.getByText('Materiales')).toBeVisible()

    // Status is Pendiente
    await expect(
      page.locator('span', { hasText: /^Pendiente$/ })
    ).toBeVisible()

    // Editar button visible for non-validated own order
    await expect(
      page.getByRole('link', { name: /editar/i })
    ).toBeVisible()
  })

  test('parte validado muestra Validado y no muestra boton Editar', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'validado@test.com',
      password: 'TestPassword123!',
      name: 'Validado User',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'manager-val@test.com',
      password: 'TestPassword123!',
      name: 'Manager Val',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Validado' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await seedWorkOrderValidation(dbContext, {
      workOrderId: orderId,
      validatedBy: manager.userId,
    })

    await setAuthCookie(context, user.token)
    await page.goto(`/work-orders/${orderId}`)

    await expect(
      page.locator('span', { hasText: /^Validado$/ })
    ).toBeVisible()

    await expect(
      page.getByRole('link', { name: /editar/i })
    ).not.toBeVisible()
  })

  test('MANAGER ve boton Validar Parte en parte pendiente', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-mgr@test.com',
      password: 'TestPassword123!',
      name: 'Empleado',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr@test.com',
      password: 'TestPassword123!',
      name: 'Manager',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: empleado.userId },
      { client: 'Cliente Manager View' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, manager.token)
    await page.goto(`/work-orders/${orderId}`)

    await expect(
      page.getByRole('link', { name: /editar/i })
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: /validar parte/i })
    ).toBeVisible()
  })

  test('EMPLEADO no puede ver parte de otro usuario', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const alice = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'alice-perm@test.com',
      password: 'TestPassword123!',
      name: 'Alice',
      role: 'EMPLEADO',
    })

    const bob = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'bob-perm@test.com',
      password: 'TestPassword123!',
      name: 'Bob',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: bob.userId },
      { client: 'Cliente de Bob' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, alice.token)
    const response = await page.goto(`/work-orders/${orderId}`)

    // Should get 403 or be redirected
    expect(response?.status()).toBe(403)
  })
})
