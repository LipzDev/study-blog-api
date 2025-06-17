import React from "react";
import AdminTemplate from "../../templates/AdminTemplate";
import { AdminProtectedRoute } from "../../components/auth/ProtectedRoute";

const Admin = () => {
  return (
    <AdminProtectedRoute>
      <AdminTemplate />
    </AdminProtectedRoute>
  );
};

export default Admin;
