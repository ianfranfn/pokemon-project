import { test, expect } from '@playwright/test';

test('Successful login: The user logs in with their nickname and the Navbar updates', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('#identifier', 'adminog'); 
  await page.fill('#password', 'admin2311'); 
  await page.click('button[type="submit"]');

  await page.waitForURL('http://localhost:3000/');

  const greeting = page.locator('text=adminog');
  await expect(greeting).toBeVisible();
});