const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'https://practice.expandtesting.com';
const AUTH_DIR = path.resolve('.auth');

async function login(page, account) {
  await page.goto(`${BASE_URL}/notes/app/login`);

  await page.getByLabel(/email address/i).fill(account.email);
  await page.getByLabel(/password/i).fill(account.password);

  await page.getByRole('button', { name: /^login$/i }).click();

  await page.waitForURL(
    url => !url.pathname.endsWith('/login'),
    { timeout: 15000 }
  );
}

async function register(page, account) {
  console.log(`Registering account: ${account.email}`);

  await page.goto(`${BASE_URL}/notes/app/register`);

  await page.getByLabel(/email address/i).fill(account.email);
  await page.getByLabel(/^name$/i).fill(account.name);
  await page.getByLabel(/^password$/i).fill(account.password);

  // The registration page contains two password inputs:
  // 1. Password
  // 2. Confirm Password
  //
  // We use the second password input directly because
  // getByLabel(/confirm password/i) did not target the actual
  // confirmation input on this application.
  const passwordInputs = page.locator('input[type="password"]');

  console.log(
    'Password input count:',
    await passwordInputs.count()
  );

  if (await passwordInputs.count() < 2) {
    throw new Error(
      'Registration page does not contain two password inputs.'
    );
  }

  await passwordInputs.nth(1).fill(account.password);

  await page.getByRole('button', { name: /^register$/i }).click();

  // Give the application time to process the registration.
  await page.waitForTimeout(1500);

  console.log(
    'Registration page result:',
    (await page.locator('body').innerText()).slice(0, 1000)
  );

  // The application may not automatically redirect to login,
  // so explicitly navigate to the login page.
  await page.goto(`${BASE_URL}/notes/app/login`);
}

async function createOrLoginAccount(page, account) {
  await page.goto(`${BASE_URL}/notes/app/login`);

  await page.getByLabel(/email address/i).fill(account.email);
  await page.getByLabel(/password/i).fill(account.password);

  await page.getByRole('button', { name: /^login$/i }).click();

  // Check whether login succeeded.
  const loginSucceeded = await page
    .waitForURL(
      url => !url.pathname.endsWith('/login'),
      { timeout: 5000 }
    )
    .then(() => true)
    .catch(() => false);

  if (!loginSucceeded) {
    const loginError = page.locator(
      'text=/Incorrect email address or password|Invalid email address or password|user not found/i'
    );

    const errorVisible = await loginError
      .isVisible()
      .catch(() => false);

    if (!errorVisible) {
      throw new Error(
        `Could not determine login result for ${account.email}`
      );
    }

    // Account does not exist, so register it.
    await register(page, account);

    // Login again after successful registration.
    await login(page, account);
  }

  console.log(`Authenticated: ${account.email}`);
}

module.exports = async function globalSetup() {
  // Create .auth directory if it doesn't exist.
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const accounts = [
    {
      name: process.env.ACCOUNT1_NAME,
      email: process.env.ACCOUNT1_EMAIL,
      password: process.env.ACCOUNT1_PASSWORD,
      file: 'account1.json',
    },
    {
      name: process.env.ACCOUNT2_NAME,
      email: process.env.ACCOUNT2_EMAIL,
      password: process.env.ACCOUNT2_PASSWORD,
      file: 'account2.json',
    },
  ];

  // Validate environment variables.
  for (const account of accounts) {
    if (!account.name || !account.email || !account.password) {
      throw new Error(
        `Missing credentials for ${account.email || 'account'}`
      );
    }
  }

  const browser = await chromium.launch();

  try {
    for (const account of accounts) {
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await createOrLoginAccount(page, account);

        // Save authenticated browser state.
        await context.storageState({
          path: path.join(AUTH_DIR, account.file),
        });

        console.log(
          `Saved authentication state: .auth/${account.file}`
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
};