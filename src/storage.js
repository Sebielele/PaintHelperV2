// Storage adapter for PaintHelperV2.
//
// Server mode (app served by server/server.js): every "wph.*" key is kept per user in
// the server database. The page shows a login screen first, loads the user's data into
// memory, and writes changes back in the background.
//
// Local mode (file://, GitHub Pages, any static host): falls back to localStorage,
// exactly like the original app.
(function () {
  "use strict";

  const API = "api/";
  const LOCAL_PREFIX = "wph.";
  const FLUSH_DELAY_MS = 500;
  const RETRY_DELAY_MS = 5000;

  const TEXT = {
    en: {
      serverErrorTitle: "Server not reachable", retry: "Try again", rejected: "Not saved – rejected by server", wrongPassword: "The current password is incorrect.", weakPassword: "The new password must be at least 8 characters long.", unsavedTitle: "Unsaved changes", unsavedText: "Some changes could not be saved yet. If you sign out now, they will be lost.", signOutAnyway: "Sign out anyway", stay: "Stay signed in",
      signIn: "Sign in", signInHint: "Sign in to load your palettes, profiles, and paint collection.",
      username: "Username", password: "Password", wrongLogin: "Username or password is incorrect.",
      tooMany: "Too many attempts. Please try again in 15 minutes.", serverError: "The server is not reachable.",
      signedInAs: "Signed in as", signOut: "Sign out", changePassword: "Change password",
      currentPassword: "Current password", newPassword: "New password", repeatPassword: "Repeat new password",
      passwordMismatch: "The new passwords do not match.", passwordChanged: "Password changed.",
      save: "Save", cancel: "Cancel", saved: "Saved", saving: "Saving…", offline: "Not saved – retrying",
      sessionExpired: "Your session has expired. Please sign in again.",
      importTitle: "Data found on this device",
      importText: "This browser still holds palettes and settings saved before signing in. Copy them to your account?",
      importYes: "Copy to my account", importNo: "Discard", account: "Account"
    },
    de: {
      serverErrorTitle: "Server nicht erreichbar", retry: "Erneut versuchen", rejected: "Nicht gespeichert – vom Server abgelehnt", wrongPassword: "Das aktuelle Passwort ist falsch.", weakPassword: "Das neue Passwort muss mindestens 8 Zeichen lang sein.", unsavedTitle: "Ungespeicherte Änderungen", unsavedText: "Einige Änderungen konnten noch nicht gespeichert werden. Beim Abmelden gehen sie verloren.", signOutAnyway: "Trotzdem abmelden", stay: "Angemeldet bleiben",
      signIn: "Anmelden", signInHint: "Melde dich an, um deine Paletten, Profile und Farbsammlung zu laden.",
      username: "Benutzername", password: "Passwort", wrongLogin: "Benutzername oder Passwort falsch.",
      tooMany: "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.", serverError: "Der Server ist nicht erreichbar.",
      signedInAs: "Angemeldet als", signOut: "Abmelden", changePassword: "Passwort ändern",
      currentPassword: "Aktuelles Passwort", newPassword: "Neues Passwort", repeatPassword: "Neues Passwort wiederholen",
      passwordMismatch: "Die neuen Passwörter stimmen nicht überein.", passwordChanged: "Passwort geändert.",
      save: "Speichern", cancel: "Abbrechen", saved: "Gespeichert", saving: "Speichert…", offline: "Nicht gespeichert – neuer Versuch",
      sessionExpired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
      importTitle: "Daten auf diesem Gerät gefunden",
      importText: "In diesem Browser sind noch Paletten und Einstellungen von vor der Anmeldung gespeichert. In dein Konto übernehmen?",
      importYes: "In mein Konto übernehmen", importNo: "Verwerfen", account: "Konto"
    },
    fr: {
      serverErrorTitle: "Serveur injoignable", retry: "Réessayer", rejected: "Non enregistré – refusé par le serveur", wrongPassword: "Le mot de passe actuel est incorrect.", weakPassword: "Le nouveau mot de passe doit comporter au moins 8 caractères.", unsavedTitle: "Modifications non enregistrées", unsavedText: "Certaines modifications n'ont pas encore pu être enregistrées. Elles seront perdues si vous vous déconnectez.", signOutAnyway: "Se déconnecter quand même", stay: "Rester connecté",
      signIn: "Se connecter", signInHint: "Connectez-vous pour charger vos palettes, profils et peintures.",
      username: "Nom d'utilisateur", password: "Mot de passe", wrongLogin: "Nom d'utilisateur ou mot de passe incorrect.",
      tooMany: "Trop de tentatives. Réessayez dans 15 minutes.", serverError: "Le serveur est injoignable.",
      signedInAs: "Connecté en tant que", signOut: "Se déconnecter", changePassword: "Changer le mot de passe",
      currentPassword: "Mot de passe actuel", newPassword: "Nouveau mot de passe", repeatPassword: "Répéter le nouveau mot de passe",
      passwordMismatch: "Les nouveaux mots de passe ne correspondent pas.", passwordChanged: "Mot de passe modifié.",
      save: "Enregistrer", cancel: "Annuler", saved: "Enregistré", saving: "Enregistrement…", offline: "Non enregistré – nouvel essai",
      sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
      importTitle: "Données trouvées sur cet appareil",
      importText: "Ce navigateur contient des palettes et réglages enregistrés avant la connexion. Les copier dans votre compte ?",
      importYes: "Copier dans mon compte", importNo: "Supprimer", account: "Compte"
    },
    es: {
      serverErrorTitle: "Servidor no disponible", retry: "Reintentar", rejected: "No guardado – rechazado por el servidor", wrongPassword: "La contraseña actual es incorrecta.", weakPassword: "La nueva contraseña debe tener al menos 8 caracteres.", unsavedTitle: "Cambios sin guardar", unsavedText: "Algunos cambios aún no se han podido guardar. Si cierras sesión ahora, se perderán.", signOutAnyway: "Cerrar sesión igualmente", stay: "Seguir conectado",
      signIn: "Iniciar sesión", signInHint: "Inicia sesión para cargar tus paletas, perfiles y pinturas.",
      username: "Usuario", password: "Contraseña", wrongLogin: "Usuario o contraseña incorrectos.",
      tooMany: "Demasiados intentos. Inténtalo de nuevo en 15 minutos.", serverError: "No se puede acceder al servidor.",
      signedInAs: "Sesión de", signOut: "Cerrar sesión", changePassword: "Cambiar contraseña",
      currentPassword: "Contraseña actual", newPassword: "Nueva contraseña", repeatPassword: "Repetir nueva contraseña",
      passwordMismatch: "Las nuevas contraseñas no coinciden.", passwordChanged: "Contraseña cambiada.",
      save: "Guardar", cancel: "Cancelar", saved: "Guardado", saving: "Guardando…", offline: "No guardado – reintentando",
      sessionExpired: "Tu sesión ha caducado. Inicia sesión de nuevo.",
      importTitle: "Datos encontrados en este dispositivo",
      importText: "Este navegador conserva paletas y ajustes guardados antes de iniciar sesión. ¿Copiarlos a tu cuenta?",
      importYes: "Copiar a mi cuenta", importNo: "Descartar", account: "Cuenta"
    },
    it: {
      serverErrorTitle: "Server non raggiungibile", retry: "Riprova", rejected: "Non salvato – rifiutato dal server", wrongPassword: "La password attuale è errata.", weakPassword: "La nuova password deve avere almeno 8 caratteri.", unsavedTitle: "Modifiche non salvate", unsavedText: "Alcune modifiche non sono ancora state salvate. Se esci ora andranno perse.", signOutAnyway: "Esci comunque", stay: "Rimani connesso",
      signIn: "Accedi", signInHint: "Accedi per caricare palette, profili e collezione di colori.",
      username: "Nome utente", password: "Password", wrongLogin: "Nome utente o password errati.",
      tooMany: "Troppi tentativi. Riprova tra 15 minuti.", serverError: "Il server non è raggiungibile.",
      signedInAs: "Accesso come", signOut: "Esci", changePassword: "Cambia password",
      currentPassword: "Password attuale", newPassword: "Nuova password", repeatPassword: "Ripeti nuova password",
      passwordMismatch: "Le nuove password non coincidono.", passwordChanged: "Password cambiata.",
      save: "Salva", cancel: "Annulla", saved: "Salvato", saving: "Salvataggio…", offline: "Non salvato – nuovo tentativo",
      sessionExpired: "La sessione è scaduta. Accedi di nuovo.",
      importTitle: "Dati trovati su questo dispositivo",
      importText: "Questo browser contiene palette e impostazioni salvate prima dell'accesso. Copiarle nel tuo account?",
      importYes: "Copia nel mio account", importNo: "Scarta", account: "Account"
    }
  };

  const memory = new Map();
  const pending = new Map();
  let mode = "local";
  let user = null;
  let loaded = false;
  let discarding = false;
  let flushTimer = null;
  let flushPromise = null;
  let statusEl = null;
  let reloginPromise = null;

  const api = {
    mode: () => mode,
    user: () => user,
    get(key) {
      if (mode === "server") {
        return memory.has(key) ? memory.get(key) : null;
      }
      return localGet(key);
    },
    set(key, value) {
      const text = String(value);
      if (mode === "server") {
        // Never write before the account's data is loaded, or after the user changed.
        if (!loaded || discarding) {
          return;
        }
        memory.set(key, text);
        pending.set(key, text);
        scheduleFlush(FLUSH_DELAY_MS);
        return;
      }
      localSet(key, text);
    },
    flush: () => flush(),
    ready: null
  };
  window.WPHStorage = api;
  api.ready = start();

  async function start() {
    await domReady();
    // server/server.js marks the page it serves; static hosts never call the API.
    const marker = document.querySelector('meta[name="wph-server"]');
    if (location.protocol === "file:" || !marker) {
      return "local";
    }
    mode = "server";
    document.documentElement.classList.add("wph-server-mode");
    // On a server page there is no silent fallback to browser storage: retry until
    // the session and the account's data are loaded.
    for (;;) {
      try {
        const session = await request("GET", "session", undefined, { timeoutMs: 15000 });
        user = session.user || await showLogin();
        await loadItems();
        await offerLocalImport();
        break;
      } catch (error) {
        await showServerError();
      }
    }
    loaded = true;
    renderAccountBar();
    window.addEventListener("pagehide", flushWithKeepalive);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    });
    return "server";
  }

  async function loadItems() {
    const { items } = await request("GET", "storage", undefined, { timeoutMs: 15000 });
    memory.clear();
    Object.entries(items || {}).forEach(([key, value]) => memory.set(key, value));
  }

  // ---- background writes -------------------------------------------------

  function scheduleFlush(delay) {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, delay);
    setStatus("saving");
  }

  // Resolves true once everything is saved, false if saving has to be retried later.
  // Concurrent callers share the same run, so nobody returns while a save is in flight.
  function flush() {
    clearTimeout(flushTimer);
    if (!flushPromise) {
      flushPromise = runFlush().finally(() => {
        flushPromise = null;
      });
    }
    return flushPromise;
  }

  async function runFlush() {
    let rejected = false;
    while (pending.size && !discarding) {
      const [key, value] = pending.entries().next().value;
      try {
        await request("PUT", `storage/${encodeURIComponent(key)}`, { value }, { timeoutMs: 30000 });
        if (pending.get(key) === value) {
          pending.delete(key);
        }
      } catch (error) {
        if (error.status === 401) {
          await relogin();
          continue;
        }
        if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
          // Permanent rejection (e.g. too large): drop this value so later keys still save.
          console.warn(`PaintHelper: Speichern von ${key} abgelehnt (${error.status}).`);
          if (pending.get(key) === value) {
            pending.delete(key);
          }
          rejected = true;
          continue;
        }
        setStatus("offline");
        clearTimeout(flushTimer);
        flushTimer = setTimeout(flush, RETRY_DELAY_MS);
        return false;
      }
    }
    setStatus(rejected ? "rejected" : "saved");
    return !pending.size;
  }

  // Last resort when the page is closed: hand the unsaved values to the browser.
  function flushWithKeepalive() {
    if (!pending.size || discarding) {
      return;
    }
    let budget = 60000;
    for (const [key, value] of pending.entries()) {
      const body = JSON.stringify({ value });
      const size = new Blob([body]).size;
      const keepalive = size <= budget;
      if (keepalive) {
        budget -= size;
      }
      try {
        fetch(`${API}storage/${encodeURIComponent(key)}`, {
          method: "PUT",
          credentials: "same-origin",
          keepalive,
          headers: { "Content-Type": "application/json", "X-WPH-Request": "1" },
          body
        }).catch(() => {});
      } catch (error) {
        // Best effort while the page closes.
      }
    }
  }

  async function relogin() {
    if (!reloginPromise) {
      reloginPromise = showLogin(t("sessionExpired")).then(name => {
        reloginPromise = null;
        if (name !== user) {
          // A different person signed in: the queued edits belong to the previous user.
          discardAndReload();
          return new Promise(() => {});
        }
        return name;
      });
    }
    return reloginPromise;
  }

  function discardAndReload() {
    discarding = true;
    pending.clear();
    clearTimeout(flushTimer);
    window.removeEventListener("pagehide", flushWithKeepalive);
    location.reload();
  }

  // ---- UI ----------------------------------------------------------------

  function showLogin(message) {
    return new Promise(resolve => {
      const dialog = openDialog(`
        <h2>${esc(t("signIn"))}</h2>
        <p class="wph-auth-hint">${esc(message || t("signInHint"))}</p>
        <form class="wph-auth-form" novalidate>
          <label>${esc(t("username"))}
            <input name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required value="${esc(user || "")}">
          </label>
          <label>${esc(t("password"))}
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <p class="wph-auth-error" role="alert" hidden></p>
          <button type="submit">${esc(t("signIn"))}</button>
        </form>`);
      const form = dialog.querySelector("form");
      const error = dialog.querySelector(".wph-auth-error");
      form.querySelector(user ? "[name=password]" : "[name=username]").focus();
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = form.querySelector("button");
        button.disabled = true;
        error.hidden = true;
        try {
          const result = await request("POST", "login", {
            username: form.username.value,
            password: form.password.value
          });
          closeDialog(dialog);
          resolve(result.user);
        } catch (failure) {
          error.textContent = failure.status === 401 ? t("wrongLogin")
            : failure.status === 429 ? t("tooMany") : t("serverError");
          error.hidden = false;
          form.password.select();
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function showChangePassword() {
    const dialog = openDialog(`
      <h2>${esc(t("changePassword"))}</h2>
      <form class="wph-auth-form" novalidate>
        <input name="username" autocomplete="username" value="${esc(user)}" hidden>
        <label>${esc(t("currentPassword"))}
          <input name="currentPassword" type="password" autocomplete="current-password" required>
        </label>
        <label>${esc(t("newPassword"))}
          <input name="newPassword" type="password" autocomplete="new-password" minlength="8" required>
        </label>
        <label>${esc(t("repeatPassword"))}
          <input name="repeatPassword" type="password" autocomplete="new-password" minlength="8" required>
        </label>
        <p class="wph-auth-error" role="alert" hidden></p>
        <div class="wph-auth-actions">
          <button type="button" class="secondary" data-action="cancel">${esc(t("cancel"))}</button>
          <button type="submit">${esc(t("save"))}</button>
        </div>
      </form>`, true);
    const form = dialog.querySelector("form");
    const error = dialog.querySelector(".wph-auth-error");
    form.currentPassword.focus();
    form.querySelector("[data-action=cancel]").addEventListener("click", () => closeDialog(dialog));
    form.addEventListener("submit", async event => {
      event.preventDefault();
      error.hidden = true;
      if (form.newPassword.value !== form.repeatPassword.value) {
        error.textContent = t("passwordMismatch");
        error.hidden = false;
        return;
      }
      try {
        await request("POST", "password", {
          currentPassword: form.currentPassword.value,
          newPassword: form.newPassword.value
        });
        closeDialog(dialog);
        flashStatus(t("passwordChanged"));
      } catch (failure) {
        error.textContent = failure.code === "wrong_password" ? t("wrongPassword")
          : failure.code === "weak_password" ? t("weakPassword") : t("serverError");
        error.hidden = false;
      }
    });
  }

  function offerLocalImport() {
    const localItems = readLocalItems();
    if (memory.size || !Object.keys(localItems).length) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const dialog = openDialog(`
        <h2>${esc(t("importTitle"))}</h2>
        <p class="wph-auth-hint">${esc(t("importText"))}</p>
        <div class="wph-auth-actions">
          <button type="button" class="secondary" data-action="no">${esc(t("importNo"))}</button>
          <button type="button" data-action="yes">${esc(t("importYes"))}</button>
        </div>`);
      dialog.querySelector("[data-action=yes]").focus();
      dialog.querySelector("[data-action=no]").addEventListener("click", () => {
        // The data belongs to nobody's account; drop it so it isn't offered to others.
        Object.keys(localItems).forEach(key => localRemove(key));
        closeDialog(dialog);
        resolve();
      });
      dialog.querySelector("[data-action=yes]").addEventListener("click", async () => {
        closeDialog(dialog);
        try {
          const result = await request("POST", "storage/import", { items: localItems });
          (result.keys || []).forEach(key => localRemove(key));
          await loadItems();
          resolve();
        } catch (error) {
          // Keep the local copy; the caller shows the retry screen.
          reject(error);
        }
      });
    });
  }

  function renderAccountBar() {
    const bar = document.createElement("div");
    bar.className = "wph-account";
    fillAccountBar(bar);
    // Close the account menu after an action and when clicking elsewhere.
    document.addEventListener("click", event => {
      const menu = bar.querySelector(".wph-account-menu");
      if (menu && menu.open && !menu.contains(event.target)) {
        menu.open = false;
      }
    });
    bar.addEventListener("click", event => {
      const action = event.target.closest("[data-action]");
      const menu = bar.querySelector(".wph-account-menu");
      if (action && menu) {
        menu.open = false;
      }
      if (action && action.dataset.action === "password") {
        showChangePassword();
      } else if (action && action.dataset.action === "logout") {
        logout();
      }
    });
    const anchor = document.querySelector(".header-utility .language-control");
    if (anchor) {
      anchor.parentNode.insertBefore(bar, anchor);
    } else {
      document.body.prepend(bar);
    }
    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
      languageSelect.addEventListener("change", () => setTimeout(() => fillAccountBar(bar), 0));
    }
  }

  function fillAccountBar(bar) {
    bar.innerHTML = `
      <span class="wph-account-status" aria-live="polite"></span>
      <details class="wph-account-menu">
        <summary aria-label="${esc(t("account"))}: ${esc(user)}"><span aria-hidden="true">👤</span> <span class="wph-account-user">${esc(user)}</span></summary>
        <div class="wph-account-panel">
          <span class="wph-account-signed">${esc(t("signedInAs"))} <strong>${esc(user)}</strong></span>
          <button type="button" class="secondary" data-action="password">${esc(t("changePassword"))}</button>
          <button type="button" class="secondary" data-action="logout">${esc(t("signOut"))}</button>
        </div>
      </details>`;
    bar.setAttribute("aria-label", t("account"));
    statusEl = bar.querySelector(".wph-account-status");
    setStatus(pending.size ? "saving" : "saved");
  }

  async function logout() {
    const saved = await flush();
    if (!saved && !await confirmUnsaved()) {
      return;
    }
    discarding = true;
    pending.clear();
    try {
      await request("POST", "logout", {});
    } catch (error) {
      // Reload anyway; the session cookie expires on the server side.
    }
    location.reload();
  }

  function showServerError() {
    return new Promise(resolve => {
      const dialog = openDialog(`
        <h2>${esc(t("serverErrorTitle"))}</h2>
        <p class="wph-auth-hint">${esc(t("serverError"))}</p>
        <div class="wph-auth-actions">
          <button type="button" data-action="retry">${esc(t("retry"))}</button>
        </div>`);
      const button = dialog.querySelector("[data-action=retry]");
      button.focus();
      button.addEventListener("click", () => {
        closeDialog(dialog);
        resolve();
      });
    });
  }

  function confirmUnsaved() {
    return new Promise(resolve => {
      const dialog = openDialog(`
        <h2>${esc(t("unsavedTitle"))}</h2>
        <p class="wph-auth-hint">${esc(t("unsavedText"))}</p>
        <div class="wph-auth-actions">
          <button type="button" class="secondary" data-action="signout">${esc(t("signOutAnyway"))}</button>
          <button type="button" data-action="stay">${esc(t("stay"))}</button>
        </div>`, true);
      dialog.querySelector("[data-action=stay]").focus();
      dialog.addEventListener("click", event => {
        const action = event.target.closest("[data-action]");
        if (action) {
          closeDialog(dialog);
          resolve(action.dataset.action === "signout");
        }
      });
    });
  }

  function setStatus(state) {
    if (!statusEl) {
      return;
    }
    statusEl.dataset.state = state;
    statusEl.textContent = t(state);
  }

  function flashStatus(text) {
    if (statusEl) {
      statusEl.textContent = text;
      setTimeout(() => setStatus(pending.size ? "saving" : "saved"), 3000);
    }
  }

  function openDialog(html, dismissable) {
    const overlay = document.createElement("div");
    overlay.className = "wph-auth-overlay";
    overlay.innerHTML = `<div class="wph-auth-card" role="dialog" aria-modal="true">
      <p class="wph-auth-brand">Warhammer Paint Helper</p>${html}</div>`;
    if (dismissable) {
      overlay.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          closeDialog(overlay);
        }
      });
    }
    document.body.appendChild(overlay);
    document.documentElement.classList.add("wph-auth-open");
    return overlay;
  }

  function closeDialog(overlay) {
    overlay.remove();
    if (!document.querySelector(".wph-auth-overlay")) {
      document.documentElement.classList.remove("wph-auth-open");
    }
  }

  // ---- helpers -----------------------------------------------------------

  async function request(method, path, body, options = {}) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller && options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : null;
    try {
      const headers = { "X-WPH-Request": "1" };
      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
      }
      const response = await fetch(API + path, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller ? controller.signal : undefined
      });
      const type = response.headers.get("Content-Type") || "";
      const data = type.includes("application/json") ? await response.json() : null;
      if (!response.ok) {
        const error = new Error((data && data.error) || response.statusText);
        error.status = response.status;
        error.code = data && data.code;
        throw error;
      }
      return data;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  function readLocalItems() {
    const items = {};
    try {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(LOCAL_PREFIX)) {
          items[key] = window.localStorage.getItem(key);
        }
      }
    } catch (error) {
      return {};
    }
    return items;
  }

  function localGet(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function localSet(key, value) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      // Storage may be full or blocked.
    }
  }

  function localRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Ignore.
    }
  }

  function language() {
    const stored = (mode === "server" ? memory.get("wph.language") : localGet("wph.language"))
      || navigator.language || "en";
    const short = String(stored).slice(0, 2).toLowerCase();
    return TEXT[short] ? short : "en";
  }

  function t(key) {
    return TEXT[language()][key] || TEXT.en[key] || key;
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch]);
  }

  function domReady() {
    return document.readyState === "loading"
      ? new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, { once: true }))
      : Promise.resolve();
  }
}());
