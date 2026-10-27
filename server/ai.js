"use strict";

// Assistant features backed by a local OpenAI-compatible server (e.g. OpenVINO Model
// Server on the AI PC). The browser never talks to the model server directly: the
// PaintHelper server forwards requests for signed-in users only, one at a time, with
// per-user limits, timeouts, and validation of everything the model returns.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROLE_CODES = ["D", "S", "ND", "NL", "A1", "A2"];
const LANGUAGE_NAMES = { en: "English", de: "German", fr: "French", es: "Spanish", it: "Italian" };
const SEARCH_TEXT_VERSION = 1;
const SEARCH_INSTRUCTION = "Instruct: Given a description of a miniature paint colour, retrieve matching hobby paints\nQuery: ";
const EMBED_BATCH = 32;
const MAX_DESCRIPTION = 400;
const MAX_QUERY = 120;
const MAX_CONTEXT_BYTES = 24 * 1024;

const PALETTE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    notes: { type: "string" },
    colors: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          role: { type: "string", enum: ROLE_CODES },
          name: { type: "string" },
          hex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" }
        },
        required: ["role", "name", "hex"]
      }
    }
  },
  required: ["name", "notes", "colors"]
};

function loadAiConfig(env = process.env) {
  let sampling = { temperature: 0.7, top_p: 0.8, top_k: 20, presence_penalty: 1.5 };
  if (env.AI_LLM_PARAMS) {
    try {
      sampling = { ...sampling, ...JSON.parse(env.AI_LLM_PARAMS) };
    } catch (error) {
      throw new Error("AI_LLM_PARAMS ist kein gültiges JSON.");
    }
  }
  return {
    llmUrl: trimSlash(env.AI_LLM_URL || ""),
    llmModel: env.AI_LLM_MODEL || "",
    embedUrl: trimSlash(env.AI_EMBED_URL || ""),
    embedModel: env.AI_EMBED_MODEL || "",
    // Time until the model server starts answering, and allowed silence while streaming.
    timeoutMs: positive(env.AI_TIMEOUT_SECONDS, 180) * 1000,
    idleMs: positive(env.AI_IDLE_SECONDS, 90) * 1000,
    queueWaitMs: positive(env.AI_QUEUE_WAIT_SECONDS, 300) * 1000,
    perHour: positive(env.AI_REQUESTS_PER_HOUR, 40),
    maxQueue: positive(env.AI_MAX_QUEUE, 4),
    keepaliveMs: positive(env.AI_KEEPALIVE_SECONDS, 15) * 1000,
    thinking: /^(1|true|yes)$/i.test(String(env.AI_LLM_THINKING || "false")),
    jsonSchema: !/^(0|false|no)$/i.test(String(env.AI_JSON_SCHEMA || "true")),
    sampling
  };
}

