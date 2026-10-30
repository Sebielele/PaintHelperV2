"use strict";

// PaintHelperV2 server: serves the static app and a small JSON API that stores
// each user's app data (settings, profiles, owned paints, shopping list) in SQLite.
// No npm dependencies — only Node.js built-ins (requires Node.js 22.13+).

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { openDatabase, UserError, STORAGE_KEY_PATTERN } = require("./db");
const { createAi, loadAiConfig, AiError } = require("./ai");
const APP_VERSION = require("../package.json").version;

const MAX_BODY_BYTES = 4 * 1024 * 1024;
const MAX_VALUE_BYTES = 2 * 1024 * 1024;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_PER_USER = 10;
const LOGIN_MAX_PER_IP = 50;
const LOGIN_MAX_PER_NAME = 30;
const COOKIE_NAME = "wph_session";
const CSRF_HEADER = "x-wph-request";

const STATIC_FILES = new Set(["/WarhammerPaintHelper.html", "/styles.css"]);
const STATIC_DIRS = ["/src/", "/data/", "/assets/"];
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};
const COMPRESSIBLE = new Set([".html", ".css", ".js", ".json", ".svg"]);
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'"
  ].join("; ")
};

function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT || 8080),
    host: env.HOST || "0.0.0.0",
    appRoot: path.resolve(env.APP_ROOT || path.join(__dirname, "..")),
    dataDir: path.resolve(env.DATA_DIR || path.join(__dirname, "..", "data-local")),
    sessionTtlMs: Number(env.SESSION_DAYS || 90) * 24 * 60 * 60 * 1000,
    cookieSecure: String(env.COOKIE_SECURE || "auto").toLowerCase(),
    // Only enable when the container is reachable exclusively through the reverse proxy;
    // otherwise clients could fake X-Forwarded-For to dodge the login rate limit.
    trustProxy: /^(1|true|yes)$/i.test(String(env.TRUST_PROXY || "false")),
    backupKeep: Number(env.BACKUP_KEEP ?? 14),
    initialUser: env.INITIAL_USER || "",
    initialPassword: env.INITIAL_PASSWORD || ""
  };
}

