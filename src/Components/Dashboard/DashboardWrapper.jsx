import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import Profile1 from "../Pages/Copages/Admin/Profile";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminMain from "../../Mains/AdminMain";
import EmployeeMain from "../../Mains/EmployeeMain";
import CRA_Task from "../../Components/Pages/Copages/Admin/CRA_Task";
import { AddUser } from "../../Components/Pages/Copages/Admin/AddUser";
import PremiumPricing from "../Pages/PremiumPricing";
import FreeTrial from "../Pages/premiumPlans/freeTrial";
import PaymentPage from "../Pages/PaymentPage";
import PaidPlan from "../Pages/premiumPlans/paidPlan";
import Messages from "../Pages/Messages/Messages";

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);

  // 1. Guard Clause: If Redux hasn't loaded the user yet, render nothing.
  // This prevents the router from trying to redirect before it knows the role.
  if (!user) return null;

  // Define the base path for easier redirection logic
  const dashboardBase = user.role === "Admin" ? "AdminDashboard" : "EmployeeDashboard";

  return (
    <Routes>
      {/* 🔐 ADMIN ROUTES - Only accessible if role is Admin */}
      {user.role === "Admin" && (
        <Route path="AdminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminMain />} />
          <Route path="create-task" element={<CRA_Task />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="profile" element={<Profile1 />} />
          <Route path="messages" element={<Messages />} />
          <Route path="premium" element={<PremiumPricing />} />
          <Route path="premium/free-trial" element={<FreeTrial />} />
          <Route path="premium/paidplan" element={<PaidPlan />} />
          <Route path="premium/free-trial/payment" element={<PaymentPage />} /> 
          <Route path="premium/paidplan/payment" element={<PaymentPage />} />
        </Route>
      )}

      {/* 🔐 EMPLOYEE ROUTES - Only accessible if role is Employee */}
      {user.role === "Employee" && (
        <Route path="EmployeeDashboard" element={<EmployeeDashboard />}>
          <Route index element={<EmployeeMain />} />
          <Route path="profile" element={<Profile1 />} />
          <Route path="premium" element={<PremiumPricing />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      )}

      {/* 🔁 INITIAL ROLE-BASED REDIRECT 
          If someone hits /DashboardWrapper directly, send them to their role-specific home. */}
      <Route
        index
        element={<Navigate to={dashboardBase} replace />}
      />

      {/* ❌ GLOBAL FALLBACK 
          If a URL is typed incorrectly (e.g., /DashboardWrapper/xyz), 
          it stays within the dashboard context rather than crashing or looping. */}
      <Route path="*" element={<Navigate to={dashboardBase} replace />} />
    </Routes>
  );
};

export default DashboardWrapper;