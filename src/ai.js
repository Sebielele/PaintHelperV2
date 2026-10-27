// Assistant features for PaintHelperV2:
// - palette from a description and painting guide (language model on the AI PC)
// - paint search in words (embedding model on the AI PC)
// - palette from a photo (runs entirely in the browser, no server needed)
(function () {
  "use strict";

  const API = "api/ai/";
  const ERROR_PATTERN = /\n?\[\[WPH-ERROR:([\w-]+)\]\]/g;
  const GUIDES_KEY = "wph.guides.v1";
  const MAX_GUIDES = 40;
  let app = null;
  let status = { llm: false, search: false, searchReady: false };
  let recipeController = null;
  let recipeText = "";
  let recipeSignature = "";
  let lastSearch = [];
  let lastQuery = "";
  let recipeId = "";
  let recipeUnknown = 0;
  let undoState = null;
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
      "aiRecipeOutput", "aiSearchForm", "aiSearchStatus", "aiSearchResults", "aiSearchBlock",
      "aiPaletteFeedback", "aiRecipeFeedback", "aiRefineForm", "aiRefineInput", "aiRefineBtn", "aiUndoBtn",
      "aiRefineStatus", "aiRecipeOwnedOnly", "aiRecipeOwnedOnlyLabel", "aiPhotoOnlyBtn", "aiRecipeBenchBtn", "aiRecipeProgress"
    ].forEach(id => { el[id] = document.getElementById(id); });
    // One search box on the paints page: names filter right away, descriptions go to the
    // embedding search (Enter, the ✨ button, or by itself when no paint name matches).
    el.aiSearchInput = document.getElementById("collectionSearchInput");

    setupFeedback(el.aiPaletteFeedback, () => {
      const selected = app.selectedCustomPalette();
      return selected && selected.source === "ai" ? {
        kind: "palette",
        refId: selected.id,
        prompt: selected.prompt || selected.name,
        palette: { name: selected.name, colors: app.paletteForAi() },
        current: selected.rating || 0,
        remember: rating => app.setCustomPaletteRating(selected.id, rating)
      } : null;
    });
    setupFeedback(el.aiRecipeFeedback, () => (recipeId ? {
      kind: "recipe",
      refId: recipeId,
      prompt: app.paletteTitle(),
      current: Number(el.aiRecipeFeedback.dataset.rating || 0),
      remember: rating => { el.aiRecipeFeedback.dataset.rating = String(rating); }
    } : null));
    el.aiRefineForm.addEventListener("submit", event => {
      event.preventDefault();
      refinePalette();
    });
    el.aiUndoBtn.addEventListener("click", undoRefine);

    el.aiPaletteBtn.addEventListener("click", createPaletteFromText);
    el.aiPaletteInput.addEventListener("keydown", event => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        createPaletteFromText();
      }
    });
    el.aiPhotoBtn.addEventListener("click", () => el.aiPhotoInput.click());
    el.aiPhotoOnlyBtn.addEventListener("click", () => el.aiPhotoInput.click());
    el.aiRecipeBenchBtn.addEventListener("click", openBench);
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
      if (document.documentElement.classList.contains("wph-ai-search")) {
        searchPaints();
      }
    });
    let autoTimer = null;
    el.aiSearchInput.addEventListener("input", () => {
      clearTimeout(autoTimer);
      const typed = el.aiSearchInput.value.trim();
      if (!typed) {
        clearSearch();
        return;
      }
      autoTimer = setTimeout(() => {
        // Only when the name filter finds nothing, so typing "Nuln" stays a name search.
        const nameHits = document.querySelectorAll("#ownedPaintList .collection-item, #ownedPaintList .collection-group").length;
        if (nameHits) {
          clearSearch();
        } else if (document.documentElement.classList.contains("wph-ai-search") && typed.length >= 4 && typed !== lastQuery) {
          searchPaints();
        }
      }, 700);
    });

    const storage = window.WPHStorage;
    if (storage && storage.mode() === "server") {
      request("GET", "status").then(result => {
        status = result || status;
        document.documentElement.classList.toggle("wph-ai-llm", Boolean(status.llm));
        document.documentElement.classList.toggle("wph-ai-search", Boolean(status.search));
        if (status.search) {
          el.aiSearchInput.placeholder = t("collection.searchSemantic");
        }
        document.dispatchEvent(new CustomEvent("wph:ai-status", { detail: status }));
      }, () => {});
    }
  }

  function refresh() {
    if (!app) {
      return;
    }
    el.aiPaletteInput.placeholder = t("ai.describePlaceholder");
    const selected = app.selectedCustomPalette();
    el.aiDeletePaletteBtn.hidden = !selected;
    el.aiRefineInput.placeholder = t("ai.refinePlaceholder");
    el.aiPaletteFeedback.hidden = !(selected && selected.source === "ai");
    const selectedId = selected ? selected.id : "";
    if (el.aiPaletteFeedback.dataset.paletteId !== selectedId) {
      el.aiPaletteFeedback.dataset.paletteId = selectedId;
      resetFeedback(el.aiPaletteFeedback);
    }
    syncFeedbackButtons(el.aiPaletteFeedback, selected ? selected.rating || 0 : 0);
    el.aiUndoBtn.hidden = !(undoState && selected && undoState.id === selected.id);
    const owned = app.ownedCount();
    el.aiRecipeOwnedOnlyLabel.textContent = t("ai.recipeOwnedOnly", { count: owned });
    el.aiRecipeOwnedOnly.disabled = owned === 0;
    if (!owned) {
      el.aiRecipeOwnedOnly.checked = false;
    }
    if (!el.aiPhotoStatus.dataset.message) {
      el.aiPhotoStatus.textContent = t("ai.photoHint");
    }
    if (!recipeController) {
      const signature = paletteSignature();
      if (signature !== recipeSignature) {
        // Another palette: show its saved guide, or nothing.
        recipeSignature = signature;
        recipeText = "";
        recipeId = "";
        el.aiRecipeFeedback.hidden = true;
        el.aiRecipeStatus.textContent = "";
        showGuide();
      } else if (!el.aiRecipeBenchBtn.dataset.lang || el.aiRecipeBenchBtn.dataset.lang !== app.language()) {
        el.aiRecipeBenchBtn.dataset.lang = app.language();
        showGuide();
      }
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
      if (id) {
        document.dispatchEvent(new CustomEvent("wph:palette-created", { detail: { id, source: "ai", prompt: description } }));
      }
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
      const id = app.addCustomPalette({ name, source: "photo", notes: t("ai.photoNote"), colors });
      if (id) {
        document.dispatchEvent(new CustomEvent("wph:palette-created", { detail: { id, source: "photo" } }));
      }
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

  // Streams a guide for a recipe context; resolves with the text. Errors after the
  // first bytes arrive as a marker at the end of the stream.
  async function streamRecipe(context, { signal, onText } = {}) {
    const response = await fetch(`${API}recipe`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-WPH-Request": "1" },
      body: JSON.stringify({ context }),
      signal
    });
    if (!response.ok) {
      throw await responseError(response);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      text += decoder.decode(value, { stream: true });
      if (onText) {
        onText(text.replace(ERROR_PATTERN, ""));
      }
    }
    const markers = Array.from(text.matchAll(ERROR_PATTERN));
    text = text.replace(ERROR_PATTERN, "");
    if (markers.length) {
      const code = markers[markers.length - 1][1];
      throw Object.assign(new Error(code), { code, partial: text });
    }
    return text;
  }

  async function writeRecipe() {
    if (recipeController) {
      return;
    }
    const context = app.recipeContext({ ownedOnly: el.aiRecipeOwnedOnly.checked });
    const signature = paletteSignature();
    recipeSignature = signature;
    recipeId = "";
    el.aiRecipeFeedback.hidden = true;
    el.aiRecipeFeedback.dataset.rating = "0";
    resetFeedback(el.aiRecipeFeedback);
    recipeText = "";
    recipeController = new AbortController();
    el.aiRecipeOutput.hidden = false;
    el.aiRecipeOutput.replaceChildren();
    el.aiRecipeProgress.hidden = true;
    el.aiRecipeStopBtn.hidden = false;
    el.aiRecipeCopyBtn.hidden = true;
    el.aiRecipeBenchBtn.hidden = true;
    const stopTimer = busy(el.aiRecipeBtn, el.aiRecipeStatus, t("ai.working"));
    let failure = null;
    let scheduled = false;
    try {
      recipeText = await streamRecipe(context, {
        signal: recipeController.signal,
        onText: text => {
          recipeText = text;
          if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(() => {
              scheduled = false;
              // Once the stream is done, showGuide() renders the final version with tick boxes.
              if (recipeController) {
                renderMarkdown(el.aiRecipeOutput, recipeText);
              }
            });
          }
        }
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        failure = error;
        recipeText = error.partial || recipeText;
      }
    } finally {
      stopTimer();
      recipeController = null;
      el.aiRecipeStopBtn.hidden = true;
    }
    if (recipeText.trim() && !failure) {
      recipeId = `recipe-${Date.now().toString(36)}`;
      saveGuide(signature, { title: app.paletteTitle(), text: recipeText, createdAt: new Date().toISOString(), done: [] });
      el.aiRecipeFeedback.hidden = false;
      syncFeedbackButtons(el.aiRecipeFeedback, 0);
    }
    showGuide();
    el.aiRecipeStatus.textContent = failure
      ? errorText(failure)
      : [t("ai.recipeHint", { owned: context.ownedPaintCount }), recipeUnknown ? t("ai.unknownPaints", { count: recipeUnknown }) : ""]
        .filter(Boolean).join(" ");
  }

  // Renders the guide of the current palette with tick boxes when it is saved.
  function showGuide() {
    const saved = recipeSignature ? findGuide(recipeSignature) : null;
    const text = saved ? saved.text : recipeText;
    renderMarkdown(el.aiRecipeOutput, text, saved ? {
      done: new Set(saved.done),
      onToggle: (index, checked) => toggleGuideStep(recipeSignature, index, checked)
    } : undefined);
    el.aiRecipeOutput.hidden = !text.trim();
    el.aiRecipeCopyBtn.hidden = !text.trim();
    el.aiRecipeBenchBtn.hidden = !saved;
    el.aiRecipeBtn.textContent = t(saved ? "assist.rewriteGuide" : "ai.recipeButton");
    renderGuideProgress(saved);
  }

  function renderGuideProgress(saved) {
    const total = saved ? window.WPHArmyData.guideSteps(saved.text).total : 0;
    el.aiRecipeProgress.hidden = !total;
    if (total) {
      const done = saved.done.filter(index => index < total).length;
      el.aiRecipeProgress.querySelector(".guide-progress-bar span").style.width = `${Math.round(done / total * 100)}%`;
      el.aiRecipeProgress.querySelector(".guide-progress-text").textContent = t("bench.progress", { done, total });
    }
    document.dispatchEvent(new CustomEvent("wph:guide", { detail: { saved: Boolean(saved) } }));
  }

  // ---- saved guides (per palette) -----------------------------------------

  function readGuides() {
    try {
      const raw = window.WPHStorage ? window.WPHStorage.get(GUIDES_KEY) : window.localStorage.getItem(GUIDES_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return Array.isArray(data && data.items) ? data.items.filter(item => item && typeof item.sig === "string" && typeof item.text === "string") : [];
    } catch (error) {
      return [];
    }
  }

  function writeGuides(items) {
    const value = JSON.stringify({ version: 1, items: items.slice(0, MAX_GUIDES) });
    try {
      if (window.WPHStorage) {
        window.WPHStorage.set(GUIDES_KEY, value);
      } else {
        window.localStorage.setItem(GUIDES_KEY, value);
      }
    } catch (error) {
      // Storage full or blocked: the guide stays visible until the page is reloaded.
    }
  }

  function findGuide(signature) {
    return readGuides().find(item => item.sig === signature) || null;
  }

  function saveGuide(signature, guide) {
    const items = readGuides().filter(item => item.sig !== signature);
    items.unshift({ sig: signature, ...guide, done: (guide.done || []).slice() });
    writeGuides(items);
  }

  function toggleGuideStep(signature, index, checked) {
    const items = readGuides();
    const item = items.find(entry => entry.sig === signature);
    if (!item) {
      return;
    }
    const done = new Set(item.done || []);
    if (checked) {
      done.add(index);
    } else {
      done.delete(index);
    }
    item.done = Array.from(done).sort((a, b) => a - b);
    writeGuides(items);
    renderGuideProgress(item);
  }

  // The painting desk shows the saved guide of the current palette, one step at a time.
  function openBench() {
    const signature = paletteSignature();
    const saved = findGuide(signature);
    if (!saved || !window.WPHBench) {
      return false;
    }
    window.WPHBench.open({
      title: saved.title || app.paletteTitle(),
      text: saved.text,
      done: saved.done,
      colors: app.palette(),
      onToggle: (index, checked) => {
        toggleGuideStep(signature, index, checked);
        if (recipeSignature === signature) {
          showGuide();
        }
      }
    });
    return true;
  }

  function currentGuide() {
    return findGuide(paletteSignature());
  }

  // Identifies a guide: palette colours, recipe mode and finish (cheap: runs on every update).
  function paletteSignature() {
    return JSON.stringify([app.palette().slice(0, 6).map(color => color.hex), app.recipeKey()]);
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
  // With options.done (a Set of step numbers) every numbered step gets a tick box.
  function renderMarkdown(container, text, options) {
    recipeUnknown = 0;
    const nodes = [];
    let stepIndex = 0;
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
        const index = stepIndex;
        stepIndex += 1;
        if (options && options.done) {
          const item = document.createElement("li");
          const done = options.done.has(index);
          item.className = `guide-step${done ? " is-done" : ""}`;
          const box = document.createElement("input");
          box.type = "checkbox";
          box.checked = done;
          box.setAttribute("aria-label", t("bench.stepDone", { number: index + 1 }));
          box.addEventListener("change", () => {
            item.classList.toggle("is-done", box.checked);
            options.onToggle(index, box.checked);
          });
          const body = withInline(document.createElement("div"), match[2]);
          body.className = "guide-step-text";
          item.append(box, body);
          list.appendChild(item);
        } else {
          list.appendChild(withInline(document.createElement("li"), match[2]));
        }
      } else if ((match = line.match(/^\s*[-*•]\s+(.*)$/))) {
        paragraph = null;
        if (!list || list.tagName !== "UL") {
          list = document.createElement("ul");
          nodes.push(list);
        }
        list.appendChild(withInline(document.createElement("li"), match[1]));
      } else if (list && /^\s{2,}\S/.test(rawLine)) {
        const last = list.lastElementChild.querySelector(".guide-step-text") || list.lastElementChild;
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
        node.appendChild(paintChip(part.slice(2, -2).trim()));
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

  // Paint names in the guide are checked against the catalogue: known paints get a
  // swatch and a shopping-list button, unknown names are marked for checking.
  function paintChip(name) {
    const strong = document.createElement("strong");
    const paint = app ? app.findPaintByName(name) : null;
    if (!paint) {
      strong.className = "ai-paint-unknown";
      strong.title = t("ai.paintUnknown");
      strong.textContent = name;
      recipeUnknown += 1;
      return strong;
    }
    strong.className = "ai-paint";
    const swatch = document.createElement("span");
    swatch.className = "ai-paint-swatch";
    swatch.style.background = paint.hex;
    strong.append(swatch, name);
    strong.title = [paint.manufacturer, paint.collection || paint.range, paint.hex].filter(Boolean).join(" · ");
    if (app.isOwned(paint)) {
      const badge = document.createElement("span");
      badge.className = "owned-badge";
      badge.textContent = t("ai.searchOwned");
      strong.append(" ", badge);
    } else {
      const listed = app.isOnShoppingList(paint);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary ai-paint-shop";
      button.textContent = listed ? "✓" : "+";
      button.title = listed ? t("ai.onList") : t("ai.addToList");
      button.setAttribute("aria-label", `${button.title}: ${name}`);
      button.disabled = listed;
      button.addEventListener("click", () => {
        app.addToShoppingList(paint);
        button.textContent = "✓";
        button.title = t("ai.onList");
        button.disabled = true;
      });
      strong.append(" ", button);
    }
    return strong;
  }

  // ---- improve a palette -------------------------------------------------

  async function refinePalette() {
    const instruction = el.aiRefineInput.value.trim();
    if (instruction.length < 2) {
      el.aiRefineInput.focus();
      return;
    }
    const selected = app.selectedCustomPalette();
    const stopTimer = busy(el.aiRefineBtn, el.aiRefineStatus, t("ai.working"));
    try {
      const result = await request("POST", "palette/refine", {
        palette: {
          name: selected ? selected.name : app.paletteTitle(),
          notes: selected ? selected.notes : "",
          colors: app.paletteForAi()
        },
        instruction,
        system: app.system(),
        language: app.language()
      });
      stopTimer();
      const polished = result.adjusted && result.adjusted.length ? ` ${t("ai.polished")}` : "";
      if (selected) {
        const previous = app.updateCustomPalette(selected.id, {
          name: result.name,
          notes: result.notes,
          colors: result.colors,
          prompt: [selected.prompt, instruction].filter(Boolean).join(" → ").slice(0, 400)
        });
        undoState = previous ? { id: selected.id, previous } : null;
        el.aiRefineStatus.textContent = t("ai.refineDone") + polished;
      } else {
        app.addCustomPalette({ name: result.name, source: "ai", prompt: instruction, notes: result.notes, colors: result.colors });
        undoState = null;
        el.aiRefineStatus.textContent = t("ai.refineNew", { name: result.name }) + polished;
      }
      el.aiRefineInput.value = "";
      refresh();
    } catch (error) {
      stopTimer();
      el.aiRefineStatus.textContent = errorText(error);
    }
  }

  function undoRefine() {
    if (!undoState) {
      return;
    }
    const { id, previous } = undoState;
    undoState = null;
    app.updateCustomPalette(id, {
      name: previous.name,
      notes: previous.notes,
      prompt: previous.prompt,
      colors: previous.roles.map(role => ({ role: role.code, name: role.name, hex: role.hex }))
    });
    app.setCustomPaletteRating(id, previous.rating || 0);
    el.aiRefineStatus.textContent = t("ai.undone");
    refresh();
  }

  // ---- feedback ----------------------------------------------------------

  // Thumbs up/down are sent right away; an optional comment can follow. Pressing the
  // same thumb again withdraws the rating.
  function setupFeedback(container, describe) {
    const form = container.querySelector(".ai-feedback-comment");
    const input = form.querySelector("input");
    const statusNode = container.querySelector(".ai-status");
    let pending = null;
    container.querySelectorAll("[data-rating]").forEach(button => {
      button.addEventListener("click", async () => {
        const target = describe();
        if (!target) {
          return;
        }
        const chosen = Number(button.dataset.rating);
        const rating = target.current === chosen ? 0 : chosen;
        pending = { ...target, rating };
        if (await sendFeedback(pending, "", statusNode)) {
          target.remember(rating);
          syncFeedbackButtons(container, rating);
          form.hidden = rating === 0;
          input.value = "";
          input.placeholder = rating > 0 ? t("ai.feedbackCommentGood") : t("ai.feedbackCommentBad");
          if (rating) {
            input.focus();
          }
        }
      });
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (pending && pending.rating && input.value.trim()) {
        if (await sendFeedback(pending, input.value.trim(), statusNode)) {
          form.hidden = true;
        }
      }
    });
  }

  async function sendFeedback(target, comment, statusNode) {
    try {
      await request("POST", "feedback", {
        kind: target.kind,
        refId: target.refId,
        rating: target.rating,
        prompt: target.prompt,
        comment,
        palette: target.palette
      });
      statusNode.textContent = target.rating ? t("ai.feedbackThanks") : t("ai.feedbackRemoved");
      return true;
    } catch (error) {
      statusNode.textContent = errorText(error);
      return false;
    }
  }

  function syncFeedbackButtons(container, rating) {
    container.querySelectorAll("[data-rating]").forEach(button => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === rating));
    });
  }

  function resetFeedback(container) {
    syncFeedbackButtons(container, 0);
    container.querySelector(".ai-feedback-comment").hidden = true;
    container.querySelector(".ai-status").textContent = "";
  }

  // ---- paint search in words ---------------------------------------------

  async function searchPaints() {
    const query = el.aiSearchInput.value.trim();
    lastQuery = query;
    el.aiSearchBlock.hidden = query.length < 2;
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

  function clearSearch() {
    lastSearch = [];
    lastQuery = "";
    el.aiSearchStatus.textContent = "";
    el.aiSearchResults.replaceChildren();
    el.aiSearchBlock.hidden = true;
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
  window.WPHAssistant = {
    photoPalette, renderMarkdown, rgbToLab, labToHex, streamRecipe, writeRecipe, openBench, currentGuide,
    inline: (node, text) => withInline(node, text),
    errorText: error => errorText(error),
    status: () => status,
    refreshStatus: () => request("GET", "status").then(result => {
      status = result || status;
      document.dispatchEvent(new CustomEvent("wph:ai-status", { detail: status }));
      return status;
    })
  };
}());
