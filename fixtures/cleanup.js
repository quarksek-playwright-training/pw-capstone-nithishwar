const { request } = require('@playwright/test');
require('dotenv').config();

const API_URL = 'https://practice.expandtesting.com/notes/api';

async function login(api, email, password) {
  const response = await api.post(`${API_URL}/users/login`, {
    form: { email, password },
  });

  if (!response.ok()) {
    throw new Error(`API login failed: ${response.status()}`);
  }

  const body = await response.json();

  return body.data.token;
}

async function cleanupAccount(api, email, password) {
  const token = await login(api, email, password);

  const response = await api.get(`${API_URL}/notes`, {
    headers: {
      'x-auth-token': token,
    },
  });

  if (!response.ok()) {
    return;
  }

  const body = await response.json();
  const notes = body.data || [];

  for (const note of notes) {
    await api.delete(`${API_URL}/notes/${note.id}`, {
      headers: {
        'x-auth-token': token,
      },
    });
  }
}

async function cleanupAllAccounts() {
  const api = await request.newContext();

  try {
    await cleanupAccount(
      api,
      process.env.ACCOUNT1_EMAIL,
      process.env.ACCOUNT1_PASSWORD
    );

    await cleanupAccount(
      api,
      process.env.ACCOUNT2_EMAIL,
      process.env.ACCOUNT2_PASSWORD
    );
  } finally {
    await api.dispose();
  }
}

module.exports = {
  cleanupAllAccounts,
};