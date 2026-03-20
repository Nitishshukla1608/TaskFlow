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
  pinCode
) => {
  try {
    // 1️⃣ Determine which auth instance to use.
    // If we are creating an Admin and no one is logged in, this is the FIRST Admin.
    // We MUST use the main 'auth' instance so they are signed in for the Firestore write.
    const isInitialAdmin = role === "Admin" && !auth.currentUser;
    const authToUse = isInitialAdmin ? auth : secondaryAuth;

    // 2️⃣ Create the user
    const userCredential = await createUserWithEmailAndPassword(
      authToUse,
      email,
      password
    );
    const newUser = userCredential.user;

    // 3️⃣ Prepare the document data
    const userData = {
      password: password || "",
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
      createdAt: serverTimestamp(),
      isPasswordChangable: true,
    };

    // 4️⃣ Write to Firestore
    // If isInitialAdmin is true, the user is now signed into 'auth'.
    // If isInitialAdmin is false, the Admin is still signed into 'auth'.
    const userDocRef = doc(db, "users", newUser.uid);
    await setDoc(userDocRef, userData);

    // 5️⃣ Cleanup secondary instance if used
    if (authToUse === secondaryAuth) {
      await signOut(secondaryAuth);
    }

    return {
      ...userData,
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error("Error in addUser service:", error.code, error.message);
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
    // Convert Firestore timestamp to serializable ISO string
    createdAt: firestoreUser.createdAt?.toMillis ? new Date(firestoreUser.createdAt.toMillis()).toISOString() : null,
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


export const editPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not logged in");
    }

    // 🔐 1. Update Firebase Auth (MAIN)
    await updatePassword(user, newPassword);


    return { success: true };
  } catch (error) {
    console.log("Error updating Password:", error);
    throw error;
  }
};
/* =========================
   TASK & ORG FUNCTIONS
========================= */

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



export const checkIfEmailExists = async (email) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
  console.log(methods)
    if (methods.length > 0) {

      return { exists: true, methods }; // email registered
    } else {
      return { exists: false }; // email not found
    }
  } catch (error) {
    console.error("Error checking email:", error);
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
      createdAt: data.createdAt?.toMillis?.() || null,
    });
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


export const listenToTasks = (userData, callback) => {
  const { uid, role, organization } = userData;
  if (!uid || typeof callback !== 'function') return () => {};

  const tasksRef = collection(db, "tasks");
  let q;

  // Admins see everything in their org, Employees see assigned tasks
  if (role === "Admin") {
    q = query(tasksRef, where("organization", "==", organization));
  } else {
    q = query(tasksRef, where("assignedToUid", "==", uid));
  }

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || null,
    }));
    callback(tasks);
  }, (err) => console.error("Task Listener Error:", err));
};

export const listenToTeam = (organizationName, callback) => {
  if (!organizationName) return () => {};
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

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
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
          // Auth user exists but Firestore doc hasn't been created yet
          callback({ uid: user.uid, email: user.email, partial: true });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};