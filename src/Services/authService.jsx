// services/authService.js
import { auth, db, secondaryAuth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
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


export const addUser = async (/* parameters... */) => {
  try {
    // 1️⃣ Create the user in Auth
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUser = userCredential.user;

    // 2️⃣ Prepare Data
    const userDocRef = doc(db, "users", newUser.uid);
    const userData = {
      uid: newUser.uid,
      // ... rest of your data
      role: role || "Employee", 
      createdAt: serverTimestamp(),
    };

    // 3️⃣ CRITICAL: Sign out secondaryAuth IMMEDIATELY 
    // before writing to Firestore to prevent session bleeding
    await signOut(secondaryAuth);

    // 4️⃣ Now write to Firestore. 
    // Firestore will use the 'Primary Auth' (The Admin) to verify permissions.
    await setDoc(userDocRef, userData);

    return { ...userData, createdAt: Date.now() };
  } catch (error) {
    console.error("Error in service addUser:", error.code, error.message);
    throw error; 
  }
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const authUser = userCredential.user;
  const userRef = doc(db, "users", authUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error("User profile not found");
  const firestoreUser = snap.data();
  
  return {
    uid: authUser.uid,
    email: authUser.email,
    ...firestoreUser,
    createdAt: firestoreUser.createdAt?.toDate?.()?.toISOString() || null,
  };
};

export const addTask = async (newTask) => {
  try {
    const taskId = `TASK_${Date.now()}`;
    const docRef = doc(db, "tasks", taskId);

    const taskData = {
      ...newTask,
      taskId,
      createdAt: serverTimestamp(),
      status: newTask.status || "Pending"
    };

    await setDoc(docRef, taskData);
    return taskId;
  } catch (error) {
    console.error("Error adding Task:", error);
    throw error;
  }
};

export const addOrganization = async (organization) => {
  try {
    const orgId = `ORG_${Date.now()}`;
    const docRef = doc(db, "organization", orgId); 
    const orgData = {
      ...organization,
      orgId,
      createdAt: serverTimestamp(),
      status: "active"
    };
    await setDoc(docRef, orgData);
    return orgId; 
  } catch (error) {
    console.error("Error adding organization:", error);
    throw error;
  }
};



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
    
    const data = snap.data();
    
    callback({
      uid: snap.id,
      ...data,
      // 🔥 Convert lastModified to a serializable number
      lastModified: data.lastModified?.toMillis ? data.lastModified.toMillis() : (data.lastModified || null),
      
      // Ensure createdAt is also serializable
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || null),
    });
  });
};




// ✅ Fix: Accept TWO arguments (userData object, callback function)
export const listenToTasks = (userData, callback) => {
  // Destructure the first argument
  const { uid, role, organization } = userData;
  
  // Safety check to ensure callback exists (the second argument)
  if (typeof callback !== 'function') {
    console.error("listenToTasks: Callback missing!", { uid, role, organization });
    return () => {}; 
  }

  const tasksRef = collection(db, "tasks");
  let q;

  // Logic remains the same
  if (role === "Admin") {
    q = query(tasksRef, where("organization", "==", organization));
  } else {
    // For Employees: Only show tasks assigned to them
    q = query(tasksRef, where("assignedToUid", "==", uid));
  }

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(tasks);
  }, (err) => console.error("Snapshot error:", err));
};




export const listenToTeam = (organizationName, callback) => {
  // 1️⃣ Create a query that filters the 'users' collection by the 'organization' field
  const q = query(
    collection(db, "users"), 
    where("organization", "==", organizationName)
  );

  // 2️⃣ Start the real-time listener
  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
          // 🔥 Normalizing Firestore Timestamps for Redux serializability
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || null),
          lastModified: data.lastModified?.toMillis ? data.lastModified.toMillis() : (data.lastModified || null),
        };
      });

      callback(members);
    },
    (error) => {
      // ⚠️ This will trigger if your Security Rules block this specific organization query
      console.error("Error listening to team:", error);
    }
  );
};


  
export const listenToOrganization = (callback) => {
  const q = query(collection(db, "organization"));

  return onSnapshot(
    q,
    (snapshot) => {
      const organizations = snapshot.docs.map((doc) => { 
        const data = doc.data();

        // Check if it's a Firestore Timestamp (has toMillis) or a String/Date
        let normalizedDate = null;
        if (data.createdAt) {
          if (typeof data.createdAt.toMillis === "function") {
            // It's a Firestore Timestamp
            normalizedDate = data.createdAt.toMillis();
          } else {
            // It's already a String or a Date object
            normalizedDate = new Date(data.createdAt).getTime();
          }
        }

        return {
          id: doc.id,
          ...data,
          createdAt: normalizedDate,
        };
      });

      callback(organizations);
    },
    (error) => {
      console.error("Error listening to organizations collection:", error);
    }
  );
};
 

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        callback({
          uid: user.uid,
          ...userData,
          lastModified: userData.lastModified?.toMillis?.() || null,
          createdAt: userData.createdAt?.toMillis?.() || null,
        });
      } else { callback(null); }
    } else { callback(null); }
  });
};