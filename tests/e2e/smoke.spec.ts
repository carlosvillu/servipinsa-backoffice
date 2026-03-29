import { test, expect } from '../fixtures/app.fixture'
import { createAuthSession, setAuthCookie } from '../helpers/auth'

test.describe('Home Page', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/auth/login')
  })

  test('should load home page for authenticated users', async ({ page, context, baseURL }) => {
    const timestamp = Date.now()
    const { token } = await createAuthSession(baseURL!, {
      email: `test-smoke-${timestamp}@example.com`,
      password: 'TestPassword123!',
    })
    await setAuthCookie(context, token)

    await page.goto('/')
    await expect(page).toHaveTitle(/Servipinsa/)
  })
})
