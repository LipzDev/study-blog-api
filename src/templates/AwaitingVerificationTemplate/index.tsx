import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { authService } from "../../services/auth";
import { useToast } from "../../hooks/toast";
import {
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  PrimaryButton,
  AuthActionLink,
  StatusMessage,
} from "../../components/atoms";
import { Mail } from "lucide-react";

const AwaitingVerificationTemplate: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Pegar email da query string ou localStorage
    const emailFromQuery = router.query.email as string;
    const emailFromStorage = localStorage.getItem("pendingVerificationEmail");

    if (emailFromQuery) {
      setEmail(emailFromQuery);
      localStorage.setItem("pendingVerificationEmail", emailFromQuery);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // Se não há email, redirecionar para login
      router.push("/login");
    }
  }, [router]);

  const checkVerificationStatus = async () => {
    if (!email) return;

    setIsChecking(true);
    try {
      const response = await authService.checkVerificationStatus(email);

      if (response.verified) {
        addToast({
          type: "success",
          title: "Email verificado!",
          description:
            "Seu email foi verificado com sucesso. Você pode fazer login agora.",
        });

        // Limpar email do localStorage
        localStorage.removeItem("pendingVerificationEmail");

        // Redirecionar para login
        router.push("/login");
      } else {
        addToast({
          type: "info",
          title: "Email ainda não verificado",
          description:
            "Por favor, verifique sua caixa de entrada e clique no link de verificação.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erro ao verificar status",
        description: "Ocorreu um erro ao verificar o status do email.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await authService.resendVerification(email);
      addToast({
        type: "success",
        title: "Email reenviado!",
        description:
          "Um novo email de verificação foi enviado para sua caixa de entrada.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Erro ao reenviar email",
        description: "Ocorreu um erro ao reenviar o email de verificação.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  if (!email) {
    return null; // Ou um loading spinner
  }

  return (
    <>
      <Head>
        <title>Aguardando Verificação - Study Blog</title>
        <meta
          name="description"
          content="Verifique seu email para ativar sua conta"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <AuthCard>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <AuthTitle>Verifique seu email</AuthTitle>

          <AuthSubtitle>
            Enviamos um link de verificação para seu endereço de email.
            Verifique sua caixa de entrada e clique no link para verificar sua
            conta.
          </AuthSubtitle>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center mb-6 text-base font-semibold text-blue-800">
            {email}
          </div>

          <StatusMessage variant="info" className="mb-6">
            Email de verificação enviado com sucesso. Verifique sua caixa de
            entrada e pasta de spam.
          </StatusMessage>

          <div className="space-y-3">
            <PrimaryButton
              onClick={checkVerificationStatus}
              disabled={isChecking}
              fullWidth
              variant="primary"
              size="lg"
            >
              {isChecking ? "Verificando..." : "Já verifiquei meu email"}
            </PrimaryButton>

            <PrimaryButton
              onClick={resendVerificationEmail}
              disabled={isResending}
              fullWidth
              variant="secondary"
              size="lg"
            >
              {isResending ? "Enviando..." : "Reenviar email de verificação"}
            </PrimaryButton>
          </div>

          <div className="flex flex-col gap-2 text-center">
            <AuthActionLink onClick={goToLogin}>
              Voltar para entrar
            </AuthActionLink>
          </div>
        </AuthCard>
      </div>
    </>
  );
};

export default AwaitingVerificationTemplate;
