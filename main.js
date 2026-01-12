const {
  app,
  dialog,
  ipcMain,
  clipboard,
  shell,
  Tray,
  Menu,
  BrowserWindow,
  systemPreferences,
} = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const i18n = require("./i18n");

const iconPath = path.join(__dirname, "icon.png");
let appIcon = null;
let settingWindow = null;
let searchWindow = null;

app.allowRendererProcessReuse = true;

var dirName = path.join(app.getPath("documents"), "DailyNotes");
var configName = path.join(app.getPath("userData"), "config.json");
var tempDirName = app.getPath("temp");
var fileExtension = "md"; // default file format
var newPageTemplate = ""; // default page template, such as '##todo work for today'
var userDefinedFiles = [];
var lastFile = ""; // remember last opened file. activate it again when click app icon

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDeltaDate(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDeltaDateWithWeekDay(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const weekdayKeys = [
    "weekdays.sunday",
    "weekdays.monday",
    "weekdays.tuesday",
    "weekdays.wednesday",
    "weekdays.thursday",
    "weekdays.friday",
    "weekdays.saturday",
  ];
  const weekday = i18n.t(weekdayKeys[date.getDay()]);
  return `${year}-${month}-${day} (${weekday})`;
}

function getDeltaWeekDay(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  return date.getDay();
}

var openTextFile = function (fName) {
  var fileName = path.join(dirName, fName);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
    var firstWord =
      "\n" + i18n.t("welcome.noteTitle") + "\n\n" +
      i18n.t("welcome.intro1") + "\n" +
      i18n.t("welcome.intro2") + "\n" +
      i18n.t("welcome.intro3") + "\n" +
      "\n" +
      "\n" +
      i18n.t("welcome.todoTitle") + "\n" +
      "\n" +
      i18n.t("welcome.todo1") + "\n" +
      i18n.t("welcome.todo2") + "\n" +
      i18n.t("welcome.todo3") + "\n" +
      i18n.t("welcome.todo4") + "\n" +
      i18n.t("welcome.todo5") + "\n" +
      i18n.t("welcome.todo6") + "\n" +
      i18n.t("welcome.todo7") + "\n" +
      i18n.t("welcome.todo8") + "\n" +
      i18n.t("welcome.todo9") + "\n" +
      i18n.t("welcome.todo10") + "\n" +
      "\n" +
      "\n" +
      i18n.t("welcome.typoraNote") + "\n" +
      "\n" +
      "\n" +
      i18n.t("welcome.beginWork") + "\n";
    fs.writeFileSync(fileName, firstWord, "utf8");
  }
  
  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, newPageTemplate, "utf8");
  }
  shellOpenPath(fileName);
};

// Telemetry disabled for App Store compliance

var shellOpenPath = function (fileName) {
  shell.openPath(fileName);
  lastFile = fileName;
};

var openLastOpenedFile = function () {
  if (false && lastFile != "") {
    shell.openPath(lastFile);
  } else {
    openDailyFile();
  }
};

var openDailyFile = function () {
  var fName = getCurrentDate() + "." + fileExtension;
  openTextFile(fName);
};

var openDailyFileLast = function () {
  var maxFindOffset = -30;
  var found = false;
  for (var i = -1; !found && i >= maxFindOffset; --i) {
    var fName = getDeltaDate(i) + "." + fileExtension;
    var fileName = path.join(dirName, fName);
    console.warn(fileName);
    if (fs.existsSync(fileName)) {
      found = true;
      openTextFile(fName);
    }
  }
};

var openUserDefinedFile = function (fileNamePrefix) {
  var fName = fileNamePrefix + "." + fileExtension;
  openTextFile(fName);
};

var writeAndOpenReportFile = function (fNamePrefix, content) {
  var reportDirName = dirName;
  // var reportDirName = tempDirName;
  var fName = fNamePrefix + ".md";
  var fileName = path.join(reportDirName, fName);
  
  if (!fs.existsSync(reportDirName)) {
    console.warn(i18n.t("dialog.selectNotesDirectory"));
    return;
  }
  
  fs.writeFileSync(fileName, content, "utf8");
  shellOpenPath(fileName);
};

var readFile = function (fileName, cb) {
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.warn(i18n.t("dialog.selectNotesDirectory"));
    } else {
      cb(data);
    }
  });
};

var getContent = function (type, cb) {
  readFile(fileName, function (data) {
    cb(data);
  });
};

