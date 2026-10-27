// Applies the saved light/dark choice before the page is painted (no flash).
(function () {
  "use strict";
  try {
    const theme = window.localStorage.getItem("wph-ui.theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
  } catch (error) {
    // Storage blocked: follow the device setting.
  }
}());
