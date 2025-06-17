import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { UserContext } from "../context/user";

interface UseAuthGuardOptions {
  redirectTo?: string;
  redirectToPrevious?: boolean;
}

/**
 * Hook para proteger rotas que requerem autenticação
 *
 * @param options - Opções de configuração
 * @param options.redirectTo - URL específica para redirecionamento (padrão: '/login')
 * @param options.redirectToPrevious - Se deve redirecionar para a rota anterior (padrão: false)
 *
 * @returns objeto com informações de autenticação e loading
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { redirectTo = "/login", redirectToPrevious = false } = options;

  const { signed, loading, user } = useContext(UserContext);
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Não fazer nada se ainda estiver carregando ou já redirecionou
    if (loading || hasRedirected.current) {
      return;
    }

    // Se não estiver logado, redirecionar
    if (!signed) {
      hasRedirected.current = true;

      if (redirectToPrevious) {
        // Estratégias para obter rota anterior (em ordem de prioridade)

        // 1. Tenta usar sessionStorage se disponível
        const storedPreviousRoute =
          typeof window !== "undefined"
            ? sessionStorage.getItem("previousRoute")
            : null;

        // 2. Tenta usar document.referrer
        const referrerRoute =
          typeof window !== "undefined" ? document.referrer : "";

        const currentOrigin =
          typeof window !== "undefined" ? window.location.origin : "";

        let targetRoute = "/";

        // Verifica rota armazenada primeiro
        if (
          storedPreviousRoute &&
          storedPreviousRoute !== "/admin" &&
          !storedPreviousRoute.includes("/login") &&
          !storedPreviousRoute.includes("/register") &&
          !storedPreviousRoute.includes("/auth")
        ) {
          targetRoute = storedPreviousRoute;
        }
        // Senão, verifica referrer
        else if (
          referrerRoute &&
          referrerRoute.startsWith(currentOrigin) &&
          !referrerRoute.includes("/login") &&
          !referrerRoute.includes("/register") &&
          !referrerRoute.includes("/auth") &&
          !referrerRoute.includes("/admin")
        ) {
          const referrerPath = referrerRoute.replace(currentOrigin, "");
          if (referrerPath && referrerPath !== "/") {
            targetRoute = referrerPath;
          }
        }

        console.log(
          `🔒 Usuário não autenticado, redirecionando para: ${targetRoute}`,
        );
        router.replace(targetRoute);
      } else {
        // Redireciona para a rota especificada
        console.log(
          `🔒 Usuário não autenticado, redirecionando para: ${redirectTo}`,
        );
        router.replace(redirectTo);
      }
    }
  }, [signed, loading, router, redirectTo, redirectToPrevious]);

  // Armazena a rota atual como rota anterior quando o componente é montado
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      router.asPath &&
      router.asPath !== "/admin"
    ) {
      sessionStorage.setItem("previousRoute", router.asPath);
    }
  }, [router.asPath]);

  return {
    isAuthenticated: signed,
    user,
    loading,
    isRedirecting: !loading && !signed,
  };
};

/**
 * Hook específico para proteção de rotas administrativas
 * Redireciona para a rota anterior se não estiver logado
 */
export const useAdminGuard = () => {
  return useAuthGuard({
    redirectToPrevious: true,
  });
};

/**
 * Hook para proteção de rotas com redirecionamento para login
 */
export const useLoginGuard = () => {
  return useAuthGuard({
    redirectTo: "/login",
  });
};
