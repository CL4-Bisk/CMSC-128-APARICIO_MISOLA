import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential,
  EmailAuthProvider, sendPasswordResetEmail
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
export async function addTaskToDB(uid, task, dueDate, createdAt) {
  const docRef = await addDoc(collection(db, "users", uid, "tasks"), { task, dueDate, createdAt });
  return docRef.id;
}

export async function getTasksFromDB(uid) {
  const snapshot = await getDocs(collection(db, "users", uid, "tasks"));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function updateTaskInDB(uid, id, newTask, newDueDate) {
  await updateDoc(doc(db, "users", uid, "tasks", id), { task: newTask, dueDate: newDueDate });
}

export async function deleteTaskFromDB(uid, id) {
  await deleteDoc(doc(db, "users", uid, "tasks", id));
}

//FOR REFERENCE (old firestore tasks helper functions)
// export async function addTaskToDB(task, dueDate, createdAt) {
//   const docRef = await addDoc(collection(db, "tasks"), { task, dueDate, createdAt });
//   return docRef.id;
// }

// export async function getTasksFromDB() {
//   const snapshot = await getDocs(collection(db, "tasks"));
//   return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
// }

// export async function updateTaskInDB(id, newTask, newDueDate) {
//   await updateDoc(doc(db, "tasks", id), { task: newTask, dueDate: newDueDate });
// }

// export async function deleteTaskFromDB(id) {
//   await deleteDoc(doc(db, "tasks", id));
// }


// === Firestore user collab helper helper functions (yet to be implemented) ===
export async function addCollabTaskToDB(uid, task, dueDate, createdAt) {
  const docRef = await addDoc(collection(db, "users", uid, "collabTasks"), { task, dueDate, createdAt });
  return docRef.id;
}

export async function getCollabTasksFromDB(uid) {
  const snapshot = await getDocs(collection(db, "users", uid, "collabTasks"));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function updateCollabTaskInDB(uid, id, newTask, newDueDate) {
  await updateDoc(doc(db, "users", uid, "collabTasks", id), { task: newTask, dueDate: newDueDate });
}

export async function deleteCollabTaskFromDB(uid, id) {
  await deleteDoc(doc(db, "users", uid, "collabTasks", id));
}

// === Firestore collaborator user helper functions ===
export async function saveCollabUserToDB(uid, data) {
  try{
    await setDoc(doc(db, "users", uid, "collaborator", "info"), data);
    return { uid, ...data };
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

export async function addReceiverCollabUserToDB(uid, collabUID, collabEmail, collabName, collabUsername) {
  try{
    const docRef = await addDoc(collection(db, "users", uid, "collabFrom"), { collabUID, collabName, collabEmail, collabUsername });
    return docRef.id;
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

export async function getCollabUserFromDB(uid) {
  const docRef = doc(db, "users", uid, "collaborator", "info");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function getReceiverCollabUsersFromDB(uid) {
  const docRef = collection(db, "users", uid, "collabFrom");
  const docSnap = await getDocs(docRef);
  return docSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function removeCollabUserFromDB(uid) {
  // Delete the collaborator info
  await deleteDoc(doc(db, "users", uid, "collaborator", "info"));
  
  // Delete all collab tasks
  const collabTasks = await getDocs(collection(db, "users", uid, "collabTasks"));
  const deletePromises = collabTasks.docs.map(docSnap => 
    deleteDoc(doc(db, "users", uid, "collabTasks", docSnap.id))
  );
  await Promise.all(deletePromises);
}

export async function getUserByUsernameOrEmail(identifier) {
  try {
    // Check if it's an email (contains @)
    const isEmailOrUsername = identifier.includes('@');
    
    const usersRef = collection(db, "users");
    const field = isEmailOrUsername ? 'email' : 'username';
    const q = query(usersRef, where(field, "==", identifier));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const userDoc = snapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
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
    if (error.code === "auth/invalid-credential") {
      console.error("Incorrect password. Please try again.");
    } 
    if (error.code === "auth/invalid-email") {
      console.error("User not found. Please sign up.");
    }
    return;
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

//check if user detected
export function onAuthStateChangedListener(callback) {
  return onAuthStateChanged(auth, callback);
}

//only updates the user auth's profile, not the db info
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


export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}


//retrieving user data from db
export async function getUserDataFromDB(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data(); // returns { username, name, email, ... }
    } else {
      console.warn("No user data found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}