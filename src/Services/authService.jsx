// services/authService.js

import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

/* =========================
   AUTH / USER FUNCTIONS
========================= */

// 🔹 Email + Password Signup
export const signupUser = async (email, password, role, name, position) => {
  // 1️⃣ Create user with email & password
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;





  // 3️⃣ Save user data in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    role,
    position,
    yourTotal: 0,
    createdAt: serverTimestamp(),
  });

  return user;
};

// 🔹 Google Signup
// 🔹 Google Signup (Updated to accept profile data)
export const signupWithGoogle = async (role, name, position) => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // Only create the doc if it doesn't exist
  if (!userSnap.exists()) {
    

   

    await setDoc(userRef, {
      uid: user.uid,
      name: name || user.displayName,
      email: user.email,
      role: role || "Employee",
      position: position || "Other",
      yourTotal: 0,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

// 🔹 Login
export const loginUser = async (email, password) => {
  /* =========================
     1️⃣ AUTHENTICATE USER
  ========================= */
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const authUser = userCredential.user;

  if (!authUser || !authUser.uid) {
    throw new Error("Authentication failed");
  }

  /* =========================
     2️⃣ FETCH FIRESTORE PROFILE
  ========================= */
  const userRef = doc(db, "users", authUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error("User profile not found in Firestore");
  }

  const firestoreUser = snap.data();

  /* =========================
     3️⃣ MERGE (FIRESTORE WINS)
  ========================= */
  return {
    // 🔐 Auth (identity)
    uid: authUser.uid,
    email: authUser.email,
    emailVerified: authUser.emailVerified,

    // 📦 Firestore (app data)
    ...firestoreUser,

    // 🕒 Normalize timestamp
    createdAt:
      firestoreUser.createdAt?.toDate()?.toISOString() || null,
  };
};






// 🔹 Get user data (one-time fetch)
export const getUserData = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error("User data not found");
  }

  return {
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate()?.toISOString() || null, // Convert Timestamp to ISO string
  };
};



// 🔹 Increment user's total tasks
export const incrementUserTotalTasks = async (uid) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    yourTotal: increment(1),
  });
};

/* =========================
   REAL-TIME LISTENERS
========================= */

// 🔥 Listening document's in real time


// 🔥 Listen to user document
export const listenToUser = (uid, callback) => {
  const ref = doc(db, "users", uid);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const userData = {
      uid: snap.id,
      ...snap.data(),
      createdAt: snap.data().createdAt?.toDate()?.toISOString() || null, // Convert Timestamp to ISO string
    };
    callback(userData);
  });
};



// 🔥 Listen to tasks document
export const listenToTasks = (uid, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
};


