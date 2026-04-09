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


//// HERE ARE THE METHODS OF CHAT SYSTTEM...............

// ✅ SEND MESSAGE
export const sendMessage = async (taskId, messageData) => {
    try {
      await addDoc(collection(db, "tasks", taskId, "messages"), {
        ...messageData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };
  
  export const subscribeToMessages = (taskId, callback) => {
    const q = query(
      collection(db, "tasks", taskId, "messages"),
      orderBy("createdAt", "asc")
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      callback(messages);
    });
  
    return unsubscribe;
  };
  