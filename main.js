const {app, dialog, clipboard, shell, Tray, Menu, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs')
const iconPath = path.join(__dirname, 'icon.png');
let appIcon = null;
let win = null;
app.allowRendererProcessReuse = true

var dirName = path.join(app.getPath("documents"), "DailyNotes");
var configName = path.join(app.getPath('userData'), 'config.json');
var tempDirName = app.getPath("temp");

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
            fs.writeFile(fileName, '', 'utf8', err => {
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
};

var openDailyFile = function() {
    var fName = getCurrentDate() + ".txt";
    openTextFile(fName);
};

var openDailyFileByDelta = function(delta) {
    var fName = getDeltaDate(-1) + ".txt";
    openTextFile(fName);
};


var writeAndOpenReportFile = function(fNamePrefix, content) {
    var fName = fNamePrefix + ".md";
    var fileName = path.join(tempDirName, fName);
    fs.exists(tempDirName, exists => {
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

var generateReport = function(type, delta) {
  // console.warn(type, delta);
  var results = "";
  let offset = 0 - delta;
  //for (var i = offset; i <= 0; ++i) {
  for (var i = 0;  i >= offset; --i) {
    var date = getDeltaDate(i)
    var fName =  date + ".txt";
    var fileName = path.join(dirName, fName);
    try {
      var content = fs.readFileSync(fileName, 'utf8');
      var regex = new RegExp("#+" + type + "([\\s\\S]*?)(?=\n#|$)", "g");
      let match;
      let matched = false;
      let dayResults = "";
      while ((match = regex.exec(content)) !== null) {
        //console.log(match);
        dayResults += "## " + type + " " + match[1].trim() + "\n\n";
        matched = true;
      }
      if (matched) {
        results += "# " + date + "\n\n" + dayResults + "\n\n"; 
      }
    } catch {
      // file may not exist
    }
  }
  let fNamePrefix = "report"; //type + "-" + delta.toString();
  writeAndOpenReportFile(fNamePrefix, results);
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

var initMenu = function(appIcon) {
  var labels = "";
  try {
    const config = JSON.parse(fs.readFileSync(configName));
    if (config) {
      labels = config.labels;
    }
  } catch {
    const data = {}
    labels = "#todo weekly,#todo monthly,#note weekly,#note monthly,#meeting 7 days";
    data.labels =  labels;
    fs.writeFileSync(configName, JSON.stringify(data, null, 2));
  }
  var menuArr = parseLabels(labels);
  menuArr.push({ type: 'separator' });
  menuArr.push(
    {
      label: 'yesterday',
      click: function() {
        openDailyFileByDelta(1);
      }
    }
  );
  menuArr.push({ type: 'separator' });
  menuArr.push(
    {
      label: 'all notes',
      accelerator: 'Command+D',
      click: function() {
        shell.openPath(dirName);
      }
    }
  );
  menuArr.push(
    {
      label: 'config',
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

app.on('window-all-cloased', () => {
  if (process.platform !== 'drawin') {
    app.quit()
  }
})
