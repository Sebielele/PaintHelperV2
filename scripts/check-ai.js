// Checks a running PaintHelper instance against the real AI server:
// status light, palette from a description, painting guide with tips.
//
//   WPH_URL=http://10.2.1.89:8484 WPH_USER=anna WPH_PASSWORD=... node scripts/check-ai.js
//   PowerShell: $env:WPH_URL="http://10.2.1.89:8484"; $env:WPH_USER="anna"; $env:WPH_PASSWORD="..."; node scripts/check-ai.js
"use strict";

const { fetch, AbortSignal } = globalThis;
const WPH_URL = process.env.WPH_URL || "http://127.0.0.1:8484";
const WPH_USER = process.env.WPH_USER;
const WPH_PASSWORD = process.env.WPH_PASSWORD;

if (!WPH_USER || !WPH_PASSWORD) {
  console.error("Missing WPH_USER or WPH_PASSWORD");
  process.exitCode = 2;
  process.exit();
}

async function login(base, username, password) {
  const response = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-WPH-Request": "1" },
    body: JSON.stringify({ username, password })
  });
  const setCookie = response.headers.get("set-cookie");
  if (!response.ok || !setCookie) {
    throw new Error(`login failed (HTTP ${response.status}) – check WPH_URL, WPH_USER and WPH_PASSWORD`);
  }
  const cookie = setCookie.split(";")[0];
  const call = async (method, url, body, extra = {}, options = {}) => {
    const res = await fetch(base + url, {
      method,
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
        "X-WPH-Request": "1",
        ...extra
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.signal
    });
    const text = await res.text();
    const type = res.headers.get("content-type") || "";
    return {
      status: res.status,
      headers: res.headers,
      text,
      data: type.includes("json") && !options.raw ? JSON.parse(text) : text
    };
  };
  call.cookie = cookie;
  return call;
}

const recipeContext = {
  language: "de",
  system: "Age of Sigmar",
  recipeMode: "Spielbereit",
  colors: [
    {
      name: "Rüstung",
      hex: "#6b7a3a",
      steps: [
        {
          step: "Basis",
          hex: "#6B7A3A",
          paints: [
            {
              name: "Death Guard Green",
              manufacturer: "Citadel",
              owned: true
            }
          ]
        }
      ]
    }
  ]
};

async function main() {
  const call = await login(WPH_URL, WPH_USER, WPH_PASSWORD);
  const checks = [];

  // status
  const startStatus = Date.now();
  const statusRes = await call("GET", "/api/ai/status");
  const msStatus = Date.now() - startStatus;
  if (statusRes.status === 200 && statusRes.data.llm === true && statusRes.data.reachable !== false) {
    console.log(`OK   status (${msStatus} ms): reachable=${statusRes.data.reachable} busy=${statusRes.data.busy} waiting=${statusRes.data.waiting} searchReady=${statusRes.data.searchReady}`);
    checks.push(true);
  } else {
    console.log(`FAIL status (${msStatus} ms): ${JSON.stringify(statusRes.data)}`);
    checks.push(false);
  }

  // palette
  const startPalette = Date.now();
  const paletteRes = await call(
    "POST",
    "/api/ai/palette",
    { description: "Rostiger Nurgle mit Messing" },
    {},
    { signal: AbortSignal.timeout(300000) }
  );
  const msPalette = Date.now() - startPalette;
  if (paletteRes.status === 200 && Array.isArray(paletteRes.data.colors) && paletteRes.data.colors.length >= 4) {
    const hexes = paletteRes.data.colors.map(c => c.hex).join(" ");
    console.log(`OK   palette (${msPalette} ms): ${paletteRes.data.name} ${hexes}`);
    checks.push(true);
  } else {
    console.log(`FAIL palette (${msPalette} ms): ${JSON.stringify(paletteRes.data)}`);
    checks.push(false);
  }

  // recipe
  const startRecipe = Date.now();
  const recipeRes = await call(
    "POST",
    "/api/ai/recipe",
    { context: recipeContext },
    {},
    { signal: AbortSignal.timeout(300000) }
  );
  const msRecipe = Date.now() - startRecipe;
  if (recipeRes.status === 200 && recipeRes.text.includes("## ") && !recipeRes.text.includes("[[WPH-ERROR:")) {
    const hasTips = recipeRes.text.includes("## Tipps") || recipeRes.text.includes("## Tips");
    console.log(`OK   recipe (${msRecipe} ms): ${recipeRes.text.length} chars, tips: ${hasTips ? "yes" : "no"}`);
    if (!hasTips) console.log("WARN recipe: no tips section");
    checks.push(true);
  } else {
    console.log(`FAIL recipe (${msRecipe} ms): ${recipeRes.text}`);
    checks.push(false);
  }

  const okCount = checks.filter(Boolean).length;
  console.log(`Summary: ${okCount}/${checks.length} OK`);
  if (okCount < checks.length) process.exitCode = 1;
}

main().catch(err => {
  console.error(`FAIL ${err.message}`);
  process.exitCode = 1;
});
