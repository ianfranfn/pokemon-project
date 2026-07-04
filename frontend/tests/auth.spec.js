import { test, expect } from '@playwright/test';

test('Successful login: The user logs in with their nickname and the Navbar updates', async ({ page }) => {
  const identifier = process.env.E2E_LOGIN_IDENTIFIER;
  const password = process.env.E2E_LOGIN_PASSWORD;
  const expectedNickname = process.env.E2E_LOGIN_NICKNAME;

  if (!identifier || !password || !expectedNickname) {
    throw new Error(
      'E2E_LOGIN_IDENTIFIER, E2E_LOGIN_PASSWORD, and E2E_LOGIN_NICKNAME are required'
    );
  }

  await page.goto('http://localhost:3000/login');

  await page.fill('#identifier', identifier);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  await page.waitForURL('http://localhost:3000/dashboard');

  const greeting = page.locator(`text=${expectedNickname}`);
  await expect(greeting).toBeVisible();
});