function createServer(config, store, log = console, ai = null) {
  assertDataDirIsPrivate(config);
  const loginAttempts = new Map();
  const gzipCache = new Map();

  const server = http.createServer(async (req, res) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(name, value);
    }
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname.startsWith("/api/")) {
        await handleApi(req, res, url);
      } else {
        serveStatic(req, res, url.pathname);
      }
    } catch (error) {
      if (res.headersSent) {
        if (!(error instanceof AiError)) {
          log.error("Fehler nach Antwortbeginn:", error);
        }
        res.end();
        return;
      }
      if (error instanceof AiError) {
        if (error.status >= 500 && error.code !== "busy") {
          log.warn(`KI: ${error.message}`);
        }
        sendJson(res, error.status === 499 ? 400 : error.status, { error: error.message, code: error.code });
      } else if (error instanceof HttpError) {
        if (error.status === 413) {
          res.setHeader("Connection", "close");
        }
        sendJson(res, error.status, { error: error.message, code: error.code });
      } else if (error instanceof UserError) {
        sendJson(res, 400, { error: error.message, code: error.code });
      } else {
        log.error("Unerwarteter Fehler:", error);
        sendJson(res, 500, { error: "Interner Serverfehler." });
      }
    }
  });

  async function handleApi(req, res, url) {
    const route = `${req.method} ${url.pathname}`;
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET" && req.method !== "HEAD" && req.headers[CSRF_HEADER] !== "1") {
      throw new HttpError(403, "Anfrage abgelehnt.");
    }

    if (route === "GET /api/health") {
      return sendJson(res, 200, { ok: true, version: APP_VERSION, uptime: Math.round(process.uptime()) });
    }

    if (route === "GET /api/session") {
      const user = currentUser(req, res);
      return sendJson(res, 200, { mode: "server", user: user ? user.username : null });
    }

    if (route === "POST /api/login") {
      const body = await readJson(req);
      const ip = clientIp(req);
      const username = String(body.username || "").trim().toLowerCase();
      const keys = [`u:${ip}:${username}`, `ip:${ip}`, `n:${username}`];
      checkLoginRate(keys);
      const user = store.authenticate(username, body.password);
      if (!user) {
        recordLoginFailure(keys);
        log.warn(`Login fehlgeschlagen: "${safeLog(username)}" von ${safeLog(ip)}`);
        throw new HttpError(401, "Benutzername oder Passwort falsch.", "wrong_login");
      }
      loginAttempts.delete(keys[0]);
      const token = store.createSession(user.id, config.sessionTtlMs);
      setSessionCookie(req, res, token, config.sessionTtlMs);
      log.info(`Login: ${user.username} von ${safeLog(ip)}`);
      return sendJson(res, 200, { user: user.username });
    }

    if (route === "POST /api/logout") {
      store.deleteSession(readCookie(req, COOKIE_NAME));
      setSessionCookie(req, res, "", 0);
      return sendJson(res, 200, { ok: true });
    }

    const user = currentUser(req, res);
    if (!user) {
      throw new HttpError(401, "Nicht angemeldet.", "unauthorized");
    }

    if (route === "POST /api/password") {
      const body = await readJson(req);
      store.changeOwnPassword(user.id, String(body.currentPassword || ""), body.newPassword, user.tokenHash);
      log.info(`Passwort geändert: ${user.username}`);
      return sendJson(res, 200, { ok: true });
    }

    if (url.pathname.startsWith("/api/ai/")) {
      if (route === "GET /api/ai/status") {
        return sendJson(res, 200, ai ? await ai.status() : { llm: false, search: false, searchReady: false });
      }
      if (!ai) {
        throw new HttpError(404, "KI ist nicht eingerichtet.", "disabled");
      }
      if (route === "POST /api/ai/palette") {
        return ai.palette(user, await readJson(req), req, res);
      }
      if (route === "POST /api/ai/palette/refine") {
        return ai.refine(user, await readJson(req), req, res);
      }
      if (route === "POST /api/ai/feedback") {
        return sendJson(res, 200, await ai.feedback(user, await readJson(req)));
      }
      if (route === "POST /api/ai/recipe") {
        return ai.recipe(user, await readJson(req), req, res);
      }
      if (route === "POST /api/ai/search") {
        return ai.search(user, await readJson(req), req, res);
      }
      throw new HttpError(404, "Unbekannter API-Endpunkt.");
    }

    if (route === "GET /api/storage") {
      return sendJson(res, 200, { items: store.readStorage(user.id) });
    }

    if (route === "POST /api/storage/import") {
      const body = await readJson(req);
      const items = body && typeof body.items === "object" && body.items ? body.items : {};
      const entries = Object.entries(items)
        .filter(([key, value]) => STORAGE_KEY_PATTERN.test(key) && typeof value === "string");
      entries.forEach(([, value]) => assertValueSize(value));
      entries.forEach(([key, value]) => store.writeStorage(user.id, key, value));
      return sendJson(res, 200, { imported: entries.length, keys: entries.map(([key]) => key) });
    }

    const storageMatch = url.pathname.match(/^\/api\/storage\/([^/]+)$/);
    if (storageMatch) {
      let key;
      try {
        key = decodeURIComponent(storageMatch[1]);
      } catch (error) {
        throw new HttpError(400, "Ungültiger Speicher-Schlüssel.");
      }
      if (req.method === "PUT") {
        const body = await readJson(req);
        if (typeof body.value !== "string") {
          throw new HttpError(400, "value muss ein String sein.");
        }
        assertValueSize(body.value);
        store.writeStorage(user.id, key, body.value);
        return sendJson(res, 200, { ok: true });
      }
      if (req.method === "DELETE") {
        store.deleteStorage(user.id, key);
        return sendJson(res, 200, { ok: true });
      }
    }

    throw new HttpError(404, "Unbekannter API-Endpunkt.");
  }

  // Sessions slide: once less than half of the lifetime is left, they are renewed.
  function currentUser(req, res) {
    const token = readCookie(req, COOKIE_NAME);
    const user = store.sessionUser(token, config.sessionTtlMs);
    if (user && user.renewed && res) {
      setSessionCookie(req, res, token, config.sessionTtlMs);
    }
    return user;
  }

  // The right-most X-Forwarded-For entry is the address the reverse proxy saw.
  function clientIp(req) {
    const forwarded = config.trustProxy && req.headers["x-forwarded-for"];
    if (forwarded) {
      const hops = String(forwarded).split(",").map(part => part.trim()).filter(Boolean);
      if (hops.length) {
        return hops[hops.length - 1];
      }
    }
    return req.socket.remoteAddress || "unknown";
  }

  function loginLimit(key) {
    return key.startsWith("u:") ? LOGIN_MAX_PER_USER : key.startsWith("ip:") ? LOGIN_MAX_PER_IP : LOGIN_MAX_PER_NAME;
  }

  function checkLoginRate(keys) {
    const now = Date.now();
    for (const key of keys) {
      const entry = loginAttempts.get(key);
      if (entry && entry.resetAt <= now) {
        loginAttempts.delete(key);
      } else if (entry && entry.count >= loginLimit(key)) {
        throw new HttpError(429, "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.", "too_many");
      }
    }
  }

  function recordLoginFailure(keys) {
    const now = Date.now();
    if (loginAttempts.size > 10000) {
      for (const [key, entry] of loginAttempts) {
        if (entry.resetAt <= now) {
          loginAttempts.delete(key);
        }
      }
    }
    for (const key of keys) {
      const entry = loginAttempts.get(key) || { count: 0, resetAt: now + LOGIN_WINDOW_MS };
      entry.count += 1;
      loginAttempts.set(key, entry);
    }
  }

  function setSessionCookie(req, res, token, maxAgeMs) {
    const secure = config.cookieSecure === "true"
      || (config.cookieSecure === "auto" && isHttps(req));
    const parts = [
      `${COOKIE_NAME}=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Strict",
      `Max-Age=${Math.floor(maxAgeMs / 1000)}`
    ];
    if (secure) {
      parts.push("Secure");
    }
    res.setHeader("Set-Cookie", parts.join("; "));
  }

  // Trusting X-Forwarded-Proto is harmless: a faked value only makes the cookie Secure.
  function isHttps(req) {
    if (req.socket.encrypted) {
      return true;
    }
    return String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
  }

  function serveStatic(req, res, pathname) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end();
    }
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
      if (/\.db(-wal|-shm|-journal)?$/i.test(decoded)) {
        return notFound(res);
      }
    } catch (error) {
      return notFound(res);
    }
    if (decoded === "/" || decoded === "/index.html") {
      decoded = "/WarhammerPaintHelper.html";
    }
    const normalized = path.posix.normalize(decoded);
    const allowed = STATIC_FILES.has(normalized) || STATIC_DIRS.some(dir => normalized.startsWith(dir));
    if (!allowed || normalized.split("/").some(segment => segment.startsWith("."))) {
      return notFound(res);
    }
    const file = path.join(config.appRoot, normalized);
    if (!file.startsWith(config.appRoot + path.sep)) {
      return notFound(res);
    }
    let stat;
    try {
      stat = fs.statSync(file);
    } catch (error) {
      return notFound(res);
    }
    if (!stat.isFile()) {
      return notFound(res);
    }

    const ext = path.extname(file).toLowerCase();
    const isAppPage = normalized === "/WarhammerPaintHelper.html";
    const etag = `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}${isAppPage ? "-s" : ""}"`;
    res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("ETag", etag);
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304);
      return res.end();
    }

    const wantsGzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(String(req.headers["accept-encoding"] || ""));
    let body;
    if (wantsGzip) {
      const cached = gzipCache.get(file);
      if (cached && cached.etag === etag) {
        body = cached.body;
      } else {
        body = zlib.gzipSync(readStaticFile(file, isAppPage));
        gzipCache.set(file, { etag, body });
      }
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
    } else {
      body = readStaticFile(file, isAppPage);
    }
    res.setHeader("Content-Length", body.length);
    res.writeHead(200);
    res.end(req.method === "HEAD" ? undefined : body);
  }

  return server;
}