function createAi(config, { appRoot, dataDir, log = console, fetchImpl = globalThis.fetch }) {
  const llmEnabled = Boolean(config.llmUrl && config.llmModel);
  const embedEnabled = Boolean(config.embedUrl && config.embedModel);
  const llmQueue = createQueue(config.maxQueue);
  const usage = new Map();
  const activeUsers = new Set();
  let jsonSchemaSupported = config.jsonSchema;
  let searchIndex = null;
  let indexBuild = null;
  let paints = null;
  let factionSchemes = null;

  function status() {
    return { llm: llmEnabled, search: embedEnabled, searchReady: Boolean(searchIndex) };
  }

  // ---- palette from a description ----------------------------------------

  async function palette(user, body, req, res) {
    requireEnabled(llmEnabled);
    const description = cleanText(body.description, MAX_DESCRIPTION);
    if (description.length < 3) {
      throw new AiError(400, "invalid_input", "Beschreibung fehlt.");
    }
    const language = languageName(body.language);
    const systemCode = body.system === "k40" ? "k40" : "aos";
    const system = SYSTEM_NAMES[systemCode];
    const references = findFactionReferences(description, loadFactionSchemes(), systemCode);
    const messages = [
      {
        role: "system",
        content: [
          `You are an expert miniature painter for ${system}. Create a painting palette for the user's description.`,
          "Answer with JSON only, no other text, in this shape:",
          '{"name": "...", "notes": "...", "colors": [{"role": "D", "name": "...", "hex": "#RRGGBB"}]}',
          `- name: short palette name, at most 4 words, in ${language}.`,
          `- notes: 2-3 sentences in ${language} on where each colour goes on the model and how to finish it.`,
          "- colors: 5 or 6 entries, each role code once, in this order:",
          "  D = dominant colour (largest areas such as armour or cloth)",
          "  S = secondary colour (second largest areas, trim)",
          "  ND = dark neutral (leather, straps, weapons, deep shadows)",
          "  NL = light neutral (bone, parchment, skin highlights)",
          "  A1 = first accent (small details: gems, lenses, magic, runes)",
          "  A2 = second accent (optional small detail colour)",
          `- name of each colour: 1-4 words in ${language} saying where it is used, e.g. "Armour", "Cloak", "Gems".`,
          "- hex: realistic paint colours as #RRGGBB; avoid pure black #000000 and pure white #FFFFFF.",
          `- Write name, notes and every colour name in ${language}.${language === "German" ? " Address the reader informally (du)." : ""}`,
          ...referencePrompt(references)
        ].join("\n")
      },
      { role: "user", content: description }
    ];
    const slot = reserveUser(user);
    const client = watchClient(res);
    const out = holdOpen(res, "application/json; charset=utf-8", config.keepaliveMs);
    try {
      const content = await chat(messages, { max_tokens: 700 }, client.signal);
      const result = parsePalette(content);
      const basedOn = references.length ? ` (Bezug: ${references.map(scheme => schemeLabel(scheme)).join(", ")})` : "";
      log.info(`KI-Palette für ${user.username}: "${result.name}"${basedOn}`);
      out.json(200, result);
    } catch (error) {
      const failure = asAiError(error);
      if (failure.code === "busy") {
        slot.refund();
      }
      if (failure.code !== "aborted") {
        logFailure("Palette", failure);
      }
      out.json(failure.status, { error: failure.message, code: failure.code });
    } finally {
      out.stop();
      client.dispose();
      slot.release();
    }
  }

  // The app's own faction schemes ground the model: a 9B model knows little Warhammer
  // lore and otherwise reads e.g. "Emperor's Children" as generic imperial colours.
  function loadFactionSchemes() {
    if (!factionSchemes) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.resolve(appRoot, "data", "faction-schemes.json"), "utf8"));
        factionSchemes = Array.isArray(raw.schemes) ? raw.schemes : [];
      } catch (error) {
        log.warn(`KI: Fraktionsschemata nicht lesbar: ${error.message}`);
        factionSchemes = [];
      }
    }
    return factionSchemes;
  }

  // ---- painting guide (streamed) -----------------------------------------

  async function recipe(user, body, req, res) {
    requireEnabled(llmEnabled);
    const context = sanitizeContext(body.context);
    const json = JSON.stringify(context);
    if (Buffer.byteLength(json) > MAX_CONTEXT_BYTES || !context.colors.length) {
      throw new AiError(400, "invalid_input", "Ungültige Anfrage.");
    }
    const language = languageName(context.language);
    const messages = [
      {
        role: "system",
        content: [
          "You are an experienced miniature painting coach.",
          `Write a practical step-by-step painting guide in ${language} for the scheme described by the JSON data.`,
          "Rules:",
          "- Use ONLY paint names that appear in the data (fields \"paints\"). Prefer paints with \"owned\": true.",
          "- If no listed paint fits a step, give the HEX value and say it must be mixed. Never invent paint names or products.",
          "- Follow the given steps (shade, base, layer, highlight) for each colour and say which model areas get the colour.",
          `- Structure with Markdown headings (## ) written in ${language}: preparation (primer), one section per palette colour, the base, then 2-3 short tips.`,
          "- Use numbered steps, - bullets and **bold** paint names. No tables. At most about 400 words."
        ].join("\n")
      },
      { role: "user", content: json }
    ];
    const slot = reserveUser(user);
    const client = watchClient(res);
    const out = holdOpen(res, "text/plain; charset=utf-8", config.keepaliveMs);
    let release = () => {};
    let written = 0;
    try {
      const upstream = await openStream(messages, { max_tokens: 1400 }, client.signal);
      release = upstream.release;
      for await (const delta of upstream.chunks) {
        written += delta.length;
        out.write(delta);
      }
      if (!written) {
        throw new AiError(502, "invalid", "Leere Antwort des Model-Servers.");
      }
      out.end();
      log.info(`KI-Anleitung für ${user.username}: ${written} Zeichen`);
    } catch (error) {
      const failure = asAiError(error);
      if (failure.code === "busy" && !written) {
        slot.refund();
      }
      if (failure.code !== "aborted") {
        logFailure("Anleitung", failure);
      }
      out.fail(failure);
    } finally {
      release();
      out.stop();
      client.dispose();
      slot.release();
    }
  }

  // ---- semantic paint search ---------------------------------------------

  async function search(user, body, req, res) {
    requireEnabled(embedEnabled);
    const query = cleanText(body.query, MAX_QUERY);
    if (query.length < 2) {
      throw new AiError(400, "invalid_input", "Suchbegriff fehlt.");
    }
    countUsage(user, "search", config.perHour * 5);
    const client = watchClient(res);
    const out = holdOpen(res, "application/json; charset=utf-8", config.keepaliveMs);
    try {
      const index = await ensureIndex();
      const [vector] = await embed([SEARCH_INSTRUCTION + query], client.signal);
      if (index.items.length && index.items[0].length !== vector.length) {
        searchIndex = null;
        throw new AiError(502, "invalid", "Suchindex passt nicht zum Embedding-Modell und wird neu aufgebaut.");
      }
      const manufacturers = Array.isArray(body.manufacturers)
        ? new Set(body.manufacturers.filter(name => typeof name === "string").slice(0, 50))
        : null;
      const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 30);
      const scored = [];
      index.items.forEach((item, position) => {
        const paint = index.paints[position];
        if (manufacturers && !manufacturers.has(paint.manufacturer || "__unknown__")) {
          return;
        }
        scored.push({ paint, score: dot(vector, item) });
      });
      scored.sort((a, b) => b.score - a.score);
      out.json(200, {
        results: scored.slice(0, limit).map(({ paint, score }) => ({
          name: paint.name,
          hex: paint.hex,
          manufacturer: paint.manufacturer || "",
          collection: paint.collection || "",
          range: paint.range || "",
          finish: paint.finish || "",
          score: Math.round(score * 1000) / 1000
        }))
      });
    } catch (error) {
      const failure = asAiError(error);
      if (failure.code !== "aborted") {
        logFailure("Suche", failure);
      }
      out.json(failure.status, { error: failure.message, code: failure.code });
    } finally {
      out.stop();
      client.dispose();
    }
  }

  function ensureIndex() {
    if (searchIndex) {
      return Promise.resolve(searchIndex);
    }
    if (!indexBuild) {
      indexBuild = buildIndex()
        .then(index => {
          searchIndex = index;
          return index;
        })
        .finally(() => {
          indexBuild = null;
        });
    }
    return indexBuild;
  }

  async function buildIndex() {
    const catalogue = loadPaints();
    const texts = catalogue.map(paintSearchText);
    const hash = crypto.createHash("sha256")
      .update(JSON.stringify({ v: SEARCH_TEXT_VERSION, model: config.embedModel, texts }))
      .digest("hex");
    const file = path.join(dataDir, "ai-search-index.json");
    try {
      const cached = JSON.parse(fs.readFileSync(file, "utf8"));
      if (cached.hash === hash && Array.isArray(cached.vectors) && cached.vectors.length === catalogue.length) {
        return { paints: catalogue, items: cached.vectors.map(decodeVector) };
      }
    } catch (error) {
      // No usable cache yet.
    }
    const started = Date.now();
    log.info(`Suchindex wird aufgebaut (${catalogue.length} Farben)…`);
    const items = [];
    for (let offset = 0; offset < texts.length; offset += EMBED_BATCH) {
      items.push(...await embed(texts.slice(offset, offset + EMBED_BATCH)));
    }
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ hash, model: config.embedModel, vectors: items.map(encodeVector) }));
    fs.renameSync(tmp, file);
    log.info(`Suchindex fertig in ${Math.round((Date.now() - started) / 1000)} s.`);
    return { paints: catalogue, items };
  }

  function loadPaints() {
    if (!paints) {
      const { normalizePaintCatalogue } = require(path.resolve(appRoot, "src", "citadel.js"));
      const raw = JSON.parse(fs.readFileSync(path.resolve(appRoot, "data", "paint-catalogue.json"), "utf8"));
      paints = normalizePaintCatalogue(raw).filter(paint => /^#[0-9A-F]{6}$/i.test(paint.hex || ""));
    }
    return paints;
  }

  function warmUp() {
    if (embedEnabled) {
      ensureIndex().catch(error => log.warn(`Suchindex noch nicht verfügbar: ${error.message}`));
    }
  }

  // ---- model server calls ------------------------------------------------

  async function chat(messages, options, clientSignal) {
    const release = await llmQueue.acquire(clientSignal, config.queueWaitMs);
    try {
      const first = await chatOnce(messages, { ...options, structured: jsonSchemaSupported }, clientSignal);
      if (first.retryWithoutSchema) {
        return (await chatOnce(messages, { ...options, structured: false }, clientSignal)).content;
      }
      return first.content;
    } finally {
      release();
    }
  }

  async function chatOnce(messages, options, clientSignal) {
    const call = startUpstream(`${config.llmUrl}/chat/completions`, chatBody(messages, options), clientSignal);
    try {
      const response = await call.response;
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        if (response.status === 400 && options.structured && /response_format|json_schema|schema|guided|grammar/i.test(text)) {
          // Model server without structured output: plain JSON prompting from now on.
          log.warn("Model-Server unterstützt response_format nicht – nutze reines JSON-Prompting.");
          jsonSchemaSupported = false;
          return { retryWithoutSchema: true };
        }
        throw upstreamError(response.status, text);
      }
      const data = await response.json().catch(error => {
        throw call.failure(error, "invalid");
      });
      const message = data && data.choices && data.choices[0] && data.choices[0].message;
      if (!message || typeof message.content !== "string") {
        throw new AiError(502, "invalid", "Leere Antwort des Model-Servers.");
      }
      return { content: stripThinking(message.content) };
    } catch (error) {
      throw call.failure(error);
    } finally {
      call.finish();
    }
  }

  async function openStream(messages, options, clientSignal) {
    const release = await llmQueue.acquire(clientSignal, config.queueWaitMs);
    const call = startUpstream(`${config.llmUrl}/chat/completions`, chatBody(messages, { ...options, stream: true }), clientSignal);
    let response;
    try {
      response = await call.response;
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw upstreamError(response.status, text);
      }
    } catch (error) {
      call.finish();
      release();
      throw call.failure(error);
    }
    const thinking = createThinkingFilter();
    const chunks = (async function* stream() {
      try {
        const decoder = new TextDecoder();
        let buffer = "";
        call.arm(config.idleMs);
        for await (const chunk of response.body) {
          call.arm(config.idleMs);
          buffer += decoder.decode(chunk, { stream: true });
          let newline;
          while ((newline = buffer.indexOf("\n")) > -1) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line.startsWith("data:")) {
              continue;
            }
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              const rest = thinking.flush();
              if (rest) {
                yield rest;
              }
              return;
            }
            let parsed;
            try {
              parsed = JSON.parse(data);
            } catch (error) {
              continue;
            }
            if (parsed.error) {
              throw new AiError(502, "offline", `Model-Server meldet: ${JSON.stringify(parsed.error).slice(0, 200)}`);
            }
            const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
            const text = thinking.feed(delta && typeof delta.content === "string" ? delta.content : "");
            if (text) {
              yield text;
            }
          }
        }
        const rest = thinking.flush();
        if (rest) {
          yield rest;
        }
      } catch (error) {
        throw call.failure(error);
      } finally {
        call.finish();
        release();
      }
    }());
    return { chunks, release };
  }

  async function embed(inputs, clientSignal) {
    const call = startUpstream(`${config.embedUrl}/embeddings`, { model: config.embedModel, input: inputs }, clientSignal);
    try {
      const response = await call.response;
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw upstreamError(response.status, text);
      }
      const data = await response.json();
      const vectors = (data.data || [])
        .slice()
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(item => normalize(Float32Array.from(item.embedding || [])));
      if (vectors.length !== inputs.length || vectors.some(vector => !vector.length)) {
        throw new AiError(502, "invalid", "Ungültige Antwort des Embedding-Servers.");
      }
      return vectors;
    } catch (error) {
      throw call.failure(error);
    } finally {
      call.finish();
    }
  }

  function chatBody(messages, options) {
    const body = {
      model: config.llmModel,
      messages,
      ...config.sampling,
      max_tokens: options.max_tokens,
      stream: Boolean(options.stream)
    };
    if (!config.thinking) {
      body.chat_template_kwargs = { enable_thinking: false };
    }
    if (options.structured) {
      body.response_format = { type: "json_schema", json_schema: { name: "palette", schema: PALETTE_SCHEMA } };
    }
    return body;
  }

  // One upstream call with its own abort controller: aborted when the browser goes
  // away, when the model server does not start answering in time, or (when armed)
  // after a period of silence while streaming.
  function startUpstream(url, body, clientSignal) {
    const controller = new AbortController();
    let timer = null;
    const arm = ms => {
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(new AiError(504, "timeout", "Zeitüberschreitung beim Model-Server.")), ms);
    };
    const onClientAbort = () => controller.abort(new AiError(499, "aborted", "Abgebrochen."));
    if (clientSignal) {
      if (clientSignal.aborted) {
        onClientAbort();
      } else {
        clientSignal.addEventListener("abort", onClientAbort, { once: true });
      }
    }
    arm(config.timeoutMs);
    const response = Promise.resolve().then(() => fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    }));
    response.catch(() => {});
    return {
      response,
      arm,
      finish() {
        clearTimeout(timer);
        if (clientSignal) {
          clientSignal.removeEventListener("abort", onClientAbort);
        }
      },
      failure(error, fallbackCode = "offline") {
        if (controller.signal.aborted && controller.signal.reason instanceof AiError) {
          return controller.signal.reason;
        }
        if (error instanceof AiError) {
          return error;
        }
        const cause = error && error.cause ? error.cause.code || error.cause.message : error && error.message;
        return new AiError(502, fallbackCode, `Model-Server nicht erreichbar: ${cause}`);
      }
    };
  }

  function logFailure(what, failure) {
    if (failure.status >= 500 || failure.code === "timeout") {
      log.warn(`KI-${what}: ${failure.message}`);
    }
  }

  // ---- limits ------------------------------------------------------------

  function countUsage(user, kind = "llm", limit = config.perHour) {
    const now = Date.now();
    const key = `${kind}:${user.id}`;
    const entry = usage.get(key);
    if (!entry || entry.resetAt <= now) {
      usage.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
      return () => {
        const current = usage.get(key);
        if (current && current.count > 0) {
          current.count -= 1;
        }
      };
    }
    if (entry.count >= limit) {
      throw new AiError(429, "limit", "Stundenlimit erreicht.");
    }
    entry.count += 1;
    return () => {
      entry.count = Math.max(0, entry.count - 1);
    };
  }

  // One running request per user; counted against the hourly limit.
  function reserveUser(user) {
    if (activeUsers.has(user.id)) {
      throw new AiError(429, "busy", "Es läuft bereits eine Anfrage.");
    }
    const refund = countUsage(user);
    activeUsers.add(user.id);
    let released = false;
    return {
      refund,
      release() {
        if (!released) {
          released = true;
          activeUsers.delete(user.id);
        }
      }
    };
  }

  return { status, palette, recipe, search, warmUp, llmEnabled, embedEnabled };
}

