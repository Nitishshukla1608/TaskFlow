import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { observeAuthState } from "./Services/authService";
import { setUser } from "./Context/AuthContext";
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

  // --- 1. AUTH STATE OBSERVER ---
  useEffect(() => {
    const unsubscribe = observeAuthState((userData) => {
      if (userData) {
        dispatch(setUser(userData));
      } else {
        dispatch(setUser(null));
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, [dispatch]);

  // --- 2. REAL-TIME CALL LISTENER ---
  useEffect(() => {
    if (!user) return;

    // Sirf wahi calls suno jo 'active' hain aur jisme user participant hai
    const q = query(
      collection(db, "activeCalls"), 
      where("status", "==", "active"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const callData = change.doc.data();
          
          // Double check status as per business logic
          if (callData.status === "active") {
            const join = window.confirm(`${callData.hostName} is inviting you to a video call. Join?`);
            if (join) {
              navigate(`/video-call/${callData.channelId}`);
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, navigate]);

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
        <p className="ml-3 font-bold text-slate-500 italic uppercase tracking-widest text-[10px]">Syncing Workspace...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/DashboardWrapper" />}
        />
        <Route
          path="/forgot-password"
          element={!user ? <ForgotPass /> : <Navigate to="/DashboardWrapper" />}
        />
        <Route
          path="/register-org"
          element={!user ? <CRA_org /> : <Navigate to="/DashboardWrapper" />}
        />
        <Route
          path="/createdmin"
          element={!user ? <CreateAdmin /> : <Navigate to="/DashboardWrapper" />}
        />
        <Route
          path="/DashboardWrapper/*"
          element={user ? <DashboardWrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/video-call/:channelId"
          element={user ? <VideoCallPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/DashboardWrapper" : "/login"} />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/DashboardWrapper" : "/login"} />}
        />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;