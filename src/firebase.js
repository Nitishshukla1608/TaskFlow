// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase services you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFa5FQxY_3z99Skn1R1_lLDBWdESi_7-0",
  authDomain: "taskflow-e04ab.firebaseapp.com",
  projectId: "taskflow-e04ab",
  storageBucket: "taskflow-e04ab.firebasestorage.app",
  messagingSenderId: "898542411931",
  appId: "1:898542411931:web:38c06ecc386f8773bee63e",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);


// Optional (not required)
// export default app;
