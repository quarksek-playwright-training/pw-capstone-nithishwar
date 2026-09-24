const base = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const test = base.test.extend({

  authenticatedContext: async ({ browser }, use) => {
    const statePath = path.resolve(
      __dirname,
      '../.auth/account1.json'
    );

    if (!fs.existsSync(statePath)) {
      throw new Error(
        `Missing authentication state: ${statePath}`
      );
    }

    const context = await browser.newContext({
      storageState: statePath,
    });

    await use(context);

    await context.close();
  },

  secondAuthenticatedContext: async ({ browser }, use) => {
    const statePath = path.resolve(
      __dirname,
      '../.auth/account2.json'
    );

    if (!fs.existsSync(statePath)) {
      throw new Error(
        `Missing authentication state: ${statePath}`
      );
    }

    const context = await browser.newContext({
      storageState: statePath,
    });

    await use(context);

    await context.close();
  },

});

module.exports = {
  test,
  expect: base.expect,
};