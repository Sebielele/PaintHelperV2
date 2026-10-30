const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { openDatabase } = require("../server/db");
const { createServer, loadConfig, bootstrapInitialUser } = require("../server/server");

const silentLog = { info() {}, warn() {}, error() {} };

async function startTestServer(t, env = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "wph-test-"));
  const config = loadConfig({ DATA_DIR: dataDir, ...env });
  const store = openDatabase(config.dataDir);
  const server = createServer(config, store, silentLog);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => {
    server.close();
    store.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, store, config };
}

function client(base) {
  let cookie = "";
  return async function call(method, url, body, headers = {}) {
    const init = { method, headers: { ...headers } };
    if (cookie) {
      init.headers.Cookie = cookie;
    }
    if (method !== "GET") {
      init.headers["X-WPH-Request"] ??= "1";
    }
    if (body !== undefined) {
      init.headers["Content-Type"] ??= "application/json";
      init.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    const response = await fetch(base + url, init);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      cookie = setCookie.split(";")[0];
    }
    const type = response.headers.get("content-type") || "";
    const data = type.includes("json") ? await response.json() : await response.text();
    return { status: response.status, data, headers: response.headers };
  };
}

test("login, storage round trip, and logout", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("Painter", "brush-1234");
  const call = client(base);

  assert.deepEqual((await call("GET", "/api/session")).data, { mode: "server", user: null });
  assert.equal((await call("GET", "/api/storage")).status, 401);

  const bad = await call("POST", "/api/login", { username: "painter", password: "wrong-pass" });
  assert.equal(bad.status, 401);

  const login = await call("POST", "/api/login", { username: " PAINTER ", password: "brush-1234" });
  assert.equal(login.status, 200);
  assert.equal(login.data.user, "painter");
  assert.match(login.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
  assert.doesNotMatch(login.headers.get("set-cookie"), /Secure/);

  assert.equal((await call("PUT", "/api/storage/wph.settings.v1", { value: "{\"a\":1}" })).status, 200);
  assert.equal((await call("PUT", "/api/storage/wph.settings.v1", { value: "{\"a\":2}" })).status, 200);
  assert.deepEqual((await call("GET", "/api/storage")).data.items, { "wph.settings.v1": "{\"a\":2}" });

  assert.equal((await call("DELETE", "/api/storage/wph.settings.v1")).status, 200);
  assert.deepEqual((await call("GET", "/api/storage")).data.items, {});

  assert.equal((await call("POST", "/api/logout", {})).status, 200);
  assert.equal((await call("GET", "/api/storage")).status, 401);
});

test("users only see their own data", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("anna", "password-a1");
  store.createUser("ben", "password-b1");
  const anna = client(base);
  const ben = client(base);
  await anna("POST", "/api/login", { username: "anna", password: "password-a1" });
  await ben("POST", "/api/login", { username: "ben", password: "password-b1" });

  await anna("PUT", "/api/storage/wph.profiles.v1", { value: "anna-profiles" });
  assert.deepEqual((await ben("GET", "/api/storage")).data.items, {});
  assert.deepEqual((await anna("GET", "/api/storage")).data.items, { "wph.profiles.v1": "anna-profiles" });
});

test("mutations require the CSRF header and JSON bodies", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);

  const noHeader = await call("POST", "/api/login", { username: "painter", password: "brush-1234" }, { "X-WPH-Request": "0" });
  assert.equal(noHeader.status, 403);
  const form = await call("POST", "/api/login", "username=painter", { "Content-Type": "application/x-www-form-urlencoded" });
  assert.equal(form.status, 415);

  await call("POST", "/api/login", { username: "painter", password: "brush-1234" });
  assert.equal((await call("PUT", "/api/storage/not-allowed", { value: "x" })).status, 400);
  assert.equal((await call("PUT", "/api/storage/wph.x", { value: 42 })).status, 400);
});

test("bulk import only accepts app keys", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);
  await call("POST", "/api/login", { username: "painter", password: "brush-1234" });

  const result = await call("POST", "/api/storage/import", {
    items: { "wph.settings.v1": "s", "wph.language": "de", "other": "x", "wph.bad": 1 }
  });
  assert.equal(result.data.imported, 2);
  assert.deepEqual(result.data.keys.sort(), ["wph.language", "wph.settings.v1"]);
  assert.deepEqual((await call("GET", "/api/storage")).data.items, { "wph.settings.v1": "s", "wph.language": "de" });
});

test("login attempts are rate limited", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);
  for (let i = 0; i < 10; i += 1) {
    assert.equal((await call("POST", "/api/login", { username: "painter", password: "nope-nope" })).status, 401);
  }
  assert.equal((await call("POST", "/api/login", { username: "painter", password: "brush-1234" })).status, 429);
});

test("password change keeps the current session and ends the others", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const laptop = client(base);
  const phone = client(base);
  await laptop("POST", "/api/login", { username: "painter", password: "brush-1234" });
  await phone("POST", "/api/login", { username: "painter", password: "brush-1234" });

  const wrong = await laptop("POST", "/api/password", { currentPassword: "x", newPassword: "new-secret-1" });
  assert.equal(wrong.status, 400);
  const short = await laptop("POST", "/api/password", { currentPassword: "brush-1234", newPassword: "short" });
  assert.equal(short.status, 400);
  assert.equal((await laptop("POST", "/api/password", { currentPassword: "brush-1234", newPassword: "new-secret-1" })).status, 200);

  assert.equal((await laptop("GET", "/api/storage")).status, 200);
  assert.equal((await phone("GET", "/api/storage")).status, 401);
  assert.equal((await phone("POST", "/api/login", { username: "painter", password: "new-secret-1" })).status, 200);
});

