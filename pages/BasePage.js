class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path) {
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
  }

  async waitForUrl(url) {
    await this.page.waitForURL(url, {
      timeout: 30000,
    });
  }
}

module.exports = { BasePage };