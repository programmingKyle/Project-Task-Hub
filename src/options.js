const optionsButton_el = document.getElementById('optionsButton');

const optionsOverlay_el = document.getElementById('optionsOverlay');
const databaseContent_el = document.getElementById('databaseContent');

const optionsDirectoryText_el = document.getElementById('optionsDirectoryText');
const optionsChangeDirectoryButton_el = document.getElementById('optionsChangeDirectoryButton');
const optionsResetDirectoryButton_el = document.getElementById('optionsResetDirectoryButton');
const saveDirectoryButton_el = document.getElementById('saveDirectoryButton');
const closeOptionsButton_el = document.getElementById('closeOptionsButton');

let databaseDirectoryLoc;

optionsButton_el.addEventListener('click', async () => {
    optionsOverlay_el.style.display = 'flex'; 
    databaseDirectoryLoc = await api.grabDatabaseDirectory({request: 'Saved'});
    optionsDirectoryText_el.textContent = databaseDirectoryLoc;
});

closeOptionsButton_el.addEventListener('click', () => {
    optionsOverlay_el.style.display = 'none';
});

optionsChangeDirectoryButton_el.addEventListener('click', async () => {
    databaseDirectoryLoc = await api.fileDirectoryDialog();
    optionsDirectoryText_el.textContent = databaseDirectoryLoc;
});

saveDirectoryButton_el.addEventListener('click', async () => {
    const result = await api.saveDatabaseDirectory({directory: databaseDirectoryLoc});
    console.log(result);
    if (result.success){
        optionsOverlay_el.style.display = 'none';
    } else {
        console.log(result.message);
    }

    await repopulateHomeView();
});

optionsResetDirectoryButton_el.addEventListener('click', async () => {
    databaseDirectoryLoc = await api.grabDatabaseDirectory({request: 'Default'});
    optionsDirectoryText_el.textContent = databaseDirectoryLoc;
});