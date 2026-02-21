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

export const signupUser = async (
  email,
  password,
  role,
  name,
  position,
  phone,
  organization,
  regId,
  address,
  city,
  state,
  pinCode,
  country
) => {
  try {
    // 1️⃣ Create the user in Firebase Auth
    // This requires email as the 2nd argument and password as the 3rd
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 2️⃣ Prepare the document reference
    const userDocRef = doc(db, "users", user.uid);

    // 3️⃣ Save data to Firestore
    // Every field uses || "" to prevent "Unsupported field value: undefined"
    await setDoc(userDocRef, {
      uid: user.uid,
      email: email || "",
      password:password || "",
      name: name || "",
      role: role || "Employee",
      position: position || "",
      phone: phone || "",
      organization: organization || "",
      regId: regId || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pinCode: pinCode || "",
      country: country || "",
      yourTotal: 0,
      createdAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error("Error in signupUser:", error.message);
    throw error; // Pass the error back to the UI to display it
  }
};

export const signupWithGoogle = async (
  role, 
  name, 
  position, 
  organization, 
  regId, 
  address, 
  city, 
  state, 
  pinCode, 
  country
) => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // Only create the document if it's a first-time signup
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      // Priority: 1. Name from Form, 2. Name from Google, 3. Empty String
      name: name || user.displayName || "", 
      email: user.email || "",
      
      // Values from your form component
      role: role || "Employee",
      position: position || "",
      organization: organization || "",
      regId: regId || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pinCode: pinCode || "",
      country: country || "",
      
      yourTotal: 0,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

// 🔹 Login
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const authUser = userCredential.user;

  if (!authUser || !authUser.uid) throw new Error("Authentication failed");

  const userRef = doc(db, "users", authUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User profile not found in Firestore");

  const firestoreUser = snap.data();

  return {
    uid: authUser.uid,
    email: authUser.email,
    emailVerified: authUser.emailVerified,
    ...firestoreUser,
    createdAt: firestoreUser.createdAt?.toDate()?.toISOString() || null,
  };
};

/* =========================
   REAL-TIME LISTENERS & GETTERS
========================= */

export const getUserData = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User data not found");
  return {
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate()?.toISOString() || null,
  };
};

export const incrementUserTotalTasks = async (uid) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { yourTotal: increment(1) });
};

export const listenToUser = (uid, callback) => {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    callback({
      uid: snap.id,
      ...snap.data(),
      createdAt: snap.data().createdAt?.toDate()?.toISOString() || null,
    });
  });
};

export const listenToTasks = (uid, callback) => {
  const q = query(collection(db, "tasks"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tasks);
  });
};