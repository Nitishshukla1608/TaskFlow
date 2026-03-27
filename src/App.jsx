import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { observeAuthState } from "./Services/authService";
import { setUser } from "./Context/AuthContext";

// Components
import CRA_org from "./Components/Pages/CRA_Org";
import { CreateAdmin } from "./Components/Pages/CreateAdmin";
import Login from "./Components/Pages/Login";
import DashboardWrapper from "./Components/Dashboard/DashboardWrapper";
import ForgotPass from "../src/Components/Pages/ForgotPass"; // Ensure this import path is correct

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((userData) => {
      if (userData) {
        // Hydrate Redux state if Firebase session exists
        dispatch(setUser(userData));
      } else {
        // Clear Redux state if no session exists
        dispatch(setUser(null));
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  
  // Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
        <p className="ml-3 font-bold text-slate-500">Syncing Workspace...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/DashboardWrapper" />}
      />

      {/* Forgot Password Route - Accessible to public */}
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPass /> : <Navigate to="/DashboardWrapper" />}
      />

      {/* New Organization Route - Accessible to public */}
      <Route
        path="/register-org"
        element={!user ? <CRA_org /> : <Navigate to="/DashboardWrapper" />}
      />
      
      <Route
        path="/createdmin"
        element={!user ? <CreateAdmin /> : <Navigate to="/DashboardWrapper" />}
      />

      {/* --- PROTECTED ROUTES --- */}
      <Route
        path="/DashboardWrapper/*"
        element={user ? <DashboardWrapper /> : <Navigate to="/login" />}
      />

      {/* --- REDIRECTS --- */}
      <Route
        path="/"
        element={<Navigate to={user ? "/DashboardWrapper" : "/login"} />}
      />
      
      {/* Fallback for 404s */}
      <Route
        path="*"
        element={<Navigate to={user ? "/DashboardWrapper" : "/login"} />}
      />
    </Routes>
  );
}

export default App;