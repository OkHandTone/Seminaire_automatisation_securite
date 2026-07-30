// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
});

test("la page affiche l'événement", async ({ page }) => {
  await expect(page).toHaveTitle(/EventSphere/);
  await expect(page.locator('#titre')).toHaveText('Salon de la Tech 2026');
});

test('une inscription valide génère un badge', async ({ page }) => {
  await page.locator('#nom').fill('Marie Durand');
  await page.locator('#email').fill('marie.durand@example.com');
  await page.locator('#type').selectOption('vip');
  await page.locator('#bouton-inscription').click();

  await expect(page.locator('#confirmation')).toBeVisible();
  await expect(page.locator('#badge')).toHaveText('VIP-marie-durand');
});

test('une inscription invalide affiche les erreurs', async ({ page }) => {
  await page.locator('#bouton-inscription').click();

  await expect(page.locator('#confirmation')).toBeHidden();
  await expect(page.locator('#erreur-nom')).not.toBeEmpty();
  await expect(page.locator('#erreur-email')).not.toBeEmpty();
  await expect(page.locator('#erreur-type')).not.toBeEmpty();
});
