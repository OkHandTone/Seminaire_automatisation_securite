// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
});

test('le thème clair est actif par défaut', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#bascule-theme')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('le bouton bascule vers le thème sombre', async ({ page }) => {
  await page.locator('#bascule-theme').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#bascule-theme')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('le choix de thème est mémorisé après rechargement', async ({ page }) => {
  await page.locator('#bascule-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#bascule-theme')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
