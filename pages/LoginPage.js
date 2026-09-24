const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.email = page.locator('[data-testid="login-email"]');
    this.password = page.locator('[data-testid="login-password"]');
    this.submitButton = page.locator('[data-testid="login-submit"]');

    this.emailBySibling = page.locator(
      'xpath=//label[normalize-space()="Email address"]/following-sibling::input'
    );

    this.passwordBySibling = page.locator(
      'xpath=//label[normalize-space()="Password"]/following-sibling::input'
    );

    this.errorMessage = page.locator(
      '[role="alert"], .alert, .error-message'
    );
  }

  async open() {
    await this.goto('/notes/app/login');
  }

  async login(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}

module.exports = { LoginPage };