// The app page gets a marker so src/storage.js knows it may use the server API.
function readStaticFile(file, isAppPage) {
  const content = fs.readFileSync(file);
  if (!isAppPage) {
    return content;
  }
  return Buffer.from(content.toString("utf8")
    .replace("</head>", '  <meta name="wph-server" content="1" />\n</head>'));
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readJson(req) {
  if (!/^application\/json\b/i.test(String(req.headers["content-type"] || ""))) {
    return Promise.reject(new HttpError(415, "Content-Type application/json erwartet."));
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let tooLarge = false;
    req.on("data", chunk => {
      size += chunk.length;
      if (tooLarge) {
        return;
      }
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) {
        reject(new HttpError(413, "Anfrage zu gross.", "too_large"));
        return;
      }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        resolve(parsed && typeof parsed === "object" ? parsed : {});
      } catch (error) {
        reject(new HttpError(400, "Ungültiges JSON."));
      }
    });
    req.on("error", reject);
  });
}

function readCookie(req, name) {
  const header = String(req.headers.cookie || "");
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > -1 && part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }
  return "";
}

function assertValueSize(value) {
  if (Buffer.byteLength(value) > MAX_VALUE_BYTES) {
    throw new HttpError(413, "Eintrag zu gross.", "too_large");
  }
}

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function safeLog(value) {
  return String(value).slice(0, 64).replace(/[^\w.:@\-]/g, "?");
}

