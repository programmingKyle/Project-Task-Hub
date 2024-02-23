const addBulletpointOverlay_el = document.getElementById('addBulletpointOverlay');
const addBulletpointCloseButton_el = document.getElementById('addBulletpointCloseButton');
const bulletpointInput_el = document.getElementById('bulletpointInput');
const addBulletPointButton_el = document.getElementById('addBulletPointButton');

function toggleAddBulletPoint(){
    console.log('Adding bulletpoint');
    addBulletpointOverlay_el.style.display = 'flex';
}

addBulletpointCloseButton_el.addEventListener('click', () => {
    addBulletpointOverlay_el.style.display = 'none';
});

addBulletPointButton_el.addEventListener('click', () => {
    api.bulletpointHandler({request: 'Add', taskID: taskID, projectID: projectID, bulletpoint: bulletpointInput_el.value});
});