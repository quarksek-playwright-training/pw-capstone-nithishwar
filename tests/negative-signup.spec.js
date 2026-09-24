const { test, expect } = require('@playwright/test');
const { RegisterPage } = require('../pages/RegisterPage');
const { LoginPage } = require('../pages/LoginPage');

test(
  'registration rejects an existing account @regression @auth @negative',
  {
    tag: ['@regression', '@auth', '@negative'],
  },
  async ({ page }) => {
    const registerPage = new RegisterPage(page);

    const existingEmail = process.env.ACCOUNT1_EMAIL;

    await registerPage.open();

    await registerPage.register({
      email: existingEmail,
      name: 'Duplicate User',
      password: 'Test123456!',
      confirmPassword: 'Test123456!',
    });

    // Allow the registration request/UI update to complete.
    await page.waitForTimeout(1500);

    // The duplicate registration must not redirect to the authenticated area.
    await expect(page).toHaveURL(/\/register/);

    // The registration page must still be displayed.
    await expect(
      page.getByRole('heading', { name: /register/i })
    ).toBeVisible();

    // The user must not be silently logged in.
    await expect(
      page.getByRole('button', { name: /^register$/i })
    ).toBeVisible();

    // Verify that the existing account still works.
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.login(
      process.env.ACCOUNT1_EMAIL,
      process.env.ACCOUNT1_PASSWORD
    );

    await expect(page).not.toHaveURL(/\/login/);
  }
);