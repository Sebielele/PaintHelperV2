// Minimal stand-in for an OpenAI-compatible model server (chat + embeddings), used by
// the tests so the assistant features can be exercised without the AI PC.
const http = require("node:http");
const crypto = require("node:crypto");

const DIMS = 96;

function startFakeOvms(options = {}) {
  const state = {
    requests: [],
    active: 0,
    maxActive: 0,
    activeChat: 0,
    maxActiveChat: 0,
    embedCalls: 0,
    options
  };
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      const json = body ? JSON.parse(body) : {};
      state.requests.push({ url: req.url, body: json });
      state.active += 1;
      state.maxActive = Math.max(state.maxActive, state.active);
      const isChat = req.url === "/v3/chat/completions";
      if (isChat) {
        state.activeChat += 1;
        state.maxActiveChat = Math.max(state.maxActiveChat, state.activeChat);
      }
      try {
        if (state.options.delayMs) {
          await new Promise(resolve => setTimeout(resolve, state.options.delayMs));
        }
        if (req.url === "/v3/embeddings") {
          state.embedCalls += 1;
          const inputs = Array.isArray(json.input) ? json.input : [json.input];
          return send(res, 200, {
            data: inputs.map((text, index) => ({ index, embedding: fakeEmbedding(text) }))
          });
        }
        if (req.url === "/v3/chat/completions") {
          if (state.options.rejectSchema && json.response_format) {
            return send(res, 400, { error: "response_format not supported" });
          }
          if (json.stream) {
            res.writeHead(200, { "Content-Type": "text/event-stream" });
            const text = state.options.recipeText || "## Vorbereitung\n1. Grundieren mit **Abaddon Black**.\n\n## Rüstung\n- Basis: **Retributor Armour**\n";
            for (const piece of text.match(/.{1,12}/gs)) {
              if (res.destroyed) {
                return;
              }
              res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`);
              if (state.options.stallAfterFirstChunk) {
                await new Promise(resolve => res.on("close", resolve));
                return;
              }
              await new Promise(resolve => setTimeout(resolve, state.options.chunkDelayMs || 5));
            }
            if (state.options.breakStream) {
              res.destroy();
              return;
            }
            res.end("data: [DONE]\n\n");
            return;
          }
          const content = state.options.paletteReply !== undefined ? state.options.paletteReply : JSON.stringify({
            name: "Rostiger Nurgle",
            notes: "Rüstung in krankem Grün, Messing an den Kanten.",
            colors: [
              { role: "S", name: "Messing", hex: "#a07a3c" },
              { role: "D", name: "Rüstung", hex: "#6B7A3A" },
              { role: "ND", name: "Leder", hex: "#3B2A1E" },
              { role: "NL", name: "Knochen", hex: "#D8CBA0" },
              { role: "A1", name: "Eiter", hex: "#C9B640" },
              { role: "A1", name: "Doppelt", hex: "#FF0000" },
              { role: "A2", name: "Kaputt", hex: "nope" }
            ]
          });
          return send(res, 200, { choices: [{ message: { role: "assistant", content } }] });
        }
        send(res, 404, { error: "not found" });
      } finally {
        state.active -= 1;
        if (isChat) {
          state.activeChat -= 1;
        }
      }
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => {
    resolve({
      url: `http://127.0.0.1:${server.address().port}/v3`,
      state,
      close: () => new Promise(done => {
        server.close(done);
        server.closeAllConnections();
      })
    });
  }));
}

// Bag of words hashed into a small vector: shared words give high similarity.
function fakeEmbedding(text) {
  const vector = new Array(DIMS).fill(0);
  const words = String(text).toLowerCase().replace(/^instruct:.*\nquery:/s, "").match(/[\p{L}\p{N}]+/gu) || [];
  for (const word of words) {
    const hash = crypto.createHash("md5").update(word).digest();
    vector[hash[0] % DIMS] += 1;
  }
  return vector;
}

module.exports = { startFakeOvms };

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}
