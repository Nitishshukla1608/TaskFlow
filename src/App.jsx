import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Components/Pages/Login";

import DashboardWrapper from "./Components/Dashboard/DashboardWrapper";

function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Routes>

      {/* Public */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/DashBoardWrapper" />}
      />
    

      {/* Protected */}
      <Route
        path="/DashBoardWrapper/*"
        element={user ? <DashboardWrapper /> : <Navigate to="/login" />}
      />

      {/* Fallback */} // whne no any route will match ......
      <Route
        path="*"
        element={<Navigate to={user ? "/DashBoardWrapper" : "/login"} />}
      />

    </Routes>
  );
}

export default App;
