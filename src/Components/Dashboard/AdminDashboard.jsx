import React, { useEffect } from "react";
import Header from "../Headooter/Header";
import Footer from "../Headooter/Footer";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  listenToUser,
  listenToTasks,
  listenToTeam,
} from "../../Services/authService";

// Redux actions
import { setUser, setTasks, setMembers } from "../../Context/AuthContext";

function AdminDashboard() {
  const dispatch = useDispatch();

  // 🔐 Logged-in auth user
  const authUser = useSelector((state) => state.auth.user);

  /* =========================
     LISTEN TO USER PROFILE
  ========================= */
  useEffect(() => {
    if (!authUser?.uid) return;

    const unsubscribe = listenToUser(authUser.uid, (userData) => {
      dispatch(setUser(userData));
    });

    return unsubscribe;
  }, [authUser?.uid, dispatch]);

  /* =========================
     LISTEN TO TEAM MEMBERS
  ========================= */
  useEffect(() => {
    const unsubscribe = listenToTeam((users) => {
      dispatch(setMembers(users));
    });

    return unsubscribe;
  }, [dispatch]);

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
        {/* Child routes render here */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;