const {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
} = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');

setDefaultTimeout(60 * 1000);

let serverProcess;

// Attend que le serveur réponde sur l'URL donnée
async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (_) {
      // pas encore prêt, on réessaie
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Le serveur n'a pas démarré sur ${url}`);
}

// Une seule fois, avant tous les scénarios : on démarre le serveur web
BeforeAll(async function () {
  serverProcess = spawn('npx', ['serve', '-l', '3000', '.'], {
    stdio: 'ignore',
    shell: true,
  });
  await waitForServer('http://localhost:3000');
});

// Une seule fois, à la fin : on arrête le serveur
AfterAll(async function () {
  if (serverProcess) serverProcess.kill();
});

// Avant chaque scénario : navigateur + page neufs
Before(async function () {
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Après chaque scénario : on ferme proprement
After(async function () {
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});