test("cookie is marked Secure behind an HTTPS reverse proxy", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);
  const login = await call("POST", "/api/login", { username: "painter", password: "brush-1234" }, { "X-Forwarded-Proto": "https" });
  assert.match(login.headers.get("set-cookie"), /; Secure/);
});

test("static files are limited to the app and get security headers", async t => {
  const { base } = await startTestServer(t);
  const call = client(base);

  const page = await call("GET", "/");
  assert.equal(page.status, 200);
  assert.match(page.data, /<meta name="wph-server" content="1" \/>/);
  assert.match(page.headers.get("content-security-policy"), /script-src 'self'/);
  assert.equal(page.headers.get("x-content-type-options"), "nosniff");

  for (const ok of ["/src/app.js", "/src/storage.js", "/styles.css", "/data/paint-catalogue.json", "/assets/favicon.png"]) {
    assert.equal((await call("GET", ok)).status, 200, ok);
  }
  for (const blocked of ["/server/db.js", "/package.json", "/.git/config", "/tests/server.test.js",
    "/src/../server/db.js", "/src/%2e%2e/server/db.js", "/src/..%2fserver/db.js", "/data-local/paint-helper.db"]) {
    assert.equal((await call("GET", blocked)).status, 404, blocked);
  }
});

test("initial user is created only for an empty database", async t => {
  const { store, config } = await startTestServer(t, { INITIAL_USER: "Sebastian", INITIAL_PASSWORD: "first-pass-1" });
  bootstrapInitialUser(config, store, silentLog);
  assert.deepEqual(store.listUsers().map(user => user.username), ["sebastian"]);
  bootstrapInitialUser({ ...config, initialUser: "other" }, store, silentLog);
  assert.equal(store.countUsers(), 1);
  assert.ok(store.authenticate("sebastian", "first-pass-1"));
});

test("X-Forwarded-For is ignored unless TRUST_PROXY is set", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);
  for (let i = 0; i < 10; i += 1) {
    await call("POST", "/api/login", { username: "painter", password: "nope-nope" }, { "X-Forwarded-For": `10.0.0.${i}` });
  }
  const blocked = await call("POST", "/api/login", { username: "painter", password: "brush-1234" }, { "X-Forwarded-For": "10.9.9.9" });
  assert.equal(blocked.status, 429);
});

test("behind a trusted proxy the right-most forwarded address counts", async t => {
  const { base, store } = await startTestServer(t, { TRUST_PROXY: "true" });
  store.createUser("painter", "brush-1234");
  const call = client(base);
  for (let i = 0; i < 10; i += 1) {
    await call("POST", "/api/login", { username: "painter", password: "nope-nope" }, { "X-Forwarded-For": `1.2.3.${i}, 192.168.1.50` });
  }
  const blocked = await call("POST", "/api/login", { username: "painter", password: "brush-1234" }, { "X-Forwarded-For": "8.8.8.8, 192.168.1.50" });
  assert.equal(blocked.status, 429);
  const otherClient = await call("POST", "/api/login", { username: "painter", password: "brush-1234" }, { "X-Forwarded-For": "192.168.1.60" });
  assert.equal(otherClient.status, 200);
});

test("malformed keys and oversized bodies get clean errors", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);
  await call("POST", "/api/login", { username: "painter", password: "brush-1234" });
  assert.equal((await call("PUT", "/api/storage/%E0%A4%A", { value: "x" })).status, 400);
  const huge = await call("PUT", "/api/storage/wph.big", { value: "x".repeat(5 * 1024 * 1024) });
  assert.equal(huge.status, 413);
  assert.equal(huge.data.code, "too_large");
  const wrong = await call("POST", "/api/password", { currentPassword: "nope", newPassword: "long-enough-1" });
  assert.equal(wrong.data.code, "wrong_password");
});

test("sessions are renewed when more than half of their lifetime has passed", async t => {
  const { base, store } = await startTestServer(t, { SESSION_DAYS: "2" });
  store.createUser("painter", "brush-1234");
  const call = client(base);
  const login = await call("POST", "/api/login", { username: "painter", password: "brush-1234" });
  const token = login.headers.get("set-cookie").split(";")[0].split("=")[1];
  assert.equal(store.sessionUser(token, 2 * 86400000).renewed, false);
  assert.equal(store.sessionUser(token, 10 * 86400000).renewed, true);
  const session = await call("GET", "/api/session");
  assert.equal(session.data.user, "painter");
});

test("the database folder may not be inside a served folder", () => {
  const appRoot = path.resolve(__dirname, "..");
  const config = loadConfig({ DATA_DIR: path.join(appRoot, "data"), APP_ROOT: appRoot });
  assert.throws(() => createServer(config, {}, silentLog), /öffentlich/);
  const nested = loadConfig({ DATA_DIR: path.join(appRoot, "assets", "db"), APP_ROOT: appRoot });
  assert.throws(() => createServer(nested, {}, silentLog), /öffentlich/);
});
test("health reports the app version and uptime", async t => {
  const { base } = await startTestServer(t);
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.version, require("../package.json").version);
  assert.ok(Number.isInteger(body.uptime) && body.uptime >= 0);
});

test("very large bodies end the connection and the server keeps working", async t => {
  const { base, store } = await startTestServer(t);
  store.createUser("painter", "brush-1234");
  const call = client(base);
  await call("POST", "/api/login", { username: "painter", password: "brush-1234" });
  const answer = await call("PUT", "/api/storage/wph.huge", { value: "x".repeat(20 * 1024 * 1024) }).catch(error => error);
  assert.ok(answer instanceof Error || answer.status === 413, "no success for a 20 MB body");
  assert.equal((await call("PUT", "/api/storage/wph.small", { value: "ok" })).status, 200);
});
