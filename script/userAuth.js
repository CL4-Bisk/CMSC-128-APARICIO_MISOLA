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
const profileContainer = document.getElementById('profile-container');
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
  
  const id = await addAccToDB(username, name, email, password, securityQuestion, securityAnswer);
  
  registerForm.reset()
  let accountUsername = accounts.find(account => account.id == id).username
  alert(`Account for ${accountUsername} is successfully created!`);
});

loginAccBtn.addEventListener('click', async e => {
  e.preventDefault();

  const userNameAcc = document.getElementById('username-login').value;
  const passwordAcc = document.getElementById('password-login').value;
  let found = false;
  accounts.forEach(acc => {
      if (acc.username === userNameAcc && acc.password === passwordAcc) {
          found = true;
          alert(`Welcome back, ${acc.name}!`);
      } else {
          alert("account not found.");
      }
  });
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
  profileContainer.style.display = "none"
  editProfileContainer.style.display = "block"

  const nameEdit = document.getElementById('nickname-edit')
  const userNameEdit = document.getElementById('username-edit')
  const passwordEdit = document.getElementById('password-edit')
  const confirmPasswordEdit = document.getElementById('confirm-password-edit')

  nameEdit.value = currAccount.name
  userNameEdit.value = currAccount.username
  passwordEdit.value = currAccount.password
  confirmPasswordEdit.value = currAccount.password
});

logOutProfileBtn.addEventListener('click', e => {
  e.preventDefault();

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