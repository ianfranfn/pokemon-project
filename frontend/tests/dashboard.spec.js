import { test, expect } from '@playwright/test';

test.describe('Dashboard and Authentication', () => {
  
  test('Must log in and redirect to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[type="text"]', 'ianfarina9@gmail.com');
    await page.fill('input[type="password"]', 'admin123'); 
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    const token = await page.evaluate(() => localStorage.getItem('pokemon_token'));
    expect(token).toBeTruthy();

    const pokemonName = page.locator('text=ditto');
    await expect(pokemonName).toBeVisible();

    const pokemonImage = page.locator('img[alt="Image of ditto"]');
    await expect(pokemonImage).toBeVisible();
    await expect(pokemonImage).toHaveAttribute('src', /img\.pokemondb\.net/);
  });

  test('Must redirect to login if no token is present', async ({ page }) => {

    await page.goto('http://localhost:3000/dashboard');

    await expect(page).toHaveURL('http://localhost:3000/login');
  });

});