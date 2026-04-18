import { test, expect, seedWorkOrder } from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Navegacion mobile y polish', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('MANAGER ve sidebar mobile con enlaces Partes y Usuarios', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'nav-mgr@test.com',
      password: 'TestPassword123!',
      name: 'Nav Manager',
      role: 'MANAGER',
    })

    await setAuthCookie(context, manager.token)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Click hamburger button
    await page.getByLabel('Abrir menu').click()

    // Sidebar should show both links
    await expect(page.getByRole('link', { name: 'Partes' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usuarios' })).toBeVisible()

    // Navigate to Usuarios
    await page.getByRole('link', { name: 'Usuarios' }).click()
    await expect(page).toHaveURL(/\/users/, { timeout: 10000 })
  })

  test('EMPLEADO no ve enlace Usuarios en sidebar mobile', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'nav-emp@test.com',
      password: 'TestPassword123!',
      name: 'Nav Empleado',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, empleado.token)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await page.getByLabel('Abrir menu').click()

    await expect(page.getByRole('link', { name: 'Partes' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usuarios' })).not.toBeVisible()
  })

  test('toast aparece al crear un parte de trabajo', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'toast-crear@test.com',
      password: 'TestPassword123!',
      name: 'Toast User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    // Fill minimum required fields
    await page.getByLabel(/cliente/i).fill('Cliente Toast')
    await page.getByLabel(/direccion/i).fill('Direccion Toast')
    await page.getByLabel(/descripcion/i).first().fill('Trabajo toast')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('100/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')
    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Toast')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Material toast')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('100/2026')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    // Should redirect to dashboard and show toast
    await expect(page).toHaveURL('/', { timeout: 10000 })
    await expect(
      page.getByText('Parte de trabajo creado correctamente').first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('toast aparece al validar un parte de trabajo', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'toast-validar@test.com',
      password: 'TestPassword123!',
      name: 'Toast Manager',
      role: 'MANAGER',
    })

    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'toast-emp@test.com',
      password: 'TestPassword123!',
      name: 'Toast Empleado',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: empleado.userId },
      { client: 'Cliente Validar Toast' }
    )

    await setAuthCookie(context, manager.token)
    await page.goto(`/work-orders/${orderId}`)

    // Click validate button
    await page.getByRole('button', { name: /validar parte/i }).click()

    // Confirm in dialog
    await page.getByRole('button', { name: /confirmar validación/i }).click()

    await expect(
      page.getByText('Parte de trabajo validado correctamente')
    ).toBeVisible({ timeout: 5000 })
  })

  test('estado vacio del dashboard muestra CTA para crear parte', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'empty@test.com',
      password: 'TestPassword123!',
      name: 'Empty User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await expect(
      page.getByText('No hay partes de trabajo')
    ).toBeVisible()
    await expect(
      page.getByText('Crea tu primer parte de trabajo para empezar.')
    ).toBeVisible()

    // Click CTA
    await page.getByRole('link', { name: /crear parte de trabajo/i }).click()
    await expect(page).toHaveURL(/work-orders\/new/, { timeout: 10000 })
  })

  test('boton submit se deshabilita mientras envia el formulario', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'loading@test.com',
      password: 'TestPassword123!',
      name: 'Loading User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    // Fill form
    await page.getByLabel(/cliente/i).fill('Cliente Loading')
    await page.getByLabel(/direccion/i).fill('Direccion Loading')
    await page.getByLabel(/descripcion/i).first().fill('Trabajo loading')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('600/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')
    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Loading')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Material loading')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('600/2026')

    // Click submit and check loading state immediately
    const submitButton = page.getByRole('button', { name: /crear parte de trabajo/i })
    await submitButton.click()

    // Button should show loading text
    await expect(
      page.getByRole('button', { name: /guardando/i })
    ).toBeVisible()

    // Should eventually redirect
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})
