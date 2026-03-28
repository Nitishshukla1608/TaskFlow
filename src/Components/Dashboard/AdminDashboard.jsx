import React, { useEffect } from "react";
import Header from "../Headooter/Header";
import Footer from "../Headooter/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  listenToUser,
  listenToTasks,
  listenToTeam,
  listenToOrganization,
} from "../../Services/authService";

// Redux actions
import { setUser, setTasks, setMembers, setOrganizations } from "../../Context/AuthContext";

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
      3. LISTEN TO ORGANIZATIONS
  ========================= */
  useEffect(() => {
    const unsubscribe = listenToOrganization((organizations) => {
      dispatch(setOrganizations(organizations));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [dispatch]);

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
        dispatch(setTasks(tasks));
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