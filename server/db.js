"use strict";

// SQLite persistence for users, sessions, and per-user app storage.
// Uses Node's built-in node:sqlite module, so the server has no npm dependencies.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const { hashPassword, verifyPassword } = require("./passwords");

const SCHEMA_VERSION = 2;
const MAX_FEEDBACK_PER_USER = 300;
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,31}$/;
const STORAGE_KEY_PATTERN = /^wph\.[A-Za-z0-9._-]{1,64}$/;
const MIN_PASSWORD_LENGTH = 8;

function openDatabase(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "paint-helper.db");
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  migrate(db);
  return createStore(db, file);
}

function migrate(db) {
  const { user_version: version } = db.prepare("PRAGMA user_version").get();
  if (version >= SCHEMA_VERSION) {
    return;
  }
  if (version < 1) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS storage (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key        TEXT NOT NULL,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, key)
    );
  `);
  }
  if (version < 2) {
    // Ratings and comments on assistant results; used as examples in later prompts.
    db.exec(`
    CREATE TABLE IF NOT EXISTS ai_feedback (
      id         INTEGER PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind       TEXT NOT NULL,
      ref_id     TEXT NOT NULL,
      rating     INTEGER NOT NULL,
      prompt     TEXT NOT NULL DEFAULT '',
      comment    TEXT NOT NULL DEFAULT '',
      payload    TEXT NOT NULL DEFAULT '',
      embedding  TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, kind, ref_id)
    );
    CREATE INDEX IF NOT EXISTS ai_feedback_user ON ai_feedback(user_id, kind);
  `);
  }
  db.exec(`PRAGMA user_version = ${SCHEMA_VERSION};`);
}

function createStore(db, file) {
  const q = {
    userByName: db.prepare("SELECT id, username, password_hash FROM users WHERE username = ?"),
    userById: db.prepare("SELECT id, username FROM users WHERE id = ?"),
    insertUser: db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)"),
    updatePassword: db.prepare("UPDATE users SET password_hash = ? WHERE id = ?"),
    touchLogin: db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?"),
    deleteUser: db.prepare("DELETE FROM users WHERE username = ?"),
    listUsers: db.prepare(`
      SELECT u.username,
             datetime(u.created_at, 'localtime') AS created_at,
             datetime(u.last_login_at, 'localtime') AS last_login_at,
             (SELECT COUNT(*) FROM storage s WHERE s.user_id = u.id) AS keys
      FROM users u ORDER BY u.username`),
    countUsers: db.prepare("SELECT COUNT(*) AS n FROM users"),
    insertSession: db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"),
    sessionUser: db.prepare(`
      SELECT u.id, u.username, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`),
    renewSession: db.prepare("UPDATE sessions SET expires_at = ? WHERE token_hash = ?"),
    deleteSession: db.prepare("DELETE FROM sessions WHERE token_hash = ?"),
    deleteUserSessions: db.prepare("DELETE FROM sessions WHERE user_id = ?"),
    deleteOtherSessions: db.prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?"),
    purgeSessions: db.prepare("DELETE FROM sessions WHERE expires_at <= ?"),
    storageAll: db.prepare("SELECT key, value FROM storage WHERE user_id = ?"),
    storagePut: db.prepare(`
      INSERT INTO storage (user_id, key, value) VALUES (?, ?, ?)
      ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`),
    storageDelete: db.prepare("DELETE FROM storage WHERE user_id = ? AND key = ?"),
    feedbackUpsert: db.prepare(`
      INSERT INTO ai_feedback (user_id, kind, ref_id, rating, prompt, comment, payload, embedding)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, kind, ref_id) DO UPDATE SET rating = excluded.rating, prompt = excluded.prompt,
        comment = excluded.comment, payload = excluded.payload,
        embedding = COALESCE(excluded.embedding, ai_feedback.embedding), updated_at = datetime('now')`),
    feedbackDelete: db.prepare("DELETE FROM ai_feedback WHERE user_id = ? AND kind = ? AND ref_id = ?"),
    feedbackList: db.prepare(`
      SELECT ref_id, rating, prompt, comment, payload, embedding, updated_at FROM ai_feedback
      WHERE user_id = ? AND kind = ? ORDER BY updated_at DESC, id DESC LIMIT ?`),
    feedbackPrune: db.prepare(`
      DELETE FROM ai_feedback WHERE user_id = ? AND id NOT IN (
        SELECT id FROM ai_feedback WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT ?)`)
  };

  return {
    file,

    countUsers() {
      return q.countUsers.get().n;
    },

    listUsers() {
      return q.listUsers.all().map(row => ({ ...row }));
    },

    createUser(username, password) {
      const name = normalizeUsername(username);
      assertPassword(password);
      if (q.userByName.get(name)) {
        throw new UserError(`Benutzer "${name}" existiert bereits.`);
      }
      q.insertUser.run(name, hashPassword(password));
      return name;
    },

    setPassword(username, password) {
      const user = q.userByName.get(normalizeUsername(username));
      if (!user) {
        throw new UserError(`Benutzer "${username}" nicht gefunden.`);
      }
      assertPassword(password);
      q.updatePassword.run(hashPassword(password), user.id);
      q.deleteUserSessions.run(user.id);
    },

    changeOwnPassword(userId, currentPassword, nextPassword, keepTokenHash) {
      const { username } = q.userById.get(userId) || {};
      const user = username && q.userByName.get(username);
      if (!user || !verifyPassword(currentPassword, user.password_hash)) {
        throw new UserError("Das aktuelle Passwort ist falsch.", "wrong_password");
      }
      assertPassword(nextPassword);
      q.updatePassword.run(hashPassword(nextPassword), user.id);
      q.deleteOtherSessions.run(user.id, keepTokenHash);
    },

    deleteUser(username) {
      const result = q.deleteUser.run(normalizeUsername(username));
      if (!result.changes) {
        throw new UserError(`Benutzer "${username}" nicht gefunden.`);
      }
    },

    // Always runs a hash comparison so unknown usernames take as long as wrong passwords.
    authenticate(username, password) {
      let name;
      try {
        name = normalizeUsername(username);
      } catch (error) {
        name = "";
      }
      const user = name ? q.userByName.get(name) : null;
      const ok = verifyPassword(String(password || ""), user ? user.password_hash : null);
      if (!user || !ok) {
        return null;
      }
      q.touchLogin.run(user.id);
      return { id: user.id, username: user.username };
    },

    createSession(userId, ttlMs) {
      const token = crypto.randomBytes(32).toString("base64url");
      q.insertSession.run(hashToken(token), userId, Date.now() + ttlMs);
      return token;
    },

    sessionUser(token, renewTtlMs) {
      if (!token) {
        return null;
      }
      const tokenHash = hashToken(token);
      const now = Date.now();
      const row = q.sessionUser.get(tokenHash, now);
      if (!row) {
        return null;
      }
      let renewed = false;
      if (renewTtlMs && row.expires_at - now < renewTtlMs / 2) {
        q.renewSession.run(now + renewTtlMs, tokenHash);
        renewed = true;
      }
      return { id: row.id, username: row.username, tokenHash, renewed };
    },

    deleteSession(token) {
      if (token) {
        q.deleteSession.run(hashToken(token));
      }
    },

    purgeExpiredSessions() {
      q.purgeSessions.run(Date.now());
    },

    readStorage(userId) {
      const items = {};
      for (const row of q.storageAll.all(userId)) {
        items[row.key] = row.value;
      }
      return items;
    },

    writeStorage(userId, key, value) {
      assertStorageKey(key);
      q.storagePut.run(userId, key, value);
    },

    deleteStorage(userId, key) {
      assertStorageKey(key);
      q.storageDelete.run(userId, key);
    },

    // rating 0 removes the entry (feedback withdrawn).
    saveFeedback(userId, { kind, refId, rating, prompt, comment, payload, embedding }) {
      if (!rating) {
        q.feedbackDelete.run(userId, kind, refId);
        return;
      }
      q.feedbackUpsert.run(userId, kind, refId, rating > 0 ? 1 : -1, prompt || "", comment || "", payload || "", embedding || null);
      q.feedbackPrune.run(userId, userId, MAX_FEEDBACK_PER_USER);
    },

    listFeedback(userId, kind, limit = 100) {
      return q.feedbackList.all(userId, kind, limit).map(row => ({ ...row }));
    },

    backup(targetFile) {
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
      db.prepare("VACUUM INTO ?").run(targetFile);
      return targetFile;
    },

    close() {
      db.close();
    }
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeUsername(username) {
  const name = String(username || "").trim().toLowerCase();
  if (!USERNAME_PATTERN.test(name)) {
    throw new UserError("Benutzername: 2–32 Zeichen, nur a–z, 0–9, Punkt, Binde- und Unterstrich.");
  }
  return name;
}

function assertPassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH || password.length > 256) {
    throw new UserError(`Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`, "weak_password");
  }
}

function assertStorageKey(key) {
  if (!STORAGE_KEY_PATTERN.test(String(key))) {
    throw new UserError("Ungültiger Speicher-Schlüssel.", "invalid_key");
  }
}

class UserError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

module.exports = { openDatabase, UserError, STORAGE_KEY_PATTERN, MIN_PASSWORD_LENGTH };
