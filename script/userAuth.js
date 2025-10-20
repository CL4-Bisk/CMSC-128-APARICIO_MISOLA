import { signUp, logIn, logOut, onAuthStateChangedListener, updateUserProfile, saveUserDataToDB, updateUserPassword, changePasswordEmail } from './firebase.js';

// Buttons and elements
const loginAccBtn = document.getElementById('login-acc-btn');
const forgetPassBtn = document.getElementById('forget-password-btn');
const switchToRegisterBtn = document.getElementById('switch-register-btn');
const createAccBtn = document.getElementById('create-acc-btn');
const switchToLoginBtn = document.getElementById('switch-login-btn');
const changeInfoBtn = document.getElementById('change-info-btn');
const logOutProfileBtn = document.getElementById('log-out-profile-btn');
const updateInfoBtn = document.getElementById('update-info-btn');
const backProfileBtn = document.getElementById('back-profile-btn');
const welcomeUser = document.getElementById('welcome');

// Containers
const registerContainer = document.getElementById('register-container');
const loginContainer = document.getElementById('login-container');
const accProfileContainer = document.getElementById('account-profile-container');
const profileContainer = document.getElementById('profile-container');
const editProfileContainer = document.getElementById('edit-profile-container');

// Register inputs
// const username = document.getElementById('username-register').value;
// const name = document.getElementById('name-register').value;
// const email = document.getElementById('email-register').value;
// const password = document.getElementById('password-register').value;
// const securityQuestion = document.getElementById('security-question-register').value; UNUSED
// const securityAnswer = document.getElementById('security-answer-register').value; UNUSED

// Login inputs
const emailAcc = document.getElementById('email-login');
// const passwordAcc = document.getElementById('password-login').value;

// Edit profile inputs
// const newName = document.getElementById('name-edit').value;
// const newUsername = document.getElementById('username-edit').value;
// const newPassword = document.getElementById('password-edit').value;
// const confirmNewPassword = document.getElementById('confirm-password-edit').value;
let match = true; // Why not move to updateInfoBtn

let currentUser = null; //getCurrentUser()

// Monitor auth state
onAuthStateChangedListener((user) => {
  currentUser = user;
  if (user) {
    accProfileContainer.style.display = 'block';
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'none';
    welcomeUser.textContent = `Welcome, ${user.displayName}!`;

    console.log("User is logged in:", user);
  } else {
    accProfileContainer.style.display = 'none';
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
    welcomeUser.textContent = ""; //Added to delete wecome when logged out

    console.log("No user is logged in.");
  }
});



// Switch views
switchToRegisterBtn.addEventListener('click', e => {
  e.preventDefault();
  loginContainer.style.display = 'none';
  registerContainer.style.display = 'block';
});

switchToLoginBtn.addEventListener('click', e => {
  e.preventDefault();
  registerContainer.style.display = 'none';
  loginContainer.style.display = 'block';
});



// Register account
createAccBtn.addEventListener('click', async e => {
  e.preventDefault();

  const username = document.getElementById('username-register').value;
  const name = document.getElementById('name-register').value;
  const email = document.getElementById('email-register').value;
  const password = document.getElementById('password-register').value;
  // const securityQuestion = document.getElementById('security-question-register').value;
  // const securityAnswer = document.getElementById('security-answer-register').value;           

  try {
    const newUser = await signUp(email, password);
    await updateUserProfile({
      displayName: name,
      displayUsername: username
    });
    await saveUserDataToDB(newUser.uid, {
      username,
      name,
      email,
      // securityQuestion,
      // securityAnswer
    });
    alert(`Account created successfully!\nUsername: ${username}\nName: ${name}\nEmail: ${email}`);
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  } catch (error) {
    alert("Error creating account: " + error.message);
  }
});

// Log in
loginAccBtn.addEventListener('click', async e => {
  e.preventDefault();

  let loginEmailAcc = emailAcc.value;
  const passwordAcc = document.getElementById('password-login').value;

  try {
    await logIn(loginEmailAcc, passwordAcc);
    alert(`Logged in successfully!\nUsername: ${currentUser.displayUsername}\nName: ${currentUser.displayName}\nEmail: ${emailAcc.value}`);
  } catch (error) {
    alert("Error logging in: " + error.message);
  }
});

//Forget Password
forgetPassBtn.addEventListener('click', async e => {
  e.preventDefault();

  let userEmail = emailAcc.value

  try {
    await changePasswordEmail(userEmail)
    alert(`Sent email to change password at \n Email: ${emailAcc.value}, if it exist`);
  } catch (error) {
    alert("Error in changing password: " + error.message);
  }
})

// Log out
logOutProfileBtn.addEventListener('click', async e => {
  e.preventDefault();
  try {
    await logOut();
    alert("Logged out successfully!");
  } catch (error) {
    alert("Error logging out: " + error.message);
  }
});

// Edit profile
changeInfoBtn.addEventListener('click', e => {
  e.preventDefault();
  profileContainer.style.display = 'none';
  editProfileContainer.style.display = 'block';
});

updateInfoBtn.addEventListener('click', async e => {
  e.preventDefault();

  const newName = document.getElementById('name-edit').value;
  const newUsername = document.getElementById('username-edit').value;
  const newPassword = document.getElementById('password-edit').value;
  const confirmNewPassword = document.getElementById('confirm-password-edit').value;
  const currentPassword = document.getElementById('security-password-edit').value;

  if (newPassword !== confirmNewPassword) {
    alert("Passwords do not match!");
    match = false;
    return;
  }

  try {
    // await updateUserPassword(newPassword);
    await updateUserProfile({ displayName: newName });
    if (currentUser) {
      await saveUserDataToDB(currentUser.uid, { name: newName, username: newUsername });
      if (match && newPassword) {
        await updateUserPassword(newPassword, currentPassword);
      }
    }
    alert("Profile updated successfully!");
    editProfileContainer.style.display = 'none';
    profileContainer.style.display = 'block';
  } catch (error) {
    alert("Error updating profile: " + error.message);
  }
});

backProfileBtn.addEventListener('click', e => {
  e.preventDefault();
  editProfileContainer.style.display = 'none';
  profileContainer.style.display = 'block';
});
