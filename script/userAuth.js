import { getAccFromDB, addAccToDB, updateAccInDB } from './firebase.js';

//Buttons and elements
//For login
const loginAccBtn = document.getElementById('login-acc-btn');
const forgetPassBtn = document.getElementById('forget-password-btn');
const switchToRegisterBtn = document.getElementById('switch-register-btn');
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
const loginContainer = document.getElementById('login-container');
const profileContainer = document.getElementById('profile-container');
const editProfileContainer = document.getElementById('edit-profile-container');
const accounts = await getAccFromDB();


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
  // Mark add account and clear forms

  const id = await addAccToDB(username, name, email, password, securityQuestion, securityAnswer);
  // alert(`Account created! Your account ID is ${id.username}`); refactor code

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
  //Declare constants: 'security-question', ''security answer from'
  //Mark hide container 'forget-password' , display 'forget-password-container'
});


changeInfoBtn.addEventListener('click', e => {
  e.preventDefault();

});

logOutProfileBtn.addEventListener('click', e => {
  e.preventDefault();

});

updateInfoBtn.addEventListener('click', async e => {
  e.preventDefault();
  
});

backProfileBtn.addEventListener('click', e => {
  e.preventDefault();

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