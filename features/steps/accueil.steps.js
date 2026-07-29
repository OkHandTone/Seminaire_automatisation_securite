const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('je visite la page', async function () {
  await this.page.goto('http://localhost:3000');
});

Then('le titre de la page est {string}', async function (titreAttendu) {
  await expect(this.page.locator('#titre')).toHaveText(titreAttendu);
});

When('je clique sur le bouton', async function () {
  await this.page.locator('#bouton').click();
});

Then('le message {string} s\'affiche', async function (messageAttendu) {
  await expect(this.page.locator('#message')).toHaveText(messageAttendu);
});