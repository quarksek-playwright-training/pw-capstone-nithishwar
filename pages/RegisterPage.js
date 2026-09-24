const { BasePage } = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);

    this.email = page.getByLabel(/email address/i);

    this.name = page.getByLabel(/^name$/i);

    this.password = page.getByLabel(/^password$/i);

    this.confirmPassword = page.getByLabel(/confirm password/i);

    this.registerButton = page.getByRole('button', {
      name: /^register$/i,
    });

    this.errorMessage = page.locator(
      '[role="alert"], .alert, .error-message, .text-danger'
    );
  }

  async open() {
    await this.goto('/notes/app/register');
  }

  async register({ email, name, password, confirmPassword }) {
    await this.email.fill(email);
    await this.name.fill(name);
    await this.password.fill(password);
    await this.confirmPassword.fill(confirmPassword);

    await this.registerButton.click();
  }
}

module.exports = { RegisterPage };