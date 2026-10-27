const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { openDatabase } = require("../server/db");
const { createServer, loadConfig } = require("../server/server");
const { createAi, loadAiConfig, parsePalette, sanitizeContext } = require("../server/ai");
const { startFakeOvms } = require("./fake-ovms");

const silentLog = { info() {}, warn() {}, error() {} };
const appRoot = path.resolve(__dirname, "..");

async function setup(t, { ovms = {}, env = {} } = {}) {
  const fake = await startFakeOvms(ovms);
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-ai-"));
  const config = loadConfig({ DATA_DIR: dataDir });
  const store = openDatabase(dataDir);
  const aiConfig = loadAiConfig({
    AI_LLM_URL: fake.url,
    AI_LLM_MODEL: "test-llm",
    AI_EMBED_URL: fake.url,
    AI_EMBED_MODEL: "test-embed",
    ...env
  });
  const ai = createAi(aiConfig, { appRoot, dataDir, log: silentLog });
  const server = createServer(config, store, silentLog, ai);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.close();
    store.close();
    await fake.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  });
  store.createUser("anna", "anna-pass-1");
  store.createUser("ben", "ben-pass-12");
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, fake, dataDir, store, aiConfig };
}

async function login(base, username, password) {
  const response = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-WPH-Request": "1" },
    body: JSON.stringify({ username, password })
  });
  const cookie = response.headers.get("set-cookie").split(";")[0];
  const call = async (method, url, body, extra = {}, options = {}) => {
    const res = await fetch(base + url, {
      method,
      headers: { Cookie: cookie, "Content-Type": "application/json", "X-WPH-Request": "1", ...extra },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    const type = res.headers.get("content-type") || "";
    return { status: res.status, headers: res.headers, text, data: type.includes("json") && !options.raw ? JSON.parse(text) : text };
  };
  call.cookie = cookie;
  return call;
}

const recipeContext = {
  language: "de",
  system: "Age of Sigmar",
  recipeMode: "Spielbereit",
  colors: [{
    name: "Rüstung",
    hex: "#6b7a3a",
    steps: [{ step: "Basis", hex: "#6B7A3A", paints: [{ name: "Death Guard Green", manufacturer: "Citadel", owned: true, secret: "x" }] }]
  }],
  injected: "should be dropped"
};

test("assistant endpoints need a login and report a disabled setup", async t => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-ai-off-"));
  const store = openDatabase(dataDir);
  const ai = createAi(loadAiConfig({}), { appRoot, dataDir, log: silentLog });
  const server = createServer(loadConfig({ DATA_DIR: dataDir }), store, silentLog, ai);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => {
    server.close();
    store.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/api/ai/status`)).status, 401);
  store.createUser("anna", "anna-pass-1");
  const call = await login(base, "anna", "anna-pass-1");
  assert.deepEqual((await call("GET", "/api/ai/status")).data, { llm: false, search: false, searchReady: false });
  const palette = await call("POST", "/api/ai/palette", { description: "Nurgle" });
  assert.equal(palette.status, 404);
  assert.equal(palette.data.code, "disabled");
});

test("palette from a description is validated and ordered", async t => {
  const { base, fake } = await setup(t);
  const call = await login(base, "anna", "anna-pass-1");
  assert.equal((await call("POST", "/api/ai/palette", { description: "Nurgle" }, { "X-WPH-Request": "0" })).status, 403);

  const result = await call("POST", "/api/ai/palette", { description: "Nurgle, rostiges Messing", system: "aos", language: "de" });
  assert.equal(result.status, 200);
  assert.equal(result.data.name, "Rostiger Nurgle");
  assert.deepEqual(result.data.colors.map(color => color.role), ["D", "S", "ND", "NL", "A1"]);
  assert.equal(result.data.colors[1].hex, "#A07A3C");

  const sent = fake.state.requests.find(request => request.url === "/v3/chat/completions").body;
  assert.equal(sent.model, "test-llm");
  assert.equal(sent.response_format.type, "json_schema");
  assert.deepEqual(sent.chat_template_kwargs, { enable_thinking: false });
  assert.equal(sent.top_k, 20);
  assert.match(sent.messages[0].content, /in German/);
  assert.equal(sent.messages[1].content, "Nurgle, rostiges Messing");
});

test("falls back to plain JSON prompting when structured output is rejected", async t => {
  const { base, fake } = await setup(t, { ovms: { rejectSchema: true } });
  const call = await login(base, "anna", "anna-pass-1");
  assert.equal((await call("POST", "/api/ai/palette", { description: "Ultramarines" })).status, 200);
  assert.equal((await call("POST", "/api/ai/palette", { description: "Blood Angels" })).status, 200);
  const chats = fake.state.requests.filter(request => request.url === "/v3/chat/completions");
  assert.deepEqual(chats.map(request => Boolean(request.body.response_format)), [true, false, false]);
});

test("unusable model output becomes a clear error", async t => {
  const { base } = await setup(t, { ovms: { paletteReply: "Ich denke, Grün wäre schön." } });
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/palette", { description: "Nurgle" });
  assert.equal(result.status, 502);
  assert.equal(result.data.code, "invalid");
  assert.throws(() => parsePalette('{"colors":[{"role":"S","hex":"#112233","name":"x"}]}'), /Zu wenige/);
  assert.equal(parsePalette('```json\n{"name":"A","colors":[{"role":"D","hex":"#112233"},{"role":"S","hex":"#223344"},{"role":"NL","hex":"#DDDDDD"}]}\n```').colors.length, 3);
});

test("painting guide is streamed and the context is sanitised", async t => {
  const { base, fake } = await setup(t);
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.equal(result.status, 200);
  assert.match(result.headers.get("content-type"), /text\/plain/);
  assert.match(result.data, /\*\*Retributor Armour\*\*/);
  const sent = fake.state.requests.find(request => request.body.stream).body;
  const context = JSON.parse(sent.messages[1].content);
  assert.equal(context.injected, undefined);
  assert.equal(context.colors[0].hex, "#6B7A3A");
  assert.deepEqual(context.colors[0].steps[0].paints[0], { name: "Death Guard Green", manufacturer: "Citadel", range: "", owned: true });
  assert.match(sent.messages[0].content, /Never invent paint names/);
  assert.equal((await call("POST", "/api/ai/recipe", { context: { colors: [] } })).status, 400);
});

test("a broken stream ends with an error marker", async t => {
  const { base } = await setup(t, { ovms: { breakStream: true } });
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.match(result.data, /\[\[WPH-ERROR:offline\]\]$/);
});

test("an unreachable model server is reported as offline", async t => {
  const { base } = await setup(t, { env: { AI_LLM_URL: "http://127.0.0.1:9/v3" } });
  const call = await login(base, "anna", "anna-pass-1");
  const palette = await call("POST", "/api/ai/palette", { description: "Nurgle" });
  assert.equal(palette.status, 502);
  assert.equal(palette.data.code, "offline");
  const recipe = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.equal(recipe.status, 502);
  assert.equal(recipe.data.code, "offline");
});

test("one request per user, one at a time on the model server, hourly limit", async t => {
  const { base, fake } = await setup(t, { ovms: { delayMs: 150 }, env: { AI_REQUESTS_PER_HOUR: "3" } });
  const anna = await login(base, "anna", "anna-pass-1");
  const ben = await login(base, "ben", "ben-pass-12");
  const results = await Promise.all([
    anna("POST", "/api/ai/palette", { description: "Nurgle" }),
    anna("POST", "/api/ai/palette", { description: "Khorne" }),
    ben("POST", "/api/ai/palette", { description: "Tzeentch" })
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 200, 429]);
  assert.equal(results.find(result => result.status === 429).data.code, "busy");
  assert.equal(fake.state.maxActive, 1, "model server never gets two requests at once");

  await anna("POST", "/api/ai/palette", { description: "Slaanesh" });
  await anna("POST", "/api/ai/palette", { description: "Nurgle again" });
  const limited = await anna("POST", "/api/ai/palette", { description: "too many" });
  assert.equal(limited.status, 429);
  assert.equal(limited.data.code, "limit");
});

test("paint search uses a cached embedding index and producer filters", async t => {
  const { base, fake, dataDir, aiConfig } = await setup(t);
  const call = await login(base, "anna", "anna-pass-1");
  const first = await call("POST", "/api/ai/search", { query: "bone parchment", limit: 5 });
  assert.equal(first.status, 200);
  assert.equal(first.data.results.length, 5);
  assert.ok(first.data.results.every(paint => /^#[0-9A-F]{6}$/.test(paint.hex) && paint.name));
  assert.ok(fs.existsSync(path.join(dataDir, "ai-search-index.json")));
  const callsAfterBuild = fake.state.embedCalls;
  assert.ok(callsAfterBuild > 10, "catalogue embedded in batches");

  const filtered = await call("POST", "/api/ai/search", { query: "bone", manufacturers: ["Vallejo"], limit: 8 });
  assert.ok(filtered.data.results.every(paint => paint.manufacturer === "Vallejo"));
  assert.equal(fake.state.embedCalls, callsAfterBuild + 1, "only the query is embedded");
  assert.equal((await call("GET", "/api/ai/status")).data.searchReady, true);

  // A fresh instance (e.g. after a container restart) reuses the cached index.
  const again = createAi(aiConfig, { appRoot, dataDir, log: silentLog });
  const store2 = openDatabase(dataDir);
  const server2 = createServer(loadConfig({ DATA_DIR: dataDir }), store2, silentLog, again);
  await new Promise(resolve => server2.listen(0, "127.0.0.1", resolve));
  t.after(() => {
    server2.close();
    store2.close();
  });
  const call2 = await login(`http://127.0.0.1:${server2.address().port}`, "anna", "anna-pass-1");
  assert.equal((await call2("POST", "/api/ai/search", { query: "bone" })).status, 200);
  assert.equal(fake.state.embedCalls, callsAfterBuild + 2);
});

test("closing the browser cancels the guide upstream and frees the model", async t => {
  const { base, fake } = await setup(t, { ovms: { recipeText: "x".repeat(600), chunkDelayMs: 20 } });
  const call = await login(base, "anna", "anna-pass-1");
  const controller = new AbortController();
  const pending = fetch(`${base}/api/ai/recipe`, {
    method: "POST",
    headers: { Cookie: call.cookie, "Content-Type": "application/json", "X-WPH-Request": "1" },
    body: JSON.stringify({ context: recipeContext }),
    signal: controller.signal
  }).then(response => response.body.getReader().read()).catch(() => null);
  await new Promise(resolve => setTimeout(resolve, 150));
  controller.abort();
  await pending;
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(fake.state.active, 0, "upstream stream was cancelled");
  const next = await call("POST", "/api/ai/palette", { description: "Nurgle" });
  assert.equal(next.status, 200, "same user may continue right away");
});

test("a request waiting in line leaves it when the browser goes away", async t => {
  const { base, fake } = await setup(t, { ovms: { delayMs: 400 } });
  const anna = await login(base, "anna", "anna-pass-1");
  const ben = await login(base, "ben", "ben-pass-12");
  const first = anna("POST", "/api/ai/palette", { description: "Nurgle" });
  await new Promise(resolve => setTimeout(resolve, 50));
  const controller = new AbortController();
  const queued = fetch(`${base}/api/ai/palette`, {
    method: "POST",
    headers: { Cookie: ben.cookie, "Content-Type": "application/json", "X-WPH-Request": "1" },
    body: JSON.stringify({ description: "Khorne" }),
    signal: controller.signal
  }).catch(() => null);
  await new Promise(resolve => setTimeout(resolve, 50));
  controller.abort();
  await queued;
  assert.equal((await first).status, 200);
  await new Promise(resolve => setTimeout(resolve, 100));
  const chats = fake.state.requests.filter(request => request.url === "/v3/chat/completions");
  assert.equal(chats.length, 1, "the aborted request never reached the model server");
});

test("slow answers keep the connection alive and still return JSON", async t => {
  const { base } = await setup(t, { ovms: { delayMs: 300 }, env: { AI_KEEPALIVE_SECONDS: "0.05" } });
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/palette", { description: "Nurgle" }, {}, { raw: true });
  assert.equal(result.status, 200);
  assert.match(result.text, /^ +\{/);
  assert.equal(JSON.parse(result.text).name, "Rostiger Nurgle");
});

test("timeouts are reported as such, in JSON and in the stream", async t => {
  const { base } = await setup(t, { ovms: { delayMs: 1500 }, env: { AI_TIMEOUT_SECONDS: "0.3" } });
  const call = await login(base, "anna", "anna-pass-1");
  const palette = await call("POST", "/api/ai/palette", { description: "Nurgle" });
  assert.equal(palette.status, 504);
  assert.equal(palette.data.code, "timeout");
});

test("a stalled stream ends with a single timeout marker", async t => {
  const { base } = await setup(t, { ovms: { stallAfterFirstChunk: true }, env: { AI_IDLE_SECONDS: "0.3" } });
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.equal(result.status, 200);
  assert.equal((result.data.match(/\[\[WPH-ERROR/g) || []).length, 1);
  assert.match(result.data, /\[\[WPH-ERROR:timeout\]\]$/);
});

test("thinking blocks are removed from answers", async t => {
  const { createThinkingFilter, stripThinking } = require("../server/ai");
  const filter = createThinkingFilter();
  const parts = ["<thi", "nk>plan the", " answer</th", "ink>## Guide", " text <", "b>"];
  assert.equal(parts.map(part => filter.feed(part)).join("") + filter.flush(), "## Guide text <b>");
  assert.equal(stripThinking("<think>hmm</think>{\"a\":1}"), "{\"a\":1}");
  const { base } = await setup(t, { ovms: { paletteReply: "<think>{not json}</think>" + JSON.stringify({
    name: "N", notes: "", colors: [{ role: "D", name: "a", hex: "#112233" }, { role: "S", name: "b", hex: "#223344" }, { role: "NL", name: "c", hex: "#DDDDCC" }]
  }) } });
  const call = await login(base, "anna", "anna-pass-1");
  assert.equal((await call("POST", "/api/ai/palette", { description: "Nurgle" })).status, 200);
});

test("recipe context keeps only bounded, expected fields", () => {
  const context = sanitizeContext({
    language: "de-CH-extra",
    colors: Array.from({ length: 10 }, () => ({ name: "x".repeat(500), hex: "red", steps: [] }))
  });
  assert.equal(context.language, "de-CH");
  assert.equal(context.colors.length, 6);
  assert.equal(context.colors[0].name.length, 60);
  assert.equal(context.colors[0].hex, "");
});
