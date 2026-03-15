import { auth, db, secondaryAuth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

/* =========================
   AUTH / USER FUNCTIONS
========================= */

/**
 * Creates a new user via secondaryAuth (to avoid logging out the current admin)
 * and saves their profile to Firestore.
 */
export const addUser = async (
  name, email, password, role, position, organization,
  regId, phone, country, address, city, state, pinCode
) => {
  try {
    // 1️⃣ Create the user in Auth instance (secondary)
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUser = userCredential.user;

    // 2️⃣ Prepare the document data
    const userData = {
      uid: newUser.uid,
      email: email || "",
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
      createdAt: serverTimestamp(), // Best practice for Firestore
      isPasswordChangable: true,
    };

    // 3️⃣ CRITICAL: Sign out secondary instance before writing
    // This ensures Firestore session uses the 'Primary Auth' (The Admin)
    await signOut(secondaryAuth);

    // 4️⃣ Write to Firestore
    const userDocRef = doc(db, "users", newUser.uid);
    await setDoc(userDocRef, userData);

    // Return serializable data for Redux
    return {
      ...userData,
      createdAt: Date.now(), 
    };
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

  if (!snap.exists()) throw new Error("User profile not found in Firestore");

  const firestoreUser = snap.data();
  return {
    uid: authUser.uid,
    email: authUser.email,
    ...firestoreUser,
    // Safely convert Timestamp to ISO string
    createdAt: firestoreUser.createdAt?.toDate?.()?.toISOString() || null,
  };
};

export const editUser = async (collectionName, uid, data) => {
  try {
    const docRef = doc(db, collectionName, uid);
    await updateDoc(docRef, {
      ...data,
      lastModified: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
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

export const addOrganization = async (organization) => {
  try {
    const orgId = `ORG_${Date.now()}`;
    const docRef = doc(db, "organization", orgId);

    const orgData = {
      ...organization,
      orgId,
      createdAt: serverTimestamp(),
      status: "active",
    };

    await setDoc(docRef, orgData);
    return orgId;
  } catch (error) {
    console.error("Error in adding organization:", error);
    throw error;
  }
};

/* =========================
   REAL-TIME LISTENERS
========================= */

export const listenToUser = (uid, callback) => {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    callback({
      uid: snap.id,
      ...data,
      lastModified: data.lastModified?.toMillis?.() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    });
  });
};

export const listenToTasks = (userData, callback) => {
  const { uid, role, organization } = userData;
  if (typeof callback !== 'function') return () => {};

  const tasksRef = collection(db, "tasks");
  let q;

  if (role === "Admin") {
    q = query(tasksRef, where("organization", "==", organization));
  } else {
    q = query(tasksRef, where("assignedToUid", "==", uid));
  }

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(tasks);
  }, (err) => console.error("Task Listener Error:", err));
};

export const listenToTeam = (organizationName, callback) => {
  const q = query(
    collection(db, "users"),
    where("organization", "==", organizationName)
  );

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis?.() || null,
        lastModified: data.lastModified?.toMillis?.() || null,
      };
    });
    callback(members);
  });
};

export const listenToOrganization = (callback) => {
  const q = query(collection(db, "organization"));
  return onSnapshot(q, (snapshot) => {
    const organizations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis?.() || null,
      };
    });
    callback(organizations);
  });
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
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};