var openLastDaysSummary = function (delta) {
  var results = "";
  let offset = 0 - delta;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map((file) => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });
      for (var i = 0; i >= offset; --i) {
        var date = getDeltaDate(i);
        var dateReadable = getDeltaDateWithWeekDay(i);
        if (fileMap.has(date)) {
          fileMap.get(date).forEach((fName) => {
            var fileName = path.join(dirName, fName);
            try {
              var content = fs.readFileSync(fileName, "utf8");
              var regex = new RegExp("#+\\s*" + "([\\s\\S]*?)(?=\n#|$)", "g");
              let match;
              let matched = false;
              let dayResults = "";
              while ((match = regex.exec(content)) !== null) {
                dayResults += "## " + match[1].trim() + "\n\n";
                matched = true;
              }
              if (matched) {
                results +=
                  "# [" +
                  dateReadable +
                  "](" +
                  fileName +
                  ")\n\n" +
                  dayResults +
                  "\n\n";
              }
            } catch {
              // file may not exist
              console.log("exception");
            }
          });
        }
      }
    }
    let fNamePrefix = "dailynotes_report"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, results);
  });
};

var openLastWeekSummary = function () {
  openLastDaysSummary(7);
};
var openLastMonthSummary = function () {
  openLastDaysSummary(30);
};

var openListView = function () {
  var results = "";
  var lineResults = "";
  let offset = -180;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map((file) => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });

      results += i18n.t("report.listViewTitle") + "\n\n";
      results += i18n.t("report.listViewTip") + "\n\n";
      results += i18n.t("report.tableHeader") + "\n";
      results += i18n.t("report.tableSeparator") + "\n";
      
      for (var i = 0; i >= offset; i--) {
        var date = getDeltaDate(i);
        var fileResult = "";
        if (fileMap.has(date)) {
          fName = fileMap.get(date)[0];
          var fileName = path.join(dirName, fName);
          var content = fs.readFileSync(fileName, "utf8");
          var regex = new RegExp("(^|\n)#+([\\s\\S]*?)(\n|$)", "g");
          let match;
          while ((match = regex.exec(content)) !== null) {
            var line =
              "|[" + date + "](" + fName + "): " + match[2].trim() + "]\n";
            fileResult = line + fileResult;
          }
          results += fileResult;
        }
      }
    }
    let fNamePrefix = "dailynotes_listview"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, results);
  });
};

var openCalendarView = function () {
  var results = "";
  let offset = -180;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map((file) => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });

      var extFrom = getDeltaWeekDay(offset);
      var extTo = 6 - getDeltaWeekDay(0);
      offset -= extFrom; //align to Sunday
      rest = extTo; // align to Sat

      var rowResults = ""; // used to filter out empty week data
      results += i18n.t("report.calendarViewTitle") + "\n\n";
      results += i18n.t("report.calendarViewTip") + "\n\n";
      results += "| SUN  | MON | TUE | WEN | THU  | FRI | SAT |\n";
      results += "| --- | --- | --- | --- | --- | --- | --- |\n";

      var hasNotes = false;
      for (var i = offset; i <= rest; i += 1) {
        var date = getDeltaDate(i);
        var dateReadable = getDeltaDateWithWeekDay(i);
        rowResults += "| ";
        if (fileMap.has(date)) {
          fName = fileMap.get(date)[0];
          //var fileName = path.join(dirName, fName);
          var fileName = fName;
          rowResults += "[" + date + "](" + fileName + ")";
          hasNotes = true;
        }
        if (i != offset && getDeltaWeekDay(i) == 6) {
          rowResults += "|\n"; // Switch to Next Line in Saturday
          if (hasNotes) {
            results += rowResults;
            hasNotes = false;
          }
          rowResults = "";
        }
      }
    }
    let fNamePrefix = "dailynotes_calendar"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, results);
  });
};

var generateAtSomeoneReport = function (delta) {
  var results = "";
  let offset = 0 - delta;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map((file) => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });
      for (var i = 0; i >= offset; --i) {
        var date = getDeltaDate(i);
        var dateReadable = getDeltaDateWithWeekDay(i);
        if (fileMap.has(date)) {
          fileMap.get(date).forEach((fName) => {
            var fileName = path.join(dirName, fName);
            try {
              var content = fs.readFileSync(fileName, "utf8");
              var regex = new RegExp("#+\\s*" + "([\\s\\S]*?)(?=\n#|$)", "g");
              let match;
              let matched = false;
              let dayResults = "";
              while ((match = regex.exec(content)) !== null) {
                const matchContent = match[1].trim();
                const regexAt = /@([一-龥]{1,20})[s:：$\S]/;
                const matchAt = regexAt.exec(matchContent);
                if (matchAt) {
                  dayResults += "## " + matchContent + "\n\n";
                  matched = true;
                }
              }
              if (matched) {
                results +=
                  "# [" +
                  dateReadable +
                  "](" +
                  fileName +
                  ")\n\n" +
                  dayResults +
                  "\n\n";
              }
            } catch {
              // file may not exist
              console.log("exception");
            }
          });
        }
      }
    }
    let fNamePrefix = "dailynotes_report"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, results);
  });
};

