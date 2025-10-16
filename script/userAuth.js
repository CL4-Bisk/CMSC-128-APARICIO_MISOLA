import { getAccFromDB, addAccToDB, updateAccInDB } from './firebase.js';

//Buttons and elements
//For login
const loginAccBtn = document.getElementById('login-acc-btn');
const forgetPassBtn = document.getElementById('forget-password-btn');
const showForgetPassBtn = document.getElementById('show-forget-password-btn');
const hideForgetPassBtn = document.getElementById('hide-forget-password-btn');
const switchToRegisterBtn = document.getElementById('switch-register-btn');

const forgetPassContainer = document.getElementById('forget-password-container');
const showPassword = document.getElementById('show-password')
const securityAnswerLogin = document.getElementById('security-answer-login');
//For register
const createAccBtn =  document.getElementById('create-acc-btn');
const switchToLoginBtn = document.getElementById('switch-login-btn');
//For account profile
const changeInfoBtn = document.getElementById('change-info-btn');
const logOutProfileBtn = document.getElementById('log-out-profile-btn');
//For editing profile info
const updateInfoBtn = document.getElementById('update-info-btn');
const backProfileBtn = document.getElementById('back-profile-btn');

//Divs for hiding
const registerContainer = document.getElementById('register-container');
const registerForm = document.getElementById('register-form')

const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form')
const profileContainer = document.getElementById('account-profile-container');
const editProfileContainer = document.getElementById('edit-profile-container');
const editProfileForm = document.getElementById('edit-profile-form')
let accounts = await getAccFromDB();
let currAccount;

switchToRegisterBtn.addEventListener('click', e => {
  e.preventDefault();
  loginContainer.style.display = 'none';
  registerContainer.style.display = 'block';
});

switchToLoginBtn.addEventListener('click', e => {
  e.preventDefault();
  loginContainer.style.display = 'block';
  registerContainer.style.display = 'none';
});

createAccBtn.addEventListener('click', async e => {
  e.preventDefault();
  const username = document.getElementById('username-register').value;
  const name = document.getElementById('nickname-register').value;
  const email = document.getElementById('email-register').value;
  const password = document.getElementById('password-register').value;
  const securityQuestion = document.getElementById('security-question-register').value;
  const securityAnswer = document.getElementById('security-answer-register').value;
  
  for (const acc of accounts) {
    if (acc.username === username) {
      alert("Username already taken.");
      return; // properly stops here
    } else if (acc.email === email) {
      alert("Email already registered.");
      return;
    }
  }
  
    // If we reach this point, no duplicates found
    const id = await addAccToDB(username, name, email, password, securityQuestion, securityAnswer);
    alert(`Account created!`);

    registerForm.reset();
});

loginAccBtn.addEventListener('click', async e => {
  e.preventDefault();

  const emailUsernameAcc = document.getElementById('email-login').value;
  const passwordAcc = document.getElementById('password-login').value;
  let found = false;

  for (const acc of accounts) {
    if ((acc.username === emailUsernameAcc || acc.email === emailUsernameAcc) && acc.password === passwordAcc) {
      found = true;
      break; // Exit loop if a match is found
    }
  }

  if (found) {
    loginContainer.style.display = 'none';
    profileContainer.style.display = 'block';
    sessionStorage.setItem('loggedInUser', emailUsernameAcc);
    currAccount = accounts.find(account => account.username === emailUsernameAcc || account.email === emailUsernameAcc);
    const profileList = document.getElementById('profile-list');
    profileList.innerHTML = `
      <li><strong>Nickname:</strong> ${currAccount.name}</li>
      <li><strong>Username:</strong> ${currAccount.username}</li>
      <li><strong>Email:</strong> ${currAccount.email}</li>
    `;
  } else {
    alert("Invalid username or password. Please try again.");
  }

  loginForm.reset();
});

