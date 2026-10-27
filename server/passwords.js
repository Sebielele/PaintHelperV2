"use strict";

// Password hashing with scrypt from node:crypto.
// Stored format: scrypt$N$r$p$<salt base64>$<hash base64>

const crypto = require("node:crypto");

const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;
// Used when the username does not exist, so the response time does not reveal it.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString("hex"));

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, { ...PARAMS, maxmem: 64 * 1024 * 1024 });
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

function verifyPassword(password, stored) {
  const parts = String(stored || DUMMY_HASH).split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }
  const [, N, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(N), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024
  });
  return crypto.timingSafeEqual(actual, expected) && Boolean(stored);
}

module.exports = { hashPassword, verifyPassword };
