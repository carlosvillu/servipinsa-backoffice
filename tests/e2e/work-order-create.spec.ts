import { test, expect } from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'
import { toYMD, toDisplay, daysFromToday } from '../helpers/dates'

test.describe('Creacion de partes de trabajo', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('EMPLEADO crea un parte completo y aparece en el dashboard', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'crear@test.com',
      password: 'TestPassword123!',
      name: 'Crear User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await expect(
      page.getByRole('heading', { name: /nuevo parte de trabajo/i })
    ).toBeVisible()

    // Datos generales
    await page.getByLabel(/cliente/i).fill('Empresa Test')
    await page.getByLabel(/direccion/i).fill('Calle Falsa 123')

    // Trabajo
    await page.getByLabel(/descripcion/i).first().fill('Instalacion electrica')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('100/2026')
    await page
      .locator('select[name="tasks.0.workType"]')
      .selectOption('obra')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')

    // Tecnico (ya viene 1 por defecto)
    await page.getByLabel(/nombre del tecnico/i).first().fill('Juan Garcia')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    // Anadir material
    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('5')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Cable 2.5mm')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('100/2026')

    // Submit
    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    // Debe redirigir al dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 })
    await expect(
      page.getByRole('link', { name: 'Empresa Test' }).first()
    ).toBeVisible()
    await expect(
      page.locator('span', { hasText: /^Pendiente$/ }).first()
    ).toBeVisible()
  })

  test('validacion muestra errores si faltan campos obligatorios', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'validar@test.com',
      password: 'TestPassword123!',
      name: 'Validar User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    // Submit sin rellenar nada
    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    // Debe mostrar errores de validacion
    await expect(page.getByText('El cliente es obligatorio')).toBeVisible()
    await expect(page.getByText('La direccion es obligatoria')).toBeVisible()

    // NO debe redirigir
    await expect(page).toHaveURL(/work-orders\/new/)
  })

  test('se puede anadir y eliminar lineas dinamicas', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'dinamico@test.com',
      password: 'TestPassword123!',
      name: 'Dinamico User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    // Anadir segundo trabajo
    await page.getByRole('button', { name: /anadir trabajo/i }).click()
    await expect(
      page.locator('input[name="tasks.1.description"]')
    ).toBeVisible()

    // Eliminar segundo trabajo
    const taskSection = page.locator('[data-slot="card"]').filter({
      hasText: 'Trabajos Realizados',
    })
    const deleteButtons = taskSection.getByRole('button', {
      name: /eliminar/i,
    })
    await deleteButtons.last().click()
    await expect(
      page.locator('input[name="tasks.1.description"]')
    ).not.toBeVisible()

    // Anadir material
    await page.getByRole('button', { name: /anadir material/i }).click()
    await expect(
      page.locator('input[name="materials.0.description"]')
    ).toBeVisible()

    // Eliminar material
    const materialsSection = page.locator('[data-slot="card"]').filter({
      hasText: 'Materiales',
    })
    await materialsSection
      .getByRole('button', { name: /eliminar/i })
      .first()
      .click()
    await expect(
      page.locator('input[name="materials.0.description"]')
    ).not.toBeVisible()
    await expect(
      page.getByText('No hay materiales anadidos.')
    ).toBeVisible()
  })

  test('hora fin debe ser posterior a hora inicio', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'hora@test.com',
      password: 'TestPassword123!',
      name: 'Hora User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    // Rellenar campos obligatorios
    await page.getByLabel(/cliente/i).fill('Cliente Hora')
    await page.getByLabel(/direccion/i).fill('Direccion Hora')

    // Trabajo con hora fin anterior a hora inicio
    await page.getByLabel(/descripcion/i).first().fill('Trabajo test')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('200/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('14:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('08:00')

    // Tecnico
    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Test')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('17:00')

    // Submit
    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(
      page.getByText('La hora de fin debe ser posterior a la de inicio')
    ).toBeVisible()
    await expect(page).toHaveURL(/work-orders\/new/)
  })

  test('MANAGER puede crear partes', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-crear@test.com',
      password: 'TestPassword123!',
      name: 'Manager Creator',
      role: 'MANAGER',
    })

    await setAuthCookie(context, manager.token)
    await page.goto('/work-orders/new')

    // Datos minimos
    await page.getByLabel(/cliente/i).fill('Cliente Manager')
    await page.getByLabel(/direccion/i).fill('Direccion Manager')

    await page.getByLabel(/descripcion/i).first().fill('Trabajo manager')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('300/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('09:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('13:00')

    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Mgr')
    await page.locator('input[name="labor.0.entryTime"]').fill('09:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('13:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Material manager')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('300/2026')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page).toHaveURL('/', { timeout: 10000 })
    await expect(
      page.getByRole('link', { name: 'Cliente Manager' }).first()
    ).toBeVisible()
  })

  test('usuario no autenticado es redirigido al login', async ({ page }) => {
    await page.goto('/work-orders/new')
    await expect(page).toHaveURL(/auth\/login/, { timeout: 10000 })
  })

  test('la fecha del parte se preselecciona a hoy', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'fecha-hoy@test.com',
      password: 'TestPassword123!',
      name: 'Fecha Hoy',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await expect(page.locator('input[name="createdAt"]')).toHaveValue(
      toYMD(new Date())
    )
  })

  test('se puede crear un parte con una fecha pasada', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'fecha-pasada@test.com',
      password: 'TestPassword123!',
      name: 'Fecha Pasada',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    const yesterday = daysFromToday(-1)
    const yesterdayDisplay = toDisplay(yesterday)

    await page.locator('input[name="createdAt"]').fill(toYMD(yesterday))
    await page.getByLabel(/cliente/i).fill('Cliente Pasado')
    await page.getByLabel(/direccion/i).fill('Direccion Pasado')
    await page.getByLabel(/descripcion/i).first().fill('Trabajo pasado')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('400/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')
    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Pasado')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Material pasado')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('400/2026')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page).toHaveURL('/', { timeout: 10000 })
    await expect(
      page.getByRole('link', { name: 'Cliente Pasado' }).first()
    ).toBeVisible()
    await expect(page.getByText(yesterdayDisplay).first()).toBeVisible()
  })

  test('rechaza fechas futuras', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'fecha-futura@test.com',
      password: 'TestPassword123!',
      name: 'Fecha Futura',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await page.locator('input[name="createdAt"]').fill(toYMD(daysFromToday(1)))
    await page.getByLabel(/cliente/i).fill('Cliente Futuro')
    await page.getByLabel(/direccion/i).fill('Direccion Futura')
    await page.getByLabel(/descripcion/i).first().fill('Trabajo futuro')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('500/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')
    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Futuro')
    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Material futuro')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('500/2026')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page.getByText('La fecha no puede ser futura')).toBeVisible()
    await expect(page).toHaveURL(/work-orders\/new/)
  })
})
