// Stylized figure preview with colored zones for the painting desk.
(function () {
  "use strict";

  const SHAPES = [
    ["base", "ellipse", { cx: 60, cy: 186, rx: 46, ry: 10 }],
    ["cloth", "path", { d: "M40 60 L80 60 L98 172 Q60 180 22 172 Z" }],
    ["armor", "rect", { x: 46, y: 116, width: 12, height: 56, rx: 3 }],
    ["armor", "rect", { x: 62, y: 116, width: 12, height: 56, rx: 3 }],
    ["leather", "rect", { x: 43, y: 168, width: 17, height: 10, rx: 4 }],
    ["leather", "rect", { x: 60, y: 168, width: 17, height: 10, rx: 4 }],
    ["skin", "rect", { x: 29, y: 66, width: 10, height: 42, rx: 5 }],
    ["skin", "rect", { x: 81, y: 66, width: 10, height: 42, rx: 5 }],
    ["armor", "path", { d: "M42 60 Q60 52 78 60 L75 112 Q60 120 45 112 Z" }],
    ["armor", "ellipse", { cx: 38, cy: 64, rx: 11, ry: 8 }],
    ["armor", "ellipse", { cx: 82, cy: 64, rx: 11, ry: 8 }],
    ["leather", "rect", { x: 44, y: 104, width: 32, height: 8, rx: 2 }],
    ["metal", "rect", { x: 56, y: 103, width: 8, height: 10, rx: 2 }],
    ["weapon", "path", { d: "M88 18 L93 18 L93 100 L88 100 Z M90.5 10 L93 18 L88 18 Z" }],
    ["metal", "rect", { x: 81, y: 98, width: 19, height: 5, rx: 2 }],
    ["metal", "rect", { x: 88, y: 103, width: 5, height: 10, rx: 1 }],
    ["skin", "circle", { cx: 60, cy: 40, r: 13 }],
    ["bone", "path", { d: "M50 32 Q39 22 43 10 Q47 24 55 28 Z" }],
    ["bone", "path", { d: "M70 32 Q81 22 77 10 Q73 24 65 28 Z" }],
    ["accent", "circle", { cx: 55, cy: 40, r: 2.2 }],
    ["accent", "circle", { cx: 65, cy: 40, r: 2.2 }],
    ["accent", "circle", { cx: 60, cy: 78, r: 4.5 }]
  ];

  const EMPTY_FILL = "#8a8f98";

  function create(options) {
    const opts = options || {};
    const fills = opts.fills && typeof opts.fills === "object" ? opts.fills : {};
    const highlight = Array.isArray(opts.highlight) ? opts.highlight : [];
    const NS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 200");
    svg.setAttribute("class", highlight.length ? "wph-figure has-highlight" : "wph-figure");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", opts.title || "");
    svg.setAttribute("focusable", "false");

    SHAPES.forEach(entry => {
      const zone = entry[0];
      const tag = entry[1];
      const attributes = entry[2];
      const shape = document.createElementNS(NS, tag);

      Object.keys(attributes).forEach(name => {
        shape.setAttribute(name, String(attributes[name]));
      });

      const classes = ["wph-zone", "wph-zone-" + zone];
      if (highlight.indexOf(zone) !== -1) {
        classes.push("is-active");
      }
      shape.setAttribute("class", classes.join(" "));
      shape.setAttribute("fill", fills[zone] || EMPTY_FILL);
      svg.appendChild(shape);
    });

    return svg;
  }

  window.WPHFigure = { create, SHAPES };
}());
