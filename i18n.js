const fs = require("fs");
const path = require("path");
const { app } = require("electron");

class I18n {
  constructor() {
    this.currentLocale = "en";
    this.translations = {};
    this.localesDir = path.join(__dirname, "locales");
  }

  // Initialize with system locale or config locale
  init(configLocale) {
    // Priority: config > system > default (en)
    if (configLocale && configLocale !== "auto") {
      this.currentLocale = configLocale;
    } else {
      // Get system locale
      const systemLocale = app.getLocale(); // e.g., "zh-CN", "en-US"
      const langCode = systemLocale.split("-")[0]; // e.g., "zh", "en"
      
      // Check if we have this locale
      const localePath = path.join(this.localesDir, `${langCode}.json`);
      if (fs.existsSync(localePath)) {
        this.currentLocale = langCode;
      } else {
        this.currentLocale = "en"; // fallback
      }
    }

    this.loadTranslations();
    return this.currentLocale;
  }

  loadTranslations() {
    const localePath = path.join(this.localesDir, `${this.currentLocale}.json`);
    const fallbackPath = path.join(this.localesDir, "en.json");

    try {
      this.translations = JSON.parse(fs.readFileSync(localePath, "utf8"));
    } catch (err) {
      console.warn(`Failed to load locale ${this.currentLocale}, falling back to English`);
      try {
        this.translations = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
        this.currentLocale = "en";
      } catch (e) {
        console.error("Failed to load fallback locale:", e);
        this.translations = {};
      }
    }
  }

  // Get translation by key path (e.g., "menu.search")
  t(keyPath, params = {}) {
    const keys = keyPath.split(".");
    let value = this.translations;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        console.warn(`Translation not found: ${keyPath}`);
        return keyPath; // Return key path as fallback
      }
    }

    if (typeof value !== "string") {
      return keyPath;
    }

    // Replace template variables {{var}}
    return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  // Get current locale
  getLocale() {
    return this.currentLocale;
  }

  // Set locale and reload translations
  setLocale(locale) {
    this.currentLocale = locale;
    this.loadTranslations();
  }

  // Get available locales
  getAvailableLocales() {
    try {
      const files = fs.readdirSync(this.localesDir);
      return files
        .filter(f => f.endsWith(".json"))
        .map(f => f.replace(".json", ""));
    } catch (err) {
      return ["en"];
    }
  }

  // Get locale display names
  getLocaleNames() {
    return {
      "en": "English",
      "zh": "中文"
    };
  }
}

// Singleton instance
const i18n = new I18n();

module.exports = i18n;
