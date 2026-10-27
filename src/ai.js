// Assistant features for PaintHelperV2:
// - palette from a description and painting guide (language model on the AI PC)
// - paint search in words (embedding model on the AI PC)
// - palette from a photo (runs entirely in the browser, no server needed)
(function () {
  "use strict";

  const API = "api/ai/";
  const ERROR_PATTERN = /\n?\[\[WPH-ERROR:([\w-]+)\]\]/g;
  let app = null;
  let status = { llm: false, search: false, searchReady: false };
  let recipeController = null;
  let recipeText = "";
  let recipeSignature = "";
  let lastSearch = [];
  const el = {};

  document.addEventListener("wph:update", () => {
    if (!app) {
      init();
    }
    refresh();
  });

  function init() {
    app = window.WPH && window.WPH.app;
    if (!app) {
      return;
    }
    [
      "aiPaletteInput", "aiPaletteBtn", "aiPaletteStatus", "aiPhotoBtn", "aiPhotoInput", "aiPhotoStatus",
      "aiDeletePaletteBtn", "aiRecipeBtn", "aiRecipeStopBtn", "aiRecipeCopyBtn", "aiRecipeStatus",
      "aiRecipeOutput", "aiSearchForm", "aiSearchInput", "aiSearchStatus", "aiSearchResults"
    ].forEach(id => { el[id] = document.getElementById(id); });

    el.aiPaletteBtn.addEventListener("click", createPaletteFromText);
    el.aiPaletteInput.addEventListener("keydown", event => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        createPaletteFromText();
      }
    });
    el.aiPhotoBtn.addEventListener("click", () => el.aiPhotoInput.click());
    el.aiPhotoInput.addEventListener("change", () => {
      const file = el.aiPhotoInput.files && el.aiPhotoInput.files[0];
      el.aiPhotoInput.value = "";
      if (file) {
        createPaletteFromPhoto(file);
      }
    });
    el.aiDeletePaletteBtn.addEventListener("click", () => {
      const selected = app.selectedCustomPalette();
      if (selected) {
        app.deleteCustomPalette(selected.id);
      }
    });
    el.aiRecipeBtn.addEventListener("click", writeRecipe);
    el.aiRecipeStopBtn.addEventListener("click", () => recipeController && recipeController.abort());
    el.aiRecipeCopyBtn.addEventListener("click", copyRecipe);
    el.aiSearchForm.addEventListener("submit", event => {
      event.preventDefault();
      searchPaints();
    });

    const storage = window.WPHStorage;
    if (storage && storage.mode() === "server") {
      request("GET", "status").then(result => {
        status = result || status;
        document.documentElement.classList.toggle("wph-ai-llm", Boolean(status.llm));
        document.documentElement.classList.toggle("wph-ai-search", Boolean(status.search));
      }, () => {});
    }
  }

  function refresh() {
    if (!app) {
      return;
    }
    el.aiPaletteInput.placeholder = t("ai.describePlaceholder");
    el.aiSearchInput.placeholder = t("ai.searchPlaceholder");
    el.aiSearchInput.setAttribute("aria-label", t("ai.searchTitle"));
    el.aiDeletePaletteBtn.hidden = !app.selectedCustomPalette();
    if (!el.aiPhotoStatus.dataset.message) {
      el.aiPhotoStatus.textContent = t("ai.photoHint");
    }
    if (recipeText && !recipeController && recipeSignature && recipeSignature !== paletteSignature()) {
      el.aiRecipeStatus.textContent = t("ai.recipeStale");
    }
    if (lastSearch.length) {
      renderSearchResults(lastSearch);
    }
  }

  // ---- palette from a description ----------------------------------------

  async function createPaletteFromText() {
    const description = el.aiPaletteInput.value.trim();
    if (description.length < 3) {
      el.aiPaletteInput.focus();
      return;
    }
    const stopTimer = busy(el.aiPaletteBtn, el.aiPaletteStatus, t("ai.working"));
    try {
      const result = await request("POST", "palette", {
        description,
        system: app.system(),
        language: app.language()
      });
      const id = app.addCustomPalette({
        name: result.name,
        source: "ai",
        prompt: description,
        notes: result.notes,
        colors: result.colors
      });
      stopTimer();
      el.aiPaletteStatus.textContent = id ? t("ai.paletteDone", { name: result.name }) : t("ai.error.invalid");
    } catch (error) {
      stopTimer();
      el.aiPaletteStatus.textContent = errorText(error);
    }
  }

  // ---- palette from a photo (browser only) --------------------------------

  async function createPaletteFromPhoto(file) {
    el.aiPhotoStatus.dataset.message = "1";
    el.aiPhotoStatus.textContent = t("ai.photoWorking");
    try {
      const pixels = await readPixels(file, 160);
      const colors = photoPalette(pixels);
      if (colors.length < 2) {
        throw new Error("too few colours");
      }
      const name = cleanName(file.name) || `${t("ai.source.photo")} ${new Date().toLocaleDateString()}`;
      app.addCustomPalette({ name, source: "photo", notes: t("ai.photoNote"), colors });
      el.aiPhotoStatus.textContent = t("ai.photoDone", { name });
    } catch (error) {
      el.aiPhotoStatus.textContent = t("ai.photoError");
    }
  }

  async function readPixels(file, maxSide) {
    let source;
    let cleanup = () => {};
    if (typeof createImageBitmap === "function") {
      try {
        source = await createImageBitmap(file);
        cleanup = () => source.close && source.close();
      } catch (error) {
        source = null;
      }
    }
    if (!source) {
      const url = URL.createObjectURL(file);
      cleanup = () => URL.revokeObjectURL(url);
      source = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });
    }
    try {
      const width = source.width || source.naturalWidth;
      const height = source.height || source.naturalHeight;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      return { data: context.getImageData(0, 0, canvas.width, canvas.height).data, width: canvas.width, height: canvas.height };
    } finally {
      cleanup();
    }
  }

  // Weighted k-means in Lab space; the image centre counts more because the model is
  // usually in the middle. Roles: dominant, secondary, dark/light neutral, accents.
  function photoPalette({ data, width, height }) {
    const points = [];
    const sigma = 0.38;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        if (data[offset + 3] < 128) {
          continue;
        }
        const dx = (x + 0.5) / width - 0.5;
        const dy = (y + 0.5) / height - 0.5;
        const weight = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        points.push({ lab: rgbToLab(data[offset], data[offset + 1], data[offset + 2]), weight });
      }
    }
    if (!points.length) {
      return [];
    }
    const clusters = kMeans(points, 8, 14)
      .filter(cluster => cluster.share >= 0.015)
      .sort((a, b) => b.share - a.share);
    const chroma = cluster => Math.hypot(cluster.lab[1], cluster.lab[2]);
    const used = [];
    const distinct = (cluster, min) => used.every(other => deltaE(cluster.lab, other.lab) >= min);
    const take = (role, cluster) => {
      if (cluster) {
        used.push(Object.assign(cluster, { role }));
      }
    };
    take("D", clusters.find(cluster => chroma(cluster) > 12) || clusters[0]);
    take("S", clusters.find(cluster => !used.includes(cluster) && distinct(cluster, 18)));
    const remaining = () => clusters.filter(cluster => !used.includes(cluster) && distinct(cluster, 12));
    take("ND", remaining().sort((a, b) => a.lab[0] - b.lab[0]).find(cluster => cluster.lab[0] < 40));
    take("NL", remaining().sort((a, b) => b.lab[0] - a.lab[0]).find(cluster => cluster.lab[0] > 60));
    take("A1", remaining().sort((a, b) => chroma(b) - chroma(a))[0]);
    take("A2", remaining().sort((a, b) => chroma(b) - chroma(a))[0]);
    const order = ["D", "S", "ND", "NL", "A1", "A2"];
    return used
      .sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))
      .map(cluster => ({ role: cluster.role, name: "", hex: labToHex(cluster.lab) }));
  }

  function kMeans(points, k, iterations) {
    // Deterministic k-means++ style seeding: start with the heaviest point, then
    // repeatedly add the point farthest from all centres.
    let centres = [points.reduce((best, point) => (point.weight > best.weight ? point : best)).lab.slice()];
    const step = Math.max(1, Math.floor(points.length / 2000));
    while (centres.length < k) {
      let best = null;
      let bestScore = -1;
      for (let i = 0; i < points.length; i += step) {
        const point = points[i];
        const nearest = Math.min(...centres.map(centre => deltaE(point.lab, centre)));
        const score = nearest * nearest * point.weight;
        if (score > bestScore) {
          bestScore = score;
          best = point;
        }
      }
      if (!best || bestScore <= 0) {
        break;
      }
      centres.push(best.lab.slice());
    }
    let sums = [];
    for (let round = 0; round < iterations; round += 1) {
      sums = centres.map(() => ({ l: 0, a: 0, b: 0, w: 0 }));
      points.forEach(point => {
        let index = 0;
        let distance = Infinity;
        centres.forEach((centre, i) => {
          const d = deltaE(point.lab, centre);
          if (d < distance) {
            distance = d;
            index = i;
          }
        });
        const sum = sums[index];
        sum.l += point.lab[0] * point.weight;
        sum.a += point.lab[1] * point.weight;
        sum.b += point.lab[2] * point.weight;
        sum.w += point.weight;
      });
      centres = sums.map((sum, i) => (sum.w ? [sum.l / sum.w, sum.a / sum.w, sum.b / sum.w] : centres[i]));
    }
    const total = sums.reduce((acc, sum) => acc + sum.w, 0) || 1;
    return centres.map((lab, i) => ({ lab, share: sums[i].w / total }));
  }

  // ---- painting guide -----------------------------------------------------

  async function writeRecipe() {
    if (recipeController) {
      return;
    }
    const context = app.recipeContext();
    recipeSignature = paletteSignature();
    recipeText = "";
    recipeController = new AbortController();
    el.aiRecipeOutput.hidden = false;
    el.aiRecipeOutput.replaceChildren();
    el.aiRecipeStopBtn.hidden = false;
    el.aiRecipeCopyBtn.hidden = true;
    const stopTimer = busy(el.aiRecipeBtn, el.aiRecipeStatus, t("ai.working"));
    let failure = null;
    try {
      const response = await fetch(`${API}recipe`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-WPH-Request": "1" },
        body: JSON.stringify({ context }),
        signal: recipeController.signal
      });
      if (!response.ok) {
        throw await responseError(response);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let scheduled = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        recipeText += decoder.decode(value, { stream: true });
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(() => {
            scheduled = false;
            renderMarkdown(el.aiRecipeOutput, recipeText.replace(ERROR_PATTERN, ""));
          });
        }
      }
      const markers = Array.from(recipeText.matchAll(ERROR_PATTERN));
      if (markers.length) {
        const code = markers[markers.length - 1][1];
        failure = Object.assign(new Error(code), { code });
        recipeText = recipeText.replace(ERROR_PATTERN, "");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        failure = error;
      }
    } finally {
      stopTimer();
      recipeController = null;
      el.aiRecipeStopBtn.hidden = true;
    }
    renderMarkdown(el.aiRecipeOutput, recipeText);
    el.aiRecipeOutput.hidden = !recipeText.trim();
    el.aiRecipeCopyBtn.hidden = !recipeText.trim();
    el.aiRecipeStatus.textContent = failure
      ? errorText(failure)
      : t("ai.recipeHint", { owned: context.ownedPaintCount });
  }

  function paletteSignature() {
    const context = app.recipeContext();
    return JSON.stringify([context.colors.map(color => color.hex), context.recipeMode, context.finish]);
  }

  async function copyRecipe() {
    try {
      await navigator.clipboard.writeText(recipeText);
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = recipeText;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    el.aiRecipeStatus.textContent = t("ai.recipeCopied");
  }

  // Minimal, safe Markdown: headings, numbered and bullet lists, paragraphs, **bold**.
  function renderMarkdown(container, text) {
    const nodes = [];
    let list = null;
    let paragraph = null;
    const closeBlocks = () => {
      list = null;
      paragraph = null;
    };
    String(text).split(/\r?\n/).forEach(rawLine => {
      const line = rawLine.trimEnd();
      let match;
      if (!line.trim()) {
        closeBlocks();
      } else if ((match = line.match(/^\s*#{1,6}\s+(.*)$/))) {
        closeBlocks();
        nodes.push(withInline(document.createElement("h4"), match[1]));
      } else if ((match = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
        paragraph = null;
        if (!list || list.tagName !== "OL") {
          list = document.createElement("ol");
          nodes.push(list);
        }
        list.appendChild(withInline(document.createElement("li"), match[2]));
      } else if ((match = line.match(/^\s*[-*•]\s+(.*)$/))) {
        paragraph = null;
        if (!list || list.tagName !== "UL") {
          list = document.createElement("ul");
          nodes.push(list);
        }
        list.appendChild(withInline(document.createElement("li"), match[1]));
      } else if (list && /^\s{2,}\S/.test(rawLine)) {
        const last = list.lastElementChild;
        last.appendChild(document.createTextNode(" "));
        withInline(last, line.trim());
      } else {
        list = null;
        if (!paragraph) {
          paragraph = document.createElement("p");
          nodes.push(paragraph);
        } else {
          paragraph.appendChild(document.createElement("br"));
        }
        withInline(paragraph, line.trim());
      }
    });
    container.replaceChildren(...nodes);
  }

  function withInline(node, text) {
    String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach(part => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        const strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        node.appendChild(strong);
      } else if (/^`[^`]+`$/.test(part)) {
        const code = document.createElement("code");
        code.textContent = part.slice(1, -1);
        node.appendChild(code);
      } else if (part) {
        node.appendChild(document.createTextNode(part.replace(/\*\*/g, "")));
      }
    });
    return node;
  }

  // ---- paint search in words ---------------------------------------------

  async function searchPaints() {
    const query = el.aiSearchInput.value.trim();
    if (query.length < 2) {
      el.aiSearchInput.focus();
      return;
    }
    if (!app.selectedManufacturers().length) {
      lastSearch = [];
      renderSearchResults(lastSearch);
      el.aiSearchStatus.textContent = t("ai.searchEmpty");
      return;
    }
    const button = el.aiSearchForm.querySelector("button");
    const stopTimer = busy(button, el.aiSearchStatus, status.searchReady ? "…" : t("ai.searchIndexing"));
    try {
      const result = await request("POST", "search", {
        query,
        language: app.language(),
        manufacturers: app.selectedManufacturers(),
        limit: 12
      });
      status.searchReady = true;
      stopTimer();
      lastSearch = result.results || [];
      el.aiSearchStatus.textContent = lastSearch.length ? "" : t("ai.searchEmpty");
      renderSearchResults(lastSearch);
    } catch (error) {
      stopTimer();
      el.aiSearchStatus.textContent = errorText(error);
    }
  }

  function renderSearchResults(results) {
    el.aiSearchResults.replaceChildren(...results.map(result => {
      const paint = app.findPaint(result) || result;
      const owned = app.isOwned(paint);
      const listed = app.isOnShoppingList(paint);
      const card = document.createElement("article");
      card.className = `ai-search-card${owned ? " owned-match" : ""}`;
      const swatch = document.createElement("span");
      swatch.className = "ai-search-swatch";
      if (/^#[0-9A-F]{6}$/i.test(result.hex)) {
        swatch.style.background = result.hex;
      }
      const body = document.createElement("div");
      body.className = "ai-search-body";
      const title = document.createElement("div");
      title.className = "ai-search-name";
      title.textContent = result.name;
      if (owned) {
        const badge = document.createElement("span");
        badge.className = "owned-badge";
        badge.textContent = t("ai.searchOwned");
        title.append(" ", badge);
      }
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = [result.manufacturer, result.range || result.finish, result.hex].filter(Boolean).join(" · ");
      const actions = document.createElement("div");
      actions.className = "ai-search-actions";
      const useMain = document.createElement("button");
      useMain.type = "button";
      useMain.className = "secondary";
      useMain.textContent = t("ai.searchUseMain");
      useMain.addEventListener("click", () => app.setPrimaryHex(result.hex));
      actions.appendChild(useMain);
      if (!owned && app.findPaint(result)) {
        const shop = document.createElement("button");
        shop.type = "button";
        shop.className = "secondary";
        shop.textContent = listed ? t("ai.searchOnList") : t("ai.searchAddShopping");
        shop.disabled = listed;
        shop.addEventListener("click", () => {
          app.addToShoppingList(paint);
          renderSearchResults(lastSearch);
        });
        actions.appendChild(shop);
      }
      body.append(title, meta, actions);
      card.append(swatch, body);
      return card;
    }));
  }

  // ---- helpers ------------------------------------------------------------

  function busy(button, statusNode, message) {
    button.disabled = true;
    const started = Date.now();
    statusNode.textContent = message;
    const timer = setInterval(() => {
      statusNode.textContent = `${message} ${Math.round((Date.now() - started) / 1000)} s`;
    }, 1000);
    return () => {
      clearInterval(timer);
      button.disabled = false;
    };
  }

  async function request(method, path, body) {
    const response = await fetch(API + path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined
        ? { "X-WPH-Request": "1" }
        : { "Content-Type": "application/json", "X-WPH-Request": "1" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
      throw await responseError(response);
    }
    const data = await response.json();
    if (data && data.error) {
      // Slow answers start with status 200 (keepalive), so errors can arrive in the body.
      throw Object.assign(new Error(data.error), { code: data.code });
    }
    return data;
  }

  async function responseError(response) {
    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
    return Object.assign(new Error((data && data.error) || response.statusText), {
      status: response.status,
      code: data && data.code
    });
  }

  function errorText(error) {
    const code = error && error.code;
    if (code === "disabled") {
      return t("ai.unavailable");
    }
    if (["offline", "busy", "limit", "invalid", "timeout"].includes(code)) {
      return t(`ai.error.${code}`);
    }
    if (error instanceof TypeError) {
      return t("ai.error.offline");
    }
    return t("ai.error.generic");
  }

  function t(key, params) {
    return app ? app.t(key, params) : key;
  }

  function cleanName(fileName) {
    return String(fileName || "").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_-]+/g, " ").trim().slice(0, 40);
  }

  // ---- colour maths (sRGB D65 <-> CIE Lab) ---------------------------------

  function rgbToLab(r, g, b) {
    const lin = value => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const R = lin(r);
    const G = lin(g);
    const B = lin(b);
    const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const f = value => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  }

  function labToHex([L, a, b]) {
    const fy = (L + 16) / 116;
    const fx = fy + a / 500;
    const fz = fy - b / 200;
    const inv = value => (value ** 3 > 0.008856 ? value ** 3 : (value - 16 / 116) / 7.787);
    const x = inv(fx) * 0.95047;
    const y = inv(fy);
    const z = inv(fz) * 1.08883;
    const gamma = value => {
      const c = value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, c)) * 255);
    };
    const rgb = [
      gamma(x * 3.2406 + y * -1.5372 + z * -0.4986),
      gamma(x * -0.9689 + y * 1.8758 + z * 0.0415),
      gamma(x * 0.0557 + y * -0.204 + z * 1.057)
    ];
    return `#${rgb.map(value => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }

  function deltaE(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }

  // Exposed for tests.
  window.WPHAssistant = { photoPalette, renderMarkdown, rgbToLab, labToHex };
}());
