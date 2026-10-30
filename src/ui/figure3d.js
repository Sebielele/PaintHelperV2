// 3D figure for the painting desk: a simple model built from basic shapes (no third-party
// assets), one material per zone (armor, cloth, skin, leather, metal, weapon, bone, accent,
// base) in the palette colours. Drag to turn, pinch or scroll to zoom; it turns slowly on its
// own until touched. Needs window.THREE and window.THREE_ADDONS (src/vendor/three-bundle.js).
(function () {
  "use strict";

  const EMPTY = "#8a8f98";
  const METALLIC = new Set(["metal", "weapon"]);
  let DIM = null;

  function part(scene, materials, zone, geometry, position, rotation, scale) {
    const mesh = new window.THREE.Mesh(geometry, materials[zone]);
    mesh.position.set(...position);
    if (rotation) {
      mesh.rotation.set(...rotation);
    }
    if (scale) {
      mesh.scale.set(...scale);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  // Infantry in heavy armour with cloak, horned head and a sword (own design).
  function buildInfantry(group, materials) {
    const T = window.THREE;
    const A = window.THREE_ADDONS;
    const box = (w, h, d, r) => new A.RoundedBoxGeometry(w, h, d, 3, r);
    const capsule = (r, length) => new T.CapsuleGeometry(r, length, 6, 14);
    part(group, materials, "base", new T.CylinderGeometry(0.9, 0.95, 0.14, 48), [0, 0.07, 0]);
    part(group, materials, "cloth", box(1.05, 1.5, 0.08, 0.03), [0, 1.0, -0.33], [0.12, 0, 0]);
    part(group, materials, "armor", capsule(0.15, 0.55), [-0.2, 0.62, 0]);
    part(group, materials, "armor", capsule(0.15, 0.55), [0.2, 0.62, 0]);
    part(group, materials, "leather", box(0.26, 0.18, 0.38, 0.06), [-0.2, 0.25, 0.05]);
    part(group, materials, "leather", box(0.26, 0.18, 0.38, 0.06), [0.2, 0.25, 0.05]);
    part(group, materials, "armor", box(0.78, 0.82, 0.46, 0.12), [0, 1.38, 0]);
    part(group, materials, "leather", box(0.82, 0.12, 0.5, 0.04), [0, 0.98, 0]);
    part(group, materials, "metal", box(0.16, 0.16, 0.06, 0.03), [0, 0.98, 0.26]);
    part(group, materials, "armor", new T.SphereGeometry(0.24, 24, 16), [-0.5, 1.72, 0], null, [1.1, 0.75, 1]);
    part(group, materials, "armor", new T.SphereGeometry(0.24, 24, 16), [0.5, 1.72, 0], null, [1.1, 0.75, 1]);
    part(group, materials, "skin", capsule(0.1, 0.55), [-0.52, 1.32, 0.04], [0, 0, 0.12]);
    part(group, materials, "skin", capsule(0.1, 0.55), [0.52, 1.32, 0.12], [-0.5, 0, -0.12]);
    part(group, materials, "skin", new T.SphereGeometry(0.21, 28, 20), [0, 2.0, 0.02]);
    part(group, materials, "bone", new T.ConeGeometry(0.06, 0.34, 12), [-0.17, 2.24, 0], [0, 0, 0.55]);
    part(group, materials, "bone", new T.ConeGeometry(0.06, 0.34, 12), [0.17, 2.24, 0], [0, 0, -0.55]);
    part(group, materials, "accent", new T.SphereGeometry(0.035, 12, 8), [-0.075, 2.03, 0.19]);
    part(group, materials, "accent", new T.SphereGeometry(0.035, 12, 8), [0.075, 2.03, 0.19]);
    part(group, materials, "accent", new T.SphereGeometry(0.07, 16, 12), [0, 1.48, 0.24]);
    const sword = new T.Group();
    part(sword, materials, "weapon", box(0.09, 1.2, 0.025, 0.01), [0, 0.68, 0]);
    part(sword, materials, "metal", box(0.36, 0.06, 0.08, 0.02), [0, 0.06, 0]);
    part(sword, materials, "leather", new T.CylinderGeometry(0.035, 0.035, 0.22, 10), [0, -0.08, 0]);
    sword.position.set(0.62, 0.98, 0.42);
    sword.rotation.set(0.5, 0, -0.18);
    group.add(sword);
  }

  const BUILDERS = { infantry: buildInfantry };

  // options: { figure, fills: { zone: "#hex" }, highlight: [zone], title }
  function create(container, options) {
    const T = window.THREE;
    const A = window.THREE_ADDONS;
    DIM = DIM || new T.Color("#2a2d33");
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.className = "wph-figure3d";
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(2.5, 2.1, 5.4);
    scene.add(new T.HemisphereLight(0xffffff, 0x3a3a44, 1.1));
    const key = new T.DirectionalLight(0xffffff, 2.2);
    key.position.set(-2.5, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new T.DirectionalLight(0xffffff, 0.8);
    rim.position.set(3, 2, -4);
    scene.add(rim);

    const materials = {};
    ["armor", "cloth", "skin", "leather", "metal", "weapon", "bone", "accent", "base"].forEach(zone => {
      materials[zone] = new T.MeshStandardMaterial({
        color: EMPTY,
        metalness: METALLIC.has(zone) ? 0.35 : 0.05,
        roughness: METALLIC.has(zone) ? 0.38 : 0.72
      });
    });
    const group = new T.Group();
    scene.add(group);
    let figure = "";

    const controls = new A.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.1, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 9;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener("start", () => { controls.autoRotate = false; });

    function update(next) {
      const opts = next || {};
      const type = BUILDERS[opts.figure] ? opts.figure : "infantry";
      if (type !== figure) {
        group.clear();
        BUILDERS[type](group, materials);
        figure = type;
      }
      const fills = opts.fills || {};
      const highlight = Array.isArray(opts.highlight) ? opts.highlight : [];
      Object.keys(materials).forEach(zone => {
        const material = materials[zone];
        const dimmed = highlight.length > 0 && !highlight.includes(zone);
        // Zones of other colours fade towards the background instead of turning see-through.
        material.color.set(fills[zone] || EMPTY);
        if (dimmed) {
          material.color.lerp(DIM, 0.7);
        }
        material.emissive.set(highlight.includes(zone) ? fills[zone] || EMPTY : "#000000");
        material.emissiveIntensity = highlight.includes(zone) ? 0.12 : 0;
        material.needsUpdate = true;
      });
      renderer.domElement.setAttribute("aria-label", opts.title || "");
    }

    function resize() {
      const width = container.clientWidth || 200;
      const height = container.clientHeight || Math.round(width * 1.4);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    let running = true;
    function loop() {
      if (!running) {
        return;
      }
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    update(options);
    resize();
    loop();

    function dispose() {
      running = false;
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }

    return { update, dispose, element: renderer.domElement };
  }

  window.WPHFigure3D = { create, types: Object.keys(BUILDERS) };
}());
