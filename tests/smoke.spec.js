import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
  });

  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Tom Stoneberg/);
  });

  test('terminal container is rendered', async ({ page }) => {
    await page.goto('/');
    const terminal = page.locator('.terminal');
    await expect(terminal).toBeVisible();
  });

  test('terminal header elements are present', async ({ page }) => {
    await page.goto('/');

    // Check terminal buttons
    await expect(page.locator('.terminal-buttons')).toBeVisible();

    // Check terminal title
    const title = page.locator('.terminal-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('tomstoneberg.com');

    // Check connection status
    await expect(page.locator('.terminal-status')).toBeVisible();
    await expect(page.locator('.status-text')).toContainText('connected');
  });

  test('terminal input is present and focusable', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('terminal output area exists', async ({ page }) => {
    await page.goto('/');
    const output = page.locator('#output');
    await expect(output).toBeVisible();
  });

  test('main CSS is loaded', async ({ page }) => {
    await page.goto('/');

    // Check if terminal has expected background (indicates CSS loaded)
    const terminal = page.locator('.terminal');
    const bgColor = await terminal.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should not be default white/transparent
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('resume PDF is accessible', async ({ page, context }) => {
    await page.goto('/');

    // Check if resume link exists and is valid
    const response = await context.request.get('/assets/TomStonebergResumeJan2026.pdf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('og-image asset is accessible', async ({ page, context }) => {
    await page.goto('/');

    // Check if OG image exists
    const response = await context.request.get('/assets/og-image.png');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image');
  });

  test('CRT overlay effects are rendered', async ({ page }) => {
    await page.goto('/');

    // Check for visual effects elements
    await expect(page.locator('.crt-overlay')).toBeVisible();
    await expect(page.locator('.scanlines')).toBeVisible();
    await expect(page.locator('.screen-glow')).toBeVisible();
  });
});
