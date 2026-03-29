import { test, expect, seedWorkOrder, seedWorkOrderValidation } from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Dashboard - Listado de partes', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('EMPLEADO ve solo sus partes', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const alice = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'alice@test.com',
      password: 'TestPassword123!',
      name: 'Alice',
      role: 'EMPLEADO',
    })

    const bob = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'bob@test.com',
      password: 'TestPassword123!',
      name: 'Bob',
      role: 'EMPLEADO',
    })

    await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: alice.userId }, {
      client: 'Cliente Alice 1',
    })
    await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: alice.userId }, {
      client: 'Cliente Alice 2',
    })
    await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: bob.userId }, {
      client: 'Cliente Bob',
    })

    await setAuthCookie(context, alice.token)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Partes de Trabajo' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cliente Alice 1' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cliente Alice 2' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cliente Bob' })).not.toBeVisible()
    await expect(page.getByText('2 partes')).toBeVisible()
  })

  test('MANAGER ve todos los partes', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const alice = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'alice2@test.com',
      password: 'TestPassword123!',
      name: 'Alice',
      role: 'EMPLEADO',
    })

    const bob = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'bob2@test.com',
      password: 'TestPassword123!',
      name: 'Bob',
      role: 'EMPLEADO',
    })

    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'manager@test.com',
      password: 'TestPassword123!',
      name: 'Manager',
      role: 'MANAGER',
    })

    await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: alice.userId }, {
      client: 'Cliente Alice M',
    })
    await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: bob.userId }, {
      client: 'Cliente Bob M',
    })

    await setAuthCookie(context, manager.token)
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Cliente Alice M' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cliente Bob M' }).first()).toBeVisible()
    await expect(page.getByText('2 partes')).toBeVisible()
  })

  test('muestra indicador de estado Pendiente y Validado', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'estado@test.com',
      password: 'TestPassword123!',
      name: 'Estado User',
      role: 'EMPLEADO',
    })

    const validatedOrderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Validado' }
    )
    await seedWorkOrderValidation(dbContext, {
      workOrderId: validatedOrderId,
      validatedBy: user.userId,
    })

    await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: user.userId }, {
      client: 'Cliente Pendiente',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await expect(page.locator('span', { hasText: /^Validado$/ }).first()).toBeVisible()
    await expect(page.locator('span', { hasText: /^Pendiente$/ }).first()).toBeVisible()
  })

  test('paginación funciona correctamente', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'pagina@test.com',
      password: 'TestPassword123!',
      name: 'Pagina User',
      role: 'EMPLEADO',
    })

    // Seed 12 work orders
    for (let i = 1; i <= 12; i++) {
      await seedWorkOrder(dbContext, 'sampleOrder', { createdBy: user.userId }, {
        client: `Cliente Pag ${String(i).padStart(2, '0')}`,
      })
    }

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await expect(page.getByText('12 partes')).toBeVisible()

    // Page 1 should show pagination
    await expect(page.getByText('1 / 2')).toBeVisible()
    const siguienteLink = page.getByRole('link', { name: 'Siguiente' })
    await expect(siguienteLink).toBeVisible()

    // Navigate to page 2
    await siguienteLink.click()
    await expect(page.getByText('2 / 2')).toBeVisible({ timeout: 10000 })
    expect(page.url()).toContain('page=2')

    // Navigate back
    const anteriorLink = page.getByRole('link', { name: 'Anterior' })
    await anteriorLink.click()
    await expect(page.getByText('1 / 2')).toBeVisible({ timeout: 10000 })
  })

  test('click en parte navega a detalle', async ({
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
      { client: 'Cliente Detalle' }
    )

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await page.getByRole('link', { name: 'Cliente Detalle' }).first().click()
    expect(page.url()).toContain(`/work-orders/${orderId}`)
  })

  test('botón Nuevo Parte navega a creación', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'nuevo@test.com',
      password: 'TestPassword123!',
      name: 'Nuevo User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await page.getByRole('link', { name: /nuevo parte/i }).click()
    await expect(page).toHaveURL(/work-orders\/new/, { timeout: 10000 })
  })
})
