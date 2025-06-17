import React from "react";
import Layout from "../../components/molecules/Layout";
import UserPermissions from "../../components/organisms/UserPermissions";
import ButtonReturn from "../../components/atoms/ButtonReturn";
import { AdminProtectedRoute } from "../../components/auth/ProtectedRoute";

const AdminPermissionsPage = () => {
  return (
    <AdminProtectedRoute>
      <Layout isLoggedIn={true}>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ButtonReturn returnTo="/admin" />
            <UserPermissions />
          </div>
        </div>
      </Layout>
    </AdminProtectedRoute>
  );
};

export default AdminPermissionsPage;
