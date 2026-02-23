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
  deleteDoc
} from "firebase/firestore";

/* =========================
   AUTH / USER FUNCTIONS
========================= */



export const addUser = async (
  name,
  email,
  password,
  role,
  position,
  organization,
  regId,
  phone,
  country,
  address,
  city,
  state,
  pinCode,
) => {
  try {
    // 1️⃣ Create the user in Firebase Auth
    // Firebase Auth handles the heavy lifting of password hashing and security
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 2️⃣ Prepare the document reference using the unique Auth UID
    const userDocRef = doc(db, "users", user.uid);

    // 3️⃣ Save data to Firestore
    // Using || "" or || null ensures Firestore doesn't crash on undefined values
    await setDoc(userDocRef, {
      uid: user.uid,
      email: email || "",
      // Note: Storing plain text passwords in Firestore is not recommended for production
      password: password || "", 
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
      createdAt: serverTimestamp(),
      isPasswordChangable:true,
    });

    return user;
  } catch (error) {
    // Provide more context in the console for debugging
    console.error("Error in service addUser:", error.code, error.message);
    throw error; 
  }
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



export const createUser = async (organization , email , password , role )=>{
  try{
     const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
        const user = userCredential.user;

    // 2️⃣ Prepare the document reference
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: email || "",
      password:password || "",
      role: role ,
       organization: organization || "",
      createdAt: serverTimestamp(),
    });
    return user;

  }catch(error){
    console.log("Error in signupUser:")
  }
}



export const editUser = async (collectionName, uid, data) => {
  try {
    const docRef = doc(db, collectionName, uid);
    
    // We use updateDoc to only change the fields passed in 'data'
    // We also add an 'updatedAt' timestamp automatically
    await updateDoc(docRef, {
      ...data,
      lastModified: serverTimestamp(), 
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

/* =========================
   REAL-TIME LISTENERS & GETTERS
========================= */



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
 

  
export const listenToTeam = (callback) => {
  const q = query(collection(db, "users"));

  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,

          // 🔥 normalize Firestore Timestamp
          createdAt: data.createdAt
            ? data.createdAt.toMillis() // or .toDate().toISOString()
            : null,
        };
      });

      callback(members);
    },
    (error) => {
      console.error("Error listening to users collection:", error);
    }
  );
};
  