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

  // Cavalry: mount, rider and lance (own design).
  function buildCavalry(group, materials) {
    const T = window.THREE;
    const A = window.THREE_ADDONS;
    const box = (w, h, d, r) => new A.RoundedBoxGeometry(w, h, d, 3, r);
    const capsule = (r, length) => new T.CapsuleGeometry(r, length, 6, 14);

    part(group, materials, "base", new T.CylinderGeometry(0.9, 0.95, 0.14, 48), [0, 0.07, 0], null, [1.55, 1, 1]);
    part(group, materials, "skin", capsule(0.34, 0.72), [0, 1.0, 0], [Math.PI / 2, 0, 0]);
    part(group, materials, "skin", capsule(0.16, 0.35), [0, 1.28, 0.62], [0.95, 0, 0]);
    part(group, materials, "skin", new T.SphereGeometry(0.22, 24, 16), [0, 1.48, 0.92], null, [1, 0.85, 1.35]);
    part(group, materials, "metal", box(0.22, 0.12, 0.16, 0.03), [0, 1.54, 1.08], [0.2, 0, 0]);
    part(group, materials, "accent", new T.SphereGeometry(0.035, 12, 8), [0.12, 1.5, 1.02]);

    const legPositions = [[-0.3, -0.45], [0.3, -0.45], [-0.3, 0.45], [0.3, 0.45]];
    legPositions.forEach(pos => {
      part(group, materials, "skin", capsule(0.12, 0.6), [pos[0], 0.56, pos[1]]);
      part(group, materials, "leather", box(0.18, 0.08, 0.22, 0.03), [pos[0], 0.18, pos[1] + 0.02]);
    });

    part(group, materials, "leather", capsule(0.09, 0.45), [0, 0.95, -0.78], [-Math.PI / 2 - 0.35, 0, 0]);
    part(group, materials, "cloth", box(0.86, 0.08, 1.45, 0.03), [0, 1.31, 0]);
    part(group, materials, "leather", box(0.48, 0.12, 0.68, 0.05), [0, 1.39, -0.04]);

    part(group, materials, "armor", capsule(0.11, 0.42), [-0.36, 1.22, 0], [0, 0, 0.28]);
    part(group, materials, "armor", capsule(0.11, 0.42), [0.36, 1.22, 0], [0, 0, -0.28]);
    part(group, materials, "armor", box(0.52, 0.68, 0.34, 0.1), [0, 1.92, 0]);
    part(group, materials, "armor", new T.SphereGeometry(0.17, 20, 14), [-0.35, 2.18, 0], null, [1.1, 0.75, 1]);
    part(group, materials, "armor", new T.SphereGeometry(0.17, 20, 14), [0.35, 2.18, 0], null, [1.1, 0.75, 1]);
    part(group, materials, "leather", box(0.56, 0.1, 0.38, 0.03), [0, 1.6, 0]);
    part(group, materials, "metal", box(0.12, 0.12, 0.05, 0.02), [0, 1.6, 0.2]);
    part(group, materials, "skin", capsule(0.08, 0.42), [0.42, 1.9, 0.18], [-0.75, 0, -0.35]);

    part(group, materials, "skin", new T.SphereGeometry(0.18, 26, 18), [0, 2.42, 0.02]);
    part(group, materials, "bone", new T.ConeGeometry(0.05, 0.28, 12), [-0.13, 2.6, 0], [0, 0, 0.55]);
    part(group, materials, "bone", new T.ConeGeometry(0.05, 0.28, 12), [0.13, 2.6, 0], [0, 0, -0.55]);
    part(group, materials, "accent", new T.SphereGeometry(0.03, 12, 8), [-0.07, 2.45, 0.16]);
    part(group, materials, "accent", new T.SphereGeometry(0.03, 12, 8), [0.07, 2.45, 0.16]);
    part(group, materials, "accent", new T.SphereGeometry(0.055, 14, 10), [0, 2.02, 0.19]);

    const lance = new T.Group();
    part(lance, materials, "weapon", new T.CylinderGeometry(0.035, 0.035, 1.8, 12), [0, 0, 0]);
    part(lance, materials, "metal", box(0.24, 0.05, 0.24, 0.02), [0, -0.72, 0]);
    lance.position.set(0.55, 1.78, 0.35);
    group.add(lance);
  }

  // Monster: bulky body, wings and curved blade (own design).
  function buildMonster(group, materials) {
    const T = window.THREE;
    const A = window.THREE_ADDONS;
    const box = (w, h, d, r) => new A.RoundedBoxGeometry(w, h, d, 3, r);
    const capsule = (r, length) => new T.CapsuleGeometry(r, length, 6, 14);

    part(group, materials, "base", new T.CylinderGeometry(1.05, 1.1, 0.14, 48), [0, 0.07, 0]);
    part(group, materials, "skin", new T.SphereGeometry(0.92, 32, 24), [0, 1.62, 0], null, [1, 0.95, 0.82]);
    part(group, materials, "armor", box(0.86, 0.72, 0.28, 0.1), [0, 1.95, 0.58]);
    part(group, materials, "leather", box(0.98, 0.13, 0.68, 0.04), [0, 1.45, 0]);
    part(group, materials, "metal", box(0.24, 0.18, 0.07, 0.03), [0, 1.45, 0.36]);
    part(group, materials, "cloth", box(0.68, 0.48, 0.14, 0.04), [0, 1.22, 0.58]);

    part(group, materials, "skin", capsule(0.22, 0.7), [-0.42, 0.72, 0]);
    part(group, materials, "skin", capsule(0.22, 0.7), [0.42, 0.72, 0]);

    const footX = [-0.42, 0.42];
    footX.forEach(x => {
      part(group, materials, "skin", box(0.46, 0.18, 0.66, 0.05), [x, 0.23, 0.18]);
      [-0.13, 0, 0.13].forEach(offset => {
        part(group, materials, "bone", new T.ConeGeometry(0.07, 0.24, 10), [x + offset, 0.18, 0.52], [Math.PI / 2, 0, 0]);
      });
    });

    part(group, materials, "skin", new T.SphereGeometry(0.36, 24, 16), [0, 1.25, -0.9]);
    part(group, materials, "skin", new T.SphereGeometry(0.26, 20, 14), [0, 1.05, -1.3]);
    part(group, materials, "skin", new T.SphereGeometry(0.17, 16, 12), [0, 0.85, -1.6]);

    part(group, materials, "cloth", box(1.2, 1.6, 0.06, 0.02), [-0.75, 2.2, -0.45], [0, -0.6, 0.35]);
    part(group, materials, "cloth", box(1.2, 1.6, 0.06, 0.02), [0.75, 2.2, -0.45], [0, 0.6, -0.35]);

    part(group, materials, "skin", capsule(0.17, 0.7), [-0.95, 1.75, 0.25], [-0.35, 0, 0.55]);
    part(group, materials, "skin", capsule(0.17, 0.7), [0.95, 1.75, 0.25], [-0.35, 0, -0.55]);
    part(group, materials, "metal", new T.CylinderGeometry(0.2, 0.2, 0.12, 16), [-0.82, 2.0, 0.15], [-0.35, 0, 0.55]);
    part(group, materials, "metal", new T.CylinderGeometry(0.2, 0.2, 0.12, 16), [0.82, 2.0, 0.15], [-0.35, 0, -0.55]);

    const hands = [[-1.25, 1.35, 0.45], [1.25, 1.35, 0.45]];
    hands.forEach(hand => {
      [-0.1, 0, 0.1].forEach(offset => {
        part(group, materials, "bone", new T.ConeGeometry(0.06, 0.2, 10), [hand[0] + offset, hand[1] - 0.05, hand[2] + 0.18], [Math.PI / 2, 0, 0]);
      });
    });

    part(group, materials, "skin", new T.SphereGeometry(0.46, 30, 22), [0, 2.68, 0.1]);
    part(group, materials, "bone", new T.ConeGeometry(0.1, 0.7, 12), [-0.32, 2.95, -0.05], [-0.35, 0, 0.65]);
    part(group, materials, "bone", new T.ConeGeometry(0.1, 0.7, 12), [0.32, 2.95, -0.05], [-0.35, 0, -0.65]);
    part(group, materials, "accent", new T.SphereGeometry(0.04, 12, 8), [-0.16, 2.72, 0.48]);
    part(group, materials, "accent", new T.SphereGeometry(0.04, 12, 8), [0.16, 2.72, 0.48]);
    part(group, materials, "accent", new T.SphereGeometry(0.075, 16, 12), [0, 2.05, 0.72]);

    const blade = new T.Group();
    part(blade, materials, "weapon", box(0.09, 0.65, 0.025, 0.01), [0, 0.32, 0]);
    part(blade, materials, "weapon", box(0.08, 0.45, 0.02, 0.01), [0.08, 0.78, 0], [0, 0, -0.35]);
    part(blade, materials, "weapon", box(0.07, 0.35, 0.018, 0.01), [0.22, 1.08, 0], [0, 0, -0.7]);
    blade.position.set(1.25, 1.35, 0.45);
    blade.rotation.set(-0.2, 0, -0.25);
    group.add(blade);
  }

  const BUILDERS = { infantry: buildInfantry, cavalry: buildCavalry, monster: buildMonster };

  // options: { figure, fills: { zone: "#hex" }, highlight: [zone], title, step }
  function create(container, options) {
    const T = window.THREE;
    const A = window.THREE_ADDONS;
    DIM = DIM || new T.Color("#6b7079");
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
      const uniforms = { wphRimColor: { value: new T.Color("#ffffff") }, wphRimStrength: { value: 0 } };
      materials[zone].userData.rim = uniforms;
      materials[zone].onBeforeCompile = shader => {
        shader.uniforms.wphRimColor = uniforms.wphRimColor;
        shader.uniforms.wphRimStrength = uniforms.wphRimStrength;
        shader.fragmentShader = "uniform vec3 wphRimColor;\nuniform float wphRimStrength;\n" + shader.fragmentShader.replace(
          "#include <dithering_fragment>",
          "float wphRim = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.2);\ngl_FragColor.rgb = mix(gl_FragColor.rgb, wphRimColor, clamp(wphRim * wphRimStrength, 0.0, 1.0));\n#include <dithering_fragment>");
      };
    });
    const group = new T.Group();
    scene.add(group);
    let figure = "";
    let modelBuffer = null;
    let modelActive = false;
    let modelLoading = false;
    let modelZones = [];
    let loadToken = 0;
    let lastOptions = {};

    const controls = new A.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.1, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 9;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener("start", () => { controls.autoRotate = false; });

    const cameraDirection = new T.Vector3(2.5, 1.0, 5.4).normalize();
    function fitCameraToFigure() {
      const bounds = new T.Box3().setFromObject(group);
      if (bounds.isEmpty()) {
        return;
      }
      const center = bounds.getCenter(new T.Vector3());
      const size = bounds.getSize(new T.Vector3());
      const distance = 2.4 * Math.max(size.x, size.y, size.z);
      controls.target.copy(center);
      camera.position.copy(center).addScaledVector(cameraDirection, distance);
      camera.updateProjectionMatrix();
      controls.update();
    }

    function figureType(opts) {
      return BUILDERS[opts.figure] ? opts.figure : "infantry";
    }

    function buildFigure(type) {
      group.clear();
      BUILDERS[type](group, materials);
      figure = type;
      modelActive = false;
      modelZones = [];
      fitCameraToFigure();
    }

    function applyMaterials(opts) {
      const fills = opts.fills || {};
      const highlight = Array.isArray(opts.highlight) ? opts.highlight : [];
      const step = opts.step || {};
      Object.keys(materials).forEach(zone => {
        const material = materials[zone];
        const dimmed = highlight.length > 0 && !highlight.includes(zone);
        // Zones of other colours fade towards the background instead of turning see-through.
        material.color.set(fills[zone] || EMPTY);
        if (dimmed) {
          material.color.lerp(DIM, 0.6);
        }
        material.emissive.set(highlight.includes(zone) ? fills[zone] || EMPTY : "#000000");
        material.emissiveIntensity = highlight.includes(zone) ? 0.12 : 0;
        const active = highlight.includes(zone) && Boolean(step.color);
        material.userData.rim.wphRimStrength.value = active && step.kind === "highlight" ? 1.6 : 0;
        if (active) {
          material.userData.rim.wphRimColor.value.set(step.color);
          if (step.kind === "shade") {
            material.color.lerp(new T.Color(step.color), 0.5);
          }
        }
        material.needsUpdate = true;
      });
      renderer.domElement.setAttribute("aria-label", opts.title || "");
    }

    function zoneForPart(name) {
      return window.WPH && window.WPH.zoneForPartName ? window.WPH.zoneForPartName(name) : "";
    }

    function applyModelMaterials(root) {
      const found = new Set();
      root.traverse(obj => {
        if (!obj.isMesh) {
          return;
        }
        obj.castShadow = true;
        obj.receiveShadow = true;
        let zone = "";
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          if (mat && mat.name) {
            zone = zoneForPart(mat.name);
            if (zone) {
              break;
            }
          }
        }
        if (!zone) {
          zone = zoneForPart(obj.name);
        }
        if (zone) {
          found.add(zone);
          obj.material = materials[zone];
        }
      });
      return Object.keys(materials).filter(zone => found.has(zone));
    }

    function scaleModelToBase(model) {
      const box = new T.Box3().setFromObject(model);
      if (box.isEmpty()) {
        return;
      }
      const size = box.getSize(new T.Vector3());
      const scale = size.y > 0 ? 2.3 / size.y : 1;
      model.scale.setScalar(scale);
      box.setFromObject(model);
      if (box.isEmpty()) {
        return;
      }
      const center = box.getCenter(new T.Vector3());
      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= box.min.y;
    }

    function failModel(error) {
      modelLoading = false;
      buildFigure(figureType(lastOptions));
      applyMaterials(lastOptions);
      if (typeof lastOptions.onModelError === "function") {
        lastOptions.onModelError(error);
      }
    }

    function loadModel(buffer) {
      const token = ++loadToken;
      modelLoading = true;
      try {
        const loader = new A.GLTFLoader();
        loader.parse(
          buffer,
          "",
          gltf => {
            if (token !== loadToken) {
              return;
            }
            modelLoading = false;
            const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            if (!model) {
              failModel(new Error());
              return;
            }
            group.clear();
            group.add(model);
            scaleModelToBase(model);
            modelZones = applyModelMaterials(model);
            modelActive = true;
            figure = "";
            fitCameraToFigure();
            applyMaterials(lastOptions);
          },
          error => {
            if (token !== loadToken) {
              return;
            }
            failModel(error);
          }
        );
      } catch (error) {
        if (token === loadToken) {
          failModel(error);
        }
      }
    }

    function zones() {
      return modelActive ? modelZones.slice() : Object.keys(materials).slice();
    }

    function update(next) {
      const opts = next || {};
      lastOptions = opts;
      if (opts.model) {
        if (opts.model !== modelBuffer) {
          modelBuffer = opts.model;
          loadModel(opts.model);
        } else if (!modelActive && !modelLoading) {
          const type = figureType(opts);
          if (type !== figure) {
            buildFigure(type);
          }
        }
      } else {
        modelBuffer = null;
        loadToken += 1;
        modelLoading = false;
        const type = figureType(opts);
        if (modelActive || type !== figure) {
          buildFigure(type);
        }
      }
      applyMaterials(opts);
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
      loadToken += 1;
      modelLoading = false;
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }

    return { update, dispose, element: renderer.domElement, zones };
  }

  window.WPHFigure3D = { create, types: Object.keys(BUILDERS) };
}());
