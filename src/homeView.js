const addProjectButton_el = document.getElementById('addProjectButton');
const addProjectOverlay_el = document.getElementById('addProjectOverlay');

const addProjectCloseButton_el = document.getElementById('addProjectCloseButton');
const projectNameInput_el = document.getElementById('projectNameInput');
const saveProjectButton_el = document.getElementById('saveProjectButton');

const projectListDiv_el = document.getElementById('projectListDiv');
const showActiveProjectsButton_el = document.getElementById('showActiveProjectsButton');
const showCompleteProjectsButton_el = document.getElementById('showCompleteProjectsButton');
const selectedProjectStatusHeader_el = document.getElementById('selectedProjectStatusHeader');

addProjectButton_el.addEventListener('click', () => {
    addProjectOverlay_el.style.display = 'flex';
    projectNameInput_el.focus();
});

addProjectCloseButton_el.addEventListener('click', () => {
    removeErrorInput(projectNameInput_el);
    addProjectOverlay_el.style.display = 'none';
});

projectNameInput_el.addEventListener('focus', () => {
    removeErrorInput(projectNameInput_el);
});

function removeErrorInput(element){
    if (element.classList = 'input-error'){
        element.classList.remove('input-error');
    }
}

saveProjectButton_el.addEventListener('click', async (event) => {
    if (projectNameInput_el.value === ''){
        projectNameInput_el.classList.add('input-error');
        event.preventDefault();
    } else {
        removeErrorInput(projectNameInput_el);
        await api.projectHandler({request: 'Add', projectName: projectNameInput_el.value});
        addProjectOverlay_el.style.display = 'none';
        projectNameInput_el.value = '';
        populateProjectList('active');    
        updateCounts();
    }
});

async function populateProjectList(statusRequest){
    if (statusRequest === 'complete'){
        showActiveProjectsButton_el.style.backgroundColor = 'transparent';
        showCompleteProjectsButton_el.style.backgroundColor = 'rgb(49, 49, 49)'; 
    } else if (statusRequest === 'active'){
        showActiveProjectsButton_el.style.backgroundColor = 'rgb(49, 49, 49)'; 
        showCompleteProjectsButton_el.style.backgroundColor = 'transparent';
    }
    projectListDiv_el.innerHTML = '';
    const projectNames = await api.getProjects({request: statusRequest});
    projectNames.forEach(element => {
        const projectButton_el = document.createElement('button');
        projectButton_el.textContent = element.projectName;
        projectButton_el.className = 'project-button';
        //projectButton_el.style = 'width: 100%;';
        projectListDiv_el.appendChild(projectButton_el);

        projectButton_el.addEventListener('click', () => {
            // Navigate to project.html with the project name as a URL parameter
            window.location.href = `project.html?projectId=${encodeURIComponent(element.id)}&projectName=${encodeURIComponent(element.projectName)}&projectStatus=${encodeURIComponent(element.status)}`;
        });
    });
}

showActiveProjectsButton_el.addEventListener('click', () => {
    populateProjectList('active');  
    selectedProjectStatusHeader_el.textContent = 'Active Projects';  
});

showCompleteProjectsButton_el.addEventListener('click', () => {
    populateProjectList('complete');
    selectedProjectStatusHeader_el.textContent = 'Complete Projects';  
});

document.addEventListener('DOMContentLoaded', async () => {
    populateProjectList('active');
});
