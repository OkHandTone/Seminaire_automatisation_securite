// @ts-check
import { test, expect } from '@playwright/test';

test('la page affiche le bon titre', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle('Ma page de test');
  await expect(page.locator('#titre')).toHaveText('Bonjour Playwright');
});

test('le bouton affiche un message au clic', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('#message')).toHaveText('');
  await page.locator('#bouton').click();
  await expect(page.locator('#message')).toHaveText('Bouton cliqué !');
});