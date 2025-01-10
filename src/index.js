const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const Store = require('electron-store');
const store = new Store();

const sqlite3 = require('sqlite3').verbose();
const appDataPath = app.getPath('userData');
let dbDirectory; // Will display the path of the database
let db;

let frameMaximized;

if (!store.get('dataDirectory')){
  store.set('dataDirectory', `${appDataPath}/database.db`);
  dbDirectory = `${appDataPath}/database.db`;
  db = new sqlite3.Database(`${appDataPath}/database.db`);
} else {
  dbDirectory = store.get('dataDirectory');
  db = new sqlite3.Database(dbDirectory);
}

// palette: https://coolors.co/f1f1f1-1b1b1b-252525-313131-9593d9-7c90db-889ade-24d05b-de2b2b

db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    status TEXT,
    projectName TEXT,
    dateCreated DATE,
    dateModified DATE,
    dateCompleted DATE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    projectID INT,
    status TEXT,
    taskTitle TEXT,
    taskDescription TEXT,
    dateCreated DATE,
    dateModified DATE,
    dateCompleted DATE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS bulletpoints (
    id INTEGER PRIMARY KEY,
    taskID INT,
    projectID INT,
    bulletpoint TEXT,
    status TEXT,
    dateCreated DATE,
    dateModified DATE,
    dateCompleted DATE
  )
