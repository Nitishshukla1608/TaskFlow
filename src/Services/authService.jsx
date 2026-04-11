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



/**
 * Adds a new organization to Firestore.
 * Commercial Note: Returns the full object to prevent immediate re-fetching,
 * which often triggers "Insufficient Permissions" errors on the UI.
 */
export const addOrganization = async (organization, planData = null, isFreeTrial = false) => {
  try {
    // 1. Generate unique ID for the public entry
    const entropy = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orgId = `ORG_UNAUTH_${Date.now()}_${entropy}`;
    const docRef = doc(db, "organization", orgId);

    // 2. Structure data (Notice: createdBy is now 'public_onboarding')
    const orgData = {
      ...organization,
      orgId,
      status: "pending_verification", // Pro-tip: mark as pending since it's unauthenticated
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || "public_onboarding",
      
      subscription: {
        tier: isFreeTrial ? "trial" : (planData?.type || "standard"),
        isTrialActive: isFreeTrial,
        trialEndsAt: isFreeTrial 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
      },
      settings: {
        isSetupComplete: false,
        theme: "default"
      }
    };

    // 3. Execution (This will now pass even without a login)
    await setDoc(docRef, orgData);

    return { orgId, orgData };
    
  } catch (error) {
    console.error("Infrastructure Deployment Failed:", error.code, error.message);
    throw new Error("System was unable to provision the organization. Please check your connection.");
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



// Listen only to ONE specific org
export const listenToOrganization = (orgId, callback) => {
  if (!orgId || typeof orgId !== 'string') {
    console.warn("No valid orgId provided to listenToOrganization");
    return () => {};
  }

  const docRef = doc(db, "organization", orgId); // ✅ singular as per addOrganization

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.warn("Organization not found:", orgId);
        callback(null);
      }
    },
    (err) => {
      console.error("Org Listener Error:", err);
    }
  );
};


// Note: listenToTasks has been moved to taskService.jsx to avoid redundancy.

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
    if (user?.uid) {
      try {
        const userRef = doc(db, "users", user.uid);
        
        // Use a snapshot listener instead of getDoc for the auth state 
        // to handle the delay between Auth creation and Firestore creation
        const unsubscribe = onSnapshot(userRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            callback({
              uid: user.uid,
              ...userData,
              lastModified: userData.lastModified?.toMillis?.() || null,
              createdAt: userData.createdAt?.toMillis?.() || null,
            });
          } else {
            // Document doesn't exist yet, but Auth does
            callback({ uid: user.uid, email: user.email, isNewUser: true });
          }
        }, (err) => {
          console.error("Internal User Listener Error:", err);
          callback({ uid: user.uid, email: user.email, error: "Access Denied" });
        });

        return unsubscribe;
      } catch (err) {
        callback({ uid: user.uid, email: user.email, error: "Initialization Failed" });
      }
    } else {
      callback(null);
    }
  });
};


