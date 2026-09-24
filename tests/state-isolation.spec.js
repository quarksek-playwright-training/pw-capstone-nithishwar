const { test, expect } = require('../fixtures/authenticated');
const { NotesPage } = require('../pages/NotesPage');

test(
  'note created by account1 is invisible to account2 @regression @notes',
  async ({
    authenticatedContext,
    secondAuthenticatedContext,
  }) => {
    const uniqueTitle = `Isolation Test ${Date.now()}`;

    // =========================================================
    // ACCOUNT 1
    // =========================================================

    const account1Page =
      await authenticatedContext.newPage();

    const account1Notes =
      new NotesPage(account1Page);

    await account1Notes.open();

    await account1Notes.createNote({
      title: uniqueTitle,
      description: 'Account isolation test',
      category: 'Personal',
    });

    // Verify Account 1 can see its own note.
    await expect(
      account1Notes.noteByTitle(uniqueTitle)
    ).toBeVisible({
      timeout: 15000,
    });

    // =========================================================
    // ACCOUNT 2
    // =========================================================

    const account2Page =
      await secondAuthenticatedContext.newPage();

    const account2Notes =
      new NotesPage(account2Page);

    await account2Notes.open();

    // Wait for the notes page to finish loading.
    await account2Page.getByText('MyNotes', {
      exact: true,
    }).waitFor({
      state: 'visible',
      timeout: 15000,
    });

    // Give the notes API/UI time to populate.
    await account2Page.waitForTimeout(1000);

    // Account 2 must NOT see Account 1's note.
    await expect(
      account2Notes.noteByTitle(uniqueTitle)
    ).not.toBeVisible({
      timeout: 5000,
    });

    // Close pages only.
    await account1Page.close();
    await account2Page.close();
  }
);