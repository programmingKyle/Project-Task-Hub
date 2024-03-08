const projectNameHeader_el = document.getElementById('projectNameHeader');
const homeButton_el = document.getElementById('homeButton');

// Add Task Elements
const addActiveTaskButton_el = document.getElementById('addActiveTaskButton');
const addInProgressTaskButton_el = document.getElementById('addInProgressTaskButton');
const addCompleteTaskButton_el = document.getElementById('addCompleteTaskButton');
const addTaskOverlay_el = document.getElementById('addTaskOverlay');
const addTaskCloseButton_el = document.getElementById('addTaskCloseButton');
const taskTitleInput_el = document.getElementById('taskTitleInput');
const saveTaskButton_el = document.getElementById('saveTaskButton');
const addTaskTitle_el = document.getElementById('addTaskTitle');
const taskDescriptionTextarea_el = document.getElementById('taskDescriptionTextarea');

const todoListOutput_el = document.getElementById('todoListOutput');
const inprogressListOutput_el = document.getElementById('inprogressListOutput');
const completeListOutput_el = document.getElementById('completeListOutput');


let projectID;
let projectName;
let projectStatus;
let currentAddStatus; // This is used when adding a task. Clicking on a button will change it
let currentOpenEditTaskID;
let currentOpenEditTaskStatus;

let previousTaskContainer; // This will be used to close task items when clicking another

document.addEventListener('DOMContentLoaded', async () => {
    await initalPopulation();
    await populateAllTasks();
});

async function initalPopulation(){
    // Get the project name from the URL parameter
    const params = new URLSearchParams(window.location.search);
    projectName = params.get('projectName');
    projectID = params.get('projectId');
    projectStatus = params.get('projectStatus');
    projectNameHeader_el.textContent = projectName;
}

async function populateAllTasks(){
    const activeTasks = await api.getTasks({projectID: projectID, status: 'active'});
    populateTasks(activeTasks, 'active');
    const inprogressTasks = await api.getTasks({projectID: projectID, status: 'inprogress'});
    populateTasks(inprogressTasks, 'inprogress');
    const completeTasks = await api.getTasks({projectID: projectID, status: 'complete'});
    populateTasks(completeTasks, 'complete');
}

async function populateTaskCategory(category){
    switch (category){
        case 'active':
            todoListOutput_el.innerHTML = '';
            const activeTasks = await api.getTasks({projectID: projectID, status: 'active'});
            populateTasks(activeTasks, 'active');        
            break;
        case 'inprogress':
            inprogressListOutput_el.innerHTML = '';
            const inprogressTasks = await api.getTasks({projectID: projectID, status: 'inprogress'});
            populateTasks(inprogressTasks, 'inprogress');        
            break;
        case 'complete':
            completeListOutput_el.innerHTML = '';
            const completeTasks = await api.getTasks({projectID: projectID, status: 'complete'});
            populateTasks(completeTasks, 'complete');        
            break;
    }
}

