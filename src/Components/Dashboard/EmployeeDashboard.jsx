import React, { useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Header from '../Headooter/Header';
import Footer from '../Headooter/Footer';
import { useSelector, useDispatch } from "react-redux";

import {
  listenToUser,
  listenToTeam,
  listenToOrganization
} from "../../Services/authService";
import {listenToTasks} from "../../Services/taskService"

import { setUser, setTasks, setMembers, setOrganizations, setOrganization } from "../../Context/AuthContext";

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
      LISTEN TO ORGANIZATION DETAILS
  ========================= */
  useEffect(() => {
    // 🛑 Use direct orgId from profile if available, otherwise fallback
    const orgId = authUser?.orgId || (typeof authUser?.organization === 'object' ? authUser.organization.id : authUser?.organization);
    
    if (!orgId) return;

    const unsubscribe = listenToOrganization(orgId, (orgData) => {
      dispatch(setOrganization(orgData));
    });
    
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [authUser?.organization, dispatch]);

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
        const serializableTasks = tasks.map(task => {
          const newTask = { ...task };
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