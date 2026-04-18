import {
  test,
  expect,
  seedWorkOrder,
  seedWorkOrderTask,
  seedWorkOrderLabor,
} from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Trabajos realizados: numero de proyecto y tipo de trabajo', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('crear parte con projectNumber y workType persiste y se muestra', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'task-fields-create@test.com',
      password: 'TestPassword123!',
      name: 'TaskFields Create',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await page.getByLabel(/cliente/i).fill('Cliente Fields')
    await page.getByLabel(/direccion/i).fill('Direccion Fields')

    await page.getByLabel(/descripcion/i).first().fill('Trabajo con campos')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('777/2026')
    await page
      .locator('select[name="tasks.0.workType"]')
      .selectOption('obra')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')

    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico Fields')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /anadir material/i }).click()
    await page.locator('input[name="materials.0.units"]').fill('1')
    await page
      .locator('input[name="materials.0.description"]')
      .fill('Tornillos')
    await page
      .locator('input[name="materials.0.project"]')
      .fill('777/2026')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page).toHaveURL('/', { timeout: 10000 })
    await page.getByRole('link', { name: 'Cliente Fields' }).first().click()

    await expect(page.getByText('777/2026').first()).toBeVisible()
    await expect(page.getByText('Obra').first()).toBeVisible()
  })

  test('falta material para un projectNumber bloquea el submit', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'task-fields-missing@test.com',
      password: 'TestPassword123!',
      name: 'Missing Material',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await page.getByLabel(/cliente/i).fill('Cliente Missing')
    await page.getByLabel(/direccion/i).fill('Direccion Missing')

    await page.getByLabel(/descripcion/i).first().fill('Trabajo sin material')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('888/2026')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')

    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(
      page.getByText('Falta al menos un material para el proyecto 888/2026'),
    ).toBeVisible()
    await expect(page).toHaveURL(/work-orders\/new/)
  })

  test('formato invalido en projectNumber muestra error', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'task-fields-format@test.com',
      password: 'TestPassword123!',
      name: 'Format User',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, user.token)
    await page.goto('/work-orders/new')

    await page.getByLabel(/cliente/i).fill('Cliente Format')
    await page.getByLabel(/direccion/i).fill('Direccion Format')

    await page.getByLabel(/descripcion/i).first().fill('Trabajo formato')
    await page
      .locator('input[name="tasks.0.projectNumber"]')
      .fill('formato-invalido')
    await page.locator('input[name="tasks.0.startTime"]').fill('08:00')
    await page.locator('input[name="tasks.0.endTime"]').fill('12:00')

    await page.getByLabel(/nombre del tecnico/i).first().fill('Tecnico')
    await page.locator('input[name="labor.0.entryTime"]').fill('08:00')
    await page.locator('input[name="labor.0.exitTime"]').fill('12:00')

    await page.getByRole('button', { name: /crear parte de trabajo/i }).click()

    await expect(page.getByText('Formato invalido (ID/YYYY)')).toBeVisible()
    await expect(page).toHaveURL(/work-orders\/new/)
  })

  test('parte antiguo sin projectNumber/workType se renderiza sin romper', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'task-fields-legacy@test.com',
      password: 'TestPassword123!',
      name: 'Legacy User',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Legacy' },
    )

    await seedWorkOrderTask(
      dbContext,
      'sampleTask',
      { workOrderId: orderId },
      { projectNumber: null, workType: null },
    )
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, user.token)
    await page.goto(`/work-orders/${orderId}`)

    await expect(
      page.getByRole('heading', { name: 'Cliente Legacy' }),
    ).toBeVisible()
    // Las columnas nuevas existen pero con placeholder
    await expect(page.getByText('Numero de proyecto').first()).toBeVisible()
    await expect(page.getByText('Tipo de trabajo').first()).toBeVisible()
  })
})
