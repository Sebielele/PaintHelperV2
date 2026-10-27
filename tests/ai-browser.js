// Browser test for the assistant features against a fake model server:
// palette from a description, photo palette, painting guide, paint search,
// plus the static (no server) mode where only the photo palette is offered.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
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
    console.warn("Assistant browser test skipped: set PLAYWRIGHT_BROWSER_EXECUTABLE.");
    return;
  }
  const fake = await startFakeOvms({ delayMs: 50 });
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-ai-browser-"));
  const store = openDatabase(dataDir);
  store.createUser("anna", "anna-pass-1");
  const ai = createAi(loadAiConfig({
    AI_LLM_URL: fake.url, AI_LLM_MODEL: "test", AI_EMBED_URL: fake.url, AI_EMBED_MODEL: "test"
  }), { appRoot: root, dataDir, store, log: { info() {}, warn() {}, error() {} } });
  const server = createServer(loadConfig({ DATA_DIR: dataDir }), store, { info() {}, warn() {}, error() {} }, ai);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ executablePath, headless: true });
  const errors = [];

  try {
    const context = await browser.newContext({ locale: "de-CH", viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    watchErrors(page, errors);
    await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle" });
    await page.fill(".wph-auth-form [name=username]", "anna");
    await page.fill(".wph-auth-form [name=password]", "anna-pass-1");
    await page.click(".wph-auth-form button[type=submit]");
    await page.waitForSelector("#palette article");
    await page.waitForFunction(() => document.documentElement.classList.contains("wph-ai-llm"));

    // 1. Palette from a description becomes a saved custom palette.
    assert.equal(await page.isVisible("#aiPaletteInput"), true);
    await page.fill("#aiPaletteInput", "Nurgle, rostiges Messing, krankes Grün");
    await page.click("#aiPaletteBtn");
    await page.waitForFunction(() => /Rostiger Nurgle/.test(document.getElementById("aiPaletteStatus").textContent));
    assert.deepEqual(await page.locator("#palette .hex").allTextContents(), ["#6B7A3A", "#A07A3C", "#3B2A1E", "#D8CBA0", "#C9B640"]);
    assert.deepEqual(await page.locator("#palette .role").allTextContents(), ["Rüstung", "Messing", "Leder", "Knochen", "Eiter"]);
    assert.equal(await page.locator("#factionSelect option:checked").textContent(), "★ Eigene Paletten");
    assert.match(await page.textContent("#paintNotes"), /krankem Grün/);
    assert.equal(await page.isVisible("#aiDeletePaletteBtn"), true);

    // Rating a palette (with an optional comment) is stored for this user.
    assert.equal(await page.isVisible("#aiPaletteFeedback"), true);
    await page.locator("#aiPaletteFeedback [data-rating='1']").click();
    await page.waitForFunction(() => /Danke/.test(document.querySelector("#aiPaletteFeedback .ai-status").textContent));
    await page.fill("#aiPaletteFeedback .ai-feedback-comment input", "schön rostig");
    await page.click("#aiPaletteFeedback .ai-feedback-comment button");
    await page.waitForSelector("#aiPaletteFeedback .ai-feedback-comment", { state: "hidden" });
    const stored = store.listFeedback(1, "palette");
    assert.equal(stored.length, 1);
    assert.equal(stored[0].rating, 1);
    assert.equal(stored[0].comment, "schön rostig");
    assert.equal(JSON.parse(stored[0].payload).colors[0].hex, "#6B7A3A");
    assert.equal(await page.locator("#aiPaletteFeedback [data-rating='1']").getAttribute("aria-pressed"), "true");

    // Improve the palette: locked colours stay, undo restores the previous version.
    await page.locator("#palette .palette-lock").nth(2).click();
    fake.state.options.paletteReply = JSON.stringify({
      name: "Dunkler Nurgle",
      notes: "Dunkler.",
      colors: [
        { role: "D", name: "Rüstung", hex: "#3E4A22" },
        { role: "S", name: "Messing", hex: "#7A5A2A" },
        { role: "ND", name: "Leder", hex: "#FF0000" },
        { role: "NL", name: "Knochen", hex: "#D8CBA0" },
        { role: "A1", name: "Eiter", hex: "#C9B640" }
      ]
    });
    await page.fill("#aiRefineInput", "dunkler");
    await page.click("#aiRefineBtn");
    await page.waitForFunction(() => /angepasst/.test(document.getElementById("aiRefineStatus").textContent));
    assert.deepEqual((await page.locator("#palette .hex").allTextContents()).slice(0, 3), ["#3E4A22", "#7A5A2A", "#3B2A1E"]);
    const refineRequest = fake.state.requests.filter(request => request.url === "/v3/chat/completions").pop().body;
    assert.equal(JSON.parse(refineRequest.messages[1].content).current.colors.find(color => color.role === "ND").locked, true);
    assert.match((await page.locator("#subfactionSelect option").allTextContents()).join("|"), /Dunkler Nurgle/);
    assert.equal(await page.locator("#aiPaletteFeedback [data-rating='1']").getAttribute("aria-pressed"), "false", "new version is unrated");
    await page.click("#aiUndoBtn");
    assert.deepEqual(await page.locator("#palette .hex").allTextContents(), ["#6B7A3A", "#A07A3C", "#3B2A1E", "#D8CBA0", "#C9B640"]);
    assert.match(await page.textContent("#aiRefineStatus"), /wiederhergestellt/);
    delete fake.state.options.paletteReply;

    // 2. Photo palette (no AI involved).
    const photo = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#DDDDDD"; ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = "#2F5D3A"; ctx.fillRect(50, 40, 100, 120);
      ctx.fillStyle = "#C8A040"; ctx.fillRect(50, 90, 100, 18);
      ctx.fillStyle = "#1E1A18"; ctx.fillRect(60, 150, 80, 14);
      ctx.fillStyle = "#D02020"; ctx.fillRect(95, 60, 10, 10);
      return canvas.toDataURL("image/png").split(",")[1];
    });
    await page.setInputFiles("#aiPhotoInput", { name: "dark_angels.png", mimeType: "image/png", buffer: Buffer.from(photo, "base64") });
    await page.waitForFunction(() => /dark angels/.test(document.getElementById("aiPhotoStatus").textContent));
    const photoHexes = await page.locator("#palette .hex").allTextContents();
    assert.ok(photoHexes.length >= 4, `photo palette has ${photoHexes.length} colours`);
    assert.ok(near(photoHexes[0], "#2F5D3A"), `dominant ${photoHexes[0]} should be the green`);
    assert.ok(photoHexes.some(hex => near(hex, "#C8A040")), "gold found");
    assert.ok(photoHexes.some(hex => near(hex, "#1E1A18")), "dark neutral found");
    const customOptions = await page.locator("#subfactionSelect option").allTextContents();
    assert.ok(customOptions.some(text => /dark angels - Foto/.test(text)));
    assert.ok(customOptions.some(text => /Rostiger Nurgle - Assistent/.test(text)));

    // Custom palettes survive a reload (stored with the account) and can be deleted.
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("#palette article");
    assert.deepEqual(await page.locator("#palette .hex").allTextContents(), photoHexes);
    await page.click("#aiDeletePaletteBtn");
    assert.equal(await page.locator("#factionSelect").inputValue(), "__custom__");
    assert.doesNotMatch((await page.locator("#subfactionSelect option").allTextContents()).join("|"), /dark angels/);

    // Own palettes stay selected across game systems ...
    const nurgleHexes = await page.locator("#palette .hex").allTextContents();
    await page.selectOption("#systemSelect", "k40");
    assert.deepEqual(await page.locator("#palette .hex").allTextContents(), nurgleHexes);
    await page.selectOption("#systemSelect", "aos");

    // ... survive loading an older profile ...
    await page.click("#openSaveBtn");
    await page.fill("#profileNameInput", "Nur Nurgle");
    await page.click("#saveProfileBtn");
    await page.setInputFiles("#aiPhotoInput", { name: "second photo.png", mimeType: "image/png", buffer: Buffer.from(photo, "base64") });
    await page.waitForFunction(() => /second photo/.test(document.getElementById("aiPhotoStatus").textContent));
    await page.selectOption("#savedProfilesSelect", { label: "Nur Nurgle" });
    await page.click("#loadProfileBtn");
    assert.deepEqual(await page.locator("#palette .hex").allTextContents(), nurgleHexes);
    assert.match((await page.locator("#subfactionSelect option").allTextContents()).join("|"), /second photo/);

    // ... and travel with share links.
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => { window.copiedShareUrl = text; } } });
    });
    await page.click("#copyShareLinkBtn");
    const shareUrl = new URL(await page.evaluate(() => window.copiedShareUrl));
    const receiver = await (await browser.newContext({ locale: "de-CH" })).newPage();
    watchErrors(receiver, errors);
    await receiver.goto(`http://127.0.0.1:${staticServer.address().port}/WarhammerPaintHelper.html${shareUrl.search}`, { waitUntil: "networkidle" });
    await receiver.waitForSelector("#palette article");
    assert.deepEqual(await receiver.locator("#palette .hex").allTextContents(), nurgleHexes);
    assert.equal(await receiver.locator("#factionSelect option:checked").textContent(), "★ Eigene Paletten");
    await receiver.close();

    // 3. Painting guide, streamed and rendered as safe HTML.
    await page.click('[data-workflow="plan"]');
    assert.equal(await page.isVisible("#aiRecipeBtn"), true);
    assert.equal(await page.locator("#aiRecipeOwnedOnly").isDisabled(), true, "no owned paints yet");
    assert.match(await page.textContent("#aiRecipeOwnedOnlyLabel"), /\(0\)/);
    fake.state.options.recipeText = "## Tipps\n- Kanten mit **Retributor Armour** betonen.\n- Augen in **Erfundenes Gelb**.\n";
    await page.click("#aiRecipeBtn");
    await page.waitForFunction(() => Array.from(document.querySelectorAll("#aiRecipeOutput strong")).some(node => node.textContent.startsWith("Retributor Armour")));
    await page.waitForSelector("#aiRecipeCopyBtn:not([hidden])");
    assert.equal(await page.locator("#aiRecipeOutput h4").first().textContent(), "Vorbereitung");
    // The guide is built from the app data (one catalogue paint per step); the model
    // only adds the tips section at the end.
    assert.ok(await page.locator("#aiRecipeOutput ol li").count() >= 10, "steps for every colour");
    assert.equal(await page.locator("#aiRecipeOutput h4").last().textContent(), "Tipps");
    const sentTips = fake.state.requests.find(request => request.body.stream).body.messages;
    assert.match(sentTips[0].content, /in German/);
    assert.match(sentTips[1].content, /## Vorbereitung[\s\S]*\*\*[^*]+\*\*/);

    // Paint names are checked: known ones get a swatch and a shopping-list button.
    assert.ok(await page.locator("#aiRecipeOutput .ai-paint").count() >= 10);
    assert.equal(await page.locator("#aiRecipeOutput .ai-paint-unknown").textContent(), "Erfundenes Gelb");
    assert.match(await page.textContent("#aiRecipeStatus"), /Nicht im Katalog gefundene Farbnamen: 1/);
    await page.locator("#aiRecipeOutput .ai-paint", { hasText: "Retributor Armour" }).locator("button").click();
    assert.match(await page.textContent("#shoppingList"), /Retributor Armour/);

    // Feedback on the guide, with a comment, ends up in the next guide's prompt.
    await page.locator("#aiRecipeFeedback [data-rating='-1']").click();
    await page.waitForSelector("#aiRecipeFeedback .ai-feedback-comment:not([hidden])");
    await page.fill("#aiRecipeFeedback .ai-feedback-comment input", "zu lang");
    await page.click("#aiRecipeFeedback .ai-feedback-comment button");
    await page.waitForSelector("#aiRecipeFeedback .ai-feedback-comment", { state: "hidden" });
    assert.equal(store.listFeedback(1, "recipe")[0].comment, "zu lang");
    await page.click("#aiRecipeBtn");
    await page.waitForSelector("#aiRecipeCopyBtn:not([hidden])");
    assert.match(fake.state.requests.filter(request => request.body.stream).pop().body.messages[0].content, /disliked: zu lang/);
    delete fake.state.options.recipeText;

    // 4. Paint search in words, add to shopping list.
    await page.click('[data-workflow="paints"]');
    await page.fill("#aiSearchInput", "bone parchment");
    await page.click("#aiSearchBtn");
    await page.waitForSelector(".ai-search-card");
    const firstName = await page.locator(".ai-search-card .ai-search-name").first().textContent();
    await page.locator(".ai-search-card").first().locator("button", { hasText: "Auf die Einkaufsliste" }).click();
    assert.equal(await page.locator(".ai-search-card").first().locator("button", { hasText: "Auf der Einkaufsliste" }).isDisabled(), true);
    assert.match(await page.textContent("#shoppingList"), new RegExp(firstName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    await page.screenshot({ path: path.join(os.tmpdir(), "wph-ai-paints.png") });
    await page.click('[data-workflow="palette"]');
    await page.screenshot({ path: path.join(os.tmpdir(), "wph-ai-palette.png") });

    // 5. Static hosting: assistant hidden, photo palette still works.
    const staticPage = await (await browser.newContext({ locale: "en-GB" })).newPage();
    watchErrors(staticPage, errors);
    await staticPage.goto(`http://127.0.0.1:${staticServer.address().port}/WarhammerPaintHelper.html`, { waitUntil: "networkidle" });
    await staticPage.waitForSelector("#palette article");
    assert.equal(await staticPage.isVisible("#aiPaletteInput"), false);
    assert.equal(await staticPage.isVisible("#aiPhotoOnlyBtn"), true);
    await staticPage.setInputFiles("#aiPhotoInput", { name: "test.png", mimeType: "image/png", buffer: Buffer.from(photo, "base64") });
    await staticPage.waitForFunction(() => /test/.test(document.getElementById("aiPhotoStatus").textContent));
    assert.equal(await staticPage.locator("#factionSelect option:checked").textContent(), "★ My palettes");

    assert.deepEqual(errors, [], "no browser errors");
    console.log("Assistant browser test passed.");
  } finally {
    await browser.close();
    server.close();
    staticServer.close();
    store.close();
    await fake.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

function near(a, b) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const d = [16, 8, 0].map(shift => Math.abs(((pa >> shift) & 255) - ((pb >> shift) & 255)));
  return Math.max(...d) <= 24;
}

function watchErrors(page, errors) {
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
}

function startStaticServer() {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
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
