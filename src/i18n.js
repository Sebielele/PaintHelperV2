// Translator for PaintHelperV2. The texts live in src/i18n/<language>.js, one file per
// language; in the browser those files load first and register themselves in WPH_LOCALES.
(function (root, factory) {
  const isNode = typeof module !== "undefined" && module.exports;
  const locales = isNode
    ? { en: require("./i18n/en.js"), fr: require("./i18n/fr.js"), de: require("./i18n/de.js"), es: require("./i18n/es.js"), it: require("./i18n/it.js") }
    : (root.WPH_LOCALES || {});
  const api = factory(locales);
  root.WPH = Object.assign(root.WPH || {}, api);
  if (isNode) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function (locales) {
  "use strict";

  const LANGUAGE_KEYS = ["en", "fr", "de", "es", "it"];
  const TRANSLATIONS = {};
  LANGUAGE_KEYS.forEach(language => {
    TRANSLATIONS[language] = locales[language] || {};
  });

  function getByPath(source, path) {
    return path.split(".").reduce((value, part) => {
      if (value && Object.prototype.hasOwnProperty.call(value, part)) {
        return value[part];
      }
      return undefined;
    }, source);
  }

  function interpolate(value, params) {
    if (typeof value !== "string" || !params) {
      return value;
    }
    return value.replace(/\{(\w+)\}/g, (match, key) => (
      Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
    ));
  }

  function createTranslator(language) {
    const lang = LANGUAGE_KEYS.includes(language) ? language : "en";
    return function translate(path, params) {
      const translated = getByPath(TRANSLATIONS[lang], path);
      const fallback = getByPath(TRANSLATIONS.en, path);
      const value = translated === undefined ? fallback : translated;
      return interpolate(value === undefined ? path : value, params);
    };
  }

  function hasLanguage(language) {
    return LANGUAGE_KEYS.includes(language);
  }

  return {
    LANGUAGE_KEYS,
    TRANSLATIONS,
    createTranslator,
    hasLanguage
  };
}));
