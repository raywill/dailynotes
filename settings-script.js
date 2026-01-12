let labels = [];
let files = [];
let myConfigPath = "";

// Initialize i18n and populate language selector
async function initializeI18n() {
  const availableLocales = await window.electronAPI.getAvailableLocales();
  const localeNames = await window.electronAPI.getLocaleNames();
  
  const languageSelect = document.getElementById('language');
  
  // Clear existing options except the first one (auto)
  const firstOption = languageSelect.firstChild;
  languageSelect.innerHTML = '';
  languageSelect.appendChild(firstOption);
  
  // Add available languages
  availableLocales.forEach(locale => {
    const option = document.createElement('option');
    option.value = locale;
    option.textContent = localeNames[locale] || locale;
    languageSelect.appendChild(option);
  });
}

// Listen for config path from main process
window.electronAPI.onConfigPath(async (path) => {
  console.log("Setting window: path:", path);

  myConfigPath = path;
  
  // Initialize i18n and populate language selector
  await initializeI18n();
  
  // Load config via fetch since we don't have direct fs access
  console.log("Setting window: path:", path);

  myConfigPath = path;
  // Load config via fetch since we don't have direct fs access
  fetch(`file://${path}`)
    .then(response => response.text())
    .then(data => {
      const jsonData = JSON.parse(data);

      console.log(jsonData);

      // 填充 labels
      jsonData.labels.split(",").forEach((label) => {
        if (label) {
          addLabel(label.trim());
        }
      });

      // 填充 writer
      const writerElement = document.getElementById("writer");
      const customWriterElement = document.getElementById("custom-writer");

      writerElement.innerHTML = `
          <option value="txt">txt</option>
          <option value="md">md</option>
      `;

      if (
        jsonData.writer &&
        jsonData.writer !== "txt" &&
        jsonData.writer !== "md"
      ) {
        const option = document.createElement("option");
        option.value = jsonData.writer;
        option.textContent = jsonData.writer;
        writerElement.appendChild(option);
        writerElement.value = jsonData.writer; // 选中自定义类型
      } else {
        writerElement.value = jsonData.writer || "txt"; // 默认值为 'txt'
      }

      // 最后添加自定义选项
      const customOption = document.createElement("option");
      customOption.value = "custom";
      customOption.textContent = "Customize...";
      writerElement.appendChild(customOption);

      // 显示自定义输入框
      customWriterElement.value =
        jsonData.writer === "custom" ? jsonData.custom_writer || "" : "";
      customWriterElement.style.display =
        jsonData.writer === "custom" ? "block" : "none";

      // 填充 template
      document.getElementById("template").value = jsonData.template || "";
      
      // Set language selection
      if (jsonData.language) {
        const languageSelect = document.getElementById('language');
        languageSelect.value = jsonData.language;
      }
      
      // Set notes directory
      if (jsonData.notesDir) {
        document.getElementById("notes-directory").value = jsonData.notesDir;
      }
      
      let userDefinedFiles = jsonData.user_defined_file.split(/[,;]/).filter(item => item.trim() !== '');
      // 填充 user defined files
      userDefinedFiles.forEach((file) => {
        if (file) {
          addFile(file.trim());
        }
      });
      // document.getElementById("setting-file-path").innerHTML = myConfigPath;

    })
    .catch(error => {
      console.error("Error loading config:", error);
    });
});

// Update all elements with data-i18n attributes
async function updateI18nElements() {
  const elements = document.querySelectorAll('[data-i18n]');
  for (const element of elements) {
    const key = element.getAttribute('data-i18n');
    let translation = await window.electronAPI.getTranslation(key);
    
    // Check if there's a placeholder attribute
    const placeholderAttr = element.getAttribute('data-i18n-placeholder');
    if (placeholderAttr) {
      element.placeholder = await window.electronAPI.getTranslation(placeholderAttr);
    } else {
      element.textContent = translation;
    }
  }
}

// Tab switching functionality
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab content
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Activate selected tab
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

