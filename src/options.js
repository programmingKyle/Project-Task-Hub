const optionsButton_el = document.getElementById('optionsButton');

const optionsOverlay_el = document.getElementById('optionsOverlay');
const closeOptionsButton_el = document.getElementById('closeOptionsButton');

optionsButton_el.addEventListener('click', () => {
    optionsOverlay_el.style.display = 'flex';
});

closeOptionsButton_el.addEventListener('click', () => {
    optionsOverlay_el.style.display = 'none';
})