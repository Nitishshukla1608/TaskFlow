import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { observeAuthState } from "./Services/authService";
import { setUser, logout } from "./Context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

// Firebase imports
import { db } from "./firebase"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Components
import CRA_org from "./Components/Pages/CRA_Org";
import { CreateAdmin } from "./Components/Pages/CreateAdmin";
import Login from "./Components/Pages/Login";
import DashboardWrapper from "./Components/Dashboard/DashboardWrapper";
import ForgotPass from "../src/Components/Pages/ForgotPass"; 
import VideoCallPage from "./Components/VideoCall/VideocallPage";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [isInitializing, setIsInitializing] = useState(true);


  const isUserAuthenticated = !!user?.uid && !user.isNewUser;

  // --- 1. AUTH STATE OBSERVER ---
  useEffect(() => {
    // We listen to auth changes once on mount
    const unsubscribe = observeAuthState((userData) => {
      if (userData) {
        dispatch(setUser(userData));
      } else {
        dispatch(logout());
      }
      setIsInitializing(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [dispatch]);

  // --- 2. REAL-TIME CALL LISTENER ---
  useEffect(() => {
    // Only listen if user is FULLY authenticated and profile data (like role) is present
    if (!isUserAuthenticated || !user?.role) return;

    const q = query(
      collection(db, "activeCalls"), 
      where("status", "==", "active"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // Only trigger on NEW incoming calls
        if (change.type === "added") {
          const callData = change.doc.data();
          
          if (callData.status === "active") {
            const join = window.confirm(`${callData.hostName || "Someone"} is inviting you to a video call. Join?`);
            if (join) {
              navigate(`/video-call/${callData.channelId}`);
            }
          }
        }
      });
    }, (error) => {
      console.error("Call Listener Error:", error);
    });

    return () => unsubscribe();
  }, [isUserAuthenticated, user?.uid, navigate]);

  // --- 3. INITIALIZING LOADER ---
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
        <p className="ml-3 font-bold text-slate-500 italic uppercase tracking-widest text-[10px]">
          Syncing Workspace...
        </p>
      </div>
    );
  }

  // Helper to determine the user's current status
  const isAuthenticated = !!user?.uid;
  const hasProfile = isAuthenticated && !user.isNewUser;

  return (
    <>
      <Routes>
        {/* Primary Entry Point: Root becomes the Login page if not authenticated */}
        <Route
          path="/"
          element={
            hasProfile ? (
              <Navigate to="/DashboardWrapper" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Redirect /login to / to maintain a single entry point */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPass /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register-org"
          element={
            hasProfile ? (
              <Navigate to="/DashboardWrapper" replace />
            ) : (
              <CRA_org />
            )
          }
        />
        <Route
          path="/createdmin"
          element={
            hasProfile ? (
              <Navigate to="/DashboardWrapper" replace />
            ) : (
              <CreateAdmin />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/DashboardWrapper/*"
          element={hasProfile ? <DashboardWrapper /> : <Navigate to="/" replace />}
        />
        <Route
          path="/video-call/:channelId"
          element={hasProfile ? <VideoCallPage /> : <Navigate to="/" replace />}
        />

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;