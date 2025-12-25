import { addTaskToDB, getTasksFromDB, updateTaskInDB, deleteTaskFromDB,
    addCollabTaskToDB, deleteCollabTaskFromDB, updateCollabTaskInDB, getCollabTasksFromDB,
    getUserDataFromDB, onAuthStateChangedListener, getUserByUsernameOrEmail, 
    saveCollabUserToDB, getCollabUserFromDB, removeCollabUserFromDB, addReceiverCollabUserToDB,
    getReceiverCollabUsersFromDB, deleteReceiverCollabUserFromDB } from "./firebase.js";

// TDL elements
const addUserTaskButton = document.getElementById('add-task-btn');
const cancelButton = document.getElementById('cancel');
const taskForms = document.getElementById('task-forms');
const taskList = document.getElementById('task-list');
const submitButton = document.getElementById('submit');
const forms = document.getElementById('todo-form');

// Collab TDL elements
// const addCollabTaskButton = document.getElementById('add-collab-task-btn');
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

let currTasksUser = null;
let currCollabUserId = null; // Changed from array to single value
let currCollabUser = null;   // Changed from array to single value
let activeCollabTargetUID = null; // To track which collaborator to add task to

function updateCollabTargetLabel(name, username) {
    const label = document.getElementById('collab-target-label');
    if (!name || !username) {
        label.style.display = 'none';
        label.textContent = '';
        return;
    }
    label.textContent = `Adding task for: ${name} (@${username})`;
    label.style.display = 'block';
}

onAuthStateChangedListener(async (user) => {
    currTasksUser = user;
    if (user) {
        const taskUserData = await getUserDataFromDB(currTasksUser.uid);

        // Load personal tasks
        const tasks = await getTasksFromDB(currTasksUser.uid);
        tasks.forEach(t => {
            addTaskInterface(t.task, t.dueDate, t.id, t.createdAt, t.checkedState || false);
        });

        // Load collaborator user if exists
        const collabUserData = await getCollabUserFromDB(currTasksUser.uid);
        if (collabUserData) {
            currCollabUserId = collabUserData.UID;
            const fullCollabData = await getUserDataFromDB(collabUserData.UID);
            currCollabUser = fullCollabData;
            displayCollabUser(collabUserData);
            
            // Load collab tasks
            const collabTasks = await getCollabTasksFromDB(currTasksUser.uid);
            if (collabTasks) {
                const div = document.createElement('div');
                div.innerHTML = `
                    <br></br>
                    <hr>
                    <br></br>
                    <h3>Your Collab Tasks with ${collabUserData.name}</h3>

                    <div class="inline-collab-form">
                        <input type="text" class="collab-task-input" placeholder="Enter task" />
                        <input type="datetime-local" class="collab-due-date" />
                        <button class="inline-add-collab-task" data-uid="${currTasksUser.uid}">
                        Add Task
                        </button>
                    </div>
                `;
                taskListCollab.appendChild(div);
                if (collabTasks.length > 0) {
                    collabTasks.forEach(t => {
                        addCollabTaskInterface(t.task, t.dueDate, t.id, t.createdAt, t.checkedState || false, currTasksUser.uid);
                    });
                } else {
                    const noTaskMsg = document.createElement('p');
                    noTaskMsg.textContent = 'No tasks yet. Add one now!';
                    noTaskMsg.style.color = '#999';
                    noTaskMsg.style.fontStyle = 'italic';
                    noTaskMsg.style.marginLeft = '10px';
                    taskListCollab.appendChild(noTaskMsg);
                }
            }
        }

        document.getElementById('welcome').textContent = `Welcome, ${taskUserData.name}!`;

        // Load receiver collab users (people who added this user as collaborator)
        const collabFromUsers = await getReceiverCollabUsersFromDB(currTasksUser.uid);
        if (collabFromUsers.length > 0) {            
            for (const c of collabFromUsers) {
                
                // Load collab tasks from each user who added you
                const collabTasks = await getCollabTasksFromDB(c.collabUID);
                const div = document.createElement('div');
                div.style.marginTop = '20px';
                div.innerHTML = `
                    <br></br>
                    <hr>
                    <br></br>
                    <h3>${c.collabName}'s Collab Tasks</h3>

                    <div class="inline-collab-form">
                        <input type="text" class="collab-task-input" placeholder="Enter task" />
                        <input type="datetime-local" class="collab-due-date" />
                        <button class="inline-add-collab-task" data-uid="${c.collabUID}">
                        Add Task
                        </button>
                    </div>
                `;
                taskListCollab.appendChild(div);
                
                if (collabTasks.length > 0) {
                    collabTasks.forEach(t => {
                        addCollabTaskInterface(t.task, t.dueDate, t.id, t.createdAt, t.checkedState || false, c.collabUID);
                    });
                } else {
                    const noTaskMsg = document.createElement('p');
                    noTaskMsg.textContent = 'No tasks yet. Add one now!';
                    noTaskMsg.style.color = '#999';
                    noTaskMsg.style.fontStyle = 'italic';
                    noTaskMsg.style.marginLeft = '10px';
                    taskListCollab.appendChild(noTaskMsg);
                }
            }
        }
    }

    document.addEventListener('click', async (e) => {
        if (e.target.matches('.inline-add-collab-task')) {
            e.preventDefault();

            const uid = e.target.dataset.uid;
            activeCollabTargetUID = uid;

            // Get the input values relative to the button clicked
            const container = e.target.closest('.inline-collab-form');
            const taskInput = container.querySelector('.collab-task-input');
            const dueDateInput = container.querySelector('.collab-due-date');

            const task = taskInput.value.trim() || "Unnamed Task";
            const dueDate = dueDateInput.value || new Date().toISOString().slice(0,16);
            const createdAt = new Date().toLocaleString();
            const checkedState = false;

            if (!activeCollabTargetUID) {
                alert('Please choose which collaborator to add the task to.');
                return;
            }

            const id = await addCollabTaskToDB(activeCollabTargetUID, task, dueDate, createdAt, checkedState);
            addCollabTaskInterface(task, dueDate, id, createdAt, checkedState, activeCollabTargetUID);

            // Reset input values
            taskInput.value = '';
            dueDateInput.value = '';
        }
    });

});


