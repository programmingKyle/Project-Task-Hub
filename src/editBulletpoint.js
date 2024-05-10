const editBulletpointOverlay_el = document.getElementById('editBulletpointOverlay');
const editBulletpointCloseButton_el = document.getElementById('editBulletpointCloseButton');
const editBulletpointInput_el = document.getElementById('editBulletpointInput');
const editBulletPointButton_el = document.getElementById('editBulletPointButton');

let currentEditBulletpointID;
let currentEditTaskID;
let currentEditProjectID;

function editBulletpoint(bulletpointID, taskID, projectID) {
    currentEditBulletpointID = bulletpointID;
    currentEditTaskID = taskID;
    currentEditProjectID = projectID;
    editBulletpointOverlay_el.style.display = 'flex';
    editBulletpointInput_el.focus();
}

editBulletpointCloseButton_el.addEventListener('click', () => {
    editBulletpointOverlay_el.style.display = 'none';
});

editBulletPointButton_el.addEventListener('click', async () => {
    if (editBulletpointInput_el.value === ''){
        editBulletpointInput_el.classList.add('input-error');
    } else {
        await api.bulletpointHandler({request: 'Edit', bulletpointID: currentEditBulletpointID, editBulletpoint: editBulletpointInput_el.value});
        editBulletpointInput_el.value = '';
        editBulletpointOverlay_el.style.display = 'none';
        await viewBulletpoints(currentBulletpointList, currentEditTaskID, currentEditProjectID);    
    }
});

document.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter'){
        if (editBulletpointOverlay_el.style.display !== 'none'){
            if (editBulletpointInput_el.value === ''){
                editBulletpointInput_el.classList.add('input-error');
            } else {
                removeErrorInput(editBulletpointInput_el);
                await api.bulletpointHandler({request: 'Edit', bulletpointID: currentEditBulletpointID, editBulletpoint: editBulletpointInput_el.value});
                await api.updateProjectDateModified({projectID: currentEditProjectID});
                editBulletpointInput_el.value = '';
                editBulletpointOverlay_el.style.display = 'none';
                await viewBulletpoints(currentBulletpointList, currentEditTaskID, currentEditProjectID);    
            }
        }
    }
});