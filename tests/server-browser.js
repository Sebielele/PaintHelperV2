// Browser test for server mode: login, import of local data, saving across devices,
// per-user isolation, logout, and re-login after an expired session.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");

const { openDatabase } = require("../server/db");
const { createServer, loadConfig } = require("../server/server");

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

// Since v0.20 the manual colour controls start folded away behind the assistant.
async function openControls(page) {
  await page.evaluate(() => document.querySelectorAll("[data-control-group]").forEach(group => { group.open = true; }));
}

async function main() {
  const { chromium } = loadPlaywright();
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    const message = "No Edge, Chrome, or Chromium executable found. Set PLAYWRIGHT_BROWSER_EXECUTABLE to a browser path.";
    if (process.env.WPH_BROWSER_SMOKE_REQUIRED === "true") {
      throw new Error(message);
    }
    console.warn(`Server browser test skipped: ${message}`);
    return;
  }

  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-browser-"));
  const config = loadConfig({ DATA_DIR: dataDir });
  const store = openDatabase(config.dataDir);
  store.createUser("anna", "anna-pass-1");
  store.createUser("ben", "ben-pass-12");
  const server = createServer(config, store, { info() {}, warn() {}, error() {} });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath, headless: true });
  const errors = [];

  try {
    // Device 1: has settings from before the login existed.
    const device1 = await browser.newContext({ locale: "de-CH" });
    await device1.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem("wph.profiles.v1", JSON.stringify([]));
        localStorage.setItem("wph.language", "de");
      }
    });
    const page = await openPage(device1, baseUrl, errors);

    assert.equal(await page.locator(".wph-auth-overlay h2").textContent(), "Anmelden");
    assert.equal(await page.locator("#palette article").count(), 0, "app must not start before login");

    await login(page, "anna", "falsch-falsch");
    assert.equal(await page.locator(".wph-auth-error").textContent(), "Benutzername oder Passwort falsch.");
    await login(page, "anna", "anna-pass-1");

    // Offer to copy the local data into the account.
    await page.locator(".wph-auth-overlay [data-action=yes]").click();
    await page.waitForSelector("#palette article");
    assert.equal(await page.locator(".wph-account-user").textContent(), "anna");
    assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("wph.")).length), 0,
      "imported local data is removed from the browser");
    assert.equal(await page.locator('[data-workflow="plan"]').textContent(), "02Bemalplan", "imported language applies");

    await openControls(page); await page.fill("#hexInput", "#7a1f3d");
    await page.dispatchEvent("#hexInput", "change");
    await page.click("#openSaveBtn");
    await page.fill("#profileNameInput", "Annas Armee");
    await page.click("#saveProfileBtn");
    await page.waitForFunction(() => document.querySelector(".wph-account-status").dataset.state === "saved");
    const annaHex = await page.textContent("#currentHex");
    assert.equal(annaHex.toUpperCase(), "#7A1F3D");
    assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("wph.")).length), 0,
      "server mode does not write app data to localStorage");

    // Device 2: same account, same data.
    const device2 = await browser.newContext({ locale: "en-GB" });
    const page2 = await openPage(device2, baseUrl, errors);
    assert.equal(await page2.locator(".wph-auth-overlay h2").textContent(), "Sign in");
    await login(page2, "Anna", "anna-pass-1");
    await page2.waitForSelector("#palette article");
    assert.equal(await page2.locator(".wph-auth-overlay").count(), 0, "no import prompt when the account has data");
    assert.equal(await page2.textContent("#currentHex"), annaHex);
    assert.match(await page2.locator("#savedProfilesSelect").textContent(), /Annas Armee/);

    // Logout and a different user on the same device sees nothing of Anna's.
    await page2.locator(".wph-account-menu > summary").click();
    await page2.locator(".wph-account [data-action=logout]").click();
    await page2.waitForSelector(".wph-auth-overlay");
    await login(page2, "ben", "ben-pass-12");
    await page2.waitForSelector("#palette article");
    assert.notEqual(await page2.textContent("#currentHex"), annaHex);
    assert.doesNotMatch(await page2.locator("#savedProfilesSelect").textContent(), /Annas Armee/);
    assert.equal(await page2.locator(".wph-account-user").textContent(), "ben");

    // Session expires while working: changes are kept and saved after signing in again.
    await device1.clearCookies();
    await openControls(page); await page.fill("#hexInput", "#123456");
    await page.dispatchEvent("#hexInput", "change");
    await page.waitForSelector(".wph-auth-overlay");
    assert.match(await page.locator(".wph-auth-hint").textContent(), /abgelaufen/);
    await page.fill(".wph-auth-form [name=password]", "anna-pass-1");
    await page.click(".wph-auth-form button[type=submit]");
    await page.waitForFunction(() => document.querySelector(".wph-account-status").dataset.state === "saved");
    const hexBeforeReload = await page.textContent("#currentHex");
    assert.notEqual(hexBeforeReload, annaHex);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.textContent("#currentHex"), hexBeforeReload);

    // Change password from the account bar.
    await page.locator(".wph-account-menu > summary").click();
    await page.locator(".wph-account [data-action=password]").click();
    await page.fill("[name=currentPassword]", "anna-pass-1");
    await page.fill("[name=newPassword]", "anna-pass-2");
    await page.fill("[name=repeatPassword]", "anna-pass-2");
    await page.click(".wph-auth-form button[type=submit]");
    await page.waitForSelector(".wph-auth-overlay", { state: "detached" });
    assert.ok(store.authenticate("anna", "anna-pass-2"));

    // A different person signs in after an expired session: queued edits are dropped,
    // never written into the other account.
    const color = id => {
      const settings = JSON.parse(store.readStorage(id)["wph.settings.v1"]);
      return `${settings.h}/${settings.s}/${settings.l}`;
    };
    const benBefore = color(2);
    await device1.clearCookies();
    await openControls(page); await page.fill("#hexInput", "#aa00aa");
    await page.dispatchEvent("#hexInput", "change");
    await page.waitForSelector(".wph-auth-overlay");
    await page.fill(".wph-auth-form [name=username]", "ben");
    await page.fill(".wph-auth-form [name=password]", "ben-pass-12");
    await Promise.all([page.waitForEvent("load"), page.click(".wph-auth-form button[type=submit]")]);
    await page.waitForSelector("#palette article");
    await page.waitForTimeout(800);
    assert.equal(color(2), benBefore, "Ben's data must not receive Anna's edits");
    assert.equal(await page.locator(".wph-account-user").textContent(), "ben");

    // A failed data load shows a retry screen instead of starting with defaults.
    await openControls(page); await page.fill("#hexInput", "#c08040");
    await page.dispatchEvent("#hexInput", "change");
    await page.waitForFunction(() => document.querySelector(".wph-account-status").dataset.state === "saved");
    const benSettings = color(2);
    let failOnce = true;
    await page.route("**/api/storage", route => {
      if (failOnce && route.request().method() === "GET") {
        failOnce = false;
        return route.fulfill({ status: 502, body: "Bad gateway" });
      }
      return route.continue();
    });
    await page.reload();
    await page.waitForSelector(".wph-auth-overlay [data-action=retry]");
    assert.equal(await page.locator("#palette article").count(), 0);
    await page.click(".wph-auth-overlay [data-action=retry]");
    await page.waitForSelector("#palette article");
    await page.waitForTimeout(800);
    assert.equal(color(2), benSettings, "settings unchanged after failed load");
    await page.unroute("**/api/storage");

    // Signing out waits for a save that is still in flight.
    await page.route("**/api/storage/**", async route => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      route.continue().catch(() => {});
    });
    await openControls(page); await page.fill("#hexInput", "#336699");
    await page.dispatchEvent("#hexInput", "change");
    await page.waitForTimeout(700);
    const benLatest = await page.textContent("#currentHex");
    await page.locator(".wph-account-menu > summary").click();
    await page.locator(".wph-account [data-action=logout]").click();
    await page.waitForSelector(".wph-auth-form");
    await page.unroute("**/api/storage/**");
    await login(page, "ben", "ben-pass-12");
    await page.waitForSelector("#palette article");
    assert.equal(await page.textContent("#currentHex"), benLatest, "last edit survives sign-out");

    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true,
        `Horizontal overflow at ${width}px`);
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: path.join(dataDir, "..", "wph-server-mode.png") });

    const unexpected = errors.filter(text => !/(401 \(Unauthorized\)|502 \(Bad Gateway\))/.test(text));
    assert.deepEqual(unexpected, [], "no browser errors or CSP violations");
    console.log("Server browser test passed.");
  } finally {
    await browser.close();
    server.close();
    store.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

async function openPage(context, url, errors) {
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".wph-auth-overlay");
  return page;
}

async function login(page, username, password) {
  await page.fill(".wph-auth-form [name=username]", username);
  await page.fill(".wph-auth-form [name=password]", password);
  await page.click(".wph-auth-form button[type=submit]");
  await page.waitForFunction(() => !document.querySelector(".wph-auth-form button[type=submit]")?.disabled);
}

function loadPlaywright() {
  for (const name of ["playwright-core", "playwright"]) {
    try {
      return require(name);
    } catch (error) {
      // Try the next package name.
    }
  }
  throw new Error("Install playwright-core (npm install) to run the browser test.");
}

function findBrowserExecutable() {
  if (process.env.PLAYWRIGHT_BROWSER_EXECUTABLE) {
    return process.env.PLAYWRIGHT_BROWSER_EXECUTABLE;
  }
  const candidates = [
    "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}
