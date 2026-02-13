import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Headooter/Admin/Header";
import Footer from "../Headooter/Admin/Footer";

function AdminDashboard() {
  return (
    <>
      <Header />
      <Outlet /> {/* Nested route content will render here */}
      <Footer />
    </>
  );
}

export default AdminDashboard;
