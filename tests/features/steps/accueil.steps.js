const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('je visite la page', async function () {
  await this.page.goto('http://localhost:3000');
});

Then('le titre de la page est {string}', async function (titreAttendu) {
  await expect(this.page.locator('#titre')).toHaveText(titreAttendu);
});

When(
  "je m'inscris avec le nom {string}, l'email {string} et le billet {string}",
  async function (nom, email, type) {
    await this.page.locator('#nom').fill(nom);
    await this.page.locator('#email').fill(email);
    await this.page.locator('#type').selectOption(type);
    await this.page.locator('#bouton-inscription').click();
  }
);

Then('mon badge {string} s\'affiche', async function (badgeAttendu) {
  await expect(this.page.locator('#confirmation')).toBeVisible();
  await expect(this.page.locator('#badge')).toHaveText(badgeAttendu);
});

When('je valide le formulaire sans rien remplir', async function () {
  await this.page.locator('#bouton-inscription').click();
});

Then('un message d\'erreur sur le nom s\'affiche', async function () {
  await expect(this.page.locator('#erreur-nom')).not.toBeEmpty();
});
