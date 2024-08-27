const {app, dialog, ipcMain, clipboard, shell, Tray, Menu, BrowserWindow, systemPreferences} = require('electron');
const { spawn } = require ('child_process');
const path = require('path');
const fs = require('fs')
const os = require('os')
const http = require('http')
const iconPath = path.join(__dirname, 'icon.png');
let appIcon = null;
let mainWindow = null;
let searchWindow = null;

app.allowRendererProcessReuse = true

var dirName = path.join(app.getPath("documents"), "DailyNotes");
var configName = path.join(app.getPath('userData'), 'config.json');
var tempDirName = app.getPath("temp");
var fileExtension = 'md'; // default file editor
var newPageTemplate = ''; // default page template, such as '##todo work for today'
var userDefinedFiles = [];
var telemetryHost = 'm.reactshare.cn';
var telemetryEndpoint = '/dailynotes/?';

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


function getDeltaDate(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDeltaDateWithWeekDay(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[date.getDay()];
  return `${year}-${month}-${day} (${weekday})`;
}

function getDeltaWeekDay(delta) {
  var date = new Date();
  date.setDate(date.getDate() + delta);
  return date.getDay();
}


var openTerminal = function() {
  const atPath = dirName;
  let openTerminalAtPath = spawn ('open', [ '-a', 'Terminal', atPath ]);
  openTerminalAtPath.on ('error', (err) => { console.log (err); });
};

var openTextFile = function(fName) {
    var fileName = path.join(dirName, fName);
    fs.exists(dirName, exists => {
      if (!exists) {
        fs.mkdirSync(dirName);
        var firstWord =
					  '\n#note Welcome to use DailyNotes\n\n'
          + ' - For those enjoy simplicity!\n'
          + ' - For those want complete content control!\n'
          + ' - Visit https://www.github.com/raywill/dailynotes for update!\n'
					+ '\n'
					+ '\n'
					+ '#todo work for today:\n'
					+ '\n'
					+ ' - Check and respond to emails from clients and team members.\n'
					+ ' - Attend the daily stand-up meeting with the team to discuss progress and plans.\n'
					+ ' - Review and update the project requirements and user stories based on the feedback received.\n'
					+ ' - Start working on implementing new features or fixing existing bugs.\n'
					+ ' - Write and test code, and document it properly.\n'
					+ ' - Conduct code reviews and provide feedback to other team members.\n'
					+ ' - Attend meetings with clients to discuss project progress and gather feedback.\n'
					+ ' - Update project management tools and trackers with the latest information.\n'
					+ ' - Take breaks regularly to avoid burnout and ensure productivity.\n'
					+ ' - Learn new technologies or programming languages to enhance skills and knowledge.\n'
					+ '\n'
					+ '\n'
          + '#note Using the markdown viewer **Typora** to view weekly reports is strongly recommended!!\n'
					+ '\n'
					+ '\n'
          + '#todo Begin your work here...\n';
        fs.writeFileSync(fileName, firstWord, 'utf8');
      }
      fs.access(fileName,fs.constants.F_OK, err => {
        if (err) {
            fs.writeFile(fileName, newPageTemplate, 'utf8', err => {
                if (err) {
                    console.warn('创建文件失败');
                } else {
                    console.warn('创建文件成功');
                    shell.openPath(fileName);
                }
            });
        } else {
            console.log('文件存在');
            shell.openPath(fileName);
        }
    }); 
  });
  hookTelemetry(fName);
};

var lastTeleReportTime = 0;

var hookTelemetry = function(data) {
  const ms = new Date().getTime();
  if (lastTeleReportTime + 1000 * 60 > ms) {
    return;
  }
  try {
    lastTeleReportTime = ms;
    // OS version lookup https://en.wikipedia.org/wiki/Darwin_(operating_system)#Release_history
    var params = encodeURIComponent([os.platform(), os.machine(), os.release(), os.userInfo().username, data].join('-'));
    var req = http.get({
      hostname: telemetryHost,
      path: telemetryEndpoint + params,
      port: 80,
      timeout: 3000,
      webSecurity: false
    },
    (res) => {}
    );
    req.on('error', (err) => {
      // nop
    });
  } catch {
    // nop
  }
};

var openDailyFile = function() {
    var fName = getCurrentDate() + "." + fileExtension;
    openTextFile(fName);
};

var openDailyFileLast = function() {
    var maxFindOffset = -30;
    var found = false;
    for (var i = -1;  !found && i >= maxFindOffset; --i) {
      var fName = getDeltaDate(i) + "." + fileExtension;
      var fileName = path.join(dirName, fName);
      console.warn(fileName);
      if (fs.existsSync(fileName)) {
        found = true;
        openTextFile(fName);
      };
    }
};

var openUserDefinedFile = function(fileNamePrefix) {
  var fName = fileNamePrefix + "." + fileExtension;
  openTextFile(fName);
};

var writeAndOpenReportFile = function(fNamePrefix, content) {
    var reportDirName = dirName;
    // var reportDirName = tempDirName;
    var fName = fNamePrefix + ".md";
    var fileName = path.join(reportDirName, fName);
    fs.exists(reportDirName, exists => {
      if (!exists) {
        console.warn("找不到临时文件夹");
      } else {
        fs.access(fileName,fs.constants.F_OK, err => {
            fs.writeFile(fileName, content, 'utf8', err => {
                if (err) {
                    console.warn('创建报告文件失败');
                } else {
                    console.warn('写入报告文件成功');
                    shell.openPath(fileName);
                }
            });
      }); 
    }
  });
};


var readFile = function(fileName, cb) {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.warn('创建文件失败');
        } else {
          cb(data);
        }
    });
};

