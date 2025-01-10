const optionsButton_el = document.getElementById('optionsButton');

const optionsOverlay_el = document.getElementById('optionsOverlay');
const databaseContent_el = document.getElementById('databaseContent');

const optionsDirectoryText_el = document.getElementById('optionsDirectoryText');
const optionsChangeDirectoryButton_el = document.getElementById('optionsChangeDirectoryButton');
const optionsResetDirectoryButton_el = document.getElementById('optionsResetDirectoryButton');
const saveDirectoryButton_el = document.getElementById('saveDirectoryButton');
const closeOptionsButton_el = document.getElementById('closeOptionsButton');

optionsButton_el.addEventListener('click', async () => {
    optionsOverlay_el.style.display = 'flex'; 
    const directory = await api.grabDatabaseDirectory();
    optionsDirectoryText_el.textContent = directory;
});

closeOptionsButton_el.addEventListener('click', () => {
    optionsOverlay_el.style.display = 'none';
})