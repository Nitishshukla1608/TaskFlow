import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

import AdminMain from "../../Mains/AdminMain";
import EmployeeMain from "../../Mains/EmployeeMain";
import CRA_Task from "../../Components/Pages/Copages/Admin/CRA_Task";

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>

      {/* ADMIN */}
      {user.role === "Admin" && (
        <Route path="AdminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminMain />} />
          <Route path="create-task" element={<CRA_Task />} />
        </Route>
      )}

      {/* EMPLOYEE */}
      {user.role === "Employee" && (
        <Route path="EmployeeDashboard" element={<EmployeeDashboard />}>
          <Route index element={<EmployeeMain />} />
        </Route>
      )}



      {/* Default redirect based on role */}
      <Route
        index
        element={
          user.role === "Admin" ? (
            <Navigate to="AdminDashboard" replace />
          ) : (
            <Navigate to="EmployeeDashboard" replace />
          )
        }
      />


      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={user.role === "Admin" ? "AdminDashboard" : "EmployeeDashboard"}
            replace
          />
        }
      />

    </Routes>
  );
};

export default DashboardWrapper;
