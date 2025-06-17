import { useContext } from "react";
import { UserContext } from "../context/user";

/**
 * Hook para verificar se o usuário atual é um administrador
 *
 * @returns objeto com informações sobre o status de admin
 */
export const useAdmin = () => {
  const { user, signed, loading } = useContext(UserContext);

  const isAdmin = signed && user?.role === "admin";
  const isSuperAdmin = signed && user?.isSuperAdmin === true;
  const isUser = signed && user?.role === "user";

  return {
    isAdmin,
    isSuperAdmin,
    isUser,
    user,
    signed,
    loading,
    role: user?.role || null,
  };
};

/**
 * Hook para verificar se o usuário é admin e está logado
 * Útil para componentes que só devem ser exibidos para admins
 */
export const useAdminOnly = () => {
  const { isAdmin, loading } = useAdmin();

  return {
    isAdmin,
    loading,
    shouldShow: isAdmin && !loading,
  };
};

/**
 * Hook para verificar se o usuário é super admin
 */
export const useSuperAdminOnly = () => {
  const { isSuperAdmin, loading } = useAdmin();

  return {
    isSuperAdmin,
    loading,
    shouldShow: isSuperAdmin && !loading,
  };
};

/**
 * Hook para verificar se o usuário tem permissão para acessar funcionalidades administrativas
 */
export const useAdminPermissions = () => {
  const { isAdmin, isSuperAdmin, signed, loading } = useAdmin();

  return {
    canAccessAdmin: isAdmin,
    canCreatePosts: isAdmin,
    canEditPosts: isAdmin,
    canDeletePosts: isAdmin,
    canManageUsers: isAdmin,
    canPromoteUsers: isAdmin,
    canRevokeAdmin: isSuperAdmin,
    canManageSuperAdmins: false, // Nunca permitido via interface
    isAuthenticated: signed,
    loading,
  };
};