// The database must never sit inside a folder that is served to the browser.
function assertDataDirIsPrivate(config) {
  const relative = path.relative(config.appRoot, config.dataDir).split(path.sep).join("/");
  if (relative === "" || STATIC_DIRS.some(dir => `/${relative}/`.startsWith(dir))) {
    throw new Error(`DATA_DIR ${config.dataDir} liegt in einem öffentlich ausgelieferten Ordner.`);
  }
}

function localDate(date = new Date()) {
  const pad = number => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function bootstrapInitialUser(config, store, log) {
  if (!config.initialUser || store.countUsers() > 0) {
    return;
  }
  if (!config.initialPassword) {
    log.warn("INITIAL_USER gesetzt, aber INITIAL_PASSWORD fehlt – kein Benutzer angelegt.");
    return;
  }
  const name = store.createUser(config.initialUser, config.initialPassword);
  log.info(`Erster Benutzer "${name}" angelegt. INITIAL_PASSWORD kann jetzt aus dem Stack entfernt werden.`);
}

function scheduleMaintenance(config, store, log) {
  const backupDir = path.join(config.dataDir, "backups");
  const run = () => {
    try {
      store.purgeExpiredSessions();
      if (config.backupKeep > 0) {
        const today = localDate();
        const target = path.join(backupDir, `paint-helper-${today}.db`);
        if (!fs.existsSync(target)) {
          store.backup(target);
          log.info(`Backup erstellt: ${target}`);
        }
        const backups = fs.readdirSync(backupDir).filter(name => /^paint-helper-\d{4}-\d{2}-\d{2}\.db$/.test(name)).sort();
        backups.slice(0, Math.max(0, backups.length - config.backupKeep))
          .forEach(name => fs.rmSync(path.join(backupDir, name)));
      }
    } catch (error) {
      log.error("Wartung fehlgeschlagen:", error);
    }
  };
  run();
  return setInterval(run, 60 * 60 * 1000);
}

function main() {
  const config = loadConfig();
  const store = openDatabase(config.dataDir);
  bootstrapInitialUser(config, store, console);
  const timer = scheduleMaintenance(config, store, console);
  const aiConfig = loadAiConfig();
  const ai = createAi(aiConfig, { appRoot: config.appRoot, dataDir: config.dataDir, store, log: console });
  const server = createServer(config, store, console, ai);
  ai.warmUp();
  if (ai.llmEnabled || ai.embedEnabled) {
    console.log(`KI: Sprachmodell ${ai.llmEnabled ? aiConfig.llmUrl : "aus"}, Suche ${ai.embedEnabled ? aiConfig.embedUrl : "aus"}`);
  }

  server.listen(config.port, config.host, () => {
    console.log(`PaintHelperV2 läuft auf http://${config.host}:${config.port} (Daten: ${store.file}, Benutzer: ${store.countUsers()})`);
    if (store.countUsers() === 0) {
      console.warn("Noch kein Benutzer vorhanden. Anlegen mit: wph-user add <name>");
    }
  });

  const shutdown = () => {
    clearInterval(timer);
    server.close(() => {
      store.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

if (require.main === module) {
  main();
}

module.exports = { createServer, loadConfig, bootstrapInitialUser };
