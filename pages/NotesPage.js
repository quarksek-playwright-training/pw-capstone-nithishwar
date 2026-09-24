const { BasePage } = require('./BasePage');

class NotesPage extends BasePage {
  constructor(page) {
    super(page);

    this.addNoteButton = page.getByRole('button', {
      name: /add note|create|new note/i,
    }).first();

    this.titleInput = page.getByLabel(/title/i).first();

    this.descriptionInput = page
      .getByLabel(/description/i)
      .first();

    this.categoryInput = page
      .getByLabel(/category/i)
      .first();
  }

  async open() {
    await this.page.goto('/notes/app', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await this.page.getByText('MyNotes', {
      exact: true,
    }).waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  async createNote({ title, description, category }) {
    // Open Add Note form
    await this.addNoteButton.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await this.addNoteButton.click({
      force: true,
    });

    // Wait for form
    await this.titleInput.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await this.titleInput.fill(title);

    await this.descriptionInput.fill(description);

    // Select category
    const tagName = await this.categoryInput.evaluate(
      element => element.tagName.toLowerCase()
    );

    if (tagName === 'select') {
      await this.categoryInput.selectOption({
        label: category,
      });
    } else {
      await this.categoryInput.click({
        force: true,
      });

      const option = this.page
        .getByText(category, {
          exact: true,
        })
        .last();

      await option.waitFor({
        state: 'visible',
        timeout: 10000,
      });

      await option.click({
        force: true,
      });
    }

    // Find Create / Save button inside note form
    const form = this.page
      .locator('form')
      .filter({
        has: this.titleInput,
      })
      .last();

    const submitButton = form
      .locator(
        'button[type="submit"], input[type="submit"], button:has-text("Create"), button:has-text("Save")'
      )
      .first();

    await submitButton.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    // Force click because website ads can intercept pointer events
    await submitButton.click({
      force: true,
      timeout: 15000,
    });

    // Wait for created note
    await this.noteByTitle(title).waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  async filterByCategory(category) {
    // Wait until Notes page is loaded
    await this.page.getByText('MyNotes', {
      exact: true,
    }).waitFor({
      state: 'visible',
      timeout: 15000,
    });

    // Find category
    const categoryFilter = this.page
      .getByText(category, {
        exact: true,
      })
      .last();

    await categoryFilter.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    // WebKit/ad iframe can intercept the click
    await categoryFilter.click({
      force: true,
      timeout: 15000,
    });

    // Allow UI to update
    await this.page.waitForTimeout(500);
  }

  noteByTitle(title) {
    return this.page.getByText(title, {
      exact: true,
    });
  }
}

module.exports = {
  NotesPage,
};