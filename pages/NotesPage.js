
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class NotesPage extends BasePage {
  constructor(page) {
    super(page);

    this.addNoteButton = page
      .getByRole('button', {
        name: /add note|create|new note/i,
      })
      .first();

    this.titleInput = page
      .getByLabel(/title/i)
      .first();

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
    // Wait for the Add Note button.
    await this.addNoteButton.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    // Try clicking even if an overlay intercepts the button.
    await this.addNoteButton.click({
      force: true,
      timeout: 10000,
    });

    // Wait for the note form to appear.
    await this.titleInput.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);

    // Select the category.
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

    // Locate the form containing the title input.
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

    await submitButton.click({
      force: true,
      timeout: 15000,
    });

    // Verify that the saved note becomes visible.
    await expect(this.noteByTitle(title)).toBeVisible({
      timeout: 15000,
    });
  }

  async filterByCategory(category) {
    await this.page.getByText('MyNotes', {
      exact: true,
    }).waitFor({
      state: 'visible',
      timeout: 15000,
    });

    const categoryFilter = this.page
      .getByText(category, {
        exact: true,
      })
      .last();

    await categoryFilter.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await categoryFilter.click({
      force: true,
      timeout: 15000,
    });

    // Allow the filtered list to update.
    await this.page.waitForTimeout(1000);
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
