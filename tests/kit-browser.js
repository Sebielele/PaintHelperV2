// Browser test for the painting kit and the backup (static mode, no server):
// saved guides -> pots to pack with stand-ins -> shopping list; backup round trip.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const executablePath = process.env.PLAYWRIGHT_BROWSER_EXECUTABLE;
  if (!executablePath) {
    console.warn("Kit browser test skipped: set PLAYWRIGHT_BROWSER_EXECUTABLE.");
    return;
  }
  const { chromium } = loadPlaywright();
  const server = http.createServer((request, response) => {
    const file = path.join(root, decodeURIComponent(new URL(request.url, "http://x").pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/WarhammerPaintHelper.html`;
  const browser = await chromium.launch({ executablePath, headless: true });
  const errors = [];
  const downloads = fs.mkdtempSync(path.join(os.tmpdir(), "wph-kit-"));

  try {
    const context = await browser.newContext({ locale: "de-CH", acceptDownloads: true });
    await context.addInitScript(() => {
      if (!sessionStorage.getItem("seeded")) {
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem("wph.language", "de");
        localStorage.setItem("wph.guides.v1", JSON.stringify({ version: 1, items: [
          { sig: "s1", title: "Slaanesh Rot", createdAt: "2026-10-01T10:00:00Z", done: [],
            text: "## Rüstung\n1. Grundfarbe **Mephiston Red**.\n2. Schatten **Nuln Oil**.\n3. Kante **Evil Sunz Scarlet**.\n4. Spitzlicht **White Scar**." },
          { sig: "s2", title: "Nur Schwarz", createdAt: "2026-10-02T10:00:00Z", done: [], text: "1. **Abaddon Black** und **Fantasiefarbe**" }
        ] }));
      }
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error" && !/Failed to load resource/.test(message.text())) {
        errors.push(`console: ${message.text()}`);
      }
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector("#palette article");
    await page.click('[data-workflow="paints"]');

    // Own a Vallejo red (stands in for both Citadel reds), Nuln Oil and a white.
    for (const [search, match] of [["Bloody Red", "vallejo|game color|"], ["Nuln Oil", "citadel"], ["Dead White", "vallejo|game color|"]]) {
      await page.fill("#collectionSearchInput", search);
      const box = page.locator(`#ownedPaintList .collection-item input[type=checkbox][value*="${match}"]`).first();
      await box.waitFor();
      await box.check();
    }
    await page.fill("#collectionSearchInput", "");

    // Open the kit, pick the first guide.
    assert.equal(await page.isVisible("#kitBody"), false, "kit starts folded");
    await page.click("#kitCollapseBtn");
    await page.waitForSelector("#kitSources .kit-source");
    assert.equal(await page.locator("#kitSources .kit-source").count(), 2);
    assert.match(await page.textContent("#kitStatus"), /Hake die Anleitungen an/);
    await page.locator("#kitSources .kit-source", { hasText: "Slaanesh Rot" }).locator("input").check();

    // Exact only: Nuln Oil is packed, the rest is missing.
    await page.selectOption("#kitToleranceSelect", "0");
    await page.waitForFunction(() => /1 Töpfe einpacken · 3 kaufen/.test(document.getElementById("kitStatus").textContent));

    // Similar (ΔE ≤ 10): one Vallejo red covers both Citadel reds, Dead White covers White Scar.
    await page.selectOption("#kitToleranceSelect", "10");
    await page.waitForFunction(() => /3 Töpfe einpacken · 0 kaufen/.test(document.getElementById("kitStatus").textContent));
    const packText = await page.textContent("#kitResult");
    assert.match(packText, /Bloody Red/);
    assert.match(packText, /auch für .*Mephiston Red/);
    assert.match(packText, /Einpacken \(3\)/);
    assert.match(await page.textContent("#kitStatus"), /Ersatzfarben sparen 1 Töpfe/);

    // Second guide: Abaddon Black is missing, the made-up paint is reported.
    await page.locator("#kitSources .kit-source", { hasText: "Nur Schwarz" }).locator("input").check();
    await page.waitForSelector("#kitResult .kit-buy-head button");
    assert.match(await page.textContent("#kitResult"), /Nicht im Katalog gefunden: Fantasiefarbe/);
    await page.click("#kitResult .kit-buy-head button");
    await page.waitForFunction(() => /Abaddon Black/.test(document.getElementById("shoppingList").textContent));
    assert.equal(await page.locator("#kitResult .kit-buy-head button").isDisabled(), true);

    // Selection and tolerance survive a reload.
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("#palette article");
    await page.click('[data-workflow="paints"]');
    await page.click("#kitCollapseBtn");
    await page.waitForFunction(() => /2 Anleitungen/.test(document.getElementById("kitStatus").textContent));
    assert.equal(await page.inputValue("#kitToleranceSelect"), "10");
    // Regression (v0.25): the shopping list survives a reload (it was pruned against the
    // small fallback catalogue before the full catalogue had loaded).
    await page.waitForFunction(() => /Abaddon Black/.test(document.getElementById("shoppingList").textContent));

    // Text download.
    const [textDownload] = await Promise.all([page.waitForEvent("download"), page.click("#kitResult .kit-actions button:nth-child(2)")]);
    const textFile = path.join(downloads, "kit.txt");
    await textDownload.saveAs(textFile);
    assert.match(fs.readFileSync(textFile, "utf8"), /^Malkoffer packen\n\nEinpacken \(3\)\n\[ \] Bloody Red – Vallejo/);

    // Backup: download, wipe the guides, restore.
    const [backupDownload] = await Promise.all([page.waitForEvent("download"), page.click("#backupExportBtn")]);
    const backupFile = path.join(downloads, "backup.json");
    await backupDownload.saveAs(backupFile);
    const backup = JSON.parse(fs.readFileSync(backupFile, "utf8"));
    assert.equal(backup.format, "painthelper-v2-backup");
    assert.ok(backup.items["wph.guides.v1"], "guides are in the backup");
    assert.ok(backup.items["wph.kit.v1"], "kit selection is in the backup");
    assert.match(await page.textContent("#backupStatus"), /Sicherung mit \d+ Einträgen heruntergeladen/);

    await page.evaluate(() => localStorage.removeItem("wph.guides.v1"));
    await page.setInputFiles("#backupImportInput", backupFile);
    await page.waitForFunction(() => /Beim Wiederherstellen/.test(document.getElementById("backupStatus").textContent));
    await Promise.all([page.waitForEvent("load"), page.click("#backupImportBtn")]);
    await page.waitForSelector("#palette article");
    assert.ok(await page.evaluate(() => localStorage.getItem("wph.guides.v1")), "guides restored");

    // A file that is not a backup is refused.
    const bad = path.join(downloads, "bad.json");
    fs.writeFileSync(bad, "{\"hello\":1}");
    await page.click('[data-workflow="paints"]');
    await page.setInputFiles("#backupImportInput", bad);
    await page.waitForFunction(() => /keine PaintHelper-Sicherung/.test(document.getElementById("backupStatus").textContent));

    await page.screenshot({ path: path.join(os.tmpdir(), "wph-kit.png"), fullPage: true });
    assert.deepEqual(errors, [], "no browser errors");
    console.log("Kit browser test passed.");
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(downloads, { recursive: true, force: true });
  }
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