// Aborts when the browser closes the connection (tab closed, "Stop" pressed).
function watchClient(res) {
  const controller = new AbortController();
  const onClose = () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  };
  res.on("close", onClose);
  if (res.destroyed) {
    controller.abort();
  }
  return {
    signal: controller.signal,
    dispose: () => res.off("close", onClose)
  };
}

// Answers fast requests normally; for slow ones it starts the response early and sends
// a space every few seconds so reverse proxies (DSM: 60 s) don't cut the connection.
// JSON ignores leading whitespace; the guide renderer ignores blank lines.
function holdOpen(res, contentType, keepaliveMs) {
  let started = false;
  let marked = false;
  const start = () => {
    if (!started && !res.headersSent) {
      res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store", "X-Accel-Buffering": "no" });
    }
    started = true;
  };
  const timer = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) {
      start();
      res.write(" ");
    }
  }, keepaliveMs);
  return {
    write(text) {
      start();
      res.write(text);
    },
    end() {
      clearInterval(timer);
      if (!res.writableEnded) {
        start();
        res.end();
      }
    },
    json(status, payload) {
      clearInterval(timer);
      if (res.writableEnded || res.destroyed) {
        return;
      }
      const body = JSON.stringify(payload);
      if (!started) {
        res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      }
      res.end(body);
    },
    // Before the first byte: a normal JSON error. Afterwards: one marker at the end.
    fail(error) {
      clearInterval(timer);
      if (res.writableEnded || res.destroyed) {
        return;
      }
      if (!started) {
        res.writeHead(error.status === 499 ? 400 : error.status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
        res.end(JSON.stringify({ error: error.message, code: error.code }));
        return;
      }
      if (!marked && error.code !== "aborted") {
        marked = true;
        res.write(`\n[[WPH-ERROR:${error.code}]]`);
      }
      res.end();
    },
    stop() {
      clearInterval(timer);
    }
  };
}

