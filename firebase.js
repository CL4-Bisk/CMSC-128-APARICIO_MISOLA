import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// paste API code below


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// === Firestore helper functions ===
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
