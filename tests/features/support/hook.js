import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

setDefaultTimeout(60 * 1000);

let serverProcess;
let apiProcess;

// Attend que le serveur réponde sur l'URL donnée.
async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // pas encore prêt, on réessaie
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Le serveur n'a pas démarré sur ${url}`);
}

// Une seule fois, avant tous les scénarios : front React (Vite) + API Express.
BeforeAll(async function () {
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'ignore',
    shell: true,
  });
  apiProcess = spawn('node', ['server/index.js'], {
    stdio: 'ignore',
    shell: true,
    env: { ...process.env, PORT: '3001' },
  });
  await Promise.all([
    waitForServer('http://localhost:5173'),
    waitForServer('http://localhost:3001/api/sante'),
  ]);
});

// Une seule fois, à la fin : on arrête les deux serveurs.
AfterAll(async function () {
  if (serverProcess) serverProcess.kill();
  if (apiProcess) apiProcess.kill();
});

// Avant chaque scénario : navigateur + page neufs.
Before(async function () {
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Après chaque scénario : on ferme proprement.
After(async function () {
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
