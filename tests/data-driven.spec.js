
const { expect } = require('@playwright/test');
const { test } = require('../fixtures/authenticated');
const { NotesPage } = require('../pages/NotesPage');

test(
  'Scenario 7 - data-driven category filtering',
  { tag: ['@regression', '@notes'] },
  async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    const notesPage = new NotesPage(page);

    const notes = [
      {
        title: `Home Note ${Date.now()}`,
        description: 'Home category test',
        category: 'Home',
      },
      {
        title: `Work Note ${Date.now()}`,
        description: 'Work category test',
        category: 'Work',
      },
      {
        title: `Personal Note ${Date.now()}`,
        description: 'Personal category test',
        category: 'Personal',
      },
    ];

    try {
      await notesPage.open();

      for (const note of notes) {
        await notesPage.createNote(note);
      }

      for (const note of notes) {
        await notesPage.filterByCategory(note.category);
        await expect(
          notesPage.noteByTitle(note.title)
        ).toBeVisible();
      }
    } finally {
      await page.close();
    }
  }
);
