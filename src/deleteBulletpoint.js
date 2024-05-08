const deleteBulletpointOverlay_el = document.getElementById('deleteBulletpointOverlay');
const confirmDeleteBulletpointButton_el = document.getElementById('confirmDeleteBulletpointButton');
const cancelDeleteBulletpointButton_el = document.getElementById('cancelDeleteBulletpointButton');

let currentDeleteBulletpointID;
let currentDeleteTaskID;
let currentDeleteProjectID;

function deleteBulletpoint(bulletpointID, taskID, projectID){
    currentDeleteBulletpointID = bulletpointID;
    currentDeleteTaskID = taskID;
    currentDeleteProjectID = projectID;
}

cancelDeleteBulletpointButton_el.addEventListener('click', () => {
    deleteBulletpointOverlay_el.style.display = 'none';
});

confirmDeleteBulletpointButton_el.addEventListener('click', async () => {
    await api.bulletpointHandler({request: 'Delete', bulletpointID: currentDeleteBulletpointID});
    deleteBulletpointOverlay_el.style.display = 'none';
    await viewBulletpoints(currentBulletpointList, currentDeleteTaskID, currentDeleteProjectID);
    await populateActiveBulletpoints();
    await populateCompleteBulletpoints();
});