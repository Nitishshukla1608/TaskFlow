import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Profile1 from "../Pages/Copages/Admin/Profile";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminMain from "../../Mains/AdminMain";
import EmployeeMain from "../../Mains/EmployeeMain";
import CRA_Task from "../../Components/Pages/Copages/Admin/CRA_Task";
import { AddUser } from "../../Components/Pages/Copages/Admin/AddUser";
import PremiumPricing from "../Pages/PremiumPricing"
// Ensure this is imported correctly and renamed to PascalCase
import ForgotPassword from "../Pages/ForgotPass"; 

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Routes>
      {/* 🔐 ADMIN ROUTES */}
      <Route element={<ProtectedRoute user={user} allowedRoles={["Admin"]} />}>
        <Route path="AdminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminMain />} />
          <Route path="create-task" element={<CRA_Task />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="profile" element={<Profile1 />} />
        <Route path="premium" element={<PremiumPricing/>}/>
        </Route>
      </Route>

      {/* 🔐 EMPLOYEE ROUTES */}
      <Route element={<ProtectedRoute user={user} allowedRoles={["Employee"]} />}>
        <Route path="EmployeeDashboard" element={<EmployeeDashboard />}>
          <Route index element={<EmployeeMain />} />
          <Route path="profile" element={<Profile1 />} />
   <Route path="premium" element={<PremiumPricing/>}/>
        </Route>
      </Route>

      {/* 🔁 DEFAULT REDIRECT */}
      <Route
        index
        element={
          user?.role === "Admin" ? (
            <Navigate to="AdminDashboard" replace />
          ) : user?.role === "Employee" ? (
            <Navigate to="EmployeeDashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ❌ FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              user?.role === "Admin"
                ? "AdminDashboard"
                : user?.role === "Employee"
                ? "EmployeeDashboard"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
};

export default DashboardWrapper;