async function populateTasks(tasks, status){
    tasks.forEach(element => {
        const toDoItemContainer_el = document.createElement('div');
        toDoItemContainer_el.className = 'to-do-list-container-item';

        toDoItemContainer_el.isDivClicked = false;
        
        const toDoItemHeaderContainer_el = document.createElement('div');
        toDoItemHeaderContainer_el.style.display = 'grid';
        toDoItemHeaderContainer_el.style.gridTemplateColumns = 'auto 1fr auto'

        const toDoItemTitle_el = document.createElement('h4');
        toDoItemTitle_el.textContent = element.taskTitle;

        const moveLeftButton_el = document.createElement('button');
        moveLeftButton_el.classList = 'slim-button fas fa-arrow-left';
        moveLeftButton_el.style.visibility = 'hidden';

        const moveRightButton_el = document.createElement('button');
        moveRightButton_el.classList = 'slim-button fas fa-arrow-right';
        moveRightButton_el.style.visibility = 'hidden';

        toDoItemHeaderContainer_el.append(moveLeftButton_el);
        toDoItemHeaderContainer_el.append(toDoItemTitle_el);
        toDoItemHeaderContainer_el.append(moveRightButton_el);

        const toDoControlDiv_el = document.createElement('div');
        toDoControlDiv_el.classList.add('to-do-contol-grid');

        const toggleAddBulletPointButton_el = document.createElement('button');
        toggleAddBulletPointButton_el.textContent = 'Add Bullet Point';
        toggleAddBulletPointButton_el.className = 'input-button';
        toggleAddBulletPointButton_el.style.display = 'none';

        toggleAddBulletPointButton_el.addEventListener('click', (e) => {
            e.stopPropagation();
            taskID = element.id;
            toggleAddBulletPoint();
        });

        const editTaskButton_el = document.createElement('button');
        editTaskButton_el.textContent = 'Edit';
        editTaskButton_el.className = 'input-button';
        editTaskButton_el.style.display = 'none';

        toDoControlDiv_el.append(toggleAddBulletPointButton_el);
        toDoControlDiv_el.append(editTaskButton_el);
    
        const toDoText_el = document.createElement('p');
        toDoText_el.style.padding = '10px';
        toDoText_el.style.overflow = 'hidden'; // Why do I need you?     
        toDoText_el.textContent = element.taskDescription;
        
        const completeDateText_el = document.createElement('h5');

        const bulletpointsDiv_el = document.createElement('div');
        bulletpointsDiv_el.style.display = 'none';
        bulletpointsDiv_el.className = 'bulletpoints-div';
        const bulletpointList_el = document.createElement('ul');
        bulletpointList_el.className = 'bulletpoint-list';
        bulletpointsDiv_el.append(bulletpointList_el);
        
        toDoItemContainer_el.append(toDoItemHeaderContainer_el);
        toDoItemContainer_el.append(completeDateText_el);
        toDoItemContainer_el.append(toDoText_el);
        toDoItemContainer_el.append(bulletpointsDiv_el);
        toDoItemContainer_el.append(toDoControlDiv_el);

        //toDoItemContainer_el.append(editTaskButton_el);
        console.log(status);
        if (status === 'active'){
            moveRightButton_el.style.visibility = 'visible';
            todoListOutput_el.appendChild(toDoItemContainer_el);
        } else if (status === 'inprogress'){
            moveRightButton_el.style.visibility = 'visible';
            moveLeftButton_el.style.visibility = 'visible';
            inprogressListOutput_el.appendChild(toDoItemContainer_el);
        } else if (status === 'complete'){
            completeDateText_el.textContent = element.dateCompleted;
            moveLeftButton_el.style.visibility = 'visible';
            toDoText_el.style.display = 'none';
            completeListOutput_el.appendChild(toDoItemContainer_el);
        }
    
        toDoItemContainer_el.addEventListener('click', async () => {
            if (previousTaskContainer === toDoItemContainer_el){
                previousTaskContainer = null;
                closePreviousContainer(toDoItemContainer_el);
                return;
            }
            closePreviousContainer(previousTaskContainer);
            previousTaskContainer = toDoItemContainer_el;
            if (!toDoItemContainer_el.isDivClicked) {
              if (element.status === 'complete'){
                toDoText_el.style.display = 'grid';
              }
              toDoItemContainer_el.style.maxHeight = 'none';
              toggleAddBulletPointButton_el.style.display = 'grid';
              bulletpointsDiv_el.style.display = 'grid';
              editTaskButton_el.style.display = 'grid';
              toDoItemContainer_el.classList.add('clicked'); // Add the 'clicked' class
              await viewBulletpoints(bulletpointList_el, element.id, projectID)
              toDoItemContainer_el.isDivClicked = true;
            } else {
              if (element.status === 'complete'){
                toDoText_el.style.display = 'none';
              }
              bulletpointsDiv_el.style.display = 'none';
              bulletpointList_el.innerHTML = '';
              toDoItemContainer_el.style.maxHeight = '100px';
              toggleAddBulletPointButton_el.style.display = 'none';
              editTaskButton_el.style.display = 'none';
              toDoItemContainer_el.classList.remove('clicked'); // Remove the 'clicked' class
              toDoItemContainer_el.isDivClicked = false;
            }
          });
                          
        moveRightButton_el.addEventListener('click', async (event) => {
            event.stopPropagation();
            api.updateProjectDateModified({projectID: projectID});
            if (status === 'active'){
                await api.changeTaskCategory({taskID: element.id, newCategory: 'inprogress'});
                await populateTaskCategory(status);
                await populateTaskCategory('inprogress');
            } else if (status === 'inprogress'){
                await api.changeTaskCategory({taskID: element.id, newCategory: 'complete'});
                updateTaskCounts();
                await populateTaskCategory(status);
                await populateTaskCategory('complete');
            }
        });

        moveLeftButton_el.addEventListener('click', async (event) => {
            event.stopPropagation();
            api.updateProjectDateModified({projectID: projectID});
            if (status === 'inprogress'){
                await api.changeTaskCategory({taskID: element.id, newCategory: 'active'});
                await populateTaskCategory(status);
                await populateTaskCategory('active');
            } else if (status === 'complete'){
                await api.changeTaskCategory({taskID: element.id, newCategory: 'inprogress'});
                updateTaskCounts();
                await populateTaskCategory(status);
                await populateTaskCategory('inprogress');
            }
        });

        editTaskButton_el.addEventListener('click', async (event) => {
            event.stopPropagation();
            currentOpenEditTaskID = element.id;
            currentOpenEditTaskStatus = element.status;
            await toggleEditTask(element.taskTitle, element.taskDescription); // continues in editTask.js
        });
    });
}

