// Painting desk ("Maltisch") for PaintHelperV2: a full-screen view of a painting guide,
// one step at a time, made for a tablet next to the paints. Big buttons, swipe and
// arrow keys, the screen stays on, ticked steps are saved by the caller (onToggle).
(function () {
  "use strict";

  let overlay = null;
  let session = null;
  let wakeLock = null;
  let touchStart = null;

  function t(key, params) {
    const app = window.WPH && window.WPH.app;
    return app ? app.t(key, params) : key;
  }

  // options: { title, subtitle, text, done: number[], colors: [{name, hex}], onToggle(index, checked) }
  function open(options) {
    const parsed = window.WPHArmyData.guideSteps(options.text);
    const cards = [];
    parsed.sections.forEach(section => {
      section.steps.forEach((step, position) => {
        cards.push({ kind: "step", section, step, position, count: section.steps.length });
      });
    });
    const tips = parsed.sections.filter(section => !section.steps.length && section.bullets.length);
    if (tips.length) {
      cards.push({ kind: "tips", sections: tips });
    }
    if (!cards.length) {
      return;
    }
    const done = new Set(options.done || []);
    const firstOpen = cards.findIndex(card => card.kind === "step" && !done.has(card.step.index));
    session = { options, cards, done, total: parsed.total, current: firstOpen > -1 ? firstOpen : 0 };
    build();
    render();
    document.documentElement.classList.add("bench-open");
    overlay.hidden = false;
    overlay.querySelector(".bench-next").focus({ preventScroll: true });
    requestWakeLock();
  }

  function close() {
    if (!overlay) {
      return;
    }
    overlay.hidden = true;
    document.documentElement.classList.remove("bench-open");
    releaseWakeLock();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    session = null;
  }

  function build() {
    if (overlay) {
      return;
    }
    overlay = document.createElement("div");
    overlay.className = "bench";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="bench-top">
        <div class="bench-heading">
          <p class="eyebrow bench-eyebrow"></p>
          <h2 class="bench-title"></h2>
        </div>
        <div class="bench-tools">
          <button type="button" class="secondary bench-fullscreen" aria-hidden="true"></button>
          <button type="button" class="secondary bench-close"></button>
        </div>
      </div>
      <div class="bench-progress"><span></span></div>
      <div class="bench-stage" aria-live="polite"></div>
      <div class="bench-nav">
        <button type="button" class="secondary bench-prev"></button>
        <button type="button" class="bench-next"></button>
        <button type="button" class="secondary bench-skip"></button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".bench-close").addEventListener("click", close);
    overlay.querySelector(".bench-prev").addEventListener("click", () => go(-1));
    overlay.querySelector(".bench-skip").addEventListener("click", () => go(1));
    overlay.querySelector(".bench-next").addEventListener("click", completeAndNext);
    const fullscreen = overlay.querySelector(".bench-fullscreen");
    if (document.fullscreenEnabled) {
      fullscreen.removeAttribute("aria-hidden");
      fullscreen.addEventListener("click", () => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          overlay.requestFullscreen().catch(() => {});
        }
      });
    } else {
      fullscreen.hidden = true;
    }
    overlay.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowRight") {
        go(1);
      } else if (event.key === "ArrowLeft") {
        go(-1);
      } else {
        return;
      }
      event.preventDefault();
    });
    const stage = overlay.querySelector(".bench-stage");
    stage.addEventListener("touchstart", event => {
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    stage.addEventListener("touchend", event => {
      if (!touchStart) {
        return;
      }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (session && document.visibilityState === "visible") {
        requestWakeLock();
      }
    });
  }

  function go(delta) {
    if (!session) {
      return;
    }
    session.current = Math.max(0, Math.min(session.cards.length - 1, session.current + delta));
    render();
  }

  function completeAndNext() {
    if (!session) {
      return;
    }
    const card = session.cards[session.current];
    if (card.kind === "step") {
      const index = card.step.index;
      const checked = !session.done.has(index);
      if (checked) {
        session.done.add(index);
      } else {
        session.done.delete(index);
      }
      session.options.onToggle(index, checked);
      if (checked && session.current < session.cards.length - 1) {
        session.current += 1;
      }
      render();
    } else {
      close();
    }
  }

  function swatchFor(title) {
    const colors = session.options.colors || [];
    const match = colors.find(color => color.name && title && title.toLowerCase().startsWith(color.name.toLowerCase()));
    return match ? match.hex : "";
  }

  function render() {
    const { options, cards, done, total } = session;
    const card = cards[session.current];
    overlay.querySelector(".bench-eyebrow").textContent = options.subtitle || t("bench.title");
    overlay.querySelector(".bench-title").textContent = options.title || "";
    overlay.querySelector(".bench-close").textContent = `✕ ${t("bench.close")}`;
    overlay.querySelector(".bench-close").setAttribute("aria-label", t("bench.close"));
    const fullscreen = overlay.querySelector(".bench-fullscreen");
    fullscreen.textContent = "⛶";
    fullscreen.title = t("bench.fullscreen");
    fullscreen.setAttribute("aria-label", t("bench.fullscreen"));
    const doneCount = Array.from(done).filter(index => index < total).length;
    overlay.querySelector(".bench-progress span").style.width = `${total ? Math.round(doneCount / total * 100) : 0}%`;
    const stage = overlay.querySelector(".bench-stage");
    stage.replaceChildren();
    const inline = (node, value) => (window.WPHAssistant ? window.WPHAssistant.inline(node, value) : (node.textContent = value, node));
    if (card.kind === "step") {
      const head = document.createElement("div");
      head.className = "bench-section";
      const hex = swatchFor(card.section.title);
      if (hex) {
        const swatch = document.createElement("span");
        swatch.className = "bench-swatch";
        swatch.style.background = hex;
        head.appendChild(swatch);
      }
      const title = document.createElement("span");
      title.textContent = card.section.title;
      head.appendChild(title);
      const counter = document.createElement("p");
      counter.className = "bench-counter";
      counter.textContent = t("bench.stepOf", { number: card.step.index + 1, total, position: card.position + 1, count: card.count });
      const parts = card.step.text.split(" – ");
      const main = document.createElement("p");
      main.className = "bench-step";
      inline(main, parts[0]);
      stage.append(head, counter, main);
      if (card.section.lead) {
        const lead = document.createElement("p");
        lead.className = "bench-lead";
        lead.textContent = card.section.lead;
        stage.appendChild(lead);
      }
      if (parts.length > 1) {
        const hint = document.createElement("p");
        hint.className = "bench-hint";
        hint.textContent = parts.slice(1).join(" – ");
        stage.appendChild(hint);
      }
      const isDone = done.has(card.step.index);
      stage.classList.toggle("is-done", isDone);
      if (isDone) {
        const badge = document.createElement("p");
        badge.className = "bench-done";
        badge.textContent = `✓ ${t("bench.doneBadge")}`;
        stage.appendChild(badge);
      }
      overlay.querySelector(".bench-next").textContent = isDone ? t("bench.undo") : `✓ ${t("bench.doneNext")}`;
    } else {
      stage.classList.remove("is-done");
      card.sections.forEach(section => {
        const head = document.createElement("div");
        head.className = "bench-section";
        head.textContent = section.title;
        const list = document.createElement("ul");
        list.className = "bench-tips";
        section.bullets.forEach(bullet => list.appendChild(inline(document.createElement("li"), bullet)));
        stage.append(head, list);
      });
      const summary = document.createElement("p");
      summary.className = "bench-counter";
      summary.textContent = t("bench.progress", { done: doneCount, total });
      stage.appendChild(summary);
      overlay.querySelector(".bench-next").textContent = t("bench.finish");
    }
    const prev = overlay.querySelector(".bench-prev");
    prev.textContent = `← ${t("bench.back")}`;
    prev.disabled = session.current === 0;
    const skip = overlay.querySelector(".bench-skip");
    skip.textContent = `${t("bench.skip")} →`;
    skip.disabled = session.current >= cards.length - 1;
  }

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
      }
    } catch (error) {
      wakeLock = null;
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  window.WPHBench = { open, close, isOpen: () => Boolean(session) };
}());
