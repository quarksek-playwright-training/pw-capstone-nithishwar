import { test, expect } from '@playwright/test';

test(
  'login with valid credentials reaches authenticated area @smoke @auth',
  async ({ page }) => {
    await page.goto('/notes/app/login');

    await page.getByLabel(/email/i).fill(process.env.ACCOUNT1_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.ACCOUNT1_PASSWORD);

    await page.getByRole('button', { name: /login/i }).click();

    // Allow slower browsers such as Firefox/WebKit more time
    await expect(page).not.toHaveURL(/\/login/, {
      timeout: 15000,
    });

    // Confirm authenticated page is actually loaded
    await expect(
      page.getByText('My Notes', { exact: false })
    ).toBeVisible({
      timeout: 15000,
    });
  }
);