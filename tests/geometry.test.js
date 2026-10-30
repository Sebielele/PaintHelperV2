const test = require("node:test");
const assert = require("node:assert/strict");
const geometry = require("../src/logic/geometry.js");

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`);

test("wheel colour: hue from the angle, saturation from the distance, nothing outside", () => {
  assert.deepEqual(geometry.wheelColorAt(50, 0, 100), { h: 0, s: 50 });
  const down = geometry.wheelColorAt(0, 100, 100);
  near(down.h, 90);
  near(down.s, 100);
  const left = geometry.wheelColorAt(-10, 0, 100);
  near(left.h, 180);
  const up = geometry.wheelColorAt(0, -30, 100);
  near(up.h, 270);
  assert.equal(geometry.wheelColorAt(80, 80, 100), null);
  assert.equal(geometry.wheelColorAt(0, 0, 0), null);
  assert.deepEqual(geometry.wheelColorAt(0, 0, 100, 5), { h: 0, s: 5 });
});

test("wheel marker: inverse of the wheel colour, saturation clamped", () => {
  const point = geometry.wheelMarkerPoint(90, 50, 100);
  near(point.x, 100);
  near(point.y, 150);
  const outer = geometry.wheelMarkerPoint(0, 140, 100);
  near(outer.x, 200);
  near(outer.y, 100);
  const back = geometry.wheelColorAt(point.x - 100, point.y - 100, 100);
  near(back.h, 90);
  near(back.s, 50);
});

test("tooltip: below and centred, kept inside, above when there is no room below", () => {
  const viewport = { width: 1000, height: 800 };
  const tooltip = { width: 300, height: 200 };
  assert.deepEqual(geometry.tooltipPosition({ left: 400, top: 100, bottom: 140, width: 100 }, tooltip, viewport), { left: 300, top: 152 });
  assert.deepEqual(geometry.tooltipPosition({ left: 0, top: 100, bottom: 140, width: 40 }, tooltip, viewport), { left: 12, top: 152 });
  assert.deepEqual(geometry.tooltipPosition({ left: 960, top: 100, bottom: 140, width: 40 }, tooltip, viewport), { left: 688, top: 152 });
  assert.deepEqual(geometry.tooltipPosition({ left: 400, top: 700, bottom: 740, width: 100 }, tooltip, viewport), { left: 300, top: 488 });
  assert.deepEqual(geometry.tooltipPosition({ left: 400, top: 100, bottom: 700, width: 100 }, tooltip, viewport), { left: 300, top: 12 });
  assert.deepEqual(geometry.tooltipPosition({ left: 0, top: 0, bottom: 10, width: 10 }, { width: 2000, height: 10 }, viewport, { gap: 4, margin: 8 }), { left: 8, top: 14 });
});