window.onload = async function () {
  // Initialize i18n elements
  setTimeout(updateI18nElements, 100); // Small delay to ensure DOM is loaded
};

// Add event listener for language change
if (document.getElementById('language')) {
  document.getElementById('language').addEventListener('change', updateI18nElements);
}

// Listen for language change from main process
window.addEventListener('DOMContentLoaded', (event) => {
  if (window.electronAPI && window.electronAPI.onLanguageChange) {
    window.electronAPI.onLanguageChange((newLocale) => {
      updateI18nElements();
    });
  }
});

function addLabel(existingLabel = "") {
  const labelDiv = document.createElement("div");
  labelDiv.className = "label-item";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Label";
  nameInput.value = existingLabel.split(" ")[0] || "";

  const timeSelect = document.createElement("select");
  ["5 days", "weekly", "monthly", "quarterly", "yearly"].forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    if (existingLabel.includes(time)) {
      option.selected = true;
    }
    timeSelect.appendChild(option);
  });

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = () => {
    labelDiv.remove();
  };

  labelDiv.appendChild(nameInput);
  labelDiv.appendChild(timeSelect);
  labelDiv.appendChild(deleteButton);

  document.getElementById("labels").appendChild(labelDiv);
}

function addFile(existingFile = "") {
  const fileDiv = document.createElement("div");
  fileDiv.className = "file-item";

  const fileInput = document.createElement("input");
  fileInput.placeholder = "File Name";
  fileInput.value = existingFile || "";

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = () => {
    fileDiv.remove();
  };

  fileDiv.appendChild(fileInput);
  fileDiv.appendChild(deleteButton);

  document.getElementById("files").appendChild(fileDiv);
}

function getJsonData() {
  const labelsArray = Array.from(document.querySelectorAll(".label-item"))
    .map((label) => {
      const name = label.children[0].value;
      const time = label.children[1].value;
      return name ? `${name} ${time}` : null; // 忽略空标签
    })
    .filter(Boolean)
    .join(",");

  const filesArray = Array.from(document.querySelectorAll(".file-item"))
    .map((file) => {
      return file.children[0].value;
    })
    .filter((fileName) => fileName)
    .join(","); // 忽略空文件名

  const writerSelect = document.getElementById("writer");
  const customWriterInput = document.getElementById("custom-writer");
  const writerValue =
    writerSelect.value === "custom" && customWriterInput.value
      ? customWriterInput.value
      : writerSelect.value;

  // 处理 template 内容
  let templateValue = document.getElementById("template").value;
  templateValue = templateValue.replace(/#(\S)/g, "# $1"); // 在 # 和随后的文本之间添加空格

  const jsonData = {
    labels: labelsArray,
    writer: writerValue,
    template: templateValue,
    user_defined_file: filesArray,
    language: document.getElementById('language').value,
    notesDir: document.getElementById('notes-directory').value,
  };
  /*
		// test only, save to local file

    const jsonString = JSON.stringify(jsonData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
*/
  return jsonData;
}

function saveJson() {
  const jsonData = this.getJsonData();
  window.electronAPI.saveSettings(jsonData);
  window.close();
}

function exportJson() {
  const jsonData = this.getJsonData();
  window.electronAPI.exportSettings(jsonData);
}

function cancel() {
  window.close();
}

// 监听 writer 的变化
document.getElementById("writer").addEventListener("change", function () {
  const customWriterInput = document.getElementById("custom-writer");
  customWriterInput.style.display = this.value === "custom" ? "block" : "none";
});

// 添加目录按钮事件监听器
if (document.getElementById('browse-directory-btn')) {
  document.getElementById('browse-directory-btn').addEventListener('click', async () => {
    const result = await window.electronAPI.selectDirectory();
    if (result && result.path) {
      document.getElementById("notes-directory").value = result.path;
    }
  });
}

if (document.getElementById('open-directory-btn')) {
  document.getElementById('open-directory-btn').addEventListener('click', () => {
    const dirPath = document.getElementById("notes-directory").value;
    if (dirPath) {
      window.electronAPI.openDirectory(dirPath);
    }
  });
}
