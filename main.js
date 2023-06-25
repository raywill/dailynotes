const {app, dialog, clipboard, shell, Tray, Menu, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs')
const iconPath = path.join(__dirname, 'icon.png');
let appIcon = null;
let win = null;
app.allowRendererProcessReuse = true

var dirName = path.join(app.getPath("documents"), "DailyNotes");

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}


var fn = function() {
          var fName = getCurrentDate() + ".txt";
          var fileName = path.join(dirName, fName);
          fs.exists(dirName, exists => {
            if (!exists) {
              fs.mkdirSync(dirName);
            } else {
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
          }
        });
      };

app.on('ready', function(){
  appIcon = new Tray(iconPath);
  appIcon.setToolTip("日志保存路径：" + dirName);
  appIcon.on('click', fn); 
  fn();
});



app.on('activate', fn);

app.on('window-all-cloased', () => {
  if (process.platform !== 'drawin') {
    app.quit()
  }
})
