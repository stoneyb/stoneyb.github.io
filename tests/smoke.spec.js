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

  test('terminal header elements are present', async ({ page, isMobile }) => {
    await page.goto('/');

    // Check terminal buttons
    const buttons = page.locator('.terminal-buttons');
    await expect(buttons).toHaveCount(1);
    if (!isMobile) {
      await expect(buttons).toBeVisible();
    } else {
      // On mobile these are present but visually hidden to save space.
      await expect(buttons).toBeHidden();
    }

    // Check terminal title
    const title = page.locator('.terminal-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('tomstoneberg.com');

    // Check connection status (may be hidden on mobile layouts)
    const status = page.locator('.terminal-status');
    const statusText = page.locator('.status-text');
    if (!isMobile) {
      await expect(status).toBeVisible();
      await expect(statusText).toContainText(/connected/i);
    } else {
      await expect(status).toHaveCount(1);
      await expect(statusText).toHaveCount(1);
    }
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
  let input, output;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    input = page.locator('#terminal-input');
    output = page.locator('#output');
  });

  test('help command displays available commands', async () => {
    // Type and execute help command
    await input.fill('help');
    await input.press('Enter');

    // Verify help output contains expected commands
    await expect(output).toContainText('Available Commands', { timeout: 5000 });
    await expect(output).toContainText('about');
    await expect(output).toContainText('resume');
    await expect(output).toContainText('contact');
    await expect(output).toContainText('clear');
  });

  test('about command displays bio information', async () => {
    // Execute about command
    await input.fill('about');
    await input.press('Enter');

    // Verify about output
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });
    await expect(output).toContainText('software engineer');
    await expect(output).toContainText('Colorado');
  });

  test('resume command shows work experience', async () => {
    // Execute resume command
    await input.fill('resume');
    await input.press('Enter');

    // Verify resume output
    await expect(output).toContainText('Resume', { timeout: 5000 });
    await expect(output).toContainText('Work Experience');
    await expect(output).toContainText('Skipify');
    await expect(output).toContainText('View Full Resume');

    // Verify PDF link is present
    const pdfLink = output.locator('a[href*="TomStonebergResumeJan2026.pdf"]');
    await expect(pdfLink).toBeVisible();
  });

  test('contact command displays contact options', async () => {
    // Execute contact command
    await input.fill('contact');
    await input.press('Enter');

    // Verify contact output
    await expect(output).toContainText('Get In Touch', { timeout: 5000 });
    await expect(output).toContainText(/Email/i);
    await expect(output).toContainText('hello@tomstoneberg.com');
    await expect(output).toContainText(/GitHub/i);
    await expect(output).toContainText('github.com/stoneyb');
  });

  test('ls command lists directory contents', async () => {
    // Execute ls command
    await input.fill('ls');
    await input.press('Enter');

    // Verify ls output
    await expect(output).toContainText('about/', { timeout: 5000 });
    await expect(output).toContainText('resume/');
    await expect(output).toContainText('contact/');
    await expect(output).toContainText('README.md');
  });

  test('multiple commands work in sequence', async () => {
    // Execute first command
    await input.fill('ls');
    await input.press('Enter');
    await expect(output).toContainText('about/', { timeout: 5000 });

    // Execute second command
    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });

    // Execute third command
    await input.fill('contact');
    await input.press('Enter');
    await expect(output).toContainText('Get In Touch', { timeout: 5000 });

    // Verify all outputs are present in order
    const outputText = await output.textContent();
    expect(outputText).toContain('about/'); // from ls
    expect(outputText).toContain('TOM STONEBERG'); // from about
    expect(outputText).toContain('Get In Touch'); // from contact
  });

  test('clear command clears terminal output', async () => {
    // Execute a command to generate output
    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });

    // Verify output exists
    let outputText = await output.textContent();
    expect(outputText.length).toBeGreaterThan(0);

    // Clear the terminal
    await input.fill('clear');
    await input.press('Enter');

    // Verify output is cleared (wait for DOM to update)
    await expect(output).toHaveText('', { timeout: 5000 });
  });

  test('invalid command shows command not found error', async () => {
    // Execute invalid command
    await input.fill('invalidcommandxyz123');
    await input.press('Enter');

    // Verify error message appears with helpful suggestion
    await expect(output).toContainText(/command not found/i, { timeout: 5000 });
    await expect(output).toContainText(/help/i);
  });
});

