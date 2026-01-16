import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for smoke tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-iphone-16',
      use: {
        ...devices['iPhone 15 Pro'], // iPhone 16 uses same viewport as 15 Pro
        // iPhone 16 specs: 393x852 viewport, 2.5x pixel ratio
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        defaultBrowserType: 'webkit',
      },
    },
  ],

  // Run local dev server before tests (only in local development)
  webServer: process.env.CI ? undefined : {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
