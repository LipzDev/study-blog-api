import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { authService } from "../../services/auth";
import { useToast } from "../../hooks/toast";
import {
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  StatusMessage,
  PrimaryButton,
} from "../../components/atoms";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error" | "invalid";

const VerifyEmailTemplate: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [hasVerified, setHasVerified] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { token } = router.query;

  // Memoizar addToast para evitar re-execuções do useEffect
  const showToast = useCallback(
    (title: string, description: string, type: "success" | "error") => {
      addToast({ title, description, type, duration: 5000 });
    },
    [addToast],
  );

  useEffect(() => {
    const verifyEmail = async (verificationToken: string) => {
      if (hasVerified) return; // Evita múltiplas execuções

      setHasVerified(true);

      try {
        await authService.verifyEmail(verificationToken);
        setStatus("success");
        setMessage(
          "Email verificado com sucesso! Agora você pode entrar em sua conta.",
        );

        showToast(
          "Email verificado!",
          "Seu email foi verificado com sucesso.",
          "success",
        );

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
            "Erro ao verificar email. O token de verificação pode ter expirado.",
        );

        showToast(
          "Falha na verificação",
          "Houve um erro ao verificar seu endereço de email.",
          "error",
        );
      }
    };

    if (router.isReady && !hasVerified) {
      if (!token || typeof token !== "string") {
        setStatus("invalid");
        setMessage("Token de verificação inválido ou ausente.");
        setHasVerified(true);
        return;
      }

      verifyEmail(token);
    }
  }, [router.isReady, token, hasVerified, router, showToast]);

  const goToLogin = () => {
    router.push("/login");
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
            <AuthTitle>Verificando email...</AuthTitle>
            <AuthSubtitle>
              Aguarde enquanto verificamos seu endereço de email.
            </AuthSubtitle>
          </>
        );

      case "success":
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <AuthTitle>Email verificado!</AuthTitle>
            <AuthSubtitle>{message}</AuthSubtitle>
            <StatusMessage variant="success">
              Seu email foi verificado com sucesso. Agora você pode entrar em
              sua conta.
            </StatusMessage>
            <div className="text-center mb-4 text-sm text-gray-500">
              Você será redirecionado para a página de login em alguns
              instantes...
            </div>
            <PrimaryButton
              onClick={goToLogin}
              fullWidth
              variant="primary"
              size="lg"
            >
              Ir para login agora
            </PrimaryButton>
          </>
        );

      case "error":
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <AuthTitle>Falha na verificação</AuthTitle>
            <AuthSubtitle>{message}</AuthSubtitle>
            <StatusMessage variant="error">
              Houve um erro ao verificar seu email. O link de verificação pode
              ter expirado ou ser inválido.
            </StatusMessage>
            <PrimaryButton
              onClick={goToLogin}
              fullWidth
              variant="primary"
              size="lg"
            >
              Voltar para entrar
            </PrimaryButton>
          </>
        );

      case "invalid":
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <AuthTitle>Link inválido</AuthTitle>
            <AuthSubtitle>{message}</AuthSubtitle>
            <StatusMessage variant="error">
              O link de verificação é inválido ou está ausente. Verifique seu
              email para o link correto.
            </StatusMessage>
            <PrimaryButton
              onClick={goToLogin}
              fullWidth
              variant="primary"
              size="lg"
            >
              Voltar para entrar
            </PrimaryButton>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email - Study Blog</title>
        <meta name="description" content="Verificação de email do Study Blog" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <AuthCard>{renderContent()}</AuthCard>
      </div>
    </>
  );
};

export default VerifyEmailTemplate;
