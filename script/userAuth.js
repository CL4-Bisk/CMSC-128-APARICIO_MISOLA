import {
  signUp, logIn, logOut, onAuthStateChangedListener, updateUserProfile,
  saveUserDataToDB, updateUserPassword, sendPasswordReset, getUserDataFromDB
} from './firebase.js';

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

// Forget password modal
const forgetPassModal = document.getElementById('forgot-password-modal');
const sendResetEmailBtn = document.getElementById('send-reset-email-btn');
const updateProfileWithPasswordBtn = document.getElementById('send-reset-password-btn');
const cancelResetEmailBtn = document.getElementById('cancel-reset-email-btn');
const cancelResetPasswordBtn = document.getElementById('cancel-reset-password-btn');
const resetEmailInput = document.getElementById('reset-email');
const resetPasswordInput = document.getElementById('reset-password');
const resetPasswordContainer = document.getElementById('modal');

// Containers
const registerContainer = document.getElementById('register-container');
const loginContainer = document.getElementById('login-container');
const accProfileContainer = document.getElementById('account-profile-container');
const profileContainer = document.getElementById('profile-container');
const editProfileContainer = document.getElementById('edit-profile-container');
const accountAuthContainer = document.getElementById('account-auth-container');
const forgetPassContainer = document.getElementById('forget-password-container');

let currentUser = null;
let userCurrentPassword = " ";


