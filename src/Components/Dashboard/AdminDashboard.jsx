import React, { useEffect } from "react";
import Header from "../Headooter/Header";
import Footer from "../Headooter/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  listenToUser,
  
  listenToTeam,
  listenToOrganization,
} from "../../Services/authService";
import {listenToTasks} from "../../Services/taskService"


// Redux actions
import { setUser, setTasks, setMembers, setOrganizations, setOrganization } from "../../Context/AuthContext";

function AdminDashboard() {
  const dispatch = useDispatch();
  const location = useLocation();

  // 🔐 Logged-in auth user from Redux
  const authUser = useSelector((state) => state.auth.user);

  /* =========================
      1. LISTEN TO USER PROFILE
  ========================= */
  useEffect(() => {
    if (!authUser?.uid) return;

    const unsubscribe = listenToUser(authUser.uid, (userData) => {
      // ✅ Update Redux with full Firestore profile (role, organization, etc.)
      dispatch(setUser(userData));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authUser?.uid, dispatch]);

  
  /* =========================
      2. LISTEN TO TEAM MEMBERS
  ========================= */
  useEffect(() => {
    // 🛑 Wait for organization data from the profile listener above
    if (!authUser?.organization) return;

    const unsubscribe = listenToTeam(authUser.organization, (users) => {
      dispatch(setMembers(users));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authUser?.organization, dispatch]);

  /* =========================
      3. LISTEN TO ORGANIZATION DETAILS
  ========================= */
  useEffect(() => {
    // 🛑 Use direct orgId from profile if available, otherwise fallback
    const orgId = authUser?.orgId || (typeof authUser?.organization === 'object' ? authUser.organization.id : authUser?.organization);
    
    if (!orgId) return;

    const unsubscribe = listenToOrganization(orgId, (orgData) => {
      // ✅ Update Redux with latest organization settings/status
      dispatch(setOrganization(orgData));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authUser?.organization, dispatch]);

  /* =========================
      4. LISTEN TO TASKS (FIXED)
  ========================= */
  useEffect(() => {
    // 🛑 Stop if any required data is missing from the profile
    if (!authUser?.uid || !authUser?.role || !authUser?.organization) {
      console.log("Waiting for user profile to load before listening to tasks...");
      return;
    }

    // ✅ FIX: Separated the Data Object from the Callback Function
    const unsubscribe = listenToTasks(
      {
        uid: authUser.uid,
        role: authUser.role,
        organization: authUser.organization,
      }, 
      (tasks) => {
        const serializableTasks = tasks.map(task => {
          const newTask = { ...task };
          // Convert Firestore timestamps to serializable strings
          Object.keys(newTask).forEach(key => {
            if (newTask[key] && typeof newTask[key].toDate === 'function') {
              newTask[key] = newTask[key].toDate().toISOString();
            }
          });
          return newTask;
        });
        dispatch(setTasks(serializableTasks));
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authUser?.uid, authUser?.role, authUser?.organization, dispatch]);

  // Logic to hide footer on messages page
  const isMessagesPage = location.pathname.endsWith("/messages");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      {!isMessagesPage && <Footer />}
    </div>
  );
}

export default AdminDashboard;