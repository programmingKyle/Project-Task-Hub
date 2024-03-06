const totalActiveTasksCount_el = document.getElementById('totalActiveTasksCount');
const totalCompleteTasksCount_el = document.getElementById('totalCompleteTasksCount');
const newTotalTaskCount_el = document.getElementById('newTotalTaskCount');
const newCompleteTaskCount_el = document.getElementById('newCompleteTaskCount');
const newProjectCount_el = document.getElementById('newProjectCount');
const totalProjectsCount_el = document.getElementById('totalProjectsCount');

const activeBulletpointsCount_el = document.getElementById('activeBulletpointsCount');
const completeBulletpointsCount_el = document.getElementById('completeBulletpointsCount');

document.addEventListener('DOMContentLoaded', () => {
    updateCounts();
});

function updateCounts(){
    populateTotalActiveTasks();
    populateTotalCompleteTasks();
    populateTotalNewTasks();
    populateTotalNewCompleteTasks();
    populateNewProjectCount();
    populateTotalProjects();
    populateActiveBulletpoints();
    populateCompleteBulletpoints();
}

async function populateTotalActiveTasks(){
    const activeTasks = await api.hubQuickInfoHandler({request: 'ActiveTasks'});
    totalActiveTasksCount_el.textContent = activeTasks;
}

async function populateTotalCompleteTasks(){
    const completeTasks = await api.hubQuickInfoHandler({request: 'CompleteTasks'});
    totalCompleteTasksCount_el.textContent = completeTasks;
}

async function populateTotalNewTasks(){
    const totalNewTasks = await api.hubQuickInfoHandler({request: 'NewTasks'});
    newTotalTaskCount_el.textContent = totalNewTasks;
}

async function populateTotalNewCompleteTasks(){
    const totalNewCompleteTasks = await api.hubQuickInfoHandler({request: 'NewCompleteTasks'});
    newCompleteTaskCount_el.textContent = totalNewCompleteTasks;
}

async function populateNewProjectCount(){
    const newProjectCount = await api.hubQuickInfoHandler({request: 'NewProjects'});
    newProjectCount_el.textContent = newProjectCount;
}

async function populateTotalProjects(){
    const totalProjectCount = await api.hubQuickInfoHandler({request: 'TotalProjects'});
    totalProjectsCount_el.textContent = totalProjectCount;
}

async function populateActiveBulletpoints(){
    const activeBulletpointsCount = await api.hubQuickInfoHandler({request: 'ActiveBulletpoints'});
    activeBulletpointsCount_el.textContent = activeBulletpointsCount;
}

async function populateCompleteBulletpoints(){
    const completeBulletpointsCount = await api.hubQuickInfoHandler({request: 'CompleteBulletpoints'});
    completeBulletpointsCount_el.textContent = completeBulletpointsCount;
}