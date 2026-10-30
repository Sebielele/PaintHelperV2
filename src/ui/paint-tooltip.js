// Hover tooltip for paint swatches ([data-color-hex]) in PaintHelperV2: opens after a short
// delay on hover or keyboard focus, stays open while the pointer is over it, and keeps inside
// the window (WPH.tooltipPosition). The caller builds the content and handles its clicks.
(function () {
  "use strict";

  // options: { render(target) -> nodes, onClick(event), delay }
  function create(options) {
    const opts = options || {};
    const delay = Number.isFinite(opts.delay) ? opts.delay : 550;
    const element = document.createElement("div");
    element.className = "paint-tooltip";
    element.setAttribute("role", "tooltip");
    element.setAttribute("aria-hidden", "true");
    document.body.appendChild(element);
    let active = null;
    let timer = null;

    function hide() {
      clearTimeout(timer);
      timer = null;
      active = null;
      element.classList.remove("is-visible");
      element.setAttribute("aria-hidden", "true");
    }

    function position(target) {
      const place = window.WPH.tooltipPosition(
        target.getBoundingClientRect(),
        element.getBoundingClientRect(),
        { width: window.innerWidth, height: window.innerHeight }
      );
      element.style.left = `${place.left}px`;
      element.style.top = `${place.top}px`;
    }

    function show(target) {
      if (!target || target !== active) {
        return;
      }
      element.replaceChildren(...opts.render(target));
      element.classList.add("is-visible");
      element.setAttribute("aria-hidden", "false");
      position(target);
    }

    function handleStart(event) {
      const target = event.target.closest && event.target.closest("[data-color-hex]");
      if (!target || element.contains(event.target) || active === target) {
        return;
      }
      hide();
      active = target;
      timer = setTimeout(() => show(target), delay);
    }

    function handleEnd(event) {
      const target = event.target.closest && event.target.closest("[data-color-hex]");
      if (!target) {
        return;
      }
      if (event.relatedTarget && (target.contains(event.relatedTarget) || element.contains(event.relatedTarget))) {
        return;
      }
      if (target === active) {
        hide();
      }
    }

    document.addEventListener("mouseover", handleStart);
    document.addEventListener("mouseout", handleEnd);
    document.addEventListener("focusin", handleStart);
    document.addEventListener("focusout", handleEnd);
    element.addEventListener("mouseover", () => {
      clearTimeout(timer);
      timer = null;
    });
    element.addEventListener("mouseleave", hide);
    if (typeof opts.onClick === "function") {
      element.addEventListener("click", opts.onClick);
    }
    return { element, hide, refresh: () => show(active) };
  }

  window.WPHPaintTooltip = { create };
}());