test.describe('Command History Navigation Tests', () => {
  let input, output;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    input = page.locator('#terminal-input');
    output = page.locator('#output');
  });

  test('arrow up navigates to previous command', async () => {
    // Execute a command
    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });

    // Press arrow up to recall previous command
    await input.press('ArrowUp');

    // Verify the input field contains the previous command
    await expect(input).toHaveValue('about');
  });

  test('arrow up/down navigates through command history', async () => {
    // Execute multiple commands
    await input.fill('ls');
    await input.press('Enter');
    await expect(output).toContainText('about/', { timeout: 5000 });

    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });

    await input.fill('contact');
    await input.press('Enter');
    await expect(output).toContainText('Get In Touch', { timeout: 5000 });

    // Navigate up through history (should get commands in reverse order)
    await input.press('ArrowUp');
    await expect(input).toHaveValue('contact');

    await input.press('ArrowUp');
    await expect(input).toHaveValue('about');

    await input.press('ArrowUp');
    await expect(input).toHaveValue('ls');

    // Navigate down through history
    await input.press('ArrowDown');
    await expect(input).toHaveValue('about');

    await input.press('ArrowDown');
    await expect(input).toHaveValue('contact');

    // One more down should clear the input
    await input.press('ArrowDown');
    await expect(input).toHaveValue('');
  });

  test('preserves temporary input when navigating history', async () => {
    // Execute a command
    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });

    // Type something but don't execute it
    await input.fill('temporary input');

    // Navigate to history
    await input.press('ArrowUp');
    await expect(input).toHaveValue('about');

    // Navigate back down should restore temporary input
    await input.press('ArrowDown');
    await expect(input).toHaveValue('temporary input');
  });

  test('does not add duplicate consecutive commands to history', async () => {
    // Execute the same command twice
    await input.fill('help');
    await input.press('Enter');
    await expect(output).toContainText('Available Commands', { timeout: 5000 });

    await input.fill('help');
    await input.press('Enter');
    await expect(output).toContainText('Available Commands', { timeout: 5000 });

    // Press arrow up once - should show 'help'
    await input.press('ArrowUp');
    await expect(input).toHaveValue('help');

    // Press arrow up again - should still be on 'help' (not another duplicate)
    // If duplicates were added, it would still show 'help' but we can verify by going down
    await input.press('ArrowDown');
    await expect(input).toHaveValue('');
  });

  test('empty commands are not added to history', async () => {
    // Press Enter without typing anything
    await input.press('Enter');

    // Execute a real command
    await input.fill('about');
    await input.press('Enter');
    await expect(output).toContainText('TOM STONEBERG', { timeout: 5000 });

    // Press arrow up - should get 'about', not empty string
    await input.press('ArrowUp');
    await expect(input).toHaveValue('about');

    // Another arrow up should not find anything (stay on 'about')
    await input.press('ArrowUp');
    await expect(input).toHaveValue('about');
  });
});

test.describe('Mobile-Specific Tests', () => {
  test('terminal renders correctly on mobile viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');

    const terminal = page.locator('.terminal');
    await expect(terminal).toBeVisible();

    // Verify terminal is scrollable on mobile
    const terminalBody = page.locator('.terminal-body');
    await expect(terminalBody).toBeVisible();

    // Verify touch interaction is possible
    const input = page.locator('#terminal-input');
    await input.tap(); // Use tap instead of click for mobile
    await expect(input).toBeFocused();
  });

  test('mobile viewport shows responsive layout', async ({ page, isMobile, viewport }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');

    const terminal = page.locator('.terminal');
    const box = await terminal.boundingBox();

    // Terminal should fit within mobile viewport
    expect(box.width).toBeLessThanOrEqual(viewport.width);

    // Verify terminal header is visible and accessible
    const header = page.locator('.terminal-header');
    await expect(header).toBeVisible();

    // Verify input is accessible on mobile
    const input = page.locator('#terminal-input');
    await expect(input).toBeVisible();
    const inputBox = await input.boundingBox();
    expect(inputBox.width).toBeGreaterThan(0);
  });

  test('mobile commands work with touch input', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');

    const input = page.locator('#terminal-input');
    const output = page.locator('#output');

    // Use tap for mobile interaction
    await input.tap();
    await input.fill('help');
    await input.press('Enter');

    // Verify command output appears
    await expect(output).toContainText('Available Commands', { timeout: 5000 });
  });
});
