const addBulletpointOverlay_el = document.getElementById('addBulletpointOverlay');
const addBulletpointCloseButton_el = document.getElementById('addBulletpointCloseButton');
const bulletpointInput_el = document.getElementById('bulletpointInput');
const addBulletPointButton_el = document.getElementById('addBulletPointButton');

let currentBulletpointList;

function toggleAddBulletPoint(){
    addBulletpointOverlay_el.style.display = 'flex';
    bulletpointInput_el.focus();
}

addBulletpointCloseButton_el.addEventListener('click', () => {
    addBulletpointOverlay_el.style.display = 'none';
    bulletpointInput_el.value = '';
});

addBulletPointButton_el.addEventListener('click', async () => {
    if (bulletpointInput_el.value === '') {
        bulletpointInput_el.classList.add('input-error');
        return;
    }
    await api.bulletpointHandler({request: 'Add', taskID: taskID, projectID: projectID, bulletpoint: bulletpointInput_el.value});
    addBulletpointOverlay_el.style.display = 'none';
    await viewBulletpoints(currentBulletpointList, taskID, projectID);
});

async function viewBulletpoints(container, projectID, taskID) {
    currentBulletpointList = container;
    currentBulletpointList.textContent = '';
    const bulletpoints = await api.bulletpointHandler({ request: 'View', projectID: projectID, taskID: taskID });
    if (bulletpoints.length === 0) {
        container.style.display = 'none';
    } else {
        container.style.display = 'grid';
    }
    bulletpoints.forEach(element => {
        const listItemDiv_el = document.createElement('div');
        listItemDiv_el.classList.add('bulletpoint-list-item-div');

        const text_el = document.createElement('li');
        text_el.textContent = element.bulletpoint;
        text_el.className = 'bulletpoint';

        const editBulletpointButton_el = document.createElement('button');
        editBulletpointButton_el.classList.add('slim-button', 'fas', 'fa-edit');
        editBulletpointButton_el.style.display = 'none';

        editBulletpointButton_el.addEventListener('click', (event) => {
            event.stopPropagation();
            editBulletpointInput_el.focus();
            currentEditBulletpointID = element.id;
            editBulletpointInput_el.value = element.bulletpoint;
            editBulletpoint(element.id, element.taskID, element.projectID);
        });

        const bulletpointDeleteButton_el = document.createElement('button');
        bulletpointDeleteButton_el.classList.add('slim-button', 'fas', 'fa-trash');
        bulletpointDeleteButton_el.style.display = 'none';

        bulletpointDeleteButton_el.addEventListener('click', (event) => {
            event.stopPropagation();
            currentDeleteBulletpointID = element.id;
            deleteBulletpointOverlay_el.style.display = 'flex';
        });

        listItemDiv_el.append(text_el);
        listItemDiv_el.append(editBulletpointButton_el);
        listItemDiv_el.append(bulletpointDeleteButton_el);
        currentBulletpointList.appendChild(listItemDiv_el);

        listItemDiv_el.addEventListener('mouseenter', () => {
            bulletpointDeleteButton_el.style.display = 'block';
            editBulletpointButton_el.style.display = 'block';
            listItemDiv_el.classList.add('hovered');
        });

        listItemDiv_el.addEventListener('mouseleave', () => {
            bulletpointDeleteButton_el.style.display = 'none';
            editBulletpointButton_el.style.display = 'none';
            listItemDiv_el.classList.remove('hovered');
        });
    });
}
document.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter'){
        if (bulletpointInput_el.classList.contains('input-error')){
            bulletpointInput_el.classList.remove('input-error');
        }
        if (addBulletpointOverlay_el.style.display !== 'none'){
            if (bulletpointInput_el.value === '') {
                bulletpointInput_el.classList.add('input-error');
                return;
            }
            await api.bulletpointHandler({request: 'Add', taskID: taskID, projectID: projectID, bulletpoint: bulletpointInput_el.value});
            await viewBulletpoints(currentBulletpointList, taskID, projectID);    
            bulletpointInput_el.value = '';
        }    
    }
});

document.addEventListener('keydown', async (event) => {
    if (event.key === 'Escape' && addBulletpointOverlay_el.style.display !== 'none') {
        addBulletpointOverlay_el.style.display = 'none';
        bulletpointInput_el.value = '';
    }
});