// Profile button navigation
profileButton.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = "../index.html";
});


// Show form when Add Task button is clicked
addUserTaskButton.addEventListener('click', e => {
    e.preventDefault();
    taskForms.style.display = 'block';
    cancelButton.style.display = 'inline';
});

// addCollabTaskButton.addEventListener('click', e => {
//     e.preventDefault();
//     if (!currCollabUserId) {  // Now correctly checks if null
//         alert('Please add a collaborator first!');
//         return;
//     }
//     taskFormsCollab.style.display = 'block';
//     cancelButtonCollab.style.display = 'inline';
// });

submitButton.addEventListener('click', async e => {
    e.preventDefault();
    taskList.style.display = 'block';

    const task = document.getElementById('task-input').value || "Unnamed Task";
    const dueDate = document.getElementById('due-date').value || new Date().toISOString().slice(0,16);
    const createdAt = new Date().toLocaleString();
    const checkedState = false;

    // Save to Firebase
    const id = await addTaskToDB(currTasksUser.uid, task, dueDate, createdAt, checkedState);

    addTaskInterface(task, dueDate, id, createdAt, checkedState);
    forms.reset();
    
    // Hide form after submission
    taskForms.style.display = 'none';
    cancelButton.style.display = 'none';
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
    const checkedState = false;

    // Save to Firebase for both users
    if (!activeCollabTargetUID) {
        alert('Please choose which collaborator to add the task to.');
        return;
    }

    const targetUID = activeCollabTargetUID;

    const id = await addCollabTaskToDB(targetUID, task, dueDate, createdAt, checkedState);

    addCollabTaskInterface(task, dueDate, id, createdAt, checkedState, targetUID);

    activeCollabTargetUID = null;

    formsCollab.reset();
    
    // Hide form after submission
    taskFormsCollab.style.display = 'none';
    cancelButtonCollab.style.display = 'none';
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
    if (currCollabUserId) {  // Now correctly checks if not null
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

        // Save to current user's collaborator info
        await saveCollabUserToDB(currTasksUser.uid, {
            UID: collabUserData.uid,
            username: collabUserData.username,
            name: collabUserData.name,
            email: collabUserData.email
        });

        // Save to collaborator's "collabFrom" collection
        const userCredential = await getUserDataFromDB(currTasksUser.uid);
        await addReceiverCollabUserToDB(
            collabUserData.uid, 
            currTasksUser.uid, 
            userCredential.email, 
            userCredential.name, 
            userCredential.username
        );

        // Update current state
        currCollabUserId = collabUserData.uid;
        currCollabUser = collabUserData;
        
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

        // Remove yourself from the collaborator's "collabFrom" collection
        const collabFromUsers = await getReceiverCollabUsersFromDB(currCollabUserId);
        const docToDelete = collabFromUsers.find(c => c.collabUID === currTasksUser.uid);
        if (docToDelete) {
            await deleteReceiverCollabUserFromDB(currCollabUserId, docToDelete.id);
        }
        
        currCollabUserId = null;
        currCollabUser = null;
        // collabUserInfo.style.display = 'none';
        // taskListCollab.innerHTML = '';
        
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


function addTaskInterface(task, dueDate, id, createdAt, checkedState) {
    // numberOfTasks = taskList.getElementsByTagName('li').length + 1;

    const li = document.createElement('li');
    
    const completeButton = document.createElement('input');
    completeButton.type = 'checkbox';
    completeButton.style.marginRight = '10px';
    completeButton.checked = checkedState;
    
    const taskText = document.createElement('span');
    taskText.textContent = `${task} - Due: ${new Date(dueDate).toLocaleString()}`;
    taskText.style.textDecoration = checkedState? 'line-through' : 'none';
    
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

    completeButton.addEventListener('change', async () => {
        taskText.style.textDecoration = completeButton.checked? 'line-through' : 'none';
        checkedState = completeButton.checked;
        await updateTaskInDB(currTasksUser.uid, id, task, dueDate, checkedState);
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

            await updateTaskInDB(currTasksUser.uid, id, updatedTask, updatedDueDate, checkedState);

            task = updatedTask;
            dueDate = updatedDueDate;
            taskText.textContent = `${task} - Due: ${new Date(dueDate).toLocaleString()}`;

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

function addCollabTaskInterface(task, dueDate, id, createdAt, checkedState, collabUID) {
    // numberOfCollabTasks = taskListCollab.getElementsByTagName('li').length + 1;

    const li = document.createElement('li');
    li.style.marginBottom = '10px';
    li.style.borderLeft = '3px solid #4CAF50';
    li.style.paddingLeft = '10px';
    
    const completeButton = document.createElement('input');
    completeButton.type = 'checkbox';
    completeButton.style.marginRight = '10px';
    completeButton.checked = checkedState;
    
    const taskText = document.createElement('span');
    taskText.textContent = `${task} - Due: ${new Date(dueDate).toLocaleString()}`;
    taskText.style.textDecoration = checkedState? 'line-through' : 'none';

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

    completeButton.addEventListener('change', async () => {
        taskText.style.textDecoration = completeButton.checked? 'line-through' : 'none';
        checkedState = completeButton.checked;
        if (collabUID === currTasksUser.uid) {
            await updateCollabTaskInDB(currTasksUser.uid, id, task, dueDate, checkedState);
        } else {
            await updateCollabTaskInDB(collabUID, id, task, dueDate, checkedState);
        }
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

            // Update for both users
            if (collabUID === currTasksUser.uid) {
                await updateCollabTaskInDB(currTasksUser.uid, id, updatedTask, updatedDueDate, checkedState);
            } else {
                await updateCollabTaskInDB(collabUID, id, updatedTask, updatedDueDate, checkedState);
            }

            task = updatedTask;
            dueDate = updatedDueDate;
            taskText.textContent = `${task} - Due: ${new Date(dueDate).toLocaleString()}`;

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

    deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            if (collabUID === currTasksUser.uid) {
                await deleteCollabTaskFromDB(currTasksUser.uid, id);
            } else {
                await deleteCollabTaskFromDB(collabUID, id);
            }
            taskListCollab.removeChild(li);
        }
    });
}