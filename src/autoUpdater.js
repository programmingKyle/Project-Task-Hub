const updateOverlay_el = document.getElementById('updateOverlay');
const startUpdateButton_el = document.getElementById('startUpdateButton');
const quitUpdateButton_el = document.getElementById('quitUpdateButton');
const updateControlDiv_el = document.getElementById('updateControlDiv');
const downloadingText_el = document.getElementById('downloadingText');
const pleaseWaitText_el = document.getElementById('pleaseWaitText');

api.autoUpdaterCallback((status) => {
    if (status === 'Update Available'){
        updateOverlay_el.style.display = 'flex';
        if (selectUserTypeOverlay_el.style.display !== 'none'){
            selectUserTypeOverlay_el.style.display = 'none'
        }
    }
    if (status === 'Update Downloaded'){
        updateControlDiv_el.style.display = 'grid';
        downloadingText_el.textContent = 'Download Complete!';
        pleaseWaitText_el.style.display = 'none';
    }
});

startUpdateButton_el.addEventListener('click', () => {
    api.restartAndUpdate();
});

quitUpdateButton_el.addEventListener('click', () => {
    api.closeApp();
});