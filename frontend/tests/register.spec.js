import { test, expect } from '@playwright/test';

test('Successful registration: A new trainer creates their account', async ({ page }) => {

  const randomSuffix = Math.floor(Math.random() * 100000);
  const testNickname = `Trainer_${randomSuffix}`;
  const testEmail = `trainer${randomSuffix}@pokemon.com`;

  await page.goto('http://localhost:3000/register');

  await page.fill('#nickname', testNickname);
  await page.fill('#email', testEmail);
  await page.fill('#password', 'pikachu123');

  await page.click('button[type="submit"]');

  await page.waitForURL('http://localhost:3000/login');

  const loginTitle = page.locator('text=Welcome back!');
  await expect(loginTitle).toBeVisible();
});