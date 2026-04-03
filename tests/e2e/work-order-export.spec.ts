import { test, expect, seedWorkOrder, seedWorkOrderTask } from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Export - Botón de exportar en listado', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('botón exportar en fila es clickeable sin navegar al detalle', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'export@test.com',
      password: 'TestPassword123!',
      name: 'Export User',
      role: 'EMPLEADO',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId },
      { client: 'Cliente Export Test' }
    )
    await seedWorkOrderTask(dbContext, 'sampleTask', { workOrderId: orderId })

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Partes de Trabajo' })).toBeVisible()

    const exportButton = page.getByRole('button', { name: 'Exportar a Excel' })
    await expect(exportButton).toBeVisible()
    await exportButton.click()

    // After clicking export, we should still be on the dashboard (not navigated to detail)
    await page.waitForTimeout(500)
    expect(page.url()).not.toContain('/work-orders/')
    await expect(page.getByRole('heading', { name: 'Partes de Trabajo' })).toBeVisible()
  })
})
