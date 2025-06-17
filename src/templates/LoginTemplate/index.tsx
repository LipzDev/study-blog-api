import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { UserContext } from "../../context/user";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";

type AuthView = "login" | "register" | "forgot-password";

const LoginTemplate: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const { signed, loading } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && signed) {
      router.push("/");
    }
  }, [signed, loading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-neutral-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl text-neutral-600">Carregando...</h2>
        </div>
      </div>
    );
  }

  // Se já estiver logado, não mostrar a página
  if (signed) {
    return null;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "login":
        return (
          <LoginForm
            onForgotPassword={() => setCurrentView("forgot-password")}
            onRegister={() => setCurrentView("register")}
          />
        );
      case "register":
        return <RegisterForm onLogin={() => setCurrentView("login")} />;
      case "forgot-password":
        return (
          <ForgotPasswordForm onBackToLogin={() => setCurrentView("login")} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Login - Study Blog</title>
        <meta
          name="description"
          content="Faça login ou crie sua conta no Study Blog"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{renderCurrentView()}</div>
      </div>
    </>
  );
};

export default LoginTemplate;
