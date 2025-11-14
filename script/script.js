import { addTaskToDB, getTasksFromDB, updateTaskInDB, deleteTaskFromDB,
    addCollabTaskToDB, deleteCollabTaskFromDB, updateCollabTaskInDB, getCollabTasksFromDB,
    getUserDataFromDB, onAuthStateChangedListener, getUserByUsernameOrEmail, 
    saveCollabUserToDB, getCollabUserFromDB, removeCollabUserFromDB } from "./firebase.js";

// TDL elements
const addUserTaskButton = document.getElementById('add-task-btn');
const cancelButton = document.getElementById('cancel');
const taskForms = document.getElementById('task-forms');
const taskList = document.getElementById('task-list');
const submitButton = document.getElementById('submit');
const forms = document.getElementById('todo-form');

// Collab TDL elements
const addCollabTaskButton = document.getElementById('add-collab-task-btn');
const taskFormsCollab = document.getElementById('task-forms-collab');
const taskListCollab = document.getElementById('collab-tasks');
const submitButtonCollab = document.getElementById('submit-collab');
const formsCollab = document.getElementById('todo-form-collab');
const cancelButtonCollab = document.getElementById('cancel-collab');

// Collab user management
const addCollabUserButton = document.getElementById('add-collab-user-btn');
const collabUserForm = document.getElementById('collab-user-form');
const submitCollabUser = document.getElementById('submit-collab-user');
const cancelCollabUser = document.getElementById('cancel-collab-user');
const collabUserInfo = document.getElementById('collab-user-info');
const removeCollabUserBtn = document.getElementById('remove-collab-user');

const profileButton = document.getElementById('profile-btn');
let numberOfTasks = 0;
let numberOfCollabTasks = 0;

let currTasksUser = null;
let currCollabUserId = null;

onAuthStateChangedListener(async (user) => {
    currTasksUser = user;
    if (user) {
        await console.log(currTasksUser.uid);
        const taskUserData = await getUserDataFromDB(currTasksUser.uid);

        // Load personal tasks
        console.log("Loading personal tasks");
        const tasks = await getTasksFromDB(currTasksUser.uid);
        tasks.forEach(t => {
            addTaskInterface(t.task, t.dueDate, t.id, t.createdAt);
        });

        // Load collaborator user if exists
        const collabUser = await getCollabUserFromDB(currTasksUser.uid);
        if (collabUser) {
            currCollabUserId = collabUser.collabUserId;
            const collabUserData = await getUserDataFromDB(currCollabUserId);
            displayCollabUser(collabUserData);

            // Load collab tasks
            console.log("Loading collab tasks");
            const collabTasks = await getCollabTasksFromDB(currTasksUser.uid);
            collabTasks.forEach(t => {
                addCollabTaskInterface(t.task, t.dueDate, t.id, t.createdAt);
            });
        }

        document.getElementById('welcome').textContent = `Welcome, ${taskUserData.name}!`;
        console.log(`User logged in -\nName: ${taskUserData.name}\nUsername: ${taskUserData.username}\nEmail: ${taskUserData.email}`);
    } else {
        console.log("No user logged in");
    }
});


// Profile button navigation
profileButton.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = 'index.html';
});


// Show form when Add Task button is clicked
addUserTaskButton.addEventListener('click', e => {
    e.preventDefault();
    taskForms.style.display = 'block';
    cancelButton.style.display = 'inline';
});

addCollabTaskButton.addEventListener('click', e => {
    e.preventDefault();
    if (!currCollabUserId) {
        alert('Please add a collaborator first!');
        return;
    }
    taskFormsCollab.style.display = 'block';
    cancelButtonCollab.style.display = 'inline';
});

submitButton.addEventListener('click', async e => {
    e.preventDefault();
    taskList.style.display = 'block';

    const task = document.getElementById('task-input').value || "Unnamed Task";
    const dueDate = document.getElementById('due-date').value || new Date().toISOString().slice(0,16);
    const createdAt = new Date().toLocaleString();

    // Save to Firebase
    const id = await addTaskToDB(currTasksUser.uid, task, dueDate, createdAt);

    addTaskInterface(task, dueDate, id, createdAt);
    forms.reset();
});

cancelButton.addEventListener('click', e => {
    e.preventDefault();
    taskForms.style.display = 'none';
    cancelButton.style.display = 'none';
    forms.reset();
});

