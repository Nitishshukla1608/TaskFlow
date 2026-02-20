import React from 'react'
import { Outlet } from "react-router-dom";
import Header from '../Headooter/Employee/Header'
import Footer from '../Headooter/Employee/Footer'
import {
  listenToUser,
  listenToTasks,
} from "../../Services/authService";

function EmployeeDashboard() {


  useEffect(() => {
    if (!user?.uid) return;
  
    const unsubUser = listenToUser(user.uid, dispatch);
    const unsubTasks = listenToTasks(user.uid, dispatch);
  
    return () => {
      unsubUser();
      unsubTasks();
    };
  }, [user?.uid]);

  
  return (
    <>
    <Header />
    <Outlet /> {/* Nested route content will render here */}
    <Footer />
    </>
  )
}

export default EmployeeDashboard