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

  const CAVALRY_SHAPES = [
    ["base", "ellipse", { cx: 80, cy: 186, rx: 66, ry: 10 }],
    ["leather", "path", { d: "M32 106 Q14 122 20 152 Q28 132 38 116 Z" }],
    ["cloth", "path", { d: "M70 52 L92 52 L104 112 L60 112 Z" }],
    ["skin", "rect", { x: 40, y: 124, width: 9, height: 52, rx: 4 }],
    ["skin", "rect", { x: 56, y: 124, width: 9, height: 52, rx: 4 }],
    ["skin", "rect", { x: 102, y: 124, width: 9, height: 52, rx: 4 }],
    ["skin", "rect", { x: 118, y: 124, width: 9, height: 52, rx: 4 }],
    ["leather", "rect", { x: 38, y: 172, width: 13, height: 8, rx: 3 }],
    ["leather", "rect", { x: 54, y: 172, width: 13, height: 8, rx: 3 }],
    ["leather", "rect", { x: 100, y: 172, width: 13, height: 8, rx: 3 }],
    ["leather", "rect", { x: 116, y: 172, width: 13, height: 8, rx: 3 }],
    ["skin", "path", { d: "M30 110 Q34 92 58 92 L112 92 Q132 92 134 110 Q134 128 116 130 L50 130 Q30 128 30 110 Z" }],
    ["skin", "path", { d: "M110 98 L126 62 Q132 52 146 56 L152 70 Q148 78 138 78 L130 106 Z" }],
    ["metal", "path", { d: "M132 56 L146 56 L150 66 L136 68 Z" }],
    ["cloth", "path", { d: "M54 100 L112 100 L108 128 L58 128 Z" }],
    ["leather", "path", { d: "M64 92 Q80 82 98 92 L96 104 L66 104 Z" }],
    ["armor", "rect", { x: 72, y: 88, width: 10, height: 30, rx: 3 }],
    ["armor", "path", { d: "M68 54 Q81 47 94 54 L92 92 Q81 98 70 92 Z" }],
    ["armor", "ellipse", { cx: 67, cy: 57, rx: 8, ry: 6 }],
    ["armor", "ellipse", { cx: 95, cy: 57, rx: 8, ry: 6 }],
    ["leather", "rect", { x: 70, y: 84, width: 22, height: 6, rx: 2 }],
    ["metal", "rect", { x: 78, y: 83, width: 6, height: 8, rx: 1 }],
    ["skin", "rect", { x: 92, y: 60, width: 8, height: 30, rx: 4 }],
    ["weapon", "path", { d: "M100 22 L104 22 L104 150 L100 150 Z M102 6 L105 22 L99 22 Z" }],
    ["metal", "rect", { x: 96, y: 96, width: 12, height: 4, rx: 1 }],
    ["skin", "circle", { cx: 81, cy: 36, r: 11 }],
    ["bone", "path", { d: "M73 30 Q64 20 68 10 Q71 22 77 26 Z" }],
    ["bone", "path", { d: "M89 30 Q98 20 94 10 Q91 22 85 26 Z" }],
    ["accent", "circle", { cx: 77, cy: 35, r: 1.8 }],
    ["accent", "circle", { cx: 85, cy: 35, r: 1.8 }],
    ["accent", "circle", { cx: 140, cy: 64, r: 2 }],
    ["accent", "circle", { cx: 81, cy: 70, r: 3.5 }]
  ];

  const MONSTER_SHAPES = [
    ["base", "ellipse", { cx: 80, cy: 186, rx: 70, ry: 10 }],
    ["cloth", "path", { d: "M60 70 L10 30 L22 70 L8 92 L30 96 L20 118 L58 100 Z" }],
    ["cloth", "path", { d: "M100 70 L150 30 L138 70 L152 92 L130 96 L140 118 L102 100 Z" }],
    ["skin", "path", { d: "M60 140 Q20 150 18 178 Q30 160 62 154 Z" }],
    ["skin", "path", { d: "M56 130 L50 176 L66 176 L72 132 Z" }],
    ["skin", "path", { d: "M104 130 L110 176 L94 176 L88 132 Z" }],
    ["bone", "path", { d: "M46 182 L50 174 L54 182 Z M54 182 L58 174 L62 182 Z M62 182 L66 174 L70 182 Z" }],
    ["bone", "path", { d: "M90 182 L94 174 L98 182 Z M98 182 L102 174 L106 182 Z M106 182 L110 174 L114 182 Z" }],
    ["skin", "path", { d: "M48 70 Q80 54 112 70 Q122 104 106 136 Q80 146 54 136 Q38 104 48 70 Z" }],
    ["armor", "path", { d: "M62 80 Q80 72 98 80 L94 118 Q80 124 66 118 Z" }],
    ["cloth", "path", { d: "M64 128 L96 128 L90 156 L70 156 Z" }],
    ["leather", "rect", { x: 56, y: 122, width: 48, height: 7, rx: 2 }],
    ["metal", "rect", { x: 74, y: 121, width: 12, height: 9, rx: 2 }],
    ["skin", "path", { d: "M48 74 L30 96 L28 128 L38 128 L42 100 L56 86 Z" }],
    ["skin", "path", { d: "M112 74 L130 96 L132 128 L122 128 L118 100 L104 86 Z" }],
    ["metal", "rect", { x: 28, y: 116, width: 12, height: 5, rx: 2 }],
    ["metal", "rect", { x: 120, y: 116, width: 12, height: 5, rx: 2 }],
    ["bone", "path", { d: "M26 128 L30 140 L33 128 Z M33 128 L36 142 L39 128 Z" }],
    ["weapon", "path", { d: "M128 128 Q152 96 134 56 L138 54 Q158 96 132 130 Z" }],
    ["skin", "path", { d: "M66 52 Q80 38 94 52 Q96 66 80 70 Q64 66 66 52 Z" }],
    ["bone", "path", { d: "M68 48 Q54 34 58 18 Q62 34 72 42 Z" }],
    ["bone", "path", { d: "M92 48 Q106 34 102 18 Q98 34 88 42 Z" }],
    ["accent", "circle", { cx: 74, cy: 54, r: 2.2 }],
    ["accent", "circle", { cx: 86, cy: 54, r: 2.2 }],
    ["accent", "circle", { cx: 80, cy: 96, r: 4.5 }]
  ];

  // Figure types; each has its own drawing area.
  const FIGURES = {
    infantry: { viewBox: "0 0 120 200", shapes: SHAPES },
    cavalry: { viewBox: "0 0 160 200", shapes: CAVALRY_SHAPES },
    monster: { viewBox: "0 0 160 200", shapes: MONSTER_SHAPES }
  };
  let instance = 0;

  const EMPTY_FILL = "#8a8f98";

  // Create an SVG figure. Options: fills, highlight, title, figure, tones.
  function create(options) {
    instance += 1;
    const opts = options || {};
    const fills = opts.fills && typeof opts.fills === "object" ? opts.fills : {};
    const highlight = Array.isArray(opts.highlight) ? opts.highlight : [];
    const tones = opts.tones && typeof opts.tones === "object" ? opts.tones : {};
    const figure = Object.prototype.hasOwnProperty.call(FIGURES, opts.figure)
      ? FIGURES[opts.figure]
      : FIGURES.infantry;
    const shapes = figure.shapes;
    const NS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", figure.viewBox);
    svg.setAttribute("class", highlight.length ? "wph-figure has-highlight" : "wph-figure");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", opts.title || "");
    svg.setAttribute("focusable", "false");

    const zones = new Set(shapes.map(entry => entry[0]));
    const gradientId = zone => "wph-fig-" + instance + "-" + zone;

    if (Object.keys(tones).length) {
      const defs = document.createElementNS(NS, "defs");

      Object.keys(tones).forEach(zone => {
        const tone = tones[zone];
        if (!zones.has(zone) || !tone || typeof tone !== "object") {
          return;
        }

        const gradient = document.createElementNS(NS, "linearGradient");
        gradient.setAttribute("id", gradientId(zone));
        gradient.setAttribute("x1", "0.2");
        gradient.setAttribute("y1", "0");
        gradient.setAttribute("x2", "0.8");
        gradient.setAttribute("y2", "1");

        const stops = [
          ["0", tone.highlight],
          ["0.3", tone.layer],
          ["0.62", tone.base],
          ["1", tone.shade]
        ];

        stops.forEach(stopData => {
          const stop = document.createElementNS(NS, "stop");
          const color = stopData[1] == null ? "" : String(stopData[1]);
          stop.setAttribute("offset", stopData[0]);
          stop.setAttribute("stop-color", color);
          gradient.appendChild(stop);
        });

        defs.appendChild(gradient);
      });

      if (defs.childNodes.length) {
        svg.appendChild(defs);
      }
    }

    shapes.forEach(entry => {
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

      const tone = tones[zone];
      const hasTone = zones.has(zone) && tone && typeof tone === "object";
      shape.setAttribute(
        "fill",
        hasTone ? "url(#" + gradientId(zone) + ")" : fills[zone] || EMPTY_FILL
      );
      svg.appendChild(shape);
    });

    return svg;
  }

  window.WPHFigure = { create, SHAPES, FIGURES };
}());
