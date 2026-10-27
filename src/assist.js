// Assistant-first interface for PaintHelperV2:
// - example and recent prompts under the "What do you want to paint?" box
// - status light and ✨ button in the header
// - "Write painting guide" / painting desk buttons under the palette
// - quick-action dock on phones and tablets
(function () {
  "use strict";

  const STATUS_POLL_MS = 30000;
  let app = null;
  let pollTimer = null;
  const el = {};

  document.addEventListener("wph:update", () => {
    if (!app) {
      init();
    }
    render();
  });

  function t(key, params) {
    return app ? app.t(key, params) : key;
  }

  function init() {
    app = window.WPH && window.WPH.app;
    if (!app) {
      return;
    }
    ["assistJumpBtn", "assistStatus", "assistExamples", "assistRecent", "assistGuideBtn", "assistBenchBtn",
      "assistDock", "aiPaletteInput", "assistHero"].forEach(id => { el[id] = document.getElementById(id); });

    el.assistJumpBtn.addEventListener("click", focusDescribe);
    el.assistGuideBtn.addEventListener("click", writeGuide);
    el.assistBenchBtn.addEventListener("click", () => window.WPHAssistant && window.WPHAssistant.openBench());
    el.assistDock.addEventListener("click", event => {
      const button = event.target.closest("[data-dock]");
      if (!button) {
        return;
      }
      const action = button.dataset.dock;
      if (action === "assist") {
        focusDescribe();
      } else if (action === "guide") {
        showGuideSection();
      } else if (action === "bench") {
        if (!(window.WPHAssistant && window.WPHAssistant.openBench())) {
          showGuideSection();
        }
      } else if (action === "army") {
        window.WPHWorkflow.show("army");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    document.addEventListener("wph:ai-status", event => renderStatus(event.detail));
    document.addEventListener("wph:guide", renderGuideButtons);
    document.addEventListener("wph:workflow", renderDock);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        pollStatus();
      }
    });
    if (window.WPHStorage && window.WPHStorage.mode() === "server") {
      pollTimer = setInterval(pollStatus, STATUS_POLL_MS);
    }
  }

  function pollStatus() {
    if (document.visibilityState !== "visible" || !window.WPHAssistant || !document.documentElement.classList.contains("wph-ai-llm")) {
      return;
    }
    window.WPHAssistant.refreshStatus().catch(() => renderStatus({ llm: true, reachable: false }));
  }

  function render() {
    if (!app) {
      return;
    }
    renderExamples();
    renderRecent();
    renderGuideButtons();
    renderDock();
    const status = window.WPHAssistant ? window.WPHAssistant.status() : null;
    if (status) {
      renderStatus(status);
    }
  }

  // ---- describe box -------------------------------------------------------

  function renderExamples() {
    const examples = t(`assist.examples.${app.system() === "k40" ? "k40" : "aos"}`);
    const key = `${app.language()}|${app.system()}`;
    if (!Array.isArray(examples) || el.assistExamples.dataset.key === key) {
      return;
    }
    el.assistExamples.dataset.key = key;
    el.assistExamples.setAttribute("aria-label", t("assist.examplesLabel"));
    el.assistExamples.replaceChildren(...examples.map(example => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "secondary assist-chip";
      chip.textContent = example;
      chip.addEventListener("click", () => {
        el.aiPaletteInput.value = example;
        el.aiPaletteInput.focus();
      });
      return chip;
    }));
  }

  function renderRecent() {
    const recent = app.customPalettes().filter(palette => palette.source === "ai" && palette.prompt).slice(0, 5);
    const selected = app.selectedCustomPalette();
    const key = JSON.stringify([app.language(), selected ? selected.id : "", recent.map(palette => palette.id)]);
    if (el.assistRecent.dataset.key === key) {
      return;
    }
    el.assistRecent.dataset.key = key;
    el.assistRecent.hidden = !recent.length;
    el.assistRecent.setAttribute("aria-label", t("assist.recentLabel"));
    const label = document.createElement("span");
    label.className = "assist-chips-label";
    label.textContent = t("assist.recentLabel");
    el.assistRecent.replaceChildren(label, ...recent.map(palette => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "secondary assist-chip assist-recent-chip";
      chip.setAttribute("aria-pressed", String(Boolean(selected && selected.id === palette.id)));
      const dots = document.createElement("span");
      dots.className = "assist-chip-dots";
      dots.setAttribute("aria-hidden", "true");
      palette.colors.slice(0, 4).forEach(hex => {
        const dot = document.createElement("span");
        dot.style.background = hex;
        dots.appendChild(dot);
      });
      const text = document.createElement("span");
      text.textContent = palette.name;
      chip.title = palette.prompt;
      chip.append(dots, text);
      chip.addEventListener("click", () => app.selectCustomPalette(palette.id));
      return chip;
    }));
  }

  function focusDescribe() {
    window.WPHWorkflow.show("palette");
    el.assistHero.scrollIntoView({ behavior: "smooth", block: "start" });
    el.aiPaletteInput.focus({ preventScroll: true });
  }

  // ---- guide buttons ------------------------------------------------------

  function writeGuide() {
    showGuideSection();
    if (window.WPHAssistant) {
      window.WPHAssistant.writeRecipe();
    }
  }

  function showGuideSection() {
    window.WPHWorkflow.show("plan");
    const section = document.querySelector('[data-collapsible-section="aiRecipe"]');
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderGuideButtons() {
    const saved = window.WPHAssistant ? window.WPHAssistant.currentGuide() : null;
    el.assistBenchBtn.hidden = !saved;
    el.assistGuideBtn.querySelector("span").textContent = t(saved ? "assist.openGuide" : "assist.writeGuide");
    const bench = el.assistDock.querySelector('[data-dock="bench"]');
    bench.disabled = !saved;
  }

  function renderDock() {
    const view = window.WPHWorkflow ? window.WPHWorkflow.current() : "palette";
    const map = { assist: "palette", guide: "plan", army: "army" };
    el.assistDock.querySelectorAll("[data-dock]").forEach(button => {
      if (map[button.dataset.dock] === view) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  // ---- status light ---------------------------------------------------------

  function renderStatus(status) {
    if (!status || !status.llm) {
      return;
    }
    let state = "ready";
    if (status.reachable === false) {
      state = "offline";
    } else if (status.busy) {
      state = "busy";
    }
    el.assistStatus.dataset.state = state;
    el.assistStatus.textContent = state === "busy" && status.waiting
      ? t("assist.statusBusyWaiting", { count: status.waiting })
      : t(`assist.status.${state}`);
    el.assistStatus.title = t(`assist.statusHint.${state}`);
  }

  window.WPHAssist = { focusDescribe, writeGuide, showGuideSection, stop: () => clearInterval(pollTimer) };
}());
