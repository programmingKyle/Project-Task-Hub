const addBulletpointOverlay_el = document.getElementById('addBulletpointOverlay');
const addBulletpointCloseButton_el = document.getElementById('addBulletpointCloseButton');
const bulletpointInput_el = document.getElementById('bulletpointInput');
const addBulletPointButton_el = document.getElementById('addBulletPointButton');

let currentBulletpointList;

function toggleAddBulletPoint(){
    addBulletpointOverlay_el.style.display = 'flex';
}

addBulletpointCloseButton_el.addEventListener('click', () => {
    addBulletpointOverlay_el.style.display = 'none';
});

addBulletPointButton_el.addEventListener('click', async () => {
    await api.bulletpointHandler({request: 'Add', taskID: taskID, projectID: projectID, bulletpoint: bulletpointInput_el.value});
    addBulletpointOverlay_el.style.display = 'none';
    await viewBulletpoints(currentBulletpointList, taskID, projectID);
});

async function viewBulletpoints(container, projectID, taskID){
    currentBulletpointList = container;
    const bulletpoints = await api.bulletpointHandler({request: 'View', projectID: projectID, taskID: taskID});
    bulletpoints.forEach(element => {
        const text_el = document.createElement('li');
        text_el.textContent = element.bulletpoint;
        text_el.className = 'bulletpoint';
        currentBulletpointList.appendChild(text_el);
    });
}