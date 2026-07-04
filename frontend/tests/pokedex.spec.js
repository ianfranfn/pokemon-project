import { test, expect } from '@playwright/test';

const loginWithEnvUser = async (page) => {
  const identifier = process.env.E2E_LOGIN_IDENTIFIER;
  const password = process.env.E2E_LOGIN_PASSWORD;

  if (!identifier || !password) {
    throw new Error('E2E_LOGIN_IDENTIFIER and E2E_LOGIN_PASSWORD are required');
  }

  await page.goto('http://localhost:3000/login');
  await page.fill('#identifier', identifier);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
};

test('Pokedex search, type filters, and Pokemon details work after login', async ({ page }) => {
  await loginWithEnvUser(page);

  await page.getByPlaceholder('Search Pokemon by name or number...').fill('char');
  await expect(page).toHaveURL(/\/\?search=char/);

  await expect(page.getByRole('button', { name: /Charmander/i })).toBeVisible();
  await page.getByRole('button', { name: 'Fire', exact: true }).click();
  await expect(page.getByRole('button', { name: /Charmander/i })).toBeVisible();

  await page.getByRole('button', { name: /Charmander/i }).click();
  await expect(page.getByRole('heading', { name: /Charmander/i })).toBeVisible();
  await expect(page.getByText('Type')).toBeVisible();
  await expect(page.getByText('Origin')).toBeVisible();
  await expect(page.getByText('Price')).toBeVisible();
});
