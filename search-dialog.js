function triggerSearch() {
  const query = document.getElementById("query").value.trim();
  window.electronAPI.searchFiles(query);
}

document.addEventListener("DOMContentLoaded", () => {
  // 自动将焦点设置到 ID 为 x 的输入框
  const inputBox = document.getElementById("query");
  if (inputBox) {
    inputBox.focus();
  }
});

document.getElementById("query").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // 防止回车键产生默认行为
    triggerSearch();
  }
});

document.getElementById("query").addEventListener("input", () => {
  debounce(triggerSearch, 500)();
});

// Handle search button click
document.getElementById("search").addEventListener("click", () => {
  triggerSearch();
});

function openFile(filePath) {
  window.electronAPI.openSearchFile(filePath);
}

// Listen for search results from the main process
window.electronAPI.onSearchResults((results) => {
  const resultContainer = document.getElementById("result");
  resultContainer.innerHTML = results
    .map(
      (result) => `
        <div>
            <div class="title"><strong>[<a href='#' onclick="openFile('${result.file}');return false;">${result.file}</a>] <span class='title-content'>${result.title}</span></strong></div>
            <div class="snippet">${result.content}</div>
        </div>
        <hr>
    `,
    )
    .join("");
});

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Update all elements with data-i18n attributes
async function updateI18nElements() {
  const elements = document.querySelectorAll('[data-i18n]');
  for (const element of elements) {
    const key = element.getAttribute('data-i18n');
    if (key.startsWith('placeholder=')) {
      const placeholderKey = key.substring(10); // Remove 'placeholder='
      element.placeholder = await window.electronAPI.getTranslation(placeholderKey);
    } else {
      element.textContent = await window.electronAPI.getTranslation(key);
    }
  }
}

// Listen for language change from main process
window.addEventListener('DOMContentLoaded', (event) => {
  if (window.electronAPI && window.electronAPI.onLanguageChange) {
    window.electronAPI.onLanguageChange((newLocale) => {
      updateI18nElements();
    });
  }
});

// Initialize i18n elements on load
setTimeout(updateI18nElements, 100); // Small delay to ensure DOM is loaded
