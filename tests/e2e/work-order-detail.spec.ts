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

  test('MANAGER valida un parte → Validado → sin botón editar', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-validate@test.com',
      password: 'TestPassword123!',
      name: 'Empleado Validate',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-validate@test.com',
      password: 'TestPassword123!',
      name: 'Manager Validate',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: empleado.userId },
      { client: 'Cliente Validacion' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, manager.token)
    await page.goto(`/work-orders/${orderId}`)

    // Verify initial state
    await expect(
      page.locator('span', { hasText: /^Pendiente$/ })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /editar/i })
    ).toBeVisible()

    // Click validate button
    await page.getByRole('button', { name: /validar parte/i }).click()

    // Confirm dialog appears
    await expect(
      page.getByText(/bloqueará el parte para edición/i)
    ).toBeVisible()

    // Confirm validation
    await page.getByRole('button', { name: /confirmar validación/i }).click()

    // Wait for revalidation
    await expect(
      page.locator('span', { hasText: /^Validado$/ })
    ).toBeVisible()

    // Edit button should be gone
    await expect(
      page.getByRole('link', { name: /editar/i })
    ).not.toBeVisible()

    // Validate button should be gone (this manager already validated)
    await expect(
      page.getByRole('button', { name: /validar parte/i })
    ).not.toBeVisible()

    // Validation appears in history
    await expect(page.getByText('Manager Validate')).toBeVisible()
  })

  test('EMPLEADO no ve botón Validar Parte', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-noval@test.com',
      password: 'TestPassword123!',
      name: 'Empleado NoVal',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: empleado.userId },
      { client: 'Cliente Sin Validar' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, empleado.token)
    await page.goto(`/work-orders/${orderId}`)

    // Validate button should not be visible
    await expect(
      page.getByRole('button', { name: /validar parte/i })
    ).not.toBeVisible()

    // Edit button should be visible (own order, not validated)
    await expect(
      page.getByRole('link', { name: /editar/i })
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

  test('MANAGER puede ver el detalle de un parte de otro usuario', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const bob = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'bob-mgr-view@test.com',
      password: 'TestPassword123!',
      name: 'Bob MgrView',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-view@test.com',
      password: 'TestPassword123!',
      name: 'Manager View',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: bob.userId },
      { client: 'Cliente Bob MgrView' }
    )

    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, manager.token)
    const response = await page.goto(`/work-orders/${orderId}`)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('heading', { name: 'Cliente Bob MgrView' })
    ).toBeVisible()
  })
})