// Removes <think>…</think> blocks in case the model server ignores enable_thinking.
function createThinkingFilter() {
  let pending = "";
  let inThink = false;
  return {
    feed(text) {
      pending += text;
      let out = "";
      for (;;) {
        if (inThink) {
          const close = pending.indexOf("</think>");
          if (close < 0) {
            pending = pending.slice(-7);
            return out;
          }
          pending = pending.slice(close + 8);
          inThink = false;
        } else {
          const open = pending.indexOf("<think>");
          if (open < 0) {
            const keep = partialTagLength(pending);
            out += pending.slice(0, pending.length - keep);
            pending = pending.slice(pending.length - keep);
            return out;
          }
          out += pending.slice(0, open);
          pending = pending.slice(open + 7);
          inThink = true;
        }
      }
    },
    flush() {
      const rest = inThink ? "" : pending;
      pending = "";
      return rest;
    }
  };
}

function partialTagLength(text) {
  for (let length = Math.min(6, text.length); length > 0; length -= 1) {
    if ("<think>".startsWith(text.slice(-length))) {
      return length;
    }
  }
  return 0;
}

function stripThinking(text) {
  return String(text).replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<think>[\s\S]*$/, "").trim();
}

function asAiError(error) {
  if (error instanceof AiError) {
    return error;
  }
  return new AiError(500, "generic", error && error.message ? error.message : "Unbekannter Fehler.");
}

