import { db } from "../firebase"; // Adjust path if necessary
import {
  doc,
  updateDoc,
  deleteDoc, // <--- ADD THIS IMPORT
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

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

// ✅ SUBSCRIBE
export const subscribeToMessages = (taskId, callback) => {
  const q = query(
    collection(db, "tasks", taskId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// ✅ UPDATE MESSAGE
export const updateMessage = async (taskId, messageId, newText) => {
  try {
    const messageRef = doc(db, "tasks", taskId, "messages", messageId);
    await updateDoc(messageRef, {
      text: newText,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// ✅ DELETE MESSAGE
export const deleteMessage = async (taskId, messageId) => {
  try {
    const messageRef = doc(db, "tasks", taskId, "messages", messageId);
    await deleteDoc(messageRef); // This will now work
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};