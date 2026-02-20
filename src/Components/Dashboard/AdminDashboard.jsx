import React, { useEffect } from "react";
import Header from "../Headooter/Admin/Header";
import Footer from "../Headooter/Admin/Footer";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  listenToUser,
  listenToTasks,
} from "../../Services/authService";

// ✅ Redux slice actions
import { setUser, setTasks } from "../../Context/AuthContext";

function AdminDashboard() {
  const dispatch = useDispatch();

  // 🔐 Auth user (Redux)
  const authUser = useSelector((state) => state.auth.user);

  /* =========================
     LISTEN TO USER PROFILE
  ========================= */
  useEffect(() => {
    if (!authUser?.uid) return;
  
    const unsubscribe = listenToUser(authUser.uid, (userData) => {
      dispatch(setUser(userData)); // overwrite, don’t merge
    });
  
    return unsubscribe;
  }, [authUser?.uid, dispatch]); // ✅ ONLY uid
  



  /* =========================
     LISTEN TO TASKS
  ========================= */
  useEffect(() => {
    if (!authUser?.uid) return;

    const unsubscribe = listenToTasks(authUser.uid, (tasks) => {
      dispatch(setTasks(tasks));
    });

    return unsubscribe;
  }, [authUser?.uid, dispatch]);


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
