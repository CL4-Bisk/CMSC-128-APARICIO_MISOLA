import { addTaskToDB, getTasksFromDB, updateTaskInDB, deleteTaskFromDB } from "./firebase.js";

// TDL elements
const addButton = document.getElementById('add-task-btn');
const cancelButton = document.getElementById('cancel');
const taskForms = document.getElementById('task-forms');
const taskList = document.getElementById('task-list');
const submitButton = document.getElementById('submit');
const forms = document.getElementById('todo-form');
let numberOfTasks = 0;

// Show form when Add Task button is clicked
addButton.addEventListener('click', e => {
    e.preventDefault();
    taskForms.style.display = 'block';
    cancelButton.style.display = 'inline';
});

submitButton.addEventListener('click', async e => {
    e.preventDefault();
    taskList.style.display = 'block';

    const task = document.getElementById('task-input').value || "Unnamed Task";
    const dueDate = document.getElementById('due-date').value || new Date().toISOString().slice(0,16);
    const createdAt = new Date().toLocaleString();

    // Save to Firebase
    const id = await addTaskToDB(task, dueDate, createdAt);

    addTaskInterface(task, dueDate, id, createdAt);
    forms.reset();
});

cancelButton.addEventListener('click', e => {
    e.preventDefault();
    taskForms.style.display = 'none';
    cancelButton.style.display = 'none';
    forms.reset();
});

// Load saved tasks from Firestore when page opens
document.addEventListener("DOMContentLoaded", async () => {
    const tasks = await getTasksFromDB();
    tasks.forEach(t => {
        addTaskInterface(t.task, t.dueDate, t.id, t.createdAt);
    });
});

function addTaskInterface(task, dueDate, id, createdAt) {
    numberOfTasks = taskList.getElementsByTagName('li').length + 1;

    const li = document.createElement('li');
    
    // Checkbox
    const completeButton = document.createElement('input');
    completeButton.type = 'checkbox';
    completeButton.style.marginLeft = '10px';
    taskList.appendChild(completeButton);

    li.textContent = `Task no.${numberOfTasks}: ${task} - Due: ${new Date(dueDate).toLocaleString()}`;
    taskList.appendChild(li);

    // Timestamp
    const timeLabel = document.createElement('label');
    timeLabel.textContent = 'Added at: ' + (createdAt || new Date().toLocaleString());
    li.appendChild(timeLabel);

    // const label = document.createElement('label');
    // label.textContent = 'Mark as done';
    // li.appendChild(label);

    // Edit button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.style.marginLeft = '10px';
    li.appendChild(editButton);

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '10px';
    li.appendChild(deleteButton);

    // Checkbox logic
    completeButton.addEventListener('change', () => {
        li.style.textDecoration = completeButton.checked ? 'line-through' : 'none';
    });

    // Edit logic
    editButton.addEventListener('click', () => {
        const newTask = document.createElement('input');
        newTask.type = 'text';
        newTask.value = task;
        li.appendChild(newTask);

        const newDueDate = document.createElement('input');
        newDueDate.type = 'datetime-local';
        newDueDate.value = dueDate;
        li.appendChild(newDueDate);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        li.appendChild(saveButton);

        const cancelEditButton = document.createElement('button');
        cancelEditButton.textContent = 'Cancel';
        li.appendChild(cancelEditButton);

        editButton.style.display = 'none';

        saveButton.addEventListener('click', async () => {
            const updatedTask = newTask.value.trim() || task;
            const updatedDueDate = newDueDate.value.trim() || dueDate;

            // Update Firestore
            await updateTaskInDB(id, updatedTask, updatedDueDate);

            // Update UI
            task = updatedTask;
            dueDate = updatedDueDate;
            li.textContent = `Task no.${numberOfTasks}: ${task} - Due: ${new Date(dueDate).toLocaleString()}`;
            li.appendChild(timeLabel);
            li.appendChild(completeButton);
            li.appendChild(label);
            li.appendChild(editButton);
            li.appendChild(deleteButton);

            editButton.style.display = 'inline';
        });

        cancelEditButton.addEventListener('click', () => {
            newTask.remove();
            newDueDate.remove();
            saveButton.remove();
            cancelEditButton.remove();
            editButton.style.display = 'inline';
        });
    });

    // Delete logic
    deleteButton.addEventListener('click', () => {
        const confirmDelete = document.createElement('div');
        confirmDelete.textContent = 'Are you sure you want to delete this task? ';
        const yesButton = document.createElement('button');
        yesButton.textContent = 'Yes';
        const noButton = document.createElement('button');
        noButton.textContent = 'No';
        confirmDelete.appendChild(yesButton);
        confirmDelete.appendChild(noButton);
        li.appendChild(confirmDelete);

        yesButton.addEventListener('click', async () => {
            await deleteTaskFromDB(id); // remove from Firestore
            taskList.removeChild(li);
            taskList.removeChild(completeButton);
        });

        noButton.addEventListener('click', () => {
            confirmDelete.remove();
        });
    });
}
