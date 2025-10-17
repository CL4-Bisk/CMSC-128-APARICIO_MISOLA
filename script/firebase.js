import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


// Firebase configuration
const response = await fetch('./script/firebaseConfig.json');
const firebaseConfig = await response.json();


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export function getCurrentUser() {
  return auth.currentUser;
}


// === Firestore task helper functions ===
export async function addTaskToDB(task, dueDate, createdAt) {
  const docRef = await addDoc(collection(db, "tasks"), { task, dueDate, createdAt });
  return docRef.id;
}

export async function getTasksFromDB() {
  const snapshot = await getDocs(collection(db, "tasks"));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function updateTaskInDB(id, newTask, newDueDate) {
  await updateDoc(doc(db, "tasks", id), { task: newTask, dueDate: newDueDate });
}

export async function deleteTaskFromDB(id) {
  await deleteDoc(doc(db, "tasks", id));
}



// === Firestore account helper functions ===
export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function logIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

export function onAuthStateChangedListener(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function updateUserProfile(updates) {
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, updates);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  } else {
    throw new Error("No user is currently signed in.");
  }
}

export async function saveUserDataToDB(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), data);
    return { uid, ...data };
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

export async function updateUserPassword(newPassword, currentPassword) { // Added currentPassword parameter
  if (auth.currentUser) {
    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword); // Assuming email/password login
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update the password after successful re-authentication
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  } else {
    throw new Error("No user is currently signed in.");
  }
}