submitButtonCollab.addEventListener('click', async e => {
    e.preventDefault();
    taskListCollab.style.display = 'block';

    const task = document.getElementById('task-input-collab').value || "Unnamed Task";
    const dueDate = document.getElementById('due-date-collab').value || new Date().toISOString().slice(0,16);
    const createdAt = new Date().toLocaleString();

    // Save to Firebase
    const id = await addCollabTaskToDB(currTasksUser.uid, task, dueDate, createdAt);
    await addCollabTaskToDB(currCollabUserId, task, dueDate, createdAt);


    addCollabTaskInterface(task, dueDate, id, createdAt);
    formsCollab.reset();
});

cancelButtonCollab.addEventListener('click', e => {
    e.preventDefault();
    taskFormsCollab.style.display = 'none';
    cancelButtonCollab.style.display = 'none';
    formsCollab.reset();
});


// Add collaborator user
addCollabUserButton.addEventListener('click', e => {
    e.preventDefault();
    if (currCollabUserId) {
        alert('You already have a collaborator. Remove them first to add a new one.');
        return;
    }
    collabUserForm.style.display = 'block';
});


cancelCollabUser.addEventListener('click', e => {
    e.preventDefault();
    collabUserForm.style.display = 'none';
    document.getElementById('collab-identifier').value = '';
});


submitCollabUser.addEventListener('click', async e => {
    e.preventDefault();
    const identifier = document.getElementById('collab-identifier').value.trim();
    
    if (!identifier) {
        alert('Please enter a username or email');
        return;
    }

    try {
        const collabUserData = await getUserByUsernameOrEmail(identifier);
        
        if (!collabUserData) {
            alert('User not found!');
            return;
        }

        if (collabUserData.uid === currTasksUser.uid) {
            alert('You cannot add yourself as a collaborator!');
            return;
        }

        await saveCollabUserToDB(currTasksUser.uid, collabUserData.uid);
        await saveCollabUserToDB(collabUserData.uid, currTasksUser.uid); // Mutual collaboration
        currCollabUserId = collabUserData.uid;
        
        displayCollabUser(collabUserData);
        collabUserForm.style.display = 'none';
        document.getElementById('collab-identifier').value = '';
        
        alert(`Collaborator ${collabUserData.name} added successfully!`);
    } catch (error) {
        console.error('Error adding collaborator:', error);
        alert('Failed to add collaborator. Please try again.');
    }
});

// Remove collaborator
removeCollabUserBtn.addEventListener('click', async e => {
    e.preventDefault();
    
    if (!confirm('Are you sure you want to remove this collaborator? All shared tasks will be deleted.')) {
        return;
    }

    try {
        await removeCollabUserFromDB(currTasksUser.uid);
        currCollabUserId = null;
        collabUserInfo.style.display = 'none';
        taskListCollab.innerHTML = '';
        numberOfCollabTasks = 0;
        alert('Collaborator removed successfully!');
    } catch (error) {
        console.error('Error removing collaborator:', error);
        alert('Failed to remove collaborator. Please try again.');
    }
});


function displayCollabUser(userData) {
    document.getElementById('collab-user-name').textContent = `Collaborator: ${userData.name} (@${userData.username})`;
    collabUserInfo.style.display = 'block';
}


