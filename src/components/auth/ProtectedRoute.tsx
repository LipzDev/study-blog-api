import React from "react";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAdmin } from "../../hooks/useAdmin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  redirectToPrevious?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger rotas que requerem autenticação
 *
 * @param children - Componentes filhos a serem renderizados se autenticado
 * @param redirectTo - URL para redirecionamento se não autenticado (padrão: '/login')
 * @param redirectToPrevious - Se deve redirecionar para rota anterior (padrão: false)
 * @param fallback - Componente a ser mostrado durante loading/redirecionamento
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
  redirectToPrevious = false,
  fallback,
}) => {
  const { isAuthenticated, loading, isRedirecting } = useAuthGuard({
    redirectTo,
    redirectToPrevious,
  });

  // Componente de loading padrão
  const defaultFallback = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-neutral-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl text-neutral-600">
          {loading ? "Verificando autenticação..." : "Redirecionando..."}
        </h2>
      </div>
    </div>
  );

  // Mostra loading ou redirecionamento
  if (loading || isRedirecting) {
    return <>{fallback || defaultFallback}</>;
  }

  // Só renderiza children se estiver autenticado
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Componente específico para proteger rotas administrativas
 * Verifica se o usuário está logado E é admin
 * Redireciona para a rota anterior se não estiver logado
 */
export const AdminProtectedRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const { isAdmin, loading, signed } = useAdmin();

  // Componente de loading para verificação de admin
  const adminFallback = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-neutral-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl text-neutral-600">Verificando permissões...</h2>
      </div>
    </div>
  );

  // Componente de acesso negado
  const accessDenied = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
        <p className="text-gray-600 mb-6">
          Apenas administradores podem acessar esta funcionalidade.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute
      redirectToPrevious={true}
      fallback={fallback || adminFallback}
    >
      {loading || !signed
        ? fallback || adminFallback
        : isAdmin
        ? children
        : accessDenied}
    </ProtectedRoute>
  );
};

/**
 * Componente para proteger rotas com redirecionamento para login
 */
export const LoginProtectedRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ProtectedRoute redirectTo="/login" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};