function closePreviousContainer(container) {
    if (container) {
        const previousBulletpointsDiv = container.querySelector('.bulletpoints-div');
        const previousBulletpointList = container.querySelector('.bulletpoint-list');
        const inputButtons = container.querySelectorAll('.input-button');

        container.isDivClicked = false;
        previousBulletpointsDiv.style.display = 'none';
        previousBulletpointList.innerHTML = '';
        container.style.maxHeight = '100px';
        inputButtons.forEach(element => {
            element.style.display = 'none';
        });
        container.classList.remove('clicked');
    }
}

homeButton_el.addEventListener('click', () => {
    window.location.href = `index.html`;
});

addActiveTaskButton_el.addEventListener('click', () => {
    addTaskOverlay_el.style.display = 'flex';
    taskTitleInput_el.focus();
    addTaskTitle_el.textContent = 'Add Active Task';
    currentAddStatus = 'active';
});

addInProgressTaskButton_el.addEventListener('click', () => {
    addTaskOverlay_el.style.display = 'flex';
    taskTitleInput_el.focus();
    addTaskTitle_el.textContent = 'Add In Progress Task';
    currentAddStatus = 'inprogress';
});

addCompleteTaskButton_el.addEventListener('click', () => {
    addTaskOverlay_el.style.display = 'flex';
    taskTitleInput_el.focus();
    addTaskTitle_el.textContent = 'Add Complete Task';
    currentAddStatus = 'complete';
});

addTaskCloseButton_el.addEventListener('click', () => {
    addTaskOverlay_el.style.display = 'none';
});

taskTitleInput_el.addEventListener('focus', () => {
    removeErrorInput(taskTitleInput_el);
});

taskDescriptionTextarea_el.addEventListener('focus', () => {
    removeErrorInput(taskDescriptionTextarea_el);
});

function removeErrorInput(element){
    if (element.classList = 'input-error'){
        element.classList.remove('input-error');
    }
}

saveTaskButton_el.addEventListener('click', async () => {
    if (taskTitleInput_el.value === '') {
        taskTitleInput_el.classList.add('input-error');
    }
    if (taskDescriptionTextarea_el.value === '') {
        taskDescriptionTextarea_el.classList.add('input-error');
    }

    if (taskTitleInput_el.value === '' || taskDescriptionTextarea_el.value === ''){
        return;
    }
    await api.addTask({status: currentAddStatus, projectID: projectID, taskTitle: taskTitleInput_el.value, taskDescription: taskDescriptionTextarea_el.value});
    await api.updateProjectDateModified({projectID: projectID});
    await populateTaskCategory(currentAddStatus);
    updateTaskCounts();
    taskTitleInput_el.value = '';
    taskDescriptionTextarea_el.value = '';
    addTaskOverlay_el.style.display = 'none';
});