var generateReport = function (type, delta) {
  var results = "";
  let offset = 0 - delta;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map((file) => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });
      for (var i = 0; i >= offset; --i) {
        var date = getDeltaDate(i);
        var dateReadable = getDeltaDateWithWeekDay(i);
        if (fileMap.has(date)) {
          fileMap.get(date).forEach((fName) => {
            var fileName = path.join(dirName, fName);
            try {
              var content = fs.readFileSync(fileName, "utf8");
              var regex = new RegExp(
                "#+\\s*" + type + "([\\s\\S]*?)(?=\n#|$)",
                "g",
              );
              let match;
              let matched = false;
              let dayResults = "";
              while ((match = regex.exec(content)) !== null) {
                dayResults += "## " + type + " " + match[1].trim() + "\n\n";
                matched = true;
              }
              if (matched) {
                results +=
                  "# [" +
                  dateReadable +
                  "](" +
                  fileName +
                  ")\n\n" +
                  dayResults +
                  "\n\n";
              }
            } catch {
              // file may not exist
            }
          });
        }
      }
    }
    let fNamePrefix = "dailynotes_report"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, results);
  });
};

var parseLabels = function (labels) {
  var menuArr = [];
  labels.split(",").forEach((item, index) => {
    item = item.trim();
    var parts = item.split(" ");
    if (parts.length < 2) return;
    var tag = parts[0].replace(/^#+/, "");
    var days = 0;
    switch (parts[1]) {
      case "weekly":
        days = 7;
        break;
      case "monthly":
        days = 30;
        break;
      case "yearly":
        days = 365;
        break;
      default:
        parts.shift();
        if (parts.length == 1) {
          days = parseInt(parts[0], 10);
        } else {
          switch (parts[1]) {
            case "days":
            case "day":
              days = parseInt(parts[0], 10);
              break;
            case "month":
            case "months":
              days = 30 * parseInt(parts[0], 10);
              break;
            case "year":
            case "years":
              days = 365 * parseInt(parts[0], 10);
              break;
            default:
              days = 7;
              break;
          }
        }
        break;
    }
    const menuItem = {
      label: item,
      click: function () {
        generateReport(tag, days);
      },
    };
    menuArr.push(menuItem);
  });
  return menuArr;
};

function createSearchDialog() {
  if (searchWindow) {
    searchWindow.show();
  } else {
    searchWindow = new BrowserWindow({
      width: 900,
      height: 700,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    searchWindow.loadFile("search-dialog.html");
    searchWindow.on("closed", () => {
      searchWindow = null;
    });
  }
}

// begin paste

ipcMain.on("search-files", async (event, query) => {
  const directory = path.join(app.getPath("documents"), "DailyNotes");
  const results = [];

  const files = fs
    .readdirSync(directory)
    .filter(
      (file) =>
        (file.endsWith(".txt") || file.endsWith(".md")) &&
        !file.startsWith("dailynotes_") &&
        query.length > 0,
    )
    .map((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      return { file, mtime: stats.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime) // 按修改时间降序
    .map((entry) => entry.file); // 只取文件名

  for (const file of files) {
    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, "utf8");

    // 按行分隔并处理
    const lines = content.split("\n");
    let currentTitle = "";
    let currentTitleLineNum = 1;
    let currentLines = [];

    lines.forEach((line, index) => {
      lineNum = index + 1;
      if (line.startsWith("# ")) {
        // 处理之前的内容
        if (currentTitle && currentLines.length > 0) {
          processContent(
            file,
            currentTitle,
            currentTitleLineNum,
            currentLines,
            query,
            results,
          );
        }
        // 更新当前标题
        currentTitle = line.substring(2).trim();
        currentTitleLineNum = lineNum;
        currentLines = [];
      } else {
        currentLines.push({ content: line, index: lineNum });
      }
    });

    // 处理最后一部分内容
    if (currentTitle && currentLines.length > 0) {
      processContent(
        file,
        currentTitle,
        currentTitleLineNum,
        currentLines,
        query,
        results,
      );
    }
  }

  event.reply("search-results", formatResults(results, query));
});

function processContent(file, title, titleLineNum, lines, query, results) {
  // 使用 Unicode 支持的正则表达式
  const regex = new RegExp(`(${query})`, "giu"); // 'u' 使正则表达式支持 Unicode，'i' 使匹配不区分大小写，'g' 使匹配全局
  const matches = new Set(); // 使用 Set 来去重

  if (regex.test(title)) {
    // matches.add({content:'', index: titleLineNum});
    matches.add({ content: "", index: titleLineNum });
  }

  lines.forEach((line) => {
    if (regex.test(line.content)) {
      matches.add(line);
    }
  });

  if (matches.size > 0) {
    const result = results.find(
      (r) =>
        r.file === file && r.title === title && r.titleLineNum === titleLineNum,
    );
    if (result) {
      result.matches.push(...matches);
    } else {
      results.push({
        file,
        title,
        titleLineNum,
        matches: Array.from(matches),
      });
    }
  }
}

function formatResults(results, query) {
  return results.map((result) => {
    const { file, title, matches } = result;

    // 对匹配结果进行格式化
    const formattedMatches = matches
      .map((match) => {
        return (
          "<a style='text-decoration:none;color:black;' href='#' onclick=\"openFile('" +
          result.file +
          "');return false;\">" +
          match.content.replace(
            new RegExp(`(${query})`, "giu"),
            `<b style='color:#ea4335'>$1</b>`,
          ) +
          "</a>"
        );
      })
      .join("<br />");

    return {
      file,
      title,
      content: formattedMatches,
    };
  });
}

ipcMain.on("open-search-file", (event, fName) => {
  var filePath = path.join(dirName, fName);
  shellOpenPath(filePath);
});

// end paste
/*
ipcMain.on('close-search-dialog', () => {
    if (searchWindow) {
        searchWindow.close();
    }
});
*/

// I18n APIs for renderer processes
ipcMain.handle('init-i18n', (event, locale) => {
  return i18n.init(locale);
});

ipcMain.handle('get-translation', (event, key, params = {}) => {
  return i18n.t(key, params);
});

ipcMain.handle('get-available-locales', (event) => {
  return i18n.getAvailableLocales();
});

ipcMain.handle('get-locale-names', (event) => {
  return i18n.getLocaleNames();
});

ipcMain.handle('get-current-locale', (event) => {
  return i18n.getLocale();
});

// Directory operation APIs
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    title: i18n.t("dialog.selectNotesDirectory"),
    properties: ["openDirectory", "createDirectory"],
    defaultPath: dirName,
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return { path: result.filePaths[0] };
  }
  return null;
});

ipcMain.on('open-directory', (event, dirPath) => {
  shell.openPath(dirPath);
});

ipcMain.on("save-settings-data", (event, data) => {
  fs.writeFileSync(configName, JSON.stringify(data, null, 2));
  
  // If language changed, update i18n and broadcast to all windows
  if (data.language && data.language !== i18n.getLocale()) {
    i18n.init(data.language);
    
    // Broadcast language change to all windows
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send('language-changed', data.language);
      }
    });
  }
});

