const activeTaskCount_el = document.getElementById('activeTaskCount');
const completeTaskCount_el = document.getElementById('completeTaskCount');
const newTaskCount_el = document.getElementById('newTaskCount');
const newCompleteCount_el = document.getElementById('newCompleteCount');
const projectDateCreatedText_el = document.getElementById('projectDateCreatedText');
const projectStatusText_el = document.getElementById('projectStatusText');


document.addEventListener('DOMContentLoaded', () => {
    populateStatus();
    updateTaskCounts();
    populateProjectDateCreated();
});

function updateTaskCounts(){
    populateActiveTasks();
    populateCompleteTasks();    
    populateNewTasksCount();
    populateNewCompleteCount();
}

function populateStatus(){
    if (projectStatus === 'complete'){
        projectStatusText_el.style.color = 'green';
        projectStatusText_el.textContent = 'Complete';
    } else if (projectStatus === 'active'){
        projectStatusText_el.style.color = '';
        projectStatusText_el.textContent = 'Active';
    }
}

async function populateActiveTasks(){
    const activeTasks = await api.taskQuickInfoHandler({request: 'ActiveTasks', projectID: projectID});
    activeTaskCount_el.textContent = activeTasks;
}

async function populateCompleteTasks(){
    const completeTasks = await api.taskQuickInfoHandler({request: 'CompleteTasks', projectID: projectID});
    completeTaskCount_el.textContent = completeTasks;
}

async function populateNewTasksCount(){
    const newTasks = await api.taskQuickInfoHandler({request: 'NewTasks', projectID: projectID});
    newTaskCount_el.textContent = newTasks;
}

async function populateNewCompleteCount(){
    const newCompleteTasks = await api.taskQuickInfoHandler({request: 'NewCompleteTasks', projectID: projectID});
    newCompleteCount_el.textContent = newCompleteTasks;
}

async function populateProjectDateCreated(){
    const dateCreated = await api.taskQuickInfoHandler({request: 'ProjectCreatedDate', projectID: projectID});
    projectDateCreatedText_el.textContent = dateCreated;
}