forgetPassBtn.addEventListener('click', async e =>{
  e.preventDefault();
  const email = document.getElementById('email-login');

  showPassword.textContent = ""
  securityAnswerLogin.value = ""
  
  if (email.value != "") {
    currAccount = accounts.find(account => account.email == email.value);

    if(!currAccount){
      alert("ERROR, No email found in database");
      return;
    }
    // const securityQuestion = documet.createElement("p")

    switch (currAccount.securityQuestion) {
      case "option1":
        securityAnswerLogin.placeholder = "What is the name of your first pet";
        break;

      case "option2":
        securityAnswerLogin.placeholder = "What's the name of your first teacher?";
        break;

      case "option3":
        securityAnswerLogin.placeholder = "What is your mother's maiden name?";
        break;

      default:
        alert("ERROR, Invalid Option");
        break;
    }

    forgetPassContainer.style.display = 'block';
    forgetPassBtn.style.display = 'none';
  } else {
    alert("Email address not found, please input a valid email address")
  }
    
  //Declare constants: 'security-question', ''security answer from'
  //Mark hide container 'forget-password' , display 'forget-password-container'
});

hideForgetPassBtn.addEventListener('click' , e => {
  e.preventDefault();
  forgetPassContainer.style.display = 'none';
  forgetPassBtn.style.display = 'block'; 
});

showForgetPassBtn.addEventListener('click' , e => {
  e.preventDefault();
  if(currAccount.securityAnswer == securityAnswerLogin.value){
    showPassword.textContent = "Password: " + currAccount.password;
  } else {
    showPassword.textContent = "INVALID SECURITY ANSWER"
  }
});

changeInfoBtn.addEventListener('click', e => {
  e.preventDefault();

  editProfileContainer.style.display = "block"

  const nameEdit = document.getElementById('nickname-edit')
  const userNameEdit = document.getElementById('username-edit')
  const passwordEdit = document.getElementById('password-edit')
  const confirmPasswordEdit = document.getElementById('confirm-password-edit')

  if (currAccount) {
    nameEdit.value = currAccount.name
    userNameEdit.value = currAccount.username
    passwordEdit.value = currAccount.password
    confirmPasswordEdit.value = currAccount.password
  } else {
    // Handle the case where currAccount is undefined, perhaps log an error or show a message
    console.error("currAccount is undefined. Cannot load profile data for editing.");
  }
});

logOutProfileBtn.addEventListener('click', e => {
  e.preventDefault();

  profileContainer.style.display = 'none';
  loginContainer.style.display = 'block';
  loginForm.reset();
});

updateInfoBtn.addEventListener('click', async e => {
  e.preventDefault();
  const nameEdit = document.getElementById('nickname-edit')
  const userNameEdit = document.getElementById('username-edit')
  const passwordEdit = document.getElementById('password-edit')
  const confirmPasswordEdit = document.getElementById('confirm-password-edit')

  // nameEdit.value = currAccount.name
  // userNameEdit.value = currAccount.username
  // passwordEdit.value = currAccount.password
  // confirmPasswordEdit.value = currAccount.password
  
  if(passwordEdit.value == confirmPasswordEdit.value){
    updateAccInDB(currAccount.id, userNameEdit.value, passwordEdit.value, nameEdit.value)
    alert("Account Successfully Updated")
    backProfileBtn.click()
  }

    // sessionStorage.setItem('loggedInUser', userNameEdit.value);
    // currAccount = accounts.find(account => account.username === userNameEdit.value);
    // const profileList = document.getElementById('profile-list');
    // profileList.innerHTML = `
    //   <li><strong>Nickname:</strong> ${currAccount.name}</li>
    //   <li><strong>Username:</strong> ${currAccount.username}</li>
    //   <li><strong>Email:</strong> ${currAccount.email}</li>
    // `;
});

backProfileBtn.addEventListener('click', e => {
  e.preventDefault();
  editProfileForm.reset()
  profileContainer.style.display = "block"
  editProfileContainer.style.display = "none"
});


// getaccfromdb();
// user = acc.id
// if (user.email === db.email) {
//     message = user.securityQuestion;
//     security-question.placeholder = message;
// }

// if (user.securityAnswer === db.securityAnswer) {
//     // allow reset password
// } 