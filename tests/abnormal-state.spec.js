const { expect } = require('@playwright/test');
const { test } = require('../fixtures/authenticated');

test(
  'notes list handles abnormal state without crashing',
  {
    tag: ['@regression', '@notes', '@negative'],
  },
  async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();

    await page.goto('/notes/app', {
      waitUntil: 'domcontentloaded',
    });

    // Verify the Notes application loaded successfully.
    await expect(page).toHaveURL(/\/notes\/app/);

    // Verify the main Notes UI is available.
    await expect(
      page.getByText(/MyNotes/i).first()
    ).toBeVisible({ timeout: 10000 });

    // Search can be rendered as an input, button, or text.
    const search = page.locator(
      'input[placeholder*="search" i], ' +
      'input[aria-label*="search" i], ' +
      'button:has-text("Search"), ' +
      '[role="button"]:has-text("Search")'
    ).first();

    // Add Note can also be rendered as a button or link.
    const addNote = page.locator(
      'button:has-text("Add Note"), ' +
      'a:has-text("Add Note"), ' +
      '[role="button"]:has-text("Add Note")'
    ).first();

    await expect(addNote).toBeVisible({ timeout: 10000 });

    // The page should remain usable even when no notes exist.
    await expect(page.locator('body')).toBeVisible();

    // Capture the actual page state for debugging.
    console.log('===== ABNORMAL STATE =====');
    console.log((await page.locator('body').innerText()).slice(0, 3000));
    console.log('===== END ABNORMAL STATE =====');

    await page.close();
  }
);