// Monitor auth state
onAuthStateChangedListener(async (user) => {
  currentUser = user;
  if (user) {
    const userCredential = await getUserDataFromDB(user.uid);
    accProfileContainer.style.display = 'block';
    accountAuthContainer.style.display = 'none';
    displayUserProfile(user);

    
    console.log(`may user\n Name: ${userCredential.name}\n Username: ${userCredential.username}\n Email: ${user.email}\n Password: ${userCurrentPassword}`);


  } else {
    accProfileContainer.style.display = 'none';
    accountAuthContainer.style.display = 'block';

    console.log("wala user");
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


//
//all console.log codes must be for debugging/viewing purposes only!!
//


// Register account
createAccBtn.addEventListener('click', async e => {
  e.preventDefault();

  const username = document.getElementById('username-register').value;
  const name = document.getElementById('name-register').value;
  const email = document.getElementById('email-register').value;
  const password = document.getElementById('password-register').value;

  try {
    const newUser = await signUp(email, password);
    await updateUserProfile({
      displayName: name,
      displayUsername: username,
      displayEmail: email
    });
    await saveUserDataToDB(newUser.uid, {
      username,
      name,
      email
    });
    userCurrentPassword = password;
    showMessage(`Account created successfully! as ${name}`, "success");
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  } catch (error) {
    showMessage("Error creating account." + error.message, "error");
  }
});


// Log in
loginAccBtn.addEventListener('click', async e => {
  e.preventDefault();

  const emailAcc = document.getElementById('email-login').value;
  const passwordAcc = document.getElementById('password-login').value;

  if (emailAcc == "" || passwordAcc == "") {
    showMessage("Please enter both email and password.", "error");
    console.log("wala pass or email");
    return;
  }

  try {
    userCurrentPassword = passwordAcc;
    const user = await logIn(emailAcc, passwordAcc); // Assign the returned user object to a variable
    showMessage(`Logged in successfully as ${user.displayName}`, "success");
    console.log("Logged in user:", currentUser);
  } catch (error) {
    showMessage("Error logging in: Wrong Email or Password!", "error");
    console.error("Login error details:", error);
  }
});


// Log out
logOutProfileBtn.addEventListener('click', async e => {
  e.preventDefault();

  try {
    userCurrentPassword = "";
    await logOut();
    showMessage("Logged out successfully.", "success");
  } catch (error) {
    showMessage("Error logging out.", "error");
    console.log(error.message);
  }
});


// Edit profile
changeInfoBtn.addEventListener('click', e => {
  e.preventDefault();
  profileContainer.style.display = 'none';
  editProfileContainer.style.display = 'block';
});


// Update profile
updateInfoBtn.addEventListener('click', async e => {
  e.preventDefault();

  const newPassword = document.getElementById('password-edit').value;
  const confirmNewPassword = document.getElementById('confirm-password-edit').value;

  resetPasswordContainer.style.display='block';
  
  if (newPassword !== confirmNewPassword) {
    showMessage("New passwords do not match.", "error");
  }
});


// Buttons for navigations
backProfileBtn.addEventListener('click', e => {
  e.preventDefault();
  editProfileContainer.style.display = 'none';
  profileContainer.style.display = 'block';
});

forgetPassBtn.addEventListener('click', e => {
  e.preventDefault();
  forgetPassContainer.style.display = 'block';
  forgetPassModal.style.display = 'flex';
});

cancelResetEmailBtn.addEventListener('click', e => {
  e.preventDefault();
  resetEmailInput.value = '';
  forgetPassModal.style.display = 'none';
});

cancelResetPasswordBtn.addEventListener('click', e => {
  e.preventDefault();
  resetPasswordInput.value = '';
  resetPasswordContainer.style.display = 'none';
});


// Send 'Password Reset' Email
sendResetEmailBtn.addEventListener('click', async e => {
  e.preventDefault();

  const email = resetEmailInput.value.trim();

  if (!email) {
    showMessage("Please enter your email.", "error");
  }

  try {
    await sendPasswordReset(email);
    showMessage("Password reset email sent! Please check your inbox for confirmation.", "success");
    resetEmailInput.value = '';
    forgetPassModal.style.display = 'none';
  } catch (error) {
    showMessage("Error sending password reset email.", "error");
  }
});


// Confirm Update Profile By Current Password
updateProfileWithPasswordBtn.addEventListener('click', async e => {
  e.preventDefault();

  const nameInput = document.getElementById('name-edit');
  const usernameInput = document.getElementById('username-edit');
  const passwordInput = document.getElementById('password-edit');
  const confirmPasswordInput = document.getElementById('confirm-password-edit');
  const resetPasswordInput = document.getElementById('reset-password'); // modal field

  // Get their trimmed values
  const newName = nameInput.value.trim();
  const newUsername = usernameInput.value.trim();
  const newPassword = passwordInput.value.trim();
  const confirmNewPassword = confirmPasswordInput.value.trim();
  const confirmCurrentPassword = resetPasswordInput.value.trim();

  const userCredential = await getUserDataFromDB(currentUser.uid);

  if (newPassword && newPassword !== confirmNewPassword) {
    showMessage("New passwords do not match.", "error");
    return;
  }
  
  try {
    if (newPassword) {
      await updateUserPassword(newPassword, confirmCurrentPassword);
      userCurrentPassword = newPassword;
    }

    // Update Auth profile (Firebase Authentication)
    await updateUserProfile({ displayName: newName });

    // Update Firestore (custom user data || retain current data)
    if (currentUser) {
      await saveUserDataToDB(currentUser.uid, {
        name: newName || userCredential.name,
        username: newUsername || userCredential.username,
        email: userCredential.email
      });
    }


    showMessage("Profile updated successfully!", "success");
    displayUserProfile(currentUser);

    // Hide modal and return to profile
    resetPasswordInput.value = "";
    resetPasswordContainer.style.display = "none";
    editProfileContainer.style.display = "none";
    profileContainer.style.display = "block";

    nameInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    resetPasswordInput.value = "";

  } catch (error) {
    showMessage("Error updating profile: " + error.message, "error");
    console.log(error.message);
  }
});

// Message display function
function showMessage(message, type = "info", duration = 4000) {
  const messageBox = document.getElementById("message-box");
  messageBox.textContent = message;
  messageBox.className = type; // e.g., "success" or "error"
  messageBox.style.display = "block";

  setTimeout(() => {
    messageBox.style.display = "none";
  }, duration);
  
  return;
}


// Profile display
async function displayUserProfile(user) {
  const userCredential = await getUserDataFromDB(user.uid);
  const profileList = document.getElementById("profile-list");
  if (!user || !profileList) return;

  welcomeUser.textContent = `Welcome, ${userCredential.name || "User"}!`;

  // Get Firestore data if available
  const email = user.email || "No email found";

  // Clear old content
  profileList.innerHTML = "";

  // Add profile info
  const infoItems = [
    { label: "Name", value: userCredential.name || "N/A" },
    { label: "Username", value: userCredential.username || "N/A" },
    { label: "Email", value: email }
  ];

  for (const item of infoItems) {
    const li = document.createElement("li");
    li.textContent = `${item.label}: ${item.value}`;
    li.style.margin = "6px 0";
    profileList.appendChild(li);
  }
}
