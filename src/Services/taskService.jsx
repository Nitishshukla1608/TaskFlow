import { auth, db, secondaryAuth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  getAuth, fetchSignInMethodsForEmail,
  updatePassword 
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  addDoc,
  orderBy
} from "firebase/firestore";


export const listenToTasks = (userData, callback) => {
    const { uid, role, organization } = userData;
    if (!uid || typeof callback !== 'function') return () => {};
  
    const tasksRef = collection(db, "tasks");
    let q;
  
    // Admins see everything in their org, Employees see assigned tasks
    if (role === "Admin") {
      q = query(tasksRef, where("organization", "==", organization));
    } else {
      q = query(tasksRef, where("assignedToUid", "==", uid));
    }
  
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || null,
      }));
      callback(tasks);
    }, (err) => console.error("Task Listener Error:", err));
  };
  


  
export const addTask = async (newTask) => {
    try {
      const taskId = `TASK_${Date.now()}`;
      const docRef = doc(db, "tasks", taskId);
  
      await setDoc(docRef, {
        ...newTask,
        taskId,
        createdAt: serverTimestamp(),
        status: newTask.status || "Pending",
      });
  
      return taskId;
    } catch (error) {
      console.error("Error in adding Task:", error);
      throw error;
    }
  };


  export const updateTaskStatus =  async(taskId , newStatus) =>{
    try{
   const docRef  = doc(db , "tasks" , taskId);
   await updateDoc(docRef, {
    status : newStatus,
    lastModified: serverTimestamp(),
  });
  return { success: true };
    }catch(error){
      console.error("Error in updating task status :", error);
      throw error;
    }
  }