function addTaskInterface(task, dueDate, id, createdAt) {
    numberOfTasks = taskList.getElementsByTagName('li').length + 1;

    const li = document.createElement('li');
    
    const completeButton = document.createElement('input');
    completeButton.type = 'checkbox';
    completeButton.style.marginRight = '10px';
    
    const taskText = document.createElement('span');
    taskText.textContent = `Task ${numberOfTasks}: ${task} - Due: ${new Date(dueDate).toLocaleString()}`;
    
    li.appendChild(completeButton);
    li.appendChild(taskText);

    const timeLabel = document.createElement('label');
    timeLabel.textContent = ' (Added: ' + (createdAt || new Date().toLocaleString()) + ')';
    timeLabel.style.fontSize = '0.9em';
    timeLabel.style.color = '#666';
    li.appendChild(timeLabel);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.style.marginLeft = '10px';
    li.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '10px';
    li.appendChild(deleteButton);

    taskList.appendChild(li);

    completeButton.addEventListener('change', () => {
        taskText.style.textDecoration = completeButton.checked ? 'line-through' : 'none';
    });

    editButton.addEventListener('click', () => {
        const newTask = document.createElement('input');
        newTask.type = 'text';
        newTask.value = task;
        newTask.style.marginLeft = '10px';
        li.appendChild(newTask);

        const newDueDate = document.createElement('input');
        newDueDate.type = 'datetime-local';
        newDueDate.value = dueDate;
        newDueDate.style.marginLeft = '10px';
        li.appendChild(newDueDate);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.marginLeft = '10px';
        li.appendChild(saveButton);

        const cancelEditButton = document.createElement('button');
        cancelEditButton.textContent = 'Cancel';
        cancelEditButton.style.marginLeft = '10px';
        li.appendChild(cancelEditButton);

        editButton.style.display = 'none';
        deleteButton.style.display = 'none';

        saveButton.addEventListener('click', async () => {
            const updatedTask = newTask.value.trim() || task;
            const updatedDueDate = newDueDate.value.trim() || dueDate;

            await updateTaskInDB(currTasksUser.uid, id, updatedTask, updatedDueDate);

            task = updatedTask;
            dueDate = updatedDueDate;
            taskText.textContent = `Task ${numberOfTasks}: ${task} - Due: ${new Date(dueDate).toLocaleString()}`;

            newTask.remove();
            newDueDate.remove();
            saveButton.remove();
            cancelEditButton.remove();
            editButton.style.display = 'inline';
            deleteButton.style.display = 'inline';
        });

        cancelEditButton.addEventListener('click', () => {
            newTask.remove();
            newDueDate.remove();
            saveButton.remove();
            cancelEditButton.remove();
            editButton.style.display = 'inline';
            deleteButton.style.display = 'inline';
        });
    });

    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTaskFromDB(currTasksUser.uid, id);
            taskList.removeChild(li);
        }
    });
}

function addCollabTaskInterface(task, dueDate, id, createdAt) {
    numberOfCollabTasks = taskListCollab.getElementsByTagName('li').length + 1;

    const li = document.createElement('li');
    
    const completeButton = document.createElement('input');
    completeButton.type = 'checkbox';
    completeButton.style.marginRight = '10px';
    
    const taskText = document.createElement('span');
    taskText.textContent = `Task ${numberOfCollabTasks}: ${task} - Due: ${new Date(dueDate).toLocaleString()}`;
    
    li.appendChild(completeButton);
    li.appendChild(taskText);

    const timeLabel = document.createElement('label');
    timeLabel.textContent = ' (Added: ' + (createdAt || new Date().toLocaleString()) + ')';
    timeLabel.style.fontSize = '0.9em';
    timeLabel.style.color = '#666';
    li.appendChild(timeLabel);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.style.marginLeft = '10px';
    li.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '10px';
    li.appendChild(deleteButton);

    taskListCollab.appendChild(li);

    completeButton.addEventListener('change', () => {
        taskText.style.textDecoration = completeButton.checked ? 'line-through' : 'none';
    });

    editButton.addEventListener('click', () => {
        const newTask = document.createElement('input');
        newTask.type = 'text';
        newTask.value = task;
        newTask.style.marginLeft = '10px';
        li.appendChild(newTask);

        const newDueDate = document.createElement('input');
        newDueDate.type = 'datetime-local';
        newDueDate.value = dueDate;
        newDueDate.style.marginLeft = '10px';
        li.appendChild(newDueDate);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.marginLeft = '10px';
        li.appendChild(saveButton);

        const cancelEditButton = document.createElement('button');
        cancelEditButton.textContent = 'Cancel';
        cancelEditButton.style.marginLeft = '10px';
        li.appendChild(cancelEditButton);

        editButton.style.display = 'none';
        deleteButton.style.display = 'none';

        saveButton.addEventListener('click', async () => {
            const updatedTask = newTask.value.trim() || task;
            const updatedDueDate = newDueDate.value.trim() || dueDate;

            await updateCollabTaskInDB(currTasksUser.uid, id, updatedTask, updatedDueDate);

            task = updatedTask;
            dueDate = updatedDueDate;
            taskText.textContent = `Task ${numberOfCollabTasks}: ${task} - Due: ${new Date(dueDate).toLocaleString()}`;

            newTask.remove();
            newDueDate.remove();
            saveButton.remove();
            cancelEditButton.remove();
            editButton.style.display = 'inline';
            deleteButton.style.display = 'inline';
        });

        cancelEditButton.addEventListener('click', () => {
            newTask.remove();
            newDueDate.remove();
            saveButton.remove();
            cancelEditButton.remove();
            editButton.style.display = 'inline';
            deleteButton.style.display = 'inline';
        });
    });

    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteCollabTaskFromDB(currTasksUser.uid, id);
            taskListCollab.removeChild(li);
        }
    });
}