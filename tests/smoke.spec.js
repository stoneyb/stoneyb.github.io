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

test.describe('Terminal Command Tests', () => {
  test('help command displays available commands', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Type and execute help command
    await input.fill('help');
    await input.press('Enter');

    // Wait for output to appear
    await page.waitForTimeout(500);

    // Verify help output contains expected commands
    const outputText = await output.textContent();
    expect(outputText).toContain('Available Commands');
    expect(outputText).toContain('about');
    expect(outputText).toContain('resume');
    expect(outputText).toContain('contact');
    expect(outputText).toContain('clear');
  });

  test('about command displays bio information', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute about command
    await input.fill('about');
    await input.press('Enter');

    // Wait for output
    await page.waitForTimeout(500);

    // Verify about output
    const outputText = await output.textContent();
    expect(outputText).toContain('TOM STONEBERG');
    expect(outputText).toContain('software engineer');
    expect(outputText).toContain('Colorado');
  });

  test('resume command shows work experience', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute resume command
    await input.fill('resume');
    await input.press('Enter');

    // Wait for output
    await page.waitForTimeout(500);

    // Verify resume output
    const outputText = await output.textContent();
    expect(outputText).toContain('Resume');
    expect(outputText).toContain('Work Experience');
    expect(outputText).toContain('Skipify');
    expect(outputText).toContain('View Full Resume');

    // Verify PDF link is present
    const pdfLink = output.locator('a[href*="TomStonebergResumeJan2026.pdf"]');
    await expect(pdfLink).toBeVisible();
  });

  test('contact command displays contact options', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute contact command
    await input.fill('contact');
    await input.press('Enter');

    // Wait for output
    await page.waitForTimeout(500);

    // Verify contact output
    const outputText = await output.textContent();
    expect(outputText).toContain('CONTACT OPTIONS');
    expect(outputText).toContain('Email');
    expect(outputText).toContain('GitHub');

    // Verify email link is present
    const emailLink = output.locator('a[href="mailto:hello@tomstoneberg.com"]');
    await expect(emailLink).toBeVisible();

    // Verify GitHub link is present
    const githubLink = output.locator('a[href*="github.com/stoneyb"]');
    await expect(githubLink).toBeVisible();
  });

  test('ls command lists directory contents', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute ls command
    await input.fill('ls');
    await input.press('Enter');

    // Wait for output
    await page.waitForTimeout(500);

    // Verify ls output
    const outputText = await output.textContent();
    expect(outputText).toContain('about/');
    expect(outputText).toContain('resume/');
    expect(outputText).toContain('contact/');
    expect(outputText).toContain('README.md');
  });

  test('multiple commands work in sequence', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute first command
    await input.fill('ls');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Execute second command
    await input.fill('about');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Execute third command
    await input.fill('contact');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Verify all outputs are present in order
    const outputText = await output.textContent();
    expect(outputText).toContain('about/'); // from ls
    expect(outputText).toContain('TOM STONEBERG'); // from about
    expect(outputText).toContain('CONTACT OPTIONS'); // from contact
  });

  test('clear command clears terminal output', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute a command to generate output
    await input.fill('about');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Verify output exists
    let outputText = await output.textContent();
    expect(outputText.length).toBeGreaterThan(0);

    // Clear the terminal
    await input.fill('clear');
    await input.press('Enter');
    await page.waitForTimeout(300);

    // Verify output is cleared
    outputText = await output.textContent();
    expect(outputText.trim()).toBe('');
  });

  test('invalid command shows appropriate response', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Execute invalid command
    await input.fill('invalidcommandxyz123');
    await input.press('Enter');

    // Wait for output
    await page.waitForTimeout(500);

    // Verify error or not found message appears
    const outputText = await output.textContent();
    // The terminal should show some response (error message or "command not found")
    expect(outputText.length).toBeGreaterThan(0);
  });
});