var getContent = function(type, cb) {
  readFile(fileName, function(data) {
    cb(data);
  });
}


var openLastDaysSummary = function(delta) {
  var results = "";
  let offset = 0 - delta;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map(file => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });
      for (var i = 0;  i >= offset; --i) {
        var date = getDeltaDate(i)
        var dateReadable = getDeltaDateWithWeekDay(i)
        if (fileMap.has(date)) {
          fileMap.get(date).forEach(fName => {
            var fileName = path.join(dirName, fName);
            try {
              var content = fs.readFileSync(fileName, 'utf8');
              var regex = new RegExp("#+\\s*" + "([\\s\\S]*?)(?=\n#|$)", "g");
              let match;
              let matched = false;
              let dayResults = "";
              while ((match = regex.exec(content)) !== null) {
                dayResults += "## " + match[1].trim() + "\n\n";
                matched = true;
              }
              if (matched) {
                results += "# [" + dateReadable + "](" + fileName + ")\n\n" + dayResults + "\n\n"; 
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
  const type = "lastdayssummary";
  hookTelemetry(type + delta);
};

var openLastWeekSummary = function() {
  openLastDaysSummary(7);
};
var openLastMonthSummary = function() {
  openLastDaysSummary(30);
};

var openListView = function() {
  var results = "";
  var lineResults = "";
  let offset = -180;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map(file => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });

      lineResults += "## Recent 180 days List View\n\n";
      lineResults += "> Use 'Command + Click' to quick open the note\n\n";
      lineResults += "| Brief |\n"
      lineResults += "| ------ |\n";

      for (var i = 0;  i >= offset; i--) {
        var date = getDeltaDate(i)
        var fileResult = '';
        if (fileMap.has(date)) {
          fName = fileMap.get(date)[0];
          var fileName = path.join(dirName, fName);
          var content = fs.readFileSync(fileName, 'utf8');
          var regex = new RegExp("(^|\n)#+([\\s\\S]*?)(\n|$)", "g");
          let match;
          while ((match = regex.exec(content)) !== null) {
            var line = "|[" + date + "](" + fName + "): " + match[2].trim() + "|\n";
            fileResult = line + fileResult;
          }
          lineResults += fileResult;
        }
      }
    }
    let fNamePrefix = "dailynotes_listview"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, lineResults);
  });
  const type = "listview";
  hookTelemetry(type);
};

var openCalendarView = function() {
  var results = "";
  let offset = -180;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map(file => {
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

      var rowResults = ''; // used to filter out empty week data
      results += "## Recent 180 days Calendar View\n\n";
      results += "> Use 'Command + Click' to quick open the note\n\n";
      results += "| SUN  | MON | TUE | WEN | THU  | FRI | SAT |\n";
      results += "| --- | --- | --- | --- | --- | --- | --- |\n";

      var hasNotes = false;
      for (var i = offset;  i <= rest; i+=1) {
        var date = getDeltaDate(i)
        var dateReadable = getDeltaDateWithWeekDay(i)
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
          rowResults = '';
        }
      }
    }
    let fNamePrefix = "dailynotes_calendar"; //type + "-" + delta.toString();
    writeAndOpenReportFile(fNamePrefix, results);
  });
  const type = "calendar";
  hookTelemetry(type);
};



