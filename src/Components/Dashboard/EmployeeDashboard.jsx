import React, { useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Header from '../Headooter/Header';
import Footer from '../Headooter/Footer';
import { useSelector, useDispatch } from "react-redux";

import {
  listenToUser,
  listenToTeam,
  listenToTasks,
  listenToOrganization
} from "../../Services/authService";

import { setUser, setTasks, setMembers, setOrganizations } from "../../Context/AuthContext";

function EmployeeDashboard() {
  const dispatch = useDispatch();
  const location = useLocation();
  const authUser = useSelector((state) => state.auth.user);

  /* =========================
      LISTEN TO USER PROFILE
  ========================= */
  useEffect(() => {
    if (!authUser?.uid) return;
    
    const unsubscribe = listenToUser(authUser.uid, (userData) => {
      dispatch(setUser(userData)); 
    });
    
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [authUser?.uid, dispatch]);

  /* =========================
      LISTEN TO TEAM MEMBERS
  ========================= */
  useEffect(() => {
    if (!authUser?.organization) return;
    
    const unsubscribe = listenToTeam(authUser.organization, (users) => {
      dispatch(setMembers(users));
    });
    
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [authUser?.organization, dispatch]);

  /* =========================
      LISTEN TO ORGANIZATIONS
  ========================= */
  useEffect(() => {
    const unsubscribe = listenToOrganization((organizations) => {
      dispatch(setOrganizations(organizations));
    });
    
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [dispatch]);

  /* =========================
      LISTEN TO TASKS
  ========================= */
  useEffect(() => {
    // 1. Guard Clause: Stop if profile data hasn't loaded yet
    if (!authUser?.uid || !authUser?.role || !authUser?.organization) {
      return;
    }

    // 2. Pass arguments separately as expected by the service
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

    // 3. Proper Cleanup
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
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

export default EmployeeDashboard;