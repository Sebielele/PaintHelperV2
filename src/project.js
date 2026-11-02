// Project page for PaintHelperV2: display bases, dioramas, terrain and conversions.
// Storage key wph.projects.v1; data helpers live in src/project-data.js.
(function () {
  "use strict";

  const STORE_KEY = "wph.projects.v1";
  const Data = window.WPHProjectData;
  let app = null;
  let store = null;
  let saveTimer = null;
  let confirmDelete = false;
  const el = {};

  document.addEventListener("wph:update", () => {
    if (!app) {
      init();
    }
    if (app && isVisible()) {
      render();
    }
  });

  function t(key, params) {
    return app ? app.t(key, params) : key;
  }

  function init() {
    app = window.WPH && window.WPH.app;
    if (!app || !Data) {
      app = null;
      return;
    }
    ["projectBody", "projectStatus", "projectSelect", "projectNewBtn", "projectPanel"].forEach(id => {
      el[id] = document.getElementById(id);
    });
    store = Data.sanitizeStore(read());
    el.projectSelect.addEventListener("change", () => {
      store.activeId = el.projectSelect.value;
      confirmDelete = false;
      save();
      render();
    });
    el.projectNewBtn.addEventListener("click", () => {
      newProject();
    });
    document.addEventListener("wph:workflow", event => {
      if (event.detail && event.detail.view === "project") {
        render();
      }
    });
  }

  function isVisible() {
    return el.projectPanel && !el.projectPanel.hidden;
  }

  function read() {
    try {
      const raw = window.WPHStorage ? window.WPHStorage.get(STORE_KEY) : window.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const value = JSON.stringify(Data.sanitizeStore(store));
      try {
        if (window.WPHStorage) {
          window.WPHStorage.set(STORE_KEY, value);
        } else {
          window.localStorage.setItem(STORE_KEY, value);
        }
      } catch (error) {
        setStatus(t("project.saveError"));
      }
    }, 300);
  }

  function activeProject() {
    return store.projects.find(project => project.id === store.activeId) || store.projects[0] || null;
  }

  function setStatus(message) {
    el.projectStatus.textContent = message || "";
  }

  function touch(project) {
    project.updatedAt = new Date().toISOString();
  }

  function newProject() {
    if (store.projects.length >= 20) {
      setStatus(t("project.limit"));
      return;
    }
    const project = Data.newProject(t("project.defaultName"));
    touch(project);
    store.projects.push(project);
    store.activeId = project.id;
    save();
    render();
  }

  function h(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) {
        return;
      }
      if (key === "className") {
        node.className = value;
      } else if (key === "text") {
        node.textContent = value;
      } else if (key === "onClick") {
        node.addEventListener("click", value);
      } else if (key === "style") {
        Object.assign(node.style, value);
      } else {
        node.setAttribute(key, value === true ? "" : value);
      }
    });
    (Array.isArray(children) ? children : [children]).flat().forEach(child => {
      if (child !== null && child !== undefined && child !== false) {
        node.append(child);
      }
    });
    return node;
  }

  function render() {
    if (!app || !store) {
      return;
    }
    const project = activeProject();
    el.projectSelect.hidden = store.projects.length < 2;
    el.projectSelect.replaceChildren(...store.projects.map(entry => h("option", { value: entry.id, text: entry.name })));
    if (project) {
      el.projectSelect.value = project.id;
    }
    if (!project) {
      el.projectBody.replaceChildren(renderEmpty());
      return;
    }
    el.projectBody.replaceChildren(renderInfo(project), renderOverview(project));
  }

  function renderEmpty() {
    return h("div", { className: "army-empty" }, [
      h("p", { className: "army-empty-icon", "aria-hidden": "true", text: "🧱" }),
      h("h3", { text: t("project.emptyTitle") }),
      h("p", { text: t("project.emptyText") }),
      h("button", { type: "button", className: "assist-primary", text: t("project.new"), onClick: () => newProject() })
    ]);
  }

  function renderInfo(project) {
    const nameInput = h("input", { type: "text", id: "projectNameInput", maxlength: "80", value: project.name });
    nameInput.addEventListener("change", () => {
      project.name = nameInput.value;
      touch(project);
      save();
      render();
    });
    const descriptionInput = h("textarea", { id: "projectDescriptionInput", rows: "3", maxlength: "2000" });
    descriptionInput.value = project.description;
    descriptionInput.addEventListener("input", () => {
      project.description = descriptionInput.value;
      touch(project);
      save();
    });
    const deleteButton = h("button", {
      type: "button",
      className: "secondary danger project-delete",
      text: confirmDelete ? t("project.deleteConfirm") : t("project.delete"),
      onClick: () => {
        if (!confirmDelete) {
          confirmDelete = true;
          render();
          setTimeout(() => {
            if (confirmDelete) {
              confirmDelete = false;
              render();
            }
          }, 4000);
          return;
        }
        confirmDelete = false;
        store.projects = store.projects.filter(entry => entry.id !== project.id);
        store.activeId = store.projects[0] ? store.projects[0].id : "";
        save();
        setStatus("");
        render();
      }
    });
    return h("div", { className: "project-info" }, [
      h("label", { for: "projectNameInput", text: t("project.name") }),
      nameInput,
      h("label", { for: "projectDescriptionInput", text: t("project.description") }),
      descriptionInput,
      deleteButton
    ]);
  }

  function renderOverview(project) {
    const progress = Data.progress(project);
    const percent = Math.round(progress.share * 100);
    const groups = progress.byGroup.map(group => h("div", { className: "project-group" }, [
      h("span", { className: "project-group-name", text: group.group || t("project.groupNone") }),
      h("div", { className: "project-group-bar" }, [h("span", { style: { width: `${Math.round(group.share * 100)}%` } })]),
      h("span", { className: "project-group-count", text: `${group.done}/${group.elements}` })
    ]));
    const openSupplies = Data.suppliesOpen(project);
    return h("div", { className: "project-overview" }, [
      h("div", { className: "project-progress", role: "img", "aria-label": t("project.progress", { done: progress.done, total: progress.elements }) }, [
        h("span", { style: { width: `${percent}%` } })
      ]),
      h("p", { className: "meta project-progress-text", text: t("project.progress", { done: progress.done, total: progress.elements }) }),
      groups.length ? h("div", { className: "project-groups" }, groups) : null,
      openSupplies > 0 ? h("p", { className: "meta", text: t("project.suppliesOpen", { count: openSupplies }) }) : null
    ]);
  }

  window.WPHProject = { render, store: () => store };
}());
