const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    projectHandler: (data) => ipcRenderer.invoke('project-handler', data),
    getProjects: (data) => ipcRenderer.invoke('get-projects', data),
    getTasks: (data) => ipcRenderer.invoke('get-tasks', data),
    addTask: (data) => ipcRenderer.invoke('add-task', data),
    changeTaskCategory: (data) => ipcRenderer.invoke('change-task-category', data),
    deleteTask: (data) => ipcRenderer.invoke('delete-task', data),
    editTask: (data) => ipcRenderer.invoke('edit-task', data),
    updateProjectDateModified: (data) => ipcRenderer.invoke('update-project-date-modified', data),

    hubQuickInfoHandler: (data) => ipcRenderer.invoke('hub-quick-info-handler', data),
    taskQuickInfoHandler: (data) => ipcRenderer.invoke('task-quick-info-handler', data),

    graphCounts: (data) => ipcRenderer.invoke('graph-counts', data),
});