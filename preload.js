const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Settings window APIs
  onConfigPath: (callback) => {
    ipcRenderer.on("config-settings-path", (event, path) => callback(path));
  },
  saveSettings: (data) => {
    ipcRenderer.send("save-settings-data", data);
  },
  exportSettings: (data) => {
    ipcRenderer.send("export-settings-data", data);
  },

  // Search window APIs
  searchFiles: (query) => {
    ipcRenderer.send("search-files", query);
  },
  onSearchResults: (callback) => {
    ipcRenderer.on("search-results", (event, results) => callback(results));
  },
  openSearchFile: (fileName) => {
    ipcRenderer.send("open-search-file", fileName);
  },
  
  // I18n APIs
  initI18n: async (locale) => {
    return await ipcRenderer.invoke('init-i18n', locale);
  },
  getTranslation: async (key, params = {}) => {
    return await ipcRenderer.invoke('get-translation', key, params);
  },
  getAvailableLocales: async () => {
    return await ipcRenderer.invoke('get-available-locales');
  },
  getLocaleNames: async () => {
    return await ipcRenderer.invoke('get-locale-names');
  },
  getCurrentLocale: async () => {
    return await ipcRenderer.invoke('get-current-locale');
  },
  
  // Language change listener
  onLanguageChange: (callback) => {
    ipcRenderer.on('language-changed', (event, newLocale) => callback(newLocale));
  },
  
  // Directory operations
  selectDirectory: async () => {
    return await ipcRenderer.invoke('select-directory');
  },
  openDirectory: (dirPath) => {
    ipcRenderer.send('open-directory', dirPath);
  }
});