// One request at a time on the model server; a short waiting line, then "busy".
// Waiting requests leave the line when the browser goes away or after maxWaitMs.
function createQueue(maxWaiting) {
  let active = false;
  const waiting = [];
  function handOver() {
    const next = waiting.shift();
    if (next) {
      next.grant();
    } else {
      active = false;
    }
  }
  async function acquire(signal, maxWaitMs) {
    if (signal && signal.aborted) {
      throw new AiError(499, "aborted", "Abgebrochen.");
    }
    if (active) {
      if (waiting.length >= maxWaiting) {
        throw new AiError(503, "busy", "Der Assistent ist ausgelastet.");
      }
      await new Promise((resolve, reject) => {
        const entry = {};
        const leave = error => {
          const position = waiting.indexOf(entry);
          if (position > -1) {
            waiting.splice(position, 1);
          }
          cleanup();
          reject(error);
        };
        const onAbort = () => leave(new AiError(499, "aborted", "Abgebrochen."));
        const timer = setTimeout(() => leave(new AiError(503, "busy", "Wartezeit beim Assistenten überschritten.")), maxWaitMs);
        const cleanup = () => {
          clearTimeout(timer);
          if (signal) {
            signal.removeEventListener("abort", onAbort);
          }
        };
        entry.grant = () => {
          cleanup();
          resolve();
        };
        if (signal) {
          signal.addEventListener("abort", onAbort, { once: true });
        }
        waiting.push(entry);
      });
    } else {
      active = true;
    }
    let released = false;
    return () => {
      if (!released) {
        released = true;
        handOver();
      }
    };
  }
  return { acquire };
}