`);


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  const mainScreen = screen.getPrimaryDisplay();
  const { width, height, x, y, isMaximized } = store.get('windowBounds', { width: Math.round(mainScreen.size.width * 0.8), height: Math.round(mainScreen.size.height * 0.8), x: undefined, y: undefined, isMaximized: false });  // Create the browser window.

  //const windowWidth = Math.round(mainScreen.size.width * 0.8); // 80% of screen width
  //const windowHeight = Math.round(mainScreen.size.height * 0.8); // 80% of screen height

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 1000,
    minHeight:  600,
    x: x,
    y: y,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isMaximized) {
    frameMaximized = true;
    mainWindow.maximize();
  }

  mainWindow.on('resize', () => {
    const { width: newWidth, height: newHeight } = mainWindow.getBounds();
    if (!mainWindow.isMaximized()) {
      store.set('windowBounds', { width: newWidth, height: newHeight, x: mainWindow.getPosition()[0], y: mainWindow.getPosition()[1], isMaximized: false });
    } else {
      store.set('windowBounds', { width, height, x, y, isMaximized: true });
    }
  });
  
  mainWindow.on('move', () => {
    if (!mainWindow.isMaximized()) {
      const [newX, newY] = mainWindow.getPosition();
      store.set('windowBounds', { width, height, x: newX, y: newY, isMaximized: false });
      frameMaximized = false;
    }
  });


  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    if (app.isPackaged) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'programmingKyle',
        repo: 'Project-Task-Hub',
      });
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
};

autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Checking for Update');
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Update Available');
});

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('auto-updater-callback', 'No Updates Available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Update Downloaded');
  //ensureSafeQuitAndInstall();
});

ipcMain.handle('restart-and-update', () => {
  ensureSafeQuitAndInstall();
});

function ensureSafeQuitAndInstall() {
  setImmediate(() => {
    app.removeAllListeners("window-all-closed")
    if (mainWindow != null) {
      mainWindow.close()
    }
    autoUpdater.quitAndInstall(false)
  })
}

ipcMain.handle('close-app', () => {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('frame-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request){
    case 'Minimize':
      mainWindow.minimize();
      break;
    case 'Maximize':
      toggleMaximize();
      break;
    case 'Exit':
      mainWindow.close();
      break;
    }
});

function toggleMaximize(){
  if (frameMaximized){
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
  frameMaximized = !frameMaximized;
}

ipcMain.handle('get-projects', async (req, data) => {
  if (!data || !data.request) return;
  switch (data.request){
    case 'active':
      const activeProjectNames = getProjectInfo('active');
      return activeProjectNames;
    case 'complete':
      const completeProjectNames = getProjectInfo('complete');
      return completeProjectNames;
  }
});

async function getProjectInfo(reqStatus) {
  return new Promise((resolve, reject) => {
    // Your database query to get active project names and IDs sorted by dateModified
    db.all('SELECT id, status, projectName FROM projects WHERE status = ? ORDER BY dateModified DESC', 
    [reqStatus], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const projects = rows.map((row) => ({ id: row.id, status: row.status, projectName: row.projectName }));
        resolve(projects);
      }
    });
  });
}

ipcMain.handle('project-handler', (req, data) => {
  if (!data || !data.request ) return;
  switch (data.request) {
    case 'Add':
      addProject(data.projectName);
      break;
    case 'Edit':
      editProject(data.projectID, data.newProjectName);
      break;
    case 'CompleteHandler':
      completeProject(data.projectID, data.newStatus);
      break;
    case 'Delete':
      deleteProject(data.projectID);
      break;
  }
});

async function addProject(projectName) {
  try {
    // Insert project information into the 'projects' table
    db.run(
      'INSERT INTO projects (status, projectName, dateCreated, dateModified, dateCompleted) VALUES (?, ?, datetime("now", "localtime"), datetime("now", "localtime"), NULL)',
      ['active', projectName]
    );
  } catch (error) {
    console.error('Error adding project:', error.message);
  }
}

async function editProject(projectID, newName) {
  if (newName === '') return;
  return new Promise((resolve, reject) => {
    // Your database query to update the project name and dateModified
    db.run('UPDATE projects SET projectName = ?, dateModified = datetime("now", "localtime") WHERE id = ?', 
    [newName, projectID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function completeProject(projectID, newStatus) {
  return new Promise((resolve, reject) => {
    let query;
    let params;

    if (newStatus.toLowerCase() === 'active') {
      // Active case
      query = 'UPDATE projects SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = NULL WHERE id = ?';
      params = [newStatus, projectID];
    } else {
      // Complete case
      query = 'UPDATE projects SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = datetime("now", "localtime") WHERE id = ?';
      params = [newStatus, projectID];
    }

    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function deleteProject(projectID) {
  return new Promise((resolve, reject) => {
    // Your database query to delete the project by ID
    db.run('DELETE FROM projects WHERE id = ?', 
    [projectID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    db.run('DELETE FROM tasks WHERE projectID = ?', 
    [projectID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    db.run('DELETE FROM bulletpoints WHERE projectID = ?', 
    [projectID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

ipcMain.handle('update-project-date-modified', (req, data) => {
  if (!data || !data.projectID) return;
  return new Promise((resolve, reject) => {
    db.run('UPDATE projects SET dateModified = datetime("now", "localtime") WHERE id = ?', 
    [data.projectID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

ipcMain.handle('add-task', (req, data) => {
  if (!data || !data.status || !data.projectID || !data.taskTitle || !data.taskDescription) return;
  return new Promise((resolve, reject) => {
    let currentDate = 'datetime("now", "localtime")';

    // SQL statements
    let sqlStatementComplete = 'INSERT INTO tasks (projectID, status, taskTitle, taskDescription, dateCreated, dateModified, dateCompleted) VALUES (?, ?, ?, ?, ' + currentDate + ', ' + currentDate + ', ' + currentDate + ')';
    let sqlStatementIncomplete = 'INSERT INTO tasks (projectID, status, taskTitle, taskDescription, dateCreated, dateModified, dateCompleted) VALUES (?, ?, ?, ?, ' + currentDate + ', ' + currentDate + ', NULL)';

    // Choose the appropriate SQL statement based on data.status
    let sqlStatement = (data.status === 'complete') ? sqlStatementComplete : sqlStatementIncomplete;
    // Your database query to get active project names and IDs sorted by dateModified
    db.run(sqlStatement,
      [data.projectID, data.status, data.taskTitle, data.taskDescription], 
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
});


ipcMain.handle('get-tasks', (req, data) => {
  if (!data || !data.projectID || !data.status) return;
  switch (data.status){
    case 'active':
      const activeTasks = grabTasksWithStatus(data.projectID, data.status);
      return activeTasks;
    case 'inprogress':
      const inprogressTasks = grabTasksWithStatus(data.projectID, data.status);
      return inprogressTasks;
    case 'complete':
      const completeTasks = grabTasksWithStatus(data.projectID, data.status);
      return completeTasks;
  }
});


async function grabTasksWithStatus(projectID, status){
  return new Promise((resolve, reject) => {
    // Your database query to get active project names and IDs sorted by dateModified
    db.all('SELECT * FROM tasks WHERE status = ? AND projectID = ? ORDER BY dateModified DESC', 
    [status, projectID], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const tasks = rows.map((row) => row);
        resolve(tasks);
      }
    });
  });
}

ipcMain.handle('change-task-category', (req, data) => {
  if (!data || !data.taskID || !data.newCategory) return;
  return new Promise((resolve, reject) => {
    let query;
    let params;

    if (data.newCategory.toLowerCase() === 'complete') {
      // Complete case
      query = 'UPDATE tasks SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = datetime("now", "localtime") WHERE id = ?';
      params = [data.newCategory, data.taskID];
    } else {
      // Active case
      query = 'UPDATE tasks SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = NULL WHERE id = ?';
      params = [data.newCategory, data.taskID];
    }

    // Your database query to update the project name
    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

    completeBulletWithTask(data.taskID);
  });
});

function completeBulletWithTask(taskID){
  return new Promise((resolve, reject) => {
    const sqlStatement = `UPDATE bulletpoints SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = datetime("now", "localtime") WHERE taskID = ?`;
    params = ['complete', taskID];
    db.run(sqlStatement, params, (err) => {
      if (err){
        reject(err);
      } else {
        resolve();
      }
    })
  });
}



ipcMain.handle('edit-task', (req, data) => {
  if (!data || !data.taskID) return;

  switch (data.request) {
    case 'Title':
      updateTaskTitle(data.taskID, data.newTitle);
      break;
    case 'Description':
      updateTaskDescription(data.taskID, data.newDescription);
      break;
    case 'Both':
      updateTaskTitle(data.taskID, data.newTitle);
      updateTaskDescription(data.taskID, data.newDescription);
      break;
  }
});

function updateTaskTitle(taskID, newTitle) {
  return new Promise((resolve, reject) => {
    // Your database query to update the project name and dateModified
    db.run('UPDATE tasks SET taskTitle = ?, dateModified = datetime("now", "localtime") WHERE id = ?',
      [newTitle, taskID], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

function updateTaskDescription(taskID, newDescription) {
  return new Promise((resolve, reject) => {
    // Your database query to update the project name and dateModified
    db.run('UPDATE tasks SET taskDescription = ?, dateModified = datetime("now", "localtime") WHERE id = ?',
      [newDescription, taskID], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

ipcMain.handle('delete-task', (req, data) => {
  if (!data || !data.taskID) return;
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tasks WHERE id = ?', 
    [data.taskID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

    db.run('DELETE FROM bulletpoints WHERE taskID = ?', 
    [data.taskID], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});



ipcMain.handle('task-quick-info-handler', async (req, data) => {
  if (!data || !data.request || !data.projectID) return;

  let result;
  
  switch (data.request) {
    case 'ActiveTasks':
      result = await projectTaskCount(data.projectID, 'active & inprogress');
      break;
    case 'CompleteTasks':
      result = await projectTaskCount(data.projectID, 'complete');
      break;
    case 'NewTasks':
      result = await projectTaskCountWithinRange(data.projectID, 'active & inprogress', 7);
      break;
    case 'NewCompleteTasks':
      result = await projectTaskCountWithinRange(data.projectID, 'complete', 7);
      break;
    case 'ProjectCreatedDate':
      result = await grabProjectCreatedDate(data.projectID);
      break;
    case 'ActiveBulletpoints':
      result = await grabProjectBulletpoints('active', data.projectID);
      break;
    case 'CompleteBulletpoints':
      result = await grabProjectBulletpoints('complete', data.projectID);
      break;
  }
  // Send the result back through IPC or perform other actions based on the result
  return result;
});

async function grabProjectBulletpoints(status, projectID){
  const sqlStatement = 'SELECT COUNT(*) AS count FROM bulletpoints WHERE status = ? AND projectID = ?';
  return new Promise((resolve, reject) => {
    db.get(sqlStatement, [status, projectID], (err, row) => {
      if (err){
        reject(err);
      } else {
        resolve(row.count);
      }
    })
  });
}

async function grabProjectCreatedDate(projectID) {
  return new Promise((resolve, reject) => {
    db.get('SELECT dateCreated FROM projects WHERE id = ?', 
    [projectID], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.dateCreated.split(' ')[0] : null);
      }
    });
  });
}

async function projectTaskCount(projectID, projectStatus) {
  return new Promise((resolve, reject) => {
    const statusArray = projectStatus.split(' & ');

    db.get(`SELECT COUNT(*) AS taskCount FROM tasks WHERE projectID = ? AND status IN (${statusArray.map(_ => '?').join(', ')})`, 
      [projectID, ...statusArray], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.taskCount);
        }
      });
  });
}

async function projectTaskCountWithinRange(projectID, projectStatus, numberOfDays) {
  return new Promise((resolve, reject) => {
    const statusArray = projectStatus.split(' & ');

    db.get(
      `SELECT COUNT(*) AS taskCount FROM tasks WHERE projectID = ? AND status IN (${statusArray.map(_ => '?').join(', ')}) AND dateCreated >= datetime("now", ? || " days")`,
      [projectID, ...statusArray, -numberOfDays],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.taskCount);
        }
      }
    );
  });
}



ipcMain.handle('hub-quick-info-handler', async (req, data) => {
  if (!data || !data.request ) return;

  let result;
  
  switch (data.request) {
    case 'ActiveTasks':
      result = await hubTaskCount('active & inprogress');
      break;
    case 'CompleteTasks':
      result = await hubTaskCount('complete');
      break;
    case 'NewTasks':
      result = await hubTaskCountWithinRange('active & inprogress', 7);
      break;
    case 'NewCompleteTasks':
      result = await hubTaskCountWithinRange('complete', 7);
      break;
    case 'NewProjects':
      result = await hubNewProjectsWithinRange(7);
      break;
    case 'TotalProjects':
      result = await hubTotalProjectsCount();
      break;
    case 'ActiveBulletpoints':
      result = await hubBulletpoints('active');
      break;
    case 'CompleteBulletpoints':
      result = await hubBulletpoints('complete');
      break;
    }
  return result;
});

async function hubBulletpoints(status){
  const sqlStatement = 'SELECT COUNT(*) AS count FROM bulletpoints WHERE status = ?';
  return new Promise((resolve, reject) => {
    db.get(sqlStatement, [status], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

async function hubTaskCount(projectStatus) {
  return new Promise((resolve, reject) => {
    const statusArray = projectStatus.split(' & ');

    db.get(`SELECT COUNT(*) AS taskCount FROM tasks WHERE status IN (${statusArray.map(_ => '?').join(', ')})`, 
      [...statusArray], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.taskCount);
        }
      });
  });
}


async function hubTaskCountWithinRange(projectStatus, numberOfDays) {
  return new Promise((resolve, reject) => {
    const statusArray = projectStatus.split(' & ');

    db.get(
      `SELECT COUNT(*) AS taskCount FROM tasks WHERE status IN (${statusArray.map(_ => '?').join(', ')}) AND dateCreated >= datetime("now", ? || " days")`,
      [...statusArray, -numberOfDays],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.taskCount);
        }
      }
    );
  });
}

async function hubNewProjectsWithinRange(numberOfDays) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) AS projectCount FROM projects WHERE dateCreated >= datetime("now", ? || " days")`,
      [-numberOfDays],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.projectCount);
        }
      }
    );
  });
}

