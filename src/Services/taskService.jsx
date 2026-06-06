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
  
  if (!uid || !organization || typeof callback !== 'function') {
    console.warn("Missing required user data for task listener");
    return () => {};
  }

  const tasksRef = collection(db, "tasks");
  let q;

  // IMPORTANT: The query must match the fields in your documents
  if (role === "Admin") {
    // Admins see everything in their organization
    q = query(
      tasksRef, 
      where("organization", "==", organization)
    );
  } else {
    // Employees see only tasks assigned to them within their organization
    q = query(
      tasksRef, 
      where("organization", "==", organization),
      where("assigneeId", "==", uid)
    );
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Safely convert Firestore Timestamp to milliseconds
      createdAt: doc.data().createdAt?.toMillis?.() || null,
    }));
    callback(tasks);
  }, (err) => {
    console.error("Task Listener Error:", err);
    // If you get an index error here, click the link in the browser console to create it
  });

  return unsubscribe;
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