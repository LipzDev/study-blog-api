import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "../../hooks/toast";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "../../lib/validations/auth";
import { authService } from "../../services/auth";
import {
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  PrimaryButton,
  AuthActionLink,
  AuthSuccessMessage,
} from "../atoms";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data);
      setIsSuccess(true);

      addToast({
        title: "Email enviado!",
        description:
          "Verifique sua caixa de entrada para o link de redefinição de senha.",
        type: "success",
        duration: 5000,
      });
    } catch (error) {
      addToast({
        title: "Falha ao enviar email",
        description:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "Falha ao enviar email de redefinição de senha. Tente novamente.",
        type: "error",
        duration: 5000,
      });
    }
  };

  if (isSuccess) {
    return (
      <AuthCard>
        <AuthSuccessMessage
          title="Verifique seu email"
          description="Enviamos um link de redefinição de senha para seu endereço de email. Verifique sua caixa de entrada e siga as instruções."
        />

        <div className="flex flex-col gap-2 text-center mt-6">
          <AuthActionLink type="button" onClick={onBackToLogin}>
            Voltar para entrar
          </AuthActionLink>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthTitle>Esqueci minha senha</AuthTitle>
      <AuthSubtitle>
        Digite seu endereço de email e enviaremos um link para redefinir sua
        senha.
      </AuthSubtitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Endereço de email
          </label>
          <input
            type="email"
            placeholder="Seu endereço de email"
            className={`w-full px-4 py-3 text-base border-2 rounded-xl min-h-12 font-inherit transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <span className="block text-sm text-red-500 mt-1">
              {errors.email.message}
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
          {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
        </PrimaryButton>
      </form>

      <div className="flex flex-col gap-2 text-center">
        <AuthActionLink type="button" onClick={onBackToLogin}>
          Voltar para entrar
        </AuthActionLink>
      </div>
    </AuthCard>
  );
};
