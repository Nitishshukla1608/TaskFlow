import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Login from '../Auth/Login';
import AdminMain from '../Mains/AdminMain'; // Import AdminMain
import EmployeeMain from '../Mains/EmployeeMain'; // Import EmployeeMain
import CRA_Task from '../Cards/Admin/CRA_Task'; // Import CRA_Task
import All_Task from '../Cards/Employee/Tasklist';


const DashboardWrapper = ({ employeeData, adminData }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user || !user.role) {
    // If no user or role, show the login page
    return <Login employeeData={employeeData} adminData={adminData} />;
  }

  if (user.role === 'admin') {
    return (
      <Routes>
        <Route path="/adminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminMain />} />
          <Route path="create-task" element={<CRA_Task />} />
        </Route>
        <Route path="*" element={<Navigate to="/adminDashboard" replace />} />
      </Routes>
    );
  } else if (user.role === 'employee') {
    return (
      <Routes>
        <Route path="/employeeDashboard" element={<EmployeeDashboard/>}>
            <Route index element={<EmployeeMain/>}/>
            <Route path="view-task" element={<All_Task/>}/>
        </Route>
        <Route path="*" element={<Navigate to="/employeeDashboard" replace />} />
      </Routes>
    );
  }

  return <div>Unknown user role. Please log in.</div>;
};

export default DashboardWrapper;

