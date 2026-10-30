// Color wheel UI for PaintHelperV2: draws the wheel, handles pointer picks and places the dot/scheme markers.
(function () {
  "use strict";

  function safeBackground(color) {
    const value = String(color || "");
    return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
  }

  function create(options) {
    const opts = options || {};
    const canvas = opts.canvas;
    const dot = opts.dot;
    const markers = opts.markers;
    const onStart = typeof opts.onStart === "function" ? opts.onStart : () => {};
    const onPick = typeof opts.onPick === "function" ? opts.onPick : () => {};

    function draw() {
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      const size = canvas.width;
      const r = size / 2;
      const img = ctx.createImageData(size, size);
      const data = img.data;
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const dx = x - r;
          const dy = y - r;
          const i = (y * size + x) * 4;
          const color = window.WPH.wheelColorAt(dx, dy, r);
          if (color) {
            const rgb = window.WPH.hslToRgb(color.h, color.s, 50);
            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
            data[i + 3] = 255;
          } else {
            data[i + 3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function select(event) {
      if (!canvas) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const r = rect.width / 2;
      const color = window.WPH.wheelColorAt(event.clientX - rect.left - r, event.clientY - rect.top - r, r, 5);
      if (!color) {
        return;
      }
      onPick({ h: Math.round(color.h), s: Math.round(color.s) });
    }

    function handlePointerDown(event) {
      onStart();
      if (canvas && canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
      }
      select(event);
    }

    function handlePointerMove(event) {
      if (event.buttons === 1) {
        select(event);
      }
    }

    function handleClick(event) {
      select(event);
    }

    if (canvas) {
      canvas.addEventListener("pointerdown", handlePointerDown);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("click", handleClick);
    }

    function positionMarker(marker, hue, saturation, rect, wrap) {
      const point = window.WPH.wheelMarkerPoint(hue, saturation, rect.width / 2);
      marker.style.left = `${rect.left + point.x - wrap.left}px`;
      marker.style.top = `${rect.top + point.y - wrap.top}px`;
    }

    function placeDot(color) {
      if (!canvas || !dot || !color || !canvas.parentElement) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const wrap = canvas.parentElement.getBoundingClientRect();
      positionMarker(dot, color.h, color.s, rect, wrap);
      dot.style.background = safeBackground(color.hex);
    }

    function placeMarkers(list) {
      if (!canvas || !markers || !canvas.parentElement) {
        return;
      }
      const items = Array.isArray(list) ? list : [];
      const rect = canvas.getBoundingClientRect();
      const wrap = canvas.parentElement.getBoundingClientRect();
      const nodes = items.map((item, index) => {
        const marker = document.createElement("span");
        marker.className = "scheme-marker";
        marker.setAttribute("data-marker-index", String(index));
        marker.title = item.title || "";
        marker.style.background = safeBackground(item.hex);
        return marker;
      });
      markers.replaceChildren(...nodes);
      nodes.forEach((marker, index) => {
        const item = items[index];
        positionMarker(marker, item.h, item.s, rect, wrap);
      });
    }

    return { draw, placeDot, placeMarkers };
  }

  window.WPHWheel = { create };
}());
