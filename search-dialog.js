const { ipcRenderer } = require('electron');

function triggerSearch() {
	const query = document.getElementById('query').value.trim();
	ipcRenderer.send('search-files', query);
}

document.addEventListener('DOMContentLoaded', () => {
    // 自动将焦点设置到 ID 为 x 的输入框
    const inputBox = document.getElementById('query');
    if (inputBox) {
        inputBox.focus();
    }
});


document.getElementById('query').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 防止回车键产生默认行为
	triggerSearch();
    }
});

document.getElementById('query').addEventListener('input', () => {
    debounce(triggerSearch, 500)();
});


// Handle search button click
document.getElementById('search').addEventListener('click', () => {
    triggerSearch();
});

function openFile(filePath) {
    ipcRenderer.send('open-file', filePath);
}

// Listen for search results from the main process
ipcRenderer.on('search-results', (event, results) => {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = results.map(result => `
        <div>
            <div class="title"><strong>[<a href='#' onclick="openFile('${result.file}');return false;">${result.file}</a>] <span class='title-content'>${result.title}</span></strong></div>
            <div class="snippet">${result.content}</div>
        </div>
        <hr>
    `).join('');
});

function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}
