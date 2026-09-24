const { expect } = require('@playwright/test');
const { test } = require('../fixtures/authenticated');
const { NotesPage } = require('../pages/NotesPage');

test(
  'create a note and filter it by category',
  {
    tag: ['@smoke', '@notes'],
  },
  async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();

    const notesPage = new NotesPage(page);

    const note = {
      title: `Capstone Note ${Date.now()}`,
      description: 'Playwright happy path note',
      category: 'Personal',
    };

    await notesPage.open();

    await notesPage.createNote(note);

    await notesPage.filterByCategory(note.category);

    await expect(notesPage.noteByTitle(note.title)).toBeVisible();

    await page.close();
  }
);