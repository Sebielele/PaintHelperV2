// Project data for PaintHelperV2: display bases, dioramas, terrain and conversions.
// Storage key wph.projects.v1; pure functions shared by the browser and the Node tests.
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./army-data.js"));
  } else {
    root.WPHProjectData = factory(root.WPHArmyData);
  }
}(typeof self !== "undefined" ? self : this, function (ArmyData) {
  "use strict";

  const STAGES = {
    fdm: ["open", "printed", "cleaned", "primed", "painted", "done"],
    resin: ["open", "printed", "cleaned", "primed", "painted", "done"],
    kit: ["open", "built", "primed", "painted", "done"],
    material: ["open", "ready"]
  };
  const KINDS = Object.keys(STAGES);

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function line(value, max) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
  }

  function block(value, max) {
    return String(value == null ? "" : value).replace(/\r\n/g, "\n").trim().slice(0, max);
  }

  function link(value) {
    const source = value && typeof value === "object" ? value : {};
    const url = line(source.url, 300);
    if (!url) {
      return null;
    }
    const allowed = /^https?:\/\//i.test(url)
      || /^file:\/\//i.test(url)
      || /^[a-z]:[\\/]/i.test(url)
      || !/^[a-z][a-z0-9+.-]*:/i.test(url);
    if (!allowed) {
      return null;
    }
    return { label: line(source.label, 80) || url.slice(0, 80), url };
  }

  function sanitizeElement(value) {
    const element = value && typeof value === "object" ? value : {};
    if (!/^el-[a-z0-9-]{1,40}$/.test(String(element.id || ""))) {
      return null;
    }
    const kind = KINDS.includes(element.kind) ? element.kind : "kit";
    const rawQty = Number(element.qty);
    const qty = Number.isFinite(rawQty) ? Math.max(1, Math.min(99, Math.round(rawQty))) : 1;
    const rawStage = Number(element.stage);
    const stage = Number.isFinite(rawStage)
      ? Math.max(0, Math.min(STAGES[kind].length - 1, Math.round(rawStage)))
      : 0;
    const guide = ArmyData && ArmyData.sanitizeGuide ? ArmyData.sanitizeGuide(element.guide) : null;
    return {
      id: String(element.id),
      name: line(element.name, 80) || "Element",
      group: line(element.group, 40),
      kind,
      qty,
      stage,
      file: line(element.file, 300),
      notes: block(element.notes, 2000),
      ...(/^custom-[a-z0-9-]{1,40}$/.test(String(element.paletteId || "")) ? { paletteId: String(element.paletteId) } : {}),
      ...(guide ? { guide } : {})
    };
  }

  function sanitizeProject(value) {
    const project = value && typeof value === "object" ? value : {};
    if (!/^proj-[a-z0-9-]{1,40}$/.test(String(project.id || ""))) {
      return null;
    }
    const links = list(project.links).slice(0, 30).map(link).filter(Boolean);
    const elements = [];
    const seenElements = new Set();
    list(project.elements).slice(0, 200).forEach(item => {
      const element = sanitizeElement(item);
      if (element && !seenElements.has(element.id)) {
        seenElements.add(element.id);
        elements.push(element);
      }
    });
    const supplies = list(project.supplies).slice(0, 100).map(supply => {
      const source = supply && typeof supply === "object" ? supply : {};
      const name = line(source.name, 80);
      if (!name) {
        return null;
      }
      return {
        name,
        qty: line(source.qty, 20),
        have: Boolean(source.have),
        note: line(source.note, 200)
      };
    }).filter(Boolean);
    const paletteId = /^custom-[a-z0-9-]{1,40}$/.test(String(project.paletteId || "")) ? String(project.paletteId) : "";
    return {
      id: String(project.id),
      name: line(project.name, 80) || "Project",
      description: block(project.description, 2000),
      paletteId,
      notes: block(project.notes, 20000),
      links,
      elements,
      supplies,
      createdAt: line(project.createdAt, 40),
      updatedAt: line(project.updatedAt, 40)
    };
  }

  function sanitizeStore(value) {
    const store = value && typeof value === "object" ? value : {};
    const projects = [];
    const seenProjects = new Set();
    list(store.projects).slice(0, 20).forEach(item => {
      const project = sanitizeProject(item);
      if (project && !seenProjects.has(project.id)) {
        seenProjects.add(project.id);
        projects.push(project);
      }
    });
    const activeId = projects.some(project => project.id === store.activeId)
      ? String(store.activeId)
      : (projects[0] ? projects[0].id : "");
    return { version: 1, activeId, projects };
  }

  function newId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function newProject(name, now = new Date()) {
    const timestamp = now.toISOString();
    return {
      id: newId("proj"),
      name: line(name, 80) || "Project",
      description: "",
      paletteId: "",
      notes: "",
      links: [],
      elements: [],
      supplies: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  function newElement(kind, name) {
    return {
      id: newId("el"),
      name: line(name, 80) || "Element",
      group: "",
      kind: KINDS.includes(kind) ? kind : "kit",
      qty: 1,
      stage: 0,
      file: "",
      notes: ""
    };
  }

  function isDone(element) {
    if (!element || !STAGES[element.kind]) {
      return false;
    }
    return Number(element.stage) === STAGES[element.kind].length - 1;
  }

  function groups(project) {
    const result = [];
    list(project && project.elements).forEach(element => {
      const group = line(element && element.group, 40);
      if (!result.includes(group)) {
        result.push(group);
      }
    });
    return result;
  }

  function progress(project) {
    const elements = list(project && project.elements);
    let total = 0;
    let done = 0;
    const byKind = {};
    const groupTotals = new Map();

    elements.forEach(element => {
      const qty = Math.max(0, Number(element && element.qty) || 0);
      if (!qty) {
        return;
      }
      total += qty;
      const finished = isDone(element);
      if (finished) {
        done += qty;
      }

      const kind = element && STAGES[element.kind] ? element.kind : "";
      if (kind) {
        if (!byKind[kind]) {
          byKind[kind] = { elements: 0, done: 0 };
        }
        byKind[kind].elements += qty;
        if (finished) {
          byKind[kind].done += qty;
        }
      }

      const group = line(element && element.group, 40);
      if (!groupTotals.has(group)) {
        groupTotals.set(group, { elements: 0, done: 0 });
      }
      const totals = groupTotals.get(group);
      totals.elements += qty;
      if (finished) {
        totals.done += qty;
      }
    });

    const byGroup = groups(project).map(group => {
      const totals = groupTotals.get(group) || { elements: 0, done: 0 };
      return {
        group,
        elements: totals.elements,
        done: totals.done,
        share: totals.elements ? totals.done / totals.elements : 0
      };
    });

    return { elements: total, done, share: total ? done / total : 0, byKind, byGroup };
  }

  function suppliesOpen(project) {
    return list(project && project.supplies).filter(supply => supply && supply.have === false).length;
  }

  function moveElement(project, id, delta) {
    if (!project || !Array.isArray(project.elements) || (delta !== 1 && delta !== -1)) {
      return false;
    }
    const index = project.elements.findIndex(element => element && element.id === id);
    if (index < 0) {
      return false;
    }
    const group = line(project.elements[index].group, 40);
    let target = index + delta;
    while (target >= 0 && target < project.elements.length) {
      if (line(project.elements[target].group, 40) === group) {
        break;
      }
      target += delta;
    }
    if (target < 0 || target >= project.elements.length) {
      return false;
    }
    const current = project.elements[index];
    project.elements[index] = project.elements[target];
    project.elements[target] = current;
    return true;
  }

  return { STAGES, KINDS, sanitizeStore, sanitizeProject, sanitizeElement, newProject, newElement, isDone, progress, groups, suppliesOpen, moveElement };
}));
