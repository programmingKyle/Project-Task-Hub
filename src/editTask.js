const editTaskOverlay_el = document.getElementById('editTaskOverlay');
const editTaskCloseButton_el = document.getElementById('editTaskCloseButton');
const editTaskTitle_el = document.getElementById('editTaskTitle');
const editTaskDescription_el = document.getElementById('editTaskDescription');
const updateTaskButton_el = document.getElementById('updateTaskButton');

let isEditingTask = false;

let initialTitle;
let initialDescription;

async function toggleEditTask(title, description){
    if (!isEditingTask){
        isEditingTask = true;
        initialTitle = title
        initialDescription = description;
        editTaskTitle_el.value = title;
        editTaskDescription_el.value = description;
        editTaskOverlay_el.style.display = 'flex';
        editTaskTitle_el.focus();
    } else {
        isEditingTask = false;
        currentOpenEditTask = '';
        initialTitle = '';
        initialDescription = '';
        editTaskTitle_el.value = '';
        editTaskDescription_el.value = '';
        editTaskOverlay_el.style.display = 'none';
    }
}

editTaskCloseButton_el.addEventListener('click', () => {
    toggleEditTask();
});

updateTaskButton_el.addEventListener('click', async () => {
    const isTitleChanged = initialTitle !== editTaskTitle_el.value;
    const isDescriptionChanged = initialDescription !== editTaskDescription_el.value;
  
    if (isTitleChanged || isDescriptionChanged) {
      const requestType = isTitleChanged && isDescriptionChanged ? 'Both' : (isTitleChanged ? 'Title' : 'Description');
      const requestData = {
        request: requestType,
        taskID: currentOpenEditTaskID,
        newTitle: isTitleChanged ? editTaskTitle_el.value : undefined,
        newDescription: isDescriptionChanged ? editTaskDescription_el.value : undefined,
      }; 
      await api.editTask(requestData);
      api.updateProjectDateModified({projectID: projectID});
    }
    await populateTaskCategory(currentOpenEditTaskStatus);
    await toggleEditTask();
  });

  