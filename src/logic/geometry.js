// Screen geometry for PaintHelperV2 without DOM access: points on the colour wheel and where
// a tooltip goes next to its target. Rectangles and sizes come in as plain numbers.
(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Hue (0-360) and saturation (minSaturation-100) at an offset from the wheel centre;
  // null outside the wheel.
  function wheelColorAt(dx, dy, radius, minSaturation = 0) {
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!(radius > 0) || distance > radius) {
      return null;
    }
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return {
      h: ((angle % 360) + 360) % 360,
      s: Math.max(minSaturation, Math.min(100, distance / radius * 100))
    };
  }

  // Point of a hue and saturation on a wheel, measured from the wheel's top-left corner.
  function wheelMarkerPoint(hue, saturation, radius) {
    const markerRadius = radius * (Math.max(0, Math.min(100, saturation)) / 100);
    const angle = hue * Math.PI / 180;
    return { x: radius + Math.cos(angle) * markerRadius, y: radius + Math.sin(angle) * markerRadius };
  }

  // Tooltip below its target, centred and kept inside the viewport; above when there is no
  // room below.
  function tooltipPosition(target, tooltip, viewport, options) {
    const opts = options || {};
    const gap = Number.isFinite(opts.gap) ? opts.gap : 12;
    const margin = Number.isFinite(opts.margin) ? opts.margin : 12;
    const maxLeft = viewport.width - tooltip.width - margin;
    let left = target.left + target.width / 2 - tooltip.width / 2;
    let top = target.bottom + gap;
    left = Math.max(margin, Math.min(Math.max(margin, maxLeft), left));
    if (top + tooltip.height > viewport.height - margin) {
      top = target.top - tooltip.height - gap;
    }
    return { left, top: Math.max(margin, top) };
  }

  return {
    wheelColorAt,
    wheelMarkerPoint,
    tooltipPosition
  };
}));