var generateAtSomeoneReport = function(delta) {
  var results = "";
  let offset = 0 - delta;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map(file => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });
      for (var i = 0;  i >= offset; --i) {
        var date = getDeltaDate(i)
        var dateReadable = getDeltaDateWithWeekDay(i)
        if (fileMap.has(date)) {
          fileMap.get(date).forEach(fName => {
            var fileName = path.join(dirName, fName);
            try {
              var content = fs.readFileSync(fileName, 'utf8');
              var regex = new RegExp("#+\\s*" + "([\\s\\S]*?)(?=\n#|$)", "g");
              let match;
              let matched = false;
              let dayResults = "";
              while ((match = regex.exec(content)) !== null) {
                const matchContent = match[1].trim();
                const regexAt = /@([一-龥]{1,20})[s:：$\S]/
                const matchAt = regexAt.exec(matchContent);
                if (matchAt) {
                  dayResults += "## " + matchContent + "\n\n";
                  matched = true;
                }
              }
              if (matched) {
                results += "# [" + dateReadable + "](" + fileName + ")\n\n" + dayResults + "\n\n"; 
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
  const type = "@someone";
  hookTelemetry(type + delta);
};

var generateReport = function(type, delta) {
  var results = "";
  let offset = 0 - delta;
  var fileMap = new Map();
  fs.readdir(dirName, (err, files) => {
    if (!err) {
      files.map(file => {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        if (fileMap.has(base)) {
          fileMap.get(base).push(path.basename(file));
        } else {
          fileMap.set(base, [path.basename(file)]);
        }
      });
      for (var i = 0;  i >= offset; --i) {
        var date = getDeltaDate(i)
        var dateReadable = getDeltaDateWithWeekDay(i)
        if (fileMap.has(date)) {
          fileMap.get(date).forEach(fName => {
            var fileName = path.join(dirName, fName);
            try {
              var content = fs.readFileSync(fileName, 'utf8');
              var regex = new RegExp("#+\\s*" + type + "([\\s\\S]*?)(?=\n#|$)", "g");
              let match;
              let matched = false;
              let dayResults = "";
              while ((match = regex.exec(content)) !== null) {
                dayResults += "## " + type + " " + match[1].trim() + "\n\n";
                matched = true;
              }
              if (matched) {
                results += "# [" + dateReadable + "](" + fileName + ")\n\n" + dayResults + "\n\n"; 
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
  hookTelemetry(type + delta);
};

var parseLabels = function(labels) {
  var menuArr = [];
  labels.split(',').forEach((item, index) => {
    item = item.trim();
    var parts = item.split(' '); 
    if (parts.length < 2) return;
    var tag = parts[0].replace(/^#+/, '');
    var days = 0;
    switch(parts[1]) {
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
          switch(parts[1]) {
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
    const menuItem = {label:item, click:function() { generateReport(tag, days); }};
    menuArr.push(menuItem);
  });
  return menuArr;
};

function createSearchDialog() {
    searchWindow = new BrowserWindow({
        width: 900,
        height: 700,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    searchWindow.loadFile('search-dialog.html');
    searchWindow.on('closed', () => {
        // searchWindow = null;
    });
}

// begin paste

ipcMain.on('search-files', async (event, query) => {
    const directory = path.join(app.getPath('documents'), 'DailyNotes');
    const results = [];

    const files = fs.readdirSync(directory).filter(file => ((file.endsWith('.txt') || file.endsWith('.md')) && !file.startsWith('dailynotes_') && query.length > 0));

    for (const file of files) {
        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // 按行分隔并处理
        const lines = content.split('\n');
        let currentTitle = '';
        let currentLines = [];

        lines.forEach(line => {
            if (line.startsWith('# ')) {
                // 处理之前的内容
                if (currentTitle && currentLines.length > 0) {
                    processContent(file, currentTitle, currentLines, query, results);
                }
                // 更新当前标题
                currentTitle = line.substring(2).trim();
                currentLines = [];
            } else {
                currentLines.push(line);
            }
        });

        // 处理最后一部分内容
        if (currentTitle && currentLines.length > 0) {
            processContent(file, currentTitle, currentLines, query, results);
        }
    }

    event.reply('search-results', formatResults(results, query));
});

function processContent(file, title, lines, query, results) {
    // 使用 Unicode 支持的正则表达式
    const regex = new RegExp(`(${query})`, 'giu'); // 'u' 使正则表达式支持 Unicode，'i' 使匹配不区分大小写，'g' 使匹配全局
    const matches = new Set(); // 使用 Set 来去重

    if (regex.test(title)) {
        matches.add('');
    }

    lines.forEach(line => {
        if (regex.test(line)) {
            matches.add(line);
        }
    });

    if (matches.size > 0) {
        const result = results.find(r => r.file === file && r.title === title);
        if (result) {
            result.matches.push(...matches);
        } else {
            results.push({
                file,
                title,
                matches: Array.from(matches)
            });
        }
    }
}

function formatResults(results, query) {
    return results.map(result => {
        const { file, title, matches } = result;
        
        // 对匹配结果进行格式化
        const formattedMatches = matches.map(match => {
            return match.replace(new RegExp(`(${query})`, 'giu'), `<b style='color:#ea4335'>$1</b>`);
        }).join('<br />');

        return {
            file,
            title,
            content: formattedMatches
        };
    });
}

ipcMain.on('open-file', (event, fName) => {
    var filePath = path.join(dirName, fName);
    shell.openPath(filePath);
});

// end paste
/*
ipcMain.on('close-search-dialog', () => {
    if (searchWindow) {
        searchWindow.close();
    }
});
*/


var initMenu = function(appIcon) {
  var labels = "";
  try {
    const config = JSON.parse(fs.readFileSync(configName));
    if (config) {
      labels = config.labels;
      var needUpgrade = false;
      if (config.user_defined_file) { // new version
        userDefinedFiles = config.user_defined_file.split(/[,;]/);
      } else {
        config.user_defined_file = '';
        userDefinedFiles = [];
        needUpgrade = true;
      }
      if (config.writer) { // new version
        fileExtension = config.writer;
      } else {
        // upgrade older version
        fileExtension = 'md';
        config.writer = 'md';
        needUpgrade = true;
      }
      if (config.template) {
        newPageTemplate = config.template;
      } else {
        newPageTemplate = '';
        config.template = '';
        needUpgrade = true;
      }
      fs.writeFileSync(configName, JSON.stringify(config, null, 2));
    }
  } catch {
    const data = {}
    labels = "#todo weekly,#todo monthly,#note weekly,#note monthly,#meeting 7 days";
    data.labels =  labels;
    data.writer = 'md';
    data.template = '';
    fs.writeFileSync(configName, JSON.stringify(data, null, 2));
  }
  var menuArr = [];

  menuArr.push(
    {
      label: 'Search',
      accelerator: 'Command+S',
      click: function() {
      	createSearchDialog();
      }
    }
  );
  menuArr.push({ type: 'separator' });

  menuArr.push(...parseLabels(labels));
  menuArr.push({ type: 'separator' });

  menuArr.push(
    {
      label: '@Someone',
      accelerator: 'Command+A',
      click: function() {
        generateAtSomeoneReport(30);
      }
    }
  );
  menuArr.push(
    {
      label: 'Last Day',
      click: function() {
        openDailyFileLast();
      }
    }
  );
  menuArr.push(
    {
      label: 'Last Week',
      click: function() {
        openLastWeekSummary();
      }
    }
  );
  menuArr.push(
    {
      label: 'Last Month',
      click: function() {
        openLastMonthSummary();
      }
    }
  ); 
  menuArr.push({ type: 'separator' });
  menuArr.push(
    {
      label: 'List View',
      click: function() {
        openListView();
      }
    }
  );
  menuArr.push(
    {
      label: 'Calendar View',
      click: function() {
        openCalendarView();
      }
    }
  );
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
    menuArr.push({ type: 'separator' });
    userDefinedFiles.forEach((item, index) => {
      menuArr.push(
        {
          label: item,
          click: function() {
            openUserDefinedFile(item);
          }
        }
      );
    });
  }

  menuArr.push({ type: 'separator' });
  menuArr.push(
    {
      label: 'Notes Directory',
      accelerator: 'Command+D',
      click: function() {
        shell.openPath(dirName);
      }
    }
  );
  menuArr.push(
    {
      label: 'Config',
      accelerator: 'Command+C',
      click: function() {
        shell.openPath(configName);
      }
    }
  );
  var contextMenu = Menu.buildFromTemplate(menuArr);
  appIcon.setContextMenu(contextMenu);
  //Menu.setApplicationMenu(Menu.buildFromTemplate([{label: 'Quit', selector: 'terminate:', }]))
  //Menu.setApplicationMenu(contextMenu);
  if (process.platform === 'darwin') {
    app.dock.setMenu(contextMenu);
  }
};


app.on('ready', function(){
  appIcon = new Tray(iconPath);
  appIcon.setToolTip("日志保存路径：" + dirName);
  initMenu(appIcon);
  appIcon.on('click', openDailyFile); 
  fs.watch(configName,(event,filename)=>{
      if (filename && event == 'change') {
          initMenu(appIcon);
          console.log(`${filename}文件发生更新，更新菜单`)
      }
  });
  openDailyFile();
});


app.on('activate', openDailyFile);

app.on('window-all-closed', () => {
  if (process.platform !== 'drawin') {
    // app.quit()
  }
})
