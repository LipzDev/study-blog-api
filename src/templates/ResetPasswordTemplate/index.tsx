import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle } from "lucide-react";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "../../lib/validations/auth";
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

const ResetPasswordTemplate: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const { token } = router.query;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (token && typeof token === "string") {
      setValue("token", token);
    } else if (router.isReady && !token) {
      setTokenError(true);
    }
  }, [token, router.isReady, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await authService.resetPassword(data);
      setIsSuccess(true);

      addToast({
        title: "Senha redefinida com sucesso!",
        description:
          "Sua senha foi atualizada. Agora você pode entrar com sua nova senha.",
        type: "success",
        duration: 5000,
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      addToast({
        title: "Falha ao redefinir senha",
        description: "Falha ao redefinir senha. Tente novamente.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  if (tokenError) {
    return (
      <>
        <Head>
          <title>Erro - Redefinir Senha</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
          <AuthCard>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <AuthTitle>Link de redefinição inválido</AuthTitle>
            <AuthSubtitle>
              O link de redefinição de senha é inválido ou expirou.
            </AuthSubtitle>

            <StatusMessage variant="error">
              Solicite um novo link de redefinição de senha na página de login.
            </StatusMessage>

            <div className="flex flex-col gap-2 text-center">
              <AuthActionLink onClick={goToLogin}>
                Voltar para entrar
              </AuthActionLink>
            </div>
          </AuthCard>
        </div>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <Head>
          <title>Senha Redefinida - Study Blog</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
          <AuthCard>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <AuthTitle>Senha redefinida com sucesso!</AuthTitle>
            <AuthSubtitle>
              Sua senha foi atualizada. Agora você pode entrar com sua nova
              senha.
            </AuthSubtitle>

            <StatusMessage variant="success">
              Você será redirecionado para a página de login em alguns
              instantes...
            </StatusMessage>

            <div className="flex flex-col gap-2 text-center">
              <AuthActionLink onClick={goToLogin}>
                Ir para login agora
              </AuthActionLink>
            </div>
          </AuthCard>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Redefinir Senha - Study Blog</title>
        <meta name="description" content="Redefina sua senha do Study Blog" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
        <AuthCard>
          <AuthTitle>Redefinir senha</AuthTitle>
          <AuthSubtitle>Digite sua nova senha abaixo.</AuthSubtitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("token")} />

            {/* Password Field */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Nova senha
              </label>
              <input
                type="password"
                placeholder="Nova senha"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl min-h-12 font-inherit transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
                {...register("password")}
              />
              {errors.password && (
                <span className="block text-sm text-red-500 mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Confirmar nova senha
              </label>
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl min-h-12 font-inherit transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <span className="block text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              fullWidth
              variant="primary"
              size="lg"
            >
              {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
            </PrimaryButton>
          </form>

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

export default ResetPasswordTemplate;
