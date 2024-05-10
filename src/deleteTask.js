const deleteTaskOverlay_el = document.getElementById('deleteTaskOverlay');
const confirmDeleteTaskButton_el = document.getElementById('confirmDeleteTaskButton');
const noDeleteTaskButton_el = document.getElementById('noDeleteTaskButton');
const deleteTaskButton_el = document.getElementById('deleteTaskButton');

let isDeleteTask = false;

function toggleDeleteTask(){
    if (!isDeleteTask){
        isDeleteTask = true;
        deleteTaskOverlay_el.style.display = 'flex';
    } else {
        isDeleteTask = false;
        deleteTaskOverlay_el.style.display = 'none';
    }
}

deleteTaskButton_el.addEventListener('click', async () => {
    toggleEditTask();
    toggleDeleteTask();
})

confirmDeleteTaskButton_el.addEventListener('click', async () => {
    await api.deleteTask({taskID: currentOpenEditTaskID});
    await api.updateProjectDateModified({projectID: projectID});
    toggleDeleteTask();
    await populateTaskCategory(currentOpenEditTaskStatus)
    updateTaskCounts();
});

noDeleteTaskButton_el.addEventListener('click', () => {
    toggleDeleteTask();
});