import React, { useEffect, useContext, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { UserContext } from "../../context/user";
import { authService } from "../../services/auth";
import { useToast } from "../../hooks/toast";
import { Loader2 } from "lucide-react";

const AuthCallbackTemplate: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const { updateUser } = useContext(UserContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);
  const { token, error } = router.query;

  useEffect(() => {
    // Prevent multiple executions
    if (!router.isReady || hasProcessed.current || isProcessing) {
      return;
    }

    const processAuth = async () => {
      setIsProcessing(true);
      hasProcessed.current = true;

      try {
        if (error) {
          addToast({
            title: "Falha na autenticação do Google",
            description: "Houve um erro durante a autenticação do Google.",
            type: "error",
            duration: 5000,
          });
          router.replace("/login");
          return;
        }

        if (token && typeof token === "string") {
          try {
            // Salvar o token temporariamente para fazer a requisição
            sessionStorage.setItem("@BlogAuth:token", token);

            // Buscar dados do usuário usando o token
            const user = await authService.getProfile();

            const authResponse = {
              user,
              access_token: token,
            };

            authService.saveAuthData(authResponse);
            updateUser(user);

            addToast({
              title: "Login com Google realizado com sucesso!",
              description: `Bem-vindo, ${user.name}! Você foi conectado com sucesso.`,
              type: "success",
              duration: 5000,
            });

            // Use replace to prevent going back to this page
            router.replace("/");
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);

            // Se falhar ao buscar o perfil, limpar dados e redirecionar
            sessionStorage.removeItem("@BlogAuth:token");
            sessionStorage.removeItem("@BlogAuth:user");

            addToast({
              title: "Falha na autenticação",
              description:
                "Falha ao recuperar perfil do usuário. Tente novamente.",
              type: "error",
              duration: 5000,
            });

            router.replace("/login");
          }
        } else {
          // If no token, redirect to login
          router.replace("/login");
        }
      } catch (err) {
        console.error("Authentication callback error:", err);
        addToast({
          title: "Falha no processamento da autenticação",
          description: "Houve um erro ao processar sua autenticação.",
          type: "error",
          duration: 5000,
        });
        router.replace("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [
    router.isReady,
    token,
    error,
    addToast,
    router,
    updateUser,
    isProcessing,
  ]);

  return (
    <>
      <Head>
        <title>Autenticando... - Study Blog</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
              Processando autenticação...
            </h1>
            <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
              Aguarde enquanto completamos seu processo de login.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthCallbackTemplate;
