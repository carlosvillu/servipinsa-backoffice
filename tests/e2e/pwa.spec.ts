import type { BrowserContext } from '@playwright/test'
import { test, expect } from '../fixtures/app.fixture'
import { createAuthSession, setAuthCookie } from '../helpers/auth'

async function loginAs(
  context: BrowserContext,
  baseURL: string | undefined,
  prefix: string,
): Promise<void> {
  const { token } = await createAuthSession(baseURL!, {
    email: `${prefix}-${Date.now()}@example.com`,
    password: 'TestPassword123!',
  })
  await setAuthCookie(context, token)
}

async function dispatchBeforeInstallPrompt(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __pwaPromptCalled?: boolean }
    w.__pwaPromptCalled = false
    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: string; platform: string }>
      platforms: string[]
    }
    event.platforms = ['web']
    event.prompt = async () => {
      w.__pwaPromptCalled = true
    }
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    window.dispatchEvent(event)
  })
}

test.describe('PWA', () => {
  test('manifest.webmanifest se sirve y es válido', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/manifest.webmanifest`)
    expect(res.status()).toBe(200)

    const manifest = await res.json()
    expect(manifest.name).toBe('Servipinsa')
    expect(manifest.short_name).toBe('Servipinsa')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#383838')
    expect(manifest.background_color).toBe('#F4EFEA')

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')

    const purposes = manifest.icons.map((i: { purpose: string }) => i.purpose)
    expect(purposes).toContain('maskable')
  })

  test('iconos PNG existen y se sirven', async ({ request, baseURL }) => {
    const icons = [
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/icon-maskable-512.png',
      '/icons/apple-touch-icon-180.png',
    ]

    await Promise.all(
      icons.map(async (path) => {
        const res = await request.get(`${baseURL}${path}`)
        expect(res.status(), path).toBe(200)
        expect(res.headers()['content-type']).toContain('image/png')
      }),
    )
  })

  test('meta tags PWA presentes en root', async ({ page, context, baseURL }) => {
    await loginAs(context, baseURL, 'test-pwa')
    await page.goto('/')

    await expect(page.locator('link[rel="manifest"][href="/manifest.webmanifest"]')).toHaveCount(1)
    await expect(
      page.locator('link[rel="apple-touch-icon"][href="/icons/apple-touch-icon-180.png"]'),
    ).toHaveCount(1)
    await expect(page.locator('meta[name="theme-color"][content="#383838"]')).toHaveCount(1)
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"][content="yes"]')).toHaveCount(1)
    await expect(page.locator('meta[name="apple-mobile-web-app-title"][content="Servipinsa"]')).toHaveCount(1)
  })

  test('InstallButton no se renderiza si no hay evento beforeinstallprompt', async ({
    page,
    context,
    baseURL,
  }) => {
    await loginAs(context, baseURL, 'test-pwa-noevent')
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Instalar app' })).toHaveCount(0)
  })

  test('InstallButton aparece y dispara prompt cuando se simula el evento', async ({
    page,
    context,
    baseURL,
  }) => {
    await loginAs(context, baseURL, 'test-pwa-event')
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Servipinsa/i })).toBeVisible()
    await page.waitForFunction(() => document.readyState === 'complete')

    await dispatchBeforeInstallPrompt(page)

    const installBtn = page.getByRole('button', { name: 'Instalar app' })
    await expect(installBtn).toBeVisible()
    await installBtn.click()

    const called = await page.evaluate(
      () => (window as unknown as { __pwaPromptCalled?: boolean }).__pwaPromptCalled,
    )
    expect(called).toBe(true)
  })

  test('InstallButton no aparece si la app corre en standalone (instalada)', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addInitScript(() => {
      const originalMatchMedia = window.matchMedia.bind(window)
      window.matchMedia = (query: string) => {
        if (query.includes('display-mode: standalone')) {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          } as MediaQueryList
        }
        return originalMatchMedia(query)
      }
    })

    await loginAs(context, baseURL, 'test-pwa-standalone')
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Servipinsa/i })).toBeVisible()
    await page.waitForFunction(() => document.readyState === 'complete')

    await dispatchBeforeInstallPrompt(page)

    await expect(page.getByRole('button', { name: 'Instalar app' })).toHaveCount(0)
  })
})
