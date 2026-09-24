const { test, expect } = require('@playwright/test');

test(
  'login rejects incorrect password @regression @auth @negative',
  async ({ page }) => {
    await page.goto('/notes/app/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.getByLabel(/email/i).fill(
      process.env.ACCOUNT1_EMAIL
    );

    await page.getByLabel(/password/i).fill(
      'WrongPassword123!'
    );

    await page.getByRole('button', {
      name: /login|sign in/i,
    }).click();

    await expect(
      page.getByText(/incorrect email address or password/i)
    ).toBeVisible({
      timeout: 10000,
    });
  }
);