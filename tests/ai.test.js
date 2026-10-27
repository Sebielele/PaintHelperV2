const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { openDatabase } = require("../server/db");
const { createServer, loadConfig } = require("../server/server");
const { createAi, loadAiConfig, parsePalette, sanitizeContext, findFactionReferences } = require("../server/ai");
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
  const ai = createAi(aiConfig, { appRoot, dataDir, store, log: silentLog });
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

test("palette prompt is grounded in the app's faction schemes", async t => {
  const { base, fake } = await setup(t);
  const call = await login(base, "anna", "anna-pass-1");
  assert.equal((await call("POST", "/api/ai/palette", { description: "Emperors Children mit neonstyle", system: "aos", language: "de" })).status, 200);
  const prompt = fake.state.requests.find(request => request.url === "/v3/chat/completions").body.messages[0].content;
  assert.match(prompt, /Emperor’s Children \(Warhammer 40,000\), "Excess Pink-Purple": D #B53E89, S #6D2D7A/);
  assert.match(prompt, /same hue families/);
  assert.match(prompt, /informally \(du\)/);
});

test("faction references: subfactions, god names, system preference", () => {
  const schemes = JSON.parse(fs.readFileSync(path.join(appRoot, "data", "faction-schemes.json"), "utf8")).schemes;
  const ids = (text, system) => findFactionReferences(text, schemes, system).map(scheme => scheme.id);
  assert.deepEqual(ids("Emperor's Children, neon", "aos"), ["k40-emperors-children-no-specific-constraint"]);
  assert.deepEqual(ids("emperors children", "k40"), ["k40-emperors-children-no-specific-constraint"]);
  assert.equal(ids("Ultramarines in Weiss", "aos")[0], "k40-space-marines-ultramarines");
  assert.match(ids("Nurgle, rostiges Messing", "aos")[0], /^aos-maggotkin-of-nurgle/);
  assert.equal(ids("Nurgle", "k40")[0], "k40-chaos-daemons-nurgle");
  assert.deepEqual(ids("grünes Gift und Messing", "aos"), []);
  assert.deepEqual(ids("Marsianer", "k40"), []);
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
  // The guide comes from the app data, the model only adds tips after it.
  assert.match(result.data, /^## Vorbereitung\n/);
  assert.match(result.data, /## Rüstung\n1\. Basis: \*\*Death Guard Green\*\*/);
  assert.ok(result.data.indexOf("**Retributor Armour**") > result.data.indexOf("## Rüstung"), "tips follow the guide");
  const sent = fake.state.requests.find(request => request.body.stream).body;
  assert.match(sent.messages[0].content, /Never invent paint names/);
  assert.match(sent.messages[0].content, /Address the reader informally \(du\)/);
  assert.match(sent.messages[1].content, /\*\*Death Guard Green\*\*/);
  assert.doesNotMatch(sent.messages[1].content, /secret|injected/);
  const context = sanitizeContext(recipeContext);
  assert.equal(context.injected, undefined);
  assert.equal(context.colors[0].hex, "#6B7A3A");
  assert.deepEqual(context.colors[0].steps[0].paints[0], { name: "Death Guard Green", manufacturer: "Citadel", range: "", owned: true });
  assert.equal((await call("POST", "/api/ai/recipe", { context: { colors: [] } })).status, 400);
});

test("a broken tips stream keeps the guide and adds a note", async t => {
  const { base } = await setup(t, { ovms: { breakStream: true } });
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.match(result.data, /\*\*Death Guard Green\*\*/);
  assert.match(result.data, /\(Tipps gerade nicht verfügbar/);
  assert.doesNotMatch(result.data, /WPH-ERROR/);
});

test("an unreachable model server is reported as offline", async t => {
  const { base } = await setup(t, { env: { AI_LLM_URL: "http://127.0.0.1:9/v3" } });
  const call = await login(base, "anna", "anna-pass-1");
  const palette = await call("POST", "/api/ai/palette", { description: "Nurgle" });
  assert.equal(palette.status, 502);
  assert.equal(palette.data.code, "offline");
  // The guide does not need the model; only the tips are missing.
  const recipe = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.equal(recipe.status, 200);
  assert.match(recipe.data, /\*\*Death Guard Green\*\*[\s\S]*\(Tipps gerade nicht verfügbar/);
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
  assert.equal(fake.state.maxActiveChat, 1, "language model never gets two requests at once");

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

test("a stalled tips stream ends with a single note", async t => {
  const { base } = await setup(t, { ovms: { stallAfterFirstChunk: true }, env: { AI_IDLE_SECONDS: "0.3" } });
  const call = await login(base, "anna", "anna-pass-1");
  const result = await call("POST", "/api/ai/recipe", { context: recipeContext });
  assert.equal(result.status, 200);
  assert.equal((result.data.match(/Tipps gerade nicht verfügbar/g) || []).length, 1);
  assert.doesNotMatch(result.data, /WPH-ERROR/);
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

test("palette quality check fixes weak neutrals, contrast and hidden accents", () => {
  const { polishPalette } = require("../server/ai");
  const result = polishPalette([
    { role: "D", name: "Armour", hex: "#3A6EA5" },
    { role: "S", name: "Trim", hex: "#3C70A8" },
    { role: "ND", name: "Leather", hex: "#808080" },
    { role: "NL", name: "Bone", hex: "#9A9480" },
    { role: "A1", name: "Gems", hex: "#3B6FA6" }
  ]);
  const hex = role => result.colors.find(color => color.role === role).hex;
  assert.deepEqual(result.adjusted.sort(), ["A1 kräftiger", "NL heller", "ND dunkler", "S abgesetzt"].sort());
  assert.ok(parseInt(hex("ND").slice(1, 3), 16) < 0x50, `ND ${hex("ND")} is dark`);
  assert.ok(parseInt(hex("NL").slice(1, 3), 16) > 0xB0, `NL ${hex("NL")} is light`);
  assert.equal(hex("D"), "#3A6EA5");
  const locked = polishPalette([{ role: "D", hex: "#3A6EA5" }, { role: "ND", hex: "#808080" }], new Set(["ND"]));
  assert.equal(locked.colors[1].hex, "#808080");
});

test("similar faction schemes from the embeddings are offered as inspiration", async t => {
  const { base, fake } = await setup(t, { env: { AI_EXAMPLE_MIN_SCORE: "0.05" } });
  const call = await login(base, "anna", "anna-pass-1");
  assert.equal((await call("POST", "/api/ai/palette", { description: "pink purple excess decadent armour", language: "de" })).status, 200);
  const prompt = fake.state.requests.find(request => request.url === "/v3/chat/completions").body.messages[0].content;
  assert.match(prompt, /Related schemes from the app that fit the description/);
  const related = prompt.split("Related schemes from the app")[1].split("\n").filter(line => line.startsWith("- "));
  assert.ok(related.length >= 1 && related.length <= 3);
  assert.ok(fake.state.requests.some(request => request.url === "/v3/embeddings" && /retrieve faction colour schemes/.test(JSON.stringify(request.body.input))));
});

test("refining keeps locked colours and roles the model dropped", async t => {
  const { base, fake } = await setup(t, { ovms: { paletteReply: JSON.stringify({
    name: "Dunkler Nurgle",
    notes: "Dunkler.",
    colors: [
      { role: "D", name: "Rüstung", hex: "#3E4A22" },
      { role: "S", name: "Messing", hex: "#7A5A2A" },
      { role: "ND", name: "Leder", hex: "#FF0000" }
    ]
  }) } });
  const call = await login(base, "anna", "anna-pass-1");
  const current = {
    name: "Rostiger Nurgle",
    notes: "x",
    colors: [
      { role: "D", name: "Rüstung", hex: "#6B7A3A" },
      { role: "S", name: "Messing", hex: "#A07A3C" },
      { role: "ND", name: "Leder", hex: "#2B1E16", locked: true },
      { role: "NL", name: "Knochen", hex: "#D8CBA0" },
      { role: "A1", name: "Eiter", hex: "#C9B640" }
    ]
  };
  const result = await call("POST", "/api/ai/palette/refine", { palette: current, instruction: "dunkler", language: "de" });
  assert.equal(result.status, 200);
  const hex = role => result.data.colors.find(color => color.role === role).hex;
  assert.equal(hex("D"), "#3E4A22");
  assert.equal(hex("ND"), "#2B1E16", "locked colour wins over the model");
  assert.equal(hex("NL"), "#D8CBA0", "dropped role is kept");
  assert.equal(result.data.name, "Dunkler Nurgle");
  const sent = fake.state.requests.find(request => request.url === "/v3/chat/completions").body;
  assert.match(sent.messages[0].content, /must be returned exactly unchanged/);
  assert.deepEqual(JSON.parse(sent.messages[1].content).instruction, "dunkler");
  assert.equal((await call("POST", "/api/ai/palette/refine", { palette: current, instruction: "" })).status, 400);
});

test("feedback is stored per user and shapes later prompts", async t => {
  const { base, fake, store } = await setup(t);
  const anna = await login(base, "anna", "anna-pass-1");
  const ben = await login(base, "ben", "ben-pass-12");
  const liked = { name: "Sumpf", colors: [{ role: "D", name: "Rüstung", hex: "#4B5E2A" }, { role: "S", name: "Messing", hex: "#A07A3C" }, { role: "ND", hex: "#2B1E16" }] };
  assert.equal((await anna("POST", "/api/ai/feedback", { kind: "palette", refId: "custom-1", rating: 1, prompt: "Nurgle Sumpf", palette: liked })).status, 200);
  assert.equal((await anna("POST", "/api/ai/feedback", { kind: "palette", refId: "custom-2", rating: -1, prompt: "Nurgle Sumpf hell", comment: "zu bunt", palette: liked })).status, 200);
  assert.equal((await anna("POST", "/api/ai/feedback", { kind: "recipe", refId: "r1", rating: -1, comment: "zu lang, mehr Trockenbürsten" })).status, 200);
  assert.equal((await anna("POST", "/api/ai/feedback", { kind: "bogus", refId: "x", rating: 1 })).status, 400);
  assert.equal(store.listFeedback(1, "palette").length, 2);

  await anna("POST", "/api/ai/palette", { description: "Nurgle Sumpf mit Rost", language: "de" });
  const annaPrompt = fake.state.requests.filter(request => request.url === "/v3/chat/completions").pop().body.messages[0].content;
  assert.match(annaPrompt, /rated well for similar requests[\s\S]*"Nurgle Sumpf": D #4B5E2A/);
  assert.match(annaPrompt, /disliked this result[\s\S]*reason: zu bunt/);

  await ben("POST", "/api/ai/palette", { description: "Nurgle Sumpf mit Rost", language: "de" });
  const benPrompt = fake.state.requests.filter(request => request.url === "/v3/chat/completions").pop().body.messages[0].content;
  assert.doesNotMatch(benPrompt, /rated well/, "feedback stays with its user");

  await anna("POST", "/api/ai/recipe", { context: { ...recipeContext, ownedOnly: true } });
  const recipePrompt = fake.state.requests.filter(request => request.body.stream).pop().body.messages[0].content;
  assert.match(recipePrompt, /disliked: zu lang, mehr Trockenbürsten/);

  await anna("POST", "/api/ai/feedback", { kind: "palette", refId: "custom-1", rating: 0 });
  assert.equal(store.listFeedback(1, "palette").length, 1, "rating 0 withdraws the feedback");
});

test("databases from v0.14/v0.15 gain the feedback table", () => {
  const { DatabaseSync } = require("node:sqlite");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-migrate-"));
  const store = openDatabase(dir);
  store.createUser("anna", "anna-pass-1");
  store.close();
  const raw = new DatabaseSync(path.join(dir, "paint-helper.db"));
  raw.exec("DROP TABLE ai_feedback; PRAGMA user_version = 1;");
  raw.close();
  const reopened = openDatabase(dir);
  reopened.saveFeedback(1, { kind: "palette", refId: "a", rating: 1 });
  assert.equal(reopened.listFeedback(1, "palette").length, 1);
  assert.ok(reopened.authenticate("anna", "anna-pass-1"));
  reopened.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test("palettes still work when the embedding server is down", async t => {
  const { base } = await setup(t, { env: { AI_EMBED_URL: "http://127.0.0.1:9/v3", AI_EXAMPLE_TIMEOUT_SECONDS: "1" } });
  const call = await login(base, "anna", "anna-pass-1");
  const started = Date.now();
  const result = await call("POST", "/api/ai/palette", { description: "Nurgle Sumpf", language: "de" });
  assert.equal(result.status, 200);
  assert.ok(Date.now() - started < 3000, "no long wait for optional examples");
});

test("faction references understand German names and genitives", () => {
  const schemes = JSON.parse(fs.readFileSync(path.join(appRoot, "data", "faction-schemes.json"), "utf8")).schemes;
  const ids = (text, system) => findFactionReferences(text, schemes, system).map(scheme => scheme.id);
  assert.equal(ids("Nurgles Seuchenmarines", "k40")[0], "k40-death-guard-no-specific-constraint");
  assert.equal(ids("Tausend Söhne in Türkis", "k40")[0], "k40-thousand-sons-no-specific-constraint");
  assert.equal(ids("Blutengel", "aos")[0], "k40-space-marines-blood-angels");
  assert.deepEqual(ids("Rostiges Gold mit Grünspan", "aos"), []);
});

test("the guide is built from the app data with one paint per step", () => {
  const { buildGuide, guideText } = require("../server/ai");
  const step = (key, label, paint, distance) => ({ key, step: label, hint: "", hex: "#556229", paints: paint ? [{ name: paint, distance, owned: false }] : [] });
  const full = [
    step("shadeWash", "Shade", "Athonian Camoshade", 6),
    step("basecoat", "Basis", "Death Guard Green", 2),
    step("layer", "Layer", "Ogryn Camo", 9),
    step("edgeHighlight", "Kante", "Krieg Khaki", 18),
    step("focusLight", "Fokus", "", 0)
  ];
  const guide = buildGuide(sanitizeContext({
    language: "de",
    primer: { tone: "grey", name: "Death Guard Green", owned: true },
    areas: [{ area: "Rüstung", color: "Seuchengrün" }, { area: "Umhang", color: "Seuchengrün" }],
    colors: [
      { name: "Seuchengrün", hex: "#556229", steps: full },
      { name: "Messing", hex: "#A07A3C", steps: full },
      { name: "Wunden", hex: "#C45B32", steps: full }
    ]
  }), guideText("de"));
  assert.match(guide, /^## Vorbereitung\n1\. Grau grundieren \(z\. B\. \*\*Death Guard Green\*\*\)\./);
  assert.match(guide, /## Seuchengrün\nWo: Rüstung, Umhang\n1\. Shade: \*\*Athonian Camoshade\*\*/);
  assert.match(guide, /\*\*Krieg Khaki\*\* \(am nächsten; keine passende Farbe – Richtung `#556229`\)/);
  assert.match(guide, /5\. Fokus: keine passende Farbe – Richtung `#556229`/);
  const accent = guide.split("## Wunden")[1];
  assert.equal((accent.match(/^\d\./gm) || []).length, 3, "accents get a short ladder");
});

test("status reports reachability and the queue; guides can name a unit", async t => {
  const { base, fake } = await setup(t);
  const call = await login(base, "anna", "anna-pass-1");
  const status = (await call("GET", "/api/ai/status")).data;
  assert.equal(status.llm, true);
  assert.equal(status.reachable, true);
  assert.equal(status.busy, false);
  assert.equal(status.waiting, 0);
  const result = await call("POST", "/api/ai/recipe", { context: { ...recipeContext, unit: { name: "Daemonettes", keywords: ["INFANTRY", "DAEMON"], models: ["Daemonette"], extra: "x" } } });
  assert.equal(result.status, 200);
  const prompt = fake.state.requests.filter(request => request.body.stream).pop().body.messages[1].content;
  assert.match(prompt, /The guide is for this unit: Daemonettes \(INFANTRY, DAEMON\); models: Daemonette\./);

  const { base: offlineBase } = await setup(t, { env: { AI_LLM_URL: "http://127.0.0.1:9/v3" } });
  const offline = await login(offlineBase, "anna", "anna-pass-1");
  assert.equal((await offline("GET", "/api/ai/status")).data.reachable, false);
});
