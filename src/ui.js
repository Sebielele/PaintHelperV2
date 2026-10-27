// Interface helpers for PaintHelperV2:
// - light/dark theme toggle (automatic = follow the device), saved per device
// - on phones a palette strip that stays at the top while the settings scroll by
(function () {
  "use strict";

  const THEME_KEY = "wph-ui.theme";
  const THEMES = ["auto", "light", "dark"];
  const ICONS = { auto: "🌓", light: "☀️", dark: "🌙" };
  let app = null;
  let themeButton = null;
  let strip = null;

  document.addEventListener("wph:update", () => {
    if (!app) {
      init();
    }
    render();
  });

  function init() {
    app = window.WPH && window.WPH.app;
    if (!app) {
      return;
    }
    setupTheme();
    setupStrip();
  }

  function render() {
    if (!app) {
      return;
    }
    renderTheme();
    renderStrip();
  }

  // ---- theme ---------------------------------------------------------------

  function currentTheme() {
    const theme = document.documentElement.dataset.theme;
    return THEMES.includes(theme) ? theme : "auto";
  }

  function setupTheme() {
    themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.className = "secondary theme-toggle";
    themeButton.addEventListener("click", () => {
      const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
      if (next === "auto") {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = next;
      }
      try {
        if (next === "auto") {
          window.localStorage.removeItem(THEME_KEY);
        } else {
          window.localStorage.setItem(THEME_KEY, next);
        }
      } catch (error) {
        // Storage blocked: the choice lasts until the page is reloaded.
      }
      renderTheme();
    });
    const language = document.querySelector(".header-utility .language-control");
    if (language) {
      language.parentNode.insertBefore(themeButton, language.nextSibling);
    }
  }

  function renderTheme() {
    if (!themeButton) {
      return;
    }
    const theme = currentTheme();
    const label = app.t(`theme.${theme}`);
    themeButton.textContent = ICONS[theme];
    themeButton.title = label;
    themeButton.setAttribute("aria-label", label);
  }

  // ---- mobile palette strip -----------------------------------------------

  function setupStrip() {
    const nav = document.querySelector(".workflow-nav");
    const palette = document.getElementById("palette");
    if (!nav || !palette) {
      return;
    }
    strip = document.createElement("button");
    strip.type = "button";
    strip.className = "secondary palette-strip";
    strip.addEventListener("click", () => {
      const target = document.querySelector(".output .toolbar") || palette;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.insertAdjacentElement("afterend", strip);
    // Only shown while the palette itself is out of view.
    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(entries => {
        strip.classList.toggle("is-hidden", entries.some(entry => entry.isIntersecting));
      }).observe(palette);
    }
  }

  function renderStrip() {
    if (!strip) {
      return;
    }
    const colors = app.palette();
    const swatches = document.createElement("span");
    swatches.className = "palette-strip-swatches";
    swatches.setAttribute("aria-hidden", "true");
    colors.forEach(color => {
      const swatch = document.createElement("span");
      if (/^#[0-9A-F]{6}$/i.test(color.hex)) {
        swatch.style.background = color.hex;
      }
      swatches.appendChild(swatch);
    });
    const title = document.createElement("span");
    title.className = "palette-strip-title";
    title.textContent = app.paletteTitle();
    const go = document.createElement("span");
    go.className = "palette-strip-go";
    go.setAttribute("aria-hidden", "true");
    go.textContent = "↓";
    strip.replaceChildren(swatches, title, go);
    strip.setAttribute("aria-label", `${app.t("ui.livePalette")}: ${app.paletteTitle()}, ${colors.map(color => color.hex).join(", ")}`);
  }
}());
