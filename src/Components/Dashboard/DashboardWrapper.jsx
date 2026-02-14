import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Login from '../Auth/Login';
import AdminMain from '../Mains/AdminMain';
import EmployeeMain from '../Mains/EmployeeMain';
import CRA_Task from '../Cards/Admin/CRA_Task';
import All_Task from '../Cards/Employee/Tasklist';

import { setTask } from '../../Context/TaskContext';

const DashboardWrapper = ({ employeeData, adminData }) => {
  const user = useSelector((state) => state.auth.user);


  // ✅ If not logged in → Login
  if (!user || !user.role) {
    return <Login employeeData={employeeData} adminData={adminData} />;
  }

  // ✅ Admin Routes
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
  }

  // ✅ Employee Routes
  if (user.role === 'employee') {
    return (
      <Routes>
        <Route path="/employeeDashboard" element={<EmployeeDashboard />}>
          <Route index element={<EmployeeMain />} />
          <Route path="view-task" element={<All_Task />} />
        </Route>
        <Route path="*" element={<Navigate to="/employeeDashboard" replace />} />
      </Routes>
    );
  }

  return <div>Unknown user role. Please log in.</div>;
};

export default DashboardWrapper;
