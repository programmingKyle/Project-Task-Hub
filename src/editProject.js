const openEditProject_el = document.getElementById('openEditProject');
const quickProjectStats_el = document.getElementById('quickProjectStats');
const editProjectDiv_el = document.getElementById('editProjectDiv');
const editProjectNameButton_el = document.getElementById('editProjectNameButton');
const completeProjectButton_el = document.getElementById('completeProjectButton');
const deleteProjectButton_el = document.getElementById('deleteProjectButton');

const projectNameDiv_el = document.getElementById('projectNameDiv');
const editProjectNameDiv_el = document.getElementById('editProjectNameDiv');
const completeProjectDiv_el = document.getElementById('completeProjectDiv');
const deleteProjectDiv_el = document.getElementById('deleteProjectDiv');
const completeText_el = document.getElementById('completeText');

openEditProject_el.addEventListener('click', () => {
    toggleEditDiv();
});

function toggleCompleteButtonText (){
    if (projectStatus === 'complete'){
        completeProjectButton_el.textContent = 'Reactivate Project';
    } else if (projectStatus === 'active'){
        completeProjectButton_el.textContent = 'Complete Project';
    }
}

let isEditDivOpen = false;
function toggleEditDiv(){
    toggleCompleteButtonText();
    if (!isEditDivOpen){
        isEditDivOpen = true;
        openEditProject_el.classList = 'slim-button fas fa-arrow-left';
        quickProjectStats_el.style.display = 'none';
        editProjectDiv_el.style.display = 'grid';    
    } else {
        isEditDivOpen = false;
        openEditProject_el.classList = 'slim-button fas fa-edit';
        quickProjectStats_el.style.display = 'grid';
        editProjectDiv_el.style.display = 'none';    
    }    
}

let isEditProjectNameOpen;
function toggleEditProjectNameDiv(){
    if (!isEditProjectNameOpen){
        isEditProjectNameOpen = true;
        editProjectNameInput_el.value = projectName;
        projectNameDiv_el.style.display = 'none';
        editProjectNameDiv_el.style.display = 'grid';
        editProjectDiv_el.style.display = 'none';
    } else {
        isEditProjectNameOpen = false;
        projectNameDiv_el.style.display = 'grid';
        editProjectNameDiv_el.style.display = 'none';
        editProjectDiv_el.style.display = 'grid';
    }
}

let isCompleteProjectDivOpen;
function toggleCompleteProjectDiv(){
    if (!isCompleteProjectDivOpen){
        if (projectStatus === 'active'){
            completeText_el.textContent = 'Do you want to complete this project?';
        } else {
            completeText_el.textContent = 'Do you want to reactivate this project?';
        }
        isCompleteProjectDivOpen = true;
        projectNameDiv_el.style.display = 'none';
        completeProjectDiv_el.style.display = 'grid';
        editProjectDiv_el.style.display = 'none';
    } else {
        isCompleteProjectDivOpen = false;
        projectNameDiv_el.style.display = 'grid';
        completeProjectDiv_el.style.display = 'none';
        editProjectDiv_el.style.display = 'grid';
    }
}

let isDeleteProjectDivOpen;
function toggleDeleteProjectDiv(){
    if (!isDeleteProjectDivOpen){
        isDeleteProjectDivOpen = true;
        projectNameDiv_el.style.display = 'none';
        editProjectDiv_el.style.display = 'none';
        deleteProjectDiv_el.style.display = 'grid';
    } else {
        isDeleteProjectDivOpen = false;
        projectNameDiv_el.style.display = 'grid';
        editProjectDiv_el.style.display = 'grid';
        deleteProjectDiv_el.style.display = 'none';
    }
}



const editProjectNameInput_el = document.getElementById('editProjectNameInput');
const confirmProjectNameChange_el = document.getElementById('confirmProjectNameChange');
const backProjectNameChange_el = document.getElementById('backProjectNameChange');

editProjectNameButton_el.addEventListener('click', () => {
    toggleEditProjectNameDiv();
});

confirmProjectNameChange_el.addEventListener('click', async () => {
    if (editProjectNameInput_el.value === ''){
        editProjectNameInput_el.classList.add('input-error');
        return;
    }
    await api.projectHandler({request: 'Edit', projectID: projectID, newProjectName: editProjectNameInput_el.value});
    toggleEditProjectNameDiv();
    toggleEditDiv();
    projectNameHeader_el.textContent = editProjectNameInput_el.value;
});

backProjectNameChange_el.addEventListener('click', () => {
    toggleEditProjectNameDiv();
});

editProjectNameInput_el.addEventListener('focus', async () => {
    removeErrorInput(editProjectNameInput_el);
})

const confirmCompleteProject_el = document.getElementById('confirmCompleteProject');
const backCompleteProject_el = document.getElementById('backCompleteProject');

completeProjectButton_el.addEventListener('click', () => {
    toggleCompleteProjectDiv();
});

confirmCompleteProject_el.addEventListener('click', async () => {
    if (projectStatus === 'active'){
        await  api.projectHandler({request: 'CompleteHandler', projectID: projectID, newStatus: 'complete'});
        projectStatus = 'complete';
        projectStatusText_el.textContent = 'Complete';
        projectStatusText_el.style.color = 'green';
    } else if (projectStatus === 'complete') {
        await  api.projectHandler({request: 'CompleteHandler', projectID: projectID, newStatus: 'active'});
        projectStatus = 'active';
        projectStatusText_el.textContent = 'Active';
        projectStatusText_el.style.color = '';
    }
    toggleCompleteProjectDiv();
    toggleEditDiv();
});

backCompleteProject_el.addEventListener('click', () => {
    toggleCompleteProjectDiv();
});



const confirmDeleteProjectInput_el = document.getElementById('confirmDeleteProjectInput');
const confirmDeleteProjectButton_el = document.getElementById('confirmDeleteProjectButton');
const backDeleteProjectButton_el = document.getElementById('backDeleteProjectButton');

deleteProjectButton_el.addEventListener('click', () => {
    toggleDeleteProjectDiv();
});

backDeleteProjectButton_el.addEventListener('click', () => {
    toggleDeleteProjectDiv();
});

confirmDeleteProjectInput_el.addEventListener('focus', () => {
    removeErrorInput(confirmDeleteProjectInput_el);
})

confirmDeleteProjectButton_el.addEventListener('click', async () => {
    if (confirmDeleteProjectInput_el.value === ''){
        confirmDeleteProjectInput_el.classList.add('input-error');
        return;
    }

    if (confirmDeleteProjectInput_el.value === 'DELETE'){
        await api.projectHandler({request: 'Delete', projectID: projectID});
        window.location.href = `index.html`;
    } else {
        confirmDeleteProjectInput_el.classList.add('input-error');
        confirmDeleteProjectInput_el.value = '';
    }
});

function removeErrorInput(element){
    if (element.classList = 'input-error'){
        element.classList.remove('input-error');
    }
}