async function hubTotalProjectsCount(){
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) AS projectCount FROM projects`,
      [],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.projectCount);
        }
      }
    );
  });
}


ipcMain.handle('graph-counts', (req, data) => {
  if (!data || !data.request) return;
  let result;

  switch(data.request){
    case 'DailyCompleteTaskCount':
      result = graphDailyTaskCountComplete(data.days);
      break;
    case 'MonthlyCompleteTaskCount':
      result = graphMonthlyTaskCountComplete(data.months);
      break;
  }
  return result;
});

async function graphDailyTaskCountComplete(days) {
  const results = [];
  for (const day of days) {
    const count = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) AS taskCount FROM tasks WHERE strftime("%Y-%m-%d", dateCompleted) = ? AND status = "complete"',
        [day],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.taskCount : 0);
          }
        }
      );
    });
    results.push(count);
  }
  return results;
}

async function graphMonthlyTaskCountComplete(months) {
  const results = [];

  for (const month of months) {
    const count = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) AS taskCount FROM tasks WHERE strftime("%Y-%m", dateCompleted) = ? AND status = "complete"',
        [month],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.taskCount : 0);
          }
        }
      );
    });

    results.push(count);
  }

  return results;
}

ipcMain.handle('bulletpoint-handler', async(req, data) => {
  if (!data || !data.request) return;
  switch (data.request){
    case 'Add':
      addBulletPoint(data.taskID, data.projectID, data.bulletpoint);
    case 'View':
      const results = await getBulletpoints(data.projectID, data.taskID);
      return results;
    case 'Delete':
      await deleteBulletpoint(data.bulletpointID);
      return;
    case 'Edit':
      await editBulletpoint(data.bulletpointID, data.editBulletpoint);
      return;
    case 'Status':
      const updatedStatus = await toggleBulletpointStatus(data.bulletpointID, data.status);
      return updatedStatus;
  }
});

async function toggleBulletpointStatus(id, status) {
  const newStatus = status === 'active' ? 'complete' : 'active';
  let sqlStatement;
  if (newStatus === 'complete'){
    sqlStatement = `UPDATE bulletpoints SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = datetime("now", "localtime") WHERE id = ?`;
  } else {
    sqlStatement = 'UPDATE bulletpoints SET status = ?, dateModified = datetime("now", "localtime"), dateCompleted = NULL WHERE id = ?';
  }
  return new Promise((resolve, reject) => {
    db.run(sqlStatement, [newStatus, id], (err) => {
      if (err){
        reject(err);
      } else {
        resolve(newStatus);
      }
    })
  });
}

async function editBulletpoint(id, bulletpoint){
  if (!id || !bulletpoint) return;
  return new Promise((resolve, reject) => {
    db.run('UPDATE bulletpoints SET bulletpoint = ?, dateModified = datetime("now", "localtime") WHERE id = ?', 
    [bulletpoint, id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function deleteBulletpoint(id) {
  if (!id) return;
  const sqlStatement = 'DELETE FROM bulletpoints WHERE id = ?';

  return new Promise((resolve, reject) => {
      db.run(sqlStatement, [id], (err) => {
          if (err) {
              reject(err);
          } else {
              resolve();
          }
      });
  });
}

async function getBulletpoints(projectID, taskID){
  if (!projectID, !taskID) return;
  const sqlStatement = `SELECT * FROM bulletpoints WHERE projectID = ${projectID} AND taskID = ${taskID}`;
  return new Promise((resolve, reject) => {
    db.all(sqlStatement, (err, rows) => {
      if (err){
        reject(err);
      } else {
        resolve(rows);
      }
    })
  });
};

function addBulletPoint(taskID, projectID, bulletpoint){
  if (!taskID || !projectID || !bulletpoint) return;
  let currentDate = 'datetime("now", "localtime")';

  const sqlStatement = `INSERT INTO bulletpoints (taskID, projectID, bulletpoint, status, dateCreated, dateModified) 
  VALUES (?, ?, ?, 'active', ${currentDate}, ${currentDate})`;
  const values = [taskID, projectID, bulletpoint];
  try {
    db.run(sqlStatement, values);
  } catch (error) {
    console.error(error);
  }
}
