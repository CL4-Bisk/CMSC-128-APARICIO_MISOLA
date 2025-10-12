import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// User Authentication
const auth = getAuth();

const email = document.getElementById('email');
const password = document.getElementById('password'); 
const signupBtn = document.getElementById('signup-btn');




const signupBtnPressed = async (e) => {
    e.preventDefault();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;
        console.log('User signed in:', user);
    } catch (error) {
        console.error('Error signing in:', error.code);
    }
}


signupBtn.addEventListener("click", signupBtnPressed);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties       
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  } 
});