ipcMain.on("export-settings-data", (event, data) => {
  var options = {
    title: "Save file",
    defaultPath: "config.json",
    buttonLabel: "Save",
    filters: [
      { name: "json", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  };
  dialog.showSaveDialog(null, options).then(({ filePath }) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });
});

function createSettingWindow() {
  settingWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  settingWindow.loadFile("settings.html");

  // 在窗口加载后发送配置文件路径
  settingWindow.webContents.on("did-finish-load", () => {
    console.log("config window load OK. set config:", configName);
    settingWindow.webContents.send("config-settings-path", configName);
  });

  settingWindow.on("closed", () => {
    settingWindow = null;
  });
}

var initMenu = function (appIcon) {
  var labels = "";
  try {
    const config = JSON.parse(fs.readFileSync(configName));
    if (config) {
      labels = config.labels;
      var needUpgrade = false;
      
      // Load notes directory from config
      if (config.notesDir) {
        dirName = config.notesDir;
      } else {
        // Keep default but save to config
        config.notesDir = dirName;
        needUpgrade = true;
      }
      
      if (config.user_defined_file) {
        // new version - handle both string and array formats
        if (Array.isArray(config.user_defined_file)) {
          userDefinedFiles = config.user_defined_file;
        } else {
          userDefinedFiles = config.user_defined_file.split(/[,;]/).filter(item => item.trim() !== '');
        }
      } else {
        config.user_defined_file = "";
        userDefinedFiles = [];
        needUpgrade = true;
      }
      if (config.writer) {
        // new version
        fileExtension = config.writer;
      } else {
        // upgrade older version
        fileExtension = "md";
        config.writer = "md";
        needUpgrade = true;
      }
      if (config.template) {
        newPageTemplate = config.template;
      } else {
        newPageTemplate = "";
        config.template = "";
        needUpgrade = true;
      }
      
      // Handle language setting
      if (!config.language) {
        config.language = "auto";
        needUpgrade = true;
      }
      
      if (needUpgrade) {
        fs.writeFileSync(configName, JSON.stringify(config, null, 2));
      }
    }
  } catch {
    // Config file doesn't exist or is invalid, create default config
    if (!fs.existsSync(configName)) {
      const data = {};
      labels =
        "#todo weekly,#todo monthly,#note weekly,#note monthly,#meeting 7 days";
      data.labels = labels;
      data.writer = "md";
      data.template = "";
      data.user_defined_file = "";
      data.notesDir = dirName;
      data.language = "auto";  // Add default language setting
      fs.writeFileSync(configName, JSON.stringify(data, null, 2));
    }
    console.log("Config file created or parse failed");
  }
  var menuArr = [];

  menuArr.push({
    label: i18n.t("menu.search"),
    accelerator: "Command+S",
    click: function () {
      createSearchDialog();
    },
  });
  menuArr.push({ type: "separator" });

  menuArr.push(...parseLabels(labels));
  menuArr.push({ type: "separator" });

  menuArr.push({
    label: i18n.t("menu.atSomeone"),
    accelerator: "Command+A",
    click: function () {
      generateAtSomeoneReport(30);
    },
  });
  menuArr.push({
    label: i18n.t("menu.today"),
    click: function () {
      openDailyFile();
    },
  });
  menuArr.push({
    label: i18n.t("menu.lastDay"),
    click: function () {
      openDailyFileLast();
    },
  });
  menuArr.push({
    label: i18n.t("menu.lastWeek"),
    click: function () {
      openLastWeekSummary();
    },
  });
  menuArr.push({
    label: i18n.t("menu.lastMonth"),
    click: function () {
      openLastMonthSummary();
    },
  });
  menuArr.push({ type: "separator" });
  menuArr.push({
    label: i18n.t("menu.listView"),
    click: function () {
      openListView();
    },
  });
  menuArr.push({
    label: i18n.t("menu.calendarView"),
    click: function () {
      openCalendarView();
    },
  });
  /*
  // experimental only
  menuArr.push(
    {
      label: 'grep search',
      click: function() {
        openTerminal();
      }
    }
  );
  */

  if (userDefinedFiles.length > 0) {
    menuArr.push({ type: "separator" });
    userDefinedFiles.forEach((item, index) => {
      menuArr.push({
        label: item,
        click: function () {
          openUserDefinedFile(item);
        },
      });
    });
  }


  /*
  menuArr.push(
    {
      label: 'Config',
      accelerator: 'Command+C',
      click: function() {
        shellOpenPath(configName);
      }
    }
  );
  */
 
  menuArr.push({ type: "separator" });
  menuArr.push({
    label: i18n.t("menu.settings"),
    accelerator: "Command+C",
    click: function () {
      if (!settingWindow) {
        createSettingWindow(); // 创建窗口
      } else {
        settingWindow.focus(); // 如果窗口已存在，则聚焦
      }
    },
  });

  var contextMenu = Menu.buildFromTemplate(menuArr);
  appIcon.setContextMenu(contextMenu);
  //Menu.setApplicationMenu(Menu.buildFromTemplate([{label: 'Quit', selector: 'terminate:', }]))
  //Menu.setApplicationMenu(contextMenu);
  if (process.platform === "darwin") {
    app.dock.setMenu(contextMenu);
  }
};

app.on("ready", function () {
  // Initialize i18n with config locale
  let configLocale = "auto"; // default to auto
  if (fs.existsSync(configName)) {
    try {
      const config = JSON.parse(fs.readFileSync(configName, "utf8"));
      configLocale = config.language || "auto";
    } catch (err) {
      console.log("Failed to read config for locale, using auto");
    }
  }
  i18n.init(configLocale);
  
  appIcon = new Tray(iconPath);
  appIcon.setToolTip(i18n.t("app.tooltipNotesPath", { path: dirName }));
  initMenu(appIcon);
  appIcon.on("click", openDailyFile);
  
  // Watch config file (after initMenu ensures it exists)
  try {
    fs.watch(configName, (event, filename) => {
      if (filename && event == "change") {
        initMenu(appIcon);
        console.log(`${filename} has been changed, updating menu...`);
      }
    });
  } catch (err) {
    console.log("Failed to watch config file:", err);
  }
  
  openDailyFile();
});

app.on("activate", () => {
  openLastOpenedFile();
});

app.on("window-all-closed", () => {
  if (process.platform !== "drawin") {
    // app.quit()
  }
});
