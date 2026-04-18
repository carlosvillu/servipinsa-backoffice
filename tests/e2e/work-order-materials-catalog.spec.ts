import { test, expect } from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Materiales: catalogo para Punto de Recarga', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('autocomplete con sugerencias del catalogo para project de punto_recarga', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'materials-catalog@test.com',
      password: 'TestPassword123!',
      name: 'Catalog User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await page.getByLabel(/cliente/i).fill('Cliente Catalogo')
    await page.getByLabel(/direccion/i).fill('Direccion Catalogo')

    await page.getByLabel(/descripcion/i).first().fill('Instalacion cargador')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('100/2026')
    await page
      .locator('select[name="tasks.0.workType"]')
      .selectOption('punto_recarga')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')

    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Catalogo')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page.locator('input[name="materials.0.project"]').fill('100/2026')

    const descInput = page.locator('input[name="materials.0.description"]')
    await expect(descInput).toBeVisible()
    await descInput.click()
    await descInput.fill('PULSAR MAX 7,4Kw')
    await page
      .getByRole('option', { name: 'PULSAR MAX 7,4Kw TIPO 2 5m' })
      .click()
    await expect(descInput).toHaveValue('PULSAR MAX 7,4Kw TIPO 2 5m')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page).toHaveURL('/', { timeout: 10000 })
    await page.getByRole('link', { name: 'Cliente Catalogo' }).first().click()
    await expect(
      page.getByText('PULSAR MAX 7,4Kw TIPO 2 5m').first(),
    ).toBeVisible()
  })

  test('acepta valor libre fuera del catalogo', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'materials-free@test.com',
      password: 'TestPassword123!',
      name: 'Free Text User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await page.getByLabel(/cliente/i).fill('Cliente Free')
    await page.getByLabel(/direccion/i).fill('Direccion Free')

    await page.getByLabel(/descripcion/i).first().fill('Trabajo recarga')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('200/2026')
    await page
      .locator('select[name="tasks.0.workType"]')
      .selectOption('punto_recarga')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')

    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Free')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('2')
    await page.locator('input[name="materials.0.project"]').fill('200/2026')

    const descInput = page.locator('input[name="materials.0.description"]')
    await descInput.fill('MATERIAL_CUSTOM_NO_EN_LISTA')
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page).toHaveURL('/', { timeout: 10000 })
    await page.getByRole('link', { name: 'Cliente Free' }).first().click()
    await expect(
      page.getByText('MATERIAL_CUSTOM_NO_EN_LISTA').first(),
    ).toBeVisible()
  })
})
