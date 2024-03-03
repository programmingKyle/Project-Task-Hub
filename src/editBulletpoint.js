const editBulletpointOverlay_el = document.getElementById('editBulletpointOverlay');
const editBulletpointCloseButton_el = document.getElementById('editBulletpointCloseButton');
const editBulletpointInput_el = document.getElementById('editBulletpointInput');
const editBulletPointButton_el = document.getElementById('editBulletPointButton');

let currentEditBulletpointID;

editBulletpointCloseButton_el.addEventListener('click', () => {
    editBulletpointOverlay_el.style.display = 'none';
});

editBulletPointButton_el.addEventListener('click', () => {
    console.log(`Edit ${currentEditBulletpointID}`);
});