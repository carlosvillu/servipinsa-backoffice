import {
  test,
  expect,
  seedWorkOrder,
  seedWorkOrderLabor,
} from '../fixtures'
import {
  createAuthSession,
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Descargar Todo - Export xlsx global', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('el botón no aparece cuando no hay partes', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await createAuthSession(baseURL!, {
      email: 'empty@test.com',
      password: 'TestPassword123!',
      name: 'Empty User',
    })
    await setAuthCookie(context, user.token)
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Partes de Trabajo' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Descargar Todo' })
    ).toHaveCount(0)
  })

  test('el botón aparece cuando hay partes con operarios', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const user = await createAuthSession(baseURL!, {
      email: 'has-orders@test.com',
      password: 'TestPassword123!',
      name: 'Has Orders',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: user.userId }
    )
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, user.token)
    await page.goto('/')

    await expect(
      page.getByRole('button', { name: 'Descargar Todo' })
    ).toBeVisible()
  })

  test('click en Descargar Todo dispara descarga de xlsx', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'manager-export@test.com',
      password: 'TestPassword123!',
      name: 'Manager Export',
      role: 'MANAGER',
    })

    const orderId = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: manager.userId }
    )
    await seedWorkOrderLabor(dbContext, 'sampleLabor', { workOrderId: orderId })

    await setAuthCookie(context, manager.token)
    await page.goto('/')

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Descargar Todo' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(
      /^partes-trabajo-\d{4}-\d{2}-\d{2}\.xlsx$/
    )
  })

  test('EMPLEADO solo exporta sus propios partes', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const alice = await createAuthSession(baseURL!, {
      email: 'alice-export@test.com',
      password: 'TestPassword123!',
      name: 'Alice Export',
    })
    const bob = await createAuthSession(baseURL!, {
      email: 'bob-export@test.com',
      password: 'TestPassword123!',
      name: 'Bob Export',
    })

    const aliceOrder = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: alice.userId },
      { client: 'Alice Client' }
    )
    await seedWorkOrderLabor(dbContext, 'sampleLabor', {
      workOrderId: aliceOrder,
    })

    const bobOrder = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: bob.userId },
      { client: 'Bob Client' }
    )
    await seedWorkOrderLabor(
      dbContext,
      'sampleLabor',
      { workOrderId: bobOrder },
      { technicianName: 'Bob Técnico 1' }
    )
    await seedWorkOrderLabor(
      dbContext,
      'sampleLabor',
      { workOrderId: bobOrder },
      { technicianName: 'Bob Técnico 2' }
    )

    await setAuthCookie(context, alice.token)
    await page.goto('/')

    const [response] = await Promise.all([
      page.waitForResponse('**/work-orders/export-all**'),
      page.getByRole('button', { name: 'Descargar Todo' }).click(),
    ])

    const text = await response.text()
    expect(text).toContain('Carlos')
    expect(text).not.toContain('Bob')
  })

  test('MANAGER exporta partes de todos los usuarios ordenados', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'manager-all@test.com',
      password: 'TestPassword123!',
      name: 'Manager All',
      role: 'MANAGER',
    })
    const employee = await createAuthSession(baseURL!, {
      email: 'employee-all@test.com',
      password: 'TestPassword123!',
      name: 'Employee All',
    })

    const managerOrder = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: manager.userId }
    )
    await seedWorkOrderLabor(dbContext, 'sampleLabor', {
      workOrderId: managerOrder,
    })

    const employeeOrder = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: employee.userId }
    )
    await seedWorkOrderLabor(
      dbContext,
      'sampleLabor',
      { workOrderId: employeeOrder },
      { technicianName: 'Zeta Tecnico' }
    )
    await seedWorkOrderLabor(
      dbContext,
      'sampleLabor',
      { workOrderId: employeeOrder },
      { technicianName: 'Alfa Tecnico' }
    )

    await setAuthCookie(context, manager.token)
    await page.goto('/')

    const [response] = await Promise.all([
      page.waitForResponse('**/work-orders/export-all**'),
      page.getByRole('button', { name: 'Descargar Todo' }).click(),
    ])

    const text = await response.text()
    expect(text).toContain('Alfa Tecnico')
    expect(text).toContain('Zeta Tecnico')
    expect(text).toContain('Carlos')
    // Within the employee order (most recent), Alfa < Zeta by technicianName ASC.
    const idxAlfa = text.indexOf('Alfa Tecnico')
    const idxZeta = text.indexOf('Zeta Tecnico')
    expect(idxAlfa).toBeGreaterThan(-1)
    expect(idxZeta).toBeGreaterThan(idxAlfa)
  })

  test('EMPLEADO sin partes no ve botón Descargar Todo aunque otros tengan partes', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const alice = await createAuthSession(baseURL!, {
      email: 'alice-empty@test.com',
      password: 'TestPassword123!',
      name: 'Alice Empty',
    })
    const bob = await createAuthSession(baseURL!, {
      email: 'bob-has@test.com',
      password: 'TestPassword123!',
      name: 'Bob Has',
    })

    const bobOrder = await seedWorkOrder(
      dbContext,
      'sampleOrder',
      { createdBy: bob.userId },
      { client: 'Cliente Bob Empty' }
    )
    await seedWorkOrderLabor(dbContext, 'sampleLabor', {
      workOrderId: bobOrder,
    })

    await setAuthCookie(context, alice.token)
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Partes de Trabajo' })
    ).toBeVisible()
    await expect(page.getByText('0 partes')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Descargar Todo' })
    ).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Cliente Bob Empty' })
    ).toHaveCount(0)
  })
})