// ---- faction references ----------------------------------------------------

const SYSTEM_NAMES = { k40: "Warhammer 40,000", aos: "Warhammer Age of Sigmar" };
const GENERIC_SUBFACTION = /^no specific/i;

function normalizeName(text) {
  return ` ${String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;
}

// Faction schemes named in the description, best match first, at most two factions.
// Subfaction names count most; "Maggotkin of Nurgle" is also found by "Nurgle";
// the selected game system breaks ties.
function findFactionReferences(description, schemes, systemCode) {
  const text = normalizeName(description);
  const has = name => {
    const key = normalizeName(name);
    return key.trim().length >= 4 && text.includes(key);
  };
  const scored = [];
  (schemes || []).forEach((scheme, order) => {
    if (!scheme || !Array.isArray(scheme.roles)) {
      return;
    }
    const tail = String(scheme.faction || "").split(/\s+of\s+/i)[1];
    let score = 0;
    if (!GENERIC_SUBFACTION.test(scheme.subfaction || "") && has(scheme.subfaction)) {
      score = 3;
    } else if (has(scheme.faction) || (tail && has(tail))) {
      score = 2;
    }
    if (score) {
      scored.push({ scheme, order, score: score + (scheme.system === systemCode ? 1.5 : 0) });
    }
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  const picked = [];
  for (const { scheme } of scored) {
    if (picked.length < 2 && !picked.some(other => other.faction === scheme.faction)) {
      picked.push(scheme);
    }
  }
  return picked;
}

function schemeLabel(scheme) {
  const sub = GENERIC_SUBFACTION.test(scheme.subfaction || "") ? "" : ` – ${scheme.subfaction}`;
  return `${scheme.faction}${sub}`;
}

function referencePrompt(references) {
  if (!references.length) {
    return ["- If the description names a Warhammer faction or army you know, start from its established colours."];
  }
  const lines = ["", "Reference schemes from the app for the faction(s) named in the description:"];
  for (const scheme of references) {
    const roles = scheme.roles.map(role => `${role.code} ${role.hex}`).join(", ");
    lines.push(`- ${schemeLabel(scheme)} (${SYSTEM_NAMES[scheme.system] || scheme.system}), "${scheme.schemeName}": ${roles}.`);
    if (scheme.paintEquivalents) {
      lines.push(`  Typical paints: ${cleanText(scheme.paintEquivalents, 160)}.`);
    }
    if (scheme.notes) {
      lines.push(`  Notes: ${cleanText(scheme.notes, 300)}`);
    }
  }
  lines.push(
    "Keep the faction's colour identity: D and S stay in the same hue families as the reference.",
    "Apply the user's style wishes (e.g. neon, grimdark, weathered, pastel) by changing brightness, saturation, contrast and the accents, not by replacing the faction colours with unrelated hues."
  );
  return lines;
}

// ---- validation ----------------------------------------------------------

function parsePalette(content) {
  let text = String(content || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new AiError(502, "invalid", "Antwort enthält kein JSON.");
  }
  let data;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch (error) {
    throw new AiError(502, "invalid", "Antwort ist kein gültiges JSON.");
  }
  const seen = new Set();
  const colors = (Array.isArray(data.colors) ? data.colors : [])
    .map(color => ({
      role: String(color && color.role || "").toUpperCase(),
      name: cleanText(color && color.name, 40),
      hex: String(color && color.hex || "").trim().toUpperCase()
    }))
    .filter(color => ROLE_CODES.includes(color.role) && /^#[0-9A-F]{6}$/.test(color.hex) && !seen.has(color.role) && seen.add(color.role))
    .sort((a, b) => ROLE_CODES.indexOf(a.role) - ROLE_CODES.indexOf(b.role));
  if (colors.length < 3 || colors[0].role !== "D") {
    throw new AiError(502, "invalid", "Zu wenige gültige Farben in der Antwort.");
  }
  return {
    name: cleanText(data.name, 60) || "Palette",
    notes: cleanText(data.notes, 800),
    colors
  };
}

// Keep only the expected shape from the browser, with bounded sizes.
function sanitizeContext(input) {
  const ctx = input && typeof input === "object" ? input : {};
  const str = (value, max = 160) => cleanText(value, max);
  const paintList = list => (Array.isArray(list) ? list : []).slice(0, 3).map(paint => ({
    name: str(paint && paint.name, 80),
    manufacturer: str(paint && paint.manufacturer, 40),
    range: str(paint && paint.range, 40),
    owned: Boolean(paint && paint.owned)
  })).filter(paint => paint.name);
  const hex = value => (/^#[0-9A-F]{6}$/i.test(String(value || "")) ? String(value).toUpperCase() : "");
  return {
    language: str(ctx.language, 5),
    system: str(ctx.system, 40),
    scheme: str(ctx.scheme, 80),
    finish: str(ctx.finish, 40),
    recipeMode: str(ctx.recipeMode, 60),
    recipeModeDescription: str(ctx.recipeModeDescription, 300),
    ownedPaintCount: Math.max(0, Math.min(10000, Number(ctx.ownedPaintCount) || 0)),
    onlyOwnedPaints: Boolean(ctx.onlyOwnedPaints),
    areas: (Array.isArray(ctx.areas) ? ctx.areas : []).slice(0, 12).map(area => ({
      area: str(area && area.area, 60),
      color: str(area && area.color, 60),
      hex: hex(area && area.hex)
    })),
    colors: (Array.isArray(ctx.colors) ? ctx.colors : []).slice(0, 6).map(color => ({
      name: str(color && color.name, 60),
      hex: hex(color && color.hex),
      steps: (Array.isArray(color && color.steps) ? color.steps : []).slice(0, 6).map(step => ({
        step: str(step && step.step, 40),
        hex: hex(step && step.hex),
        paints: paintList(step && step.paints)
      }))
    })),
    base: ctx.base && typeof ctx.base === "object" ? {
      title: str(ctx.base.title, 80),
      steps: (Array.isArray(ctx.base.steps) ? ctx.base.steps : []).slice(0, 8).map(step => str(step, 120)),
      paints: paintList(ctx.base.paints)
    } : null
  };
}

function upstreamError(status, text = "") {
  return new AiError(502, status === 503 || status === 429 ? "busy" : "offline",
    `Model-Server antwortet mit ${status}${text ? `: ${String(text).slice(0, 200)}` : ""}.`);
}

function positive(value, fallback) {
  const number = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(number) && number > 0 ? number : fallback;
}

function requireEnabled(enabled) {
  if (!enabled) {
    throw new AiError(404, "disabled", "Diese KI-Funktion ist nicht eingerichtet.");
  }
}

class AiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// ---- search text and vectors -------------------------------------------------

// Words in English and German so queries in either language find the colour family.
function paintSearchText(paint) {
  const parts = [
    paint.name,
    [paint.manufacturer, paint.collection, paint.range].filter(Boolean).join(" "),
    paint.finish ? `Type: ${paint.finish}` : "",
    `Colour: ${describeColor(paint.hex, metallicHint(paint), "en")}`,
    `Farbe: ${describeColor(paint.hex, metallicHint(paint), "de")}`,
    paint.notes ? String(paint.notes).slice(0, 160) : ""
  ];
  return parts.filter(Boolean).join(". ");
}

// The catalogue rarely marks metallics, so well-known metal paint names count too.
function metallicHint(paint) {
  const text = `${paint.finish || ""} ${paint.range || ""} ${paint.name || ""}`;
  return /metal|gold|silver|brass|bronze|copper|steel|iron|chrome|leadbelcher|retributor|runefang|ironbreaker|balthasar|gehenna|auric|liberator|stormhost|sycorax|warplock|hashut|canoptek/i.test(text)
    ? "metallic"
    : paint.finish;
}

function describeColor(hex, finish, lang) {
  const { h, s, l } = hexToHsl(hex);
  const metal = /metal/i.test(finish || "");
  const de = lang === "de";
  const words = [];
  if (metal) {
    if (s < 25) words.push(de ? "Silber, Stahl, Eisen" : "silver, steel, iron");
    else if (h >= 35 && h < 65) words.push(de ? "Gold, Messing" : "gold, brass");
    else if (h < 35 || h >= 340) words.push(de ? "Kupfer, Bronze" : "copper, bronze");
    words.push(de ? "Metallic" : "metallic");
  }
  const lightness = l < 15 ? (de ? "sehr dunkel" : "very dark") : l < 35 ? (de ? "dunkel" : "dark")
    : l < 65 ? (de ? "mittel" : "mid") : l < 85 ? (de ? "hell" : "light") : (de ? "sehr hell" : "very light");
  let family;
  const neutral = s < 10 || (s < 20 && (l < 15 || l > 88)) || (metal && s < 25);
  if (neutral) {
    family = l < 15 ? (de ? "Schwarz" : "black") : l > 88 ? (de ? "Weiss" : "white") : (de ? "Grau" : "grey");
  } else if (h >= 15 && h < 50 && l < 45) {
    family = de ? "Braun" : "brown";
  } else if (h >= 25 && h < 65 && l >= 55 && s < 55) {
    family = de ? "Beige, Knochen, Pergament" : "beige, bone, parchment";
  } else {
    family = hueName(h, de);
  }
  const saturation = neutral ? "" : s < 25 ? (de ? "gedeckt, entsättigt" : "muted, desaturated")
    : s > 70 ? (de ? "kräftig, leuchtend" : "vivid, saturated") : "";
  const temperature = neutral ? "" : (h < 70 || h >= 330) ? (de ? "warm" : "warm") : (h >= 150 && h < 270) ? (de ? "kalt" : "cool") : "";
  words.push(lightness, family, saturation, temperature);
  return words.filter(Boolean).join(", ");
}

function hueName(h, de) {
  const names = [
    [15, "Rot", "red"], [40, "Orange", "orange"], [65, "Gelb", "yellow"], [90, "Gelbgrün", "yellow-green"],
    [150, "Grün", "green"], [190, "Türkis", "teal, turquoise"], [250, "Blau", "blue"], [285, "Violett", "purple"],
    [330, "Magenta, Pink", "magenta, pink"], [360, "Rot", "red"]
  ];
  const entry = names.find(([limit]) => h < limit) || names[names.length - 1];
  return de ? entry[1] : entry[2];
}

function hexToHsl(hex) {
  const value = parseInt(String(hex).slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function normalize(vector) {
  let sum = 0;
  for (const value of vector) {
    sum += value * value;
  }
  const length = Math.sqrt(sum) || 1;
  return vector.map(value => value / length);
}

function dot(a, b) {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    sum += a[i] * b[i];
  }
  return sum;
}

function encodeVector(vector) {
  return Buffer.from(Float32Array.from(vector).buffer).toString("base64");
}

function decodeVector(text) {
  const buffer = Buffer.from(text, "base64");
  return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function languageName(code) {
  return LANGUAGE_NAMES[String(code || "").slice(0, 2)] || "English";
}

function trimSlash(url) {
  return String(url).trim().replace(/\/+$/, "");
}

module.exports = { createAi, loadAiConfig, AiError, parsePalette, findFactionReferences, sanitizeContext, describeColor, paintSearchText, createThinkingFilter, stripThinking };
