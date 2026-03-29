import { test, expect } from '../fixtures'
import {
  createAuthSessionWithRole,
  setAuthCookie,
} from '../helpers/auth'
import { resetDatabase } from '../helpers/db'

test.describe('Gestión de usuarios', () => {
  test.beforeEach(async ({ dbContext }) => {
    await resetDatabase(dbContext)
  })

  test('MANAGER crea un nuevo usuario → aparece en la lista como EMPLEADO', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-users@test.com',
      password: 'TestPassword123!',
      name: 'Manager Users',
      role: 'MANAGER',
    })

    await setAuthCookie(context, manager.token)
    await page.goto('/users')

    await expect(
      page.getByRole('heading', { name: /usuarios/i })
    ).toBeVisible()

    await page.getByRole('button', { name: /nuevo usuario/i }).click()

    await page.getByLabel(/nombre/i).fill('Nuevo Empleado')
    await page.getByLabel(/email/i).fill('nuevo-empleado@test.com')
    await page.getByLabel(/contraseña/i).fill('TestPassword123!')

    await page.getByRole('button', { name: /crear usuario/i }).click()

    // Wait for the dialog to close and table to update
    const table = page.locator('table')
    await expect(table.getByText('nuevo-empleado@test.com')).toBeVisible()
    await expect(table.getByText('Nuevo Empleado')).toBeVisible()
  })

  test('MANAGER promueve usuario a MANAGER → rol actualizado', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-promote@test.com',
      password: 'TestPassword123!',
      name: 'Manager Promote',
      role: 'MANAGER',
    })

    await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-target@test.com',
      password: 'TestPassword123!',
      name: 'Empleado Target',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, manager.token)
    await page.goto('/users')

    // Use desktop table to avoid duplicate elements
    const table = page.locator('table')

    // Verify the empleado has a promote button in the table
    const promoteButton = table.getByRole('button', {
      name: /promover a manager/i,
    })
    await expect(promoteButton).toBeVisible()

    await promoteButton.click()

    // Confirm in AlertDialog
    await expect(
      page.getByText(/no se puede deshacer/i)
    ).toBeVisible()
    await page.getByRole('button', { name: /confirmar/i }).click()

    // After promotion, all users are MANAGER, so no promote buttons should remain in the table
    await expect(
      table.getByRole('button', { name: /promover a manager/i })
    ).not.toBeVisible()
  })

  test('EMPLEADO no puede acceder a /users → 403', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-noaccess@test.com',
      password: 'TestPassword123!',
      name: 'Empleado NoAccess',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, empleado.token)

    const response = await page.goto('/users')
    expect(response?.status()).toBe(403)
  })

  test('Link "Usuarios" visible solo para MANAGER en dropdown', async ({
    page,
    context,
    baseURL,
    dbContext,
  }) => {
    // Test as MANAGER
    const manager = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'mgr-nav@test.com',
      password: 'TestPassword123!',
      name: 'Manager Nav',
      role: 'MANAGER',
    })

    await setAuthCookie(context, manager.token)
    await page.goto('/')

    await page.getByLabel('User menu').click()
    await expect(page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Usuarios' })).toBeVisible()

    // Test as EMPLEADO
    await context.clearCookies()

    const empleado = await createAuthSessionWithRole(baseURL!, dbContext, {
      email: 'emp-nav@test.com',
      password: 'TestPassword123!',
      name: 'Empleado Nav',
      role: 'EMPLEADO',
    })

    await setAuthCookie(context, empleado.token)
    await page.goto('/')

    await page.getByLabel('User menu').click()
    await expect(
      page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'Usuarios' })
    ).not.toBeVisible()
  })
})
