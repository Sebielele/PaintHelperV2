// Browser test for the v0.20 tablet workflow against a fake model server:
// assistant box -> palette -> guide with tick boxes -> painting desk -> army import,
// model stages, a guide per unit, and that all of it survives a reload.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");

const { openDatabase } = require("../server/db");
const { createServer, loadConfig } = require("../server/server");
const { createAi, loadAiConfig } = require("../server/ai");
const { startFakeOvms } = require("./fake-ovms");

const root = path.resolve(__dirname, "..");

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const { chromium } = loadPlaywright();
  const executablePath = process.env.PLAYWRIGHT_BROWSER_EXECUTABLE;
  if (!executablePath) {
    console.warn("Tablet browser test skipped: set PLAYWRIGHT_BROWSER_EXECUTABLE.");
    return;
  }
  const fake = await startFakeOvms({ delayMs: 20 });
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-tablet-"));
  const store = openDatabase(dataDir);
  store.createUser("anna", "anna-pass-1");
  const log = { info() {}, warn() {}, error() {} };
  const ai = createAi(loadAiConfig({
    AI_LLM_URL: fake.url, AI_LLM_MODEL: "test", AI_EMBED_URL: fake.url, AI_EMBED_MODEL: "test"
  }), { appRoot: root, dataDir, store, log });
  const server = createServer(loadConfig({ DATA_DIR: dataDir }), store, log, ai);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ executablePath, headless: true });
  const errors = [];

  try {
    const context = await browser.newContext({ locale: "de-CH", viewport: { width: 1180, height: 820 }, hasTouch: true });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle" });
    await page.fill(".wph-auth-form [name=username]", "anna");
    await page.fill(".wph-auth-form [name=password]", "anna-pass-1");
    await page.click(".wph-auth-form button[type=submit]");
    await page.waitForSelector("#palette article");
    await page.waitForFunction(() => document.documentElement.classList.contains("wph-ai-llm"));

    // Assistant first: the box is the first thing on the page, the status light is on.
    const heroTop = await page.locator("#assistHero").evaluate(node => node.getBoundingClientRect().top);
    const controlsTop = await page.locator(".controls").evaluate(node => node.getBoundingClientRect().top);
    assert.ok(heroTop < controlsTop, "assistant box above the manual controls");
    await page.waitForFunction(() => document.getElementById("assistStatus").dataset.state === "ready");
    assert.equal(await page.isVisible("#assistDock"), true, "quick-action dock on a tablet");
    assert.equal(await page.locator('[data-control-group="color"]').evaluate(node => node.open), false, "manual colour tools folded");

    // Example chip fills the box; the palette is created from it.
    await page.locator("#assistExamples .assist-chip").first().click();
    assert.match(await page.inputValue("#aiPaletteInput"), /Stormcast/);
    await page.fill("#aiPaletteInput", "Nurgle, rostiges Messing");
    await page.click("#aiPaletteBtn");
    await page.waitForFunction(() => /Rostiger Nurgle/.test(document.getElementById("aiPaletteStatus").textContent));
    await page.waitForSelector("#assistRecent .assist-recent-chip[aria-pressed='true']");

    // Guide from the action bar: tick boxes, progress, saved.
    await page.click("#assistGuideBtn");
    await page.waitForSelector("#aiRecipeOutput .guide-step input");
    assert.equal(await page.getAttribute('[data-workflow="plan"]', "aria-current"), "step");
    const steps = await page.locator("#aiRecipeOutput .guide-step").count();
    assert.ok(steps >= 10, `guide has ${steps} steps`);
    await page.locator("#aiRecipeOutput .guide-step input").first().check();
    assert.match(await page.textContent("#aiRecipeProgress"), new RegExp(`1 von ${steps}`));

    // What am I missing: unowned guide paints go to the shopping list with one button.
    await page.waitForSelector("#aiRecipeMissing:not([hidden])");
    await page.locator("#aiRecipeMissing .guide-missing-head button").click();
    assert.ok(await page.locator("#shoppingList .shopping-item, #shoppingList li, #shoppingList > *").count() > 0, "missing paints listed");
    assert.equal(await page.locator("#aiRecipeMissing .guide-missing-head button").isDisabled(), true);

    // Painting desk: starts at the first open step; "done, next" ticks and moves on.
    await page.click("#aiRecipeBenchBtn");
    await page.waitForSelector(".bench:not([hidden])");
    assert.match(await page.textContent(".bench-counter"), new RegExp(`Schritt 2 von ${steps}`));
    await page.click(".bench-next");
    assert.match(await page.textContent(".bench-counter"), new RegExp(`Schritt 3 von ${steps}`));
    await page.keyboard.press("ArrowLeft");
    assert.match(await page.textContent(".bench-counter"), /Schritt 2/);
    assert.equal(await page.isVisible(".bench-done"), true);
    await page.click(".bench-close");
    assert.match(await page.textContent("#aiRecipeProgress"), new RegExp(`2 von ${steps}`));

    // A lock is lost when the game system changes; "undo" brings settings and lock back.
    await page.click('[data-workflow="palette"]');
    await page.locator("#palette .palette-lock").first().click();
    assert.equal(await page.locator("#undoResetBtn").isHidden(), true);
    const system = await page.inputValue("#systemSelect");
    await page.selectOption("#systemSelect", system === "aos" ? "k40" : "aos");
    await page.waitForSelector("#undoResetBtn:not([hidden])");
    await page.click("#undoResetBtn");
    assert.equal(await page.inputValue("#systemSelect"), system);
    assert.equal(await page.locator("#palette .palette-lock").first().getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#undoResetBtn").isHidden(), true);

    // Army: import the NewRecruit list, set stages, assign the palette, write a unit guide.
    await page.click('[data-dock="army"]');
    await page.waitForSelector(".army-empty");
    await page.setInputFiles("#armyImportInput", path.join(__dirname, "fixtures", "newrecruit-hedonites.json"));
    await page.waitForSelector(".army-overview");
    assert.match(await page.textContent("#armyStatus"), /TryHard/);
    assert.equal(await page.locator(".army-unit").count(), 12, "manifestations and terrain hidden by default");
    const daemonettes = page.locator(".army-unit", { hasText: "Daemonettes" }).first();
    await daemonettes.locator(".army-bulk").selectOption("3");
    await page.locator(".army-unit", { hasText: "Shalaxi Helbane" }).locator(".army-model").click();
    assert.match(await page.textContent(".army-figures"), /10 \/ 34/);
    assert.match(await page.textContent(".army-figures"), /120 \/ 2000/);
    await page.selectOption("#armyPaletteSelect", { label: "Rostiger Nurgle" });
    const fiends = page.locator(".army-unit", { hasText: "Fiends" });
    await fiends.locator(".army-write").click();
    await fiends.locator(".army-bench").waitFor();
    const unitPrompt = fake.state.requests.filter(request => request.body.stream).pop().body.messages[1].content;
    assert.match(unitPrompt, /The guide is for this unit: Fiends/);
    await fiends.locator(".army-bench").click();
    await page.waitForSelector(".bench:not([hidden])");
    assert.equal(await page.textContent(".bench-title"), "Fiends");
    await page.click(".bench-next");
    await page.click(".bench-close");

    // Everything is stored per user on the server.
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: "networkidle" });
    await page.click('[data-workflow="army"]');
    await page.waitForSelector(".army-overview");
    assert.match(await page.textContent(".army-figures"), /10 \/ 34/);
    assert.match(await page.locator(".army-unit", { hasText: "Fiends" }).locator(".army-bench").textContent(), /\(1\//);
    assert.equal(await page.inputValue("#armyPaletteSelect") !== "", true);
    await page.click('[data-workflow="palette"]');
    await page.locator("#assistRecent .assist-recent-chip").first().click();
    await page.click('[data-workflow="plan"]');
    await page.waitForSelector("#aiRecipeOutput .guide-step input:checked");
    assert.equal(await page.locator("#aiRecipeOutput .guide-step input:checked").count(), 2);

    for (const width of [390, 820, 1180]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ["palette", "plan", "paints", "army"]) {
        await page.evaluate(target => window.WPHWorkflow.show(target), view);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `overflow in ${view} at ${width}px`);
      }
    }
    assert.deepEqual(errors, [], "no browser errors");
    console.log("Tablet browser test passed.");
  } finally {
    await browser.close();
    server.close();
    store.close();
    await fake.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
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
