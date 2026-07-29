// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Secondary app (used to create users without signing out the current admin)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");

// Firebase services
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);

// If your Cloud Functions are deployed to another region (e.g. asia-south1),
// replace "us-central1" with your region.
export const functions = getFunctions(app, "us-central1");

// Optional
export default app;