const deleteBulletpointOverlay_el = document.getElementById('deleteBulletpointOverlay');
const confirmDeleteBulletpointButton_el = document.getElementById('confirmDeleteBulletpointButton');
const cancelDeleteBulletpointButton_el = document.getElementById('cancelDeleteBulletpointButton');

cancelDeleteBulletpointButton_el.addEventListener('click', () => {
    deleteBulletpointOverlay_el.style.display = 'none';
});