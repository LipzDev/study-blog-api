import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "../../lib/validations/auth";
import { authService } from "../../services/auth";
import { useToast } from "../../hooks/toast";
import { useRouter } from "next/router";
import {
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  PrimaryButton,
  AuthActionLink,
  TermsText,
  GoogleButton,
} from "../atoms";

interface RegisterFormProps {
  onLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onLogin }) => {
  const { addToast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      addToast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para ativar sua conta.",
        type: "success",
        duration: 5000,
      });

      // Redirecionar para página de aguardando verificação
      router.push(
        `/awaiting-verification?email=${encodeURIComponent(data.email)}`,
      );
    } catch (error) {
      addToast({
        title: "Falha no cadastro",
        description:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Falha ao criar conta. Tente novamente.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  return (
    <AuthCard>
      <AuthTitle>Criar Conta</AuthTitle>
      <AuthSubtitle>
        Junte-se a nós hoje! Crie sua conta para começar.
      </AuthSubtitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name Field */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Nome completo
          </label>
          <input
            type="text"
            placeholder="Seu nome completo"
            className={`w-full px-4 py-3 text-base border-2 rounded-xl min-h-12 font-inherit transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
              errors.name
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
            }`}
            {...register("name")}
          />
          {errors.name && (
            <span className="block text-sm text-red-500 mt-1">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Senha
          </label>
          <input
            type="password"
            placeholder="Crie uma senha"
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
            Confirmar senha
          </label>
          <input
            type="password"
            placeholder="Confirme sua senha"
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
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </PrimaryButton>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">
            Ou cadastre-se com
          </span>
        </div>
      </div>

      <GoogleButton onClick={handleGoogleLogin} />

      <div className="flex flex-col gap-2 text-center mt-6">
        <AuthActionLink type="button" onClick={onLogin}>
          Já tem uma conta? Entre
        </AuthActionLink>
      </div>

      <TermsText>
        Ao criar uma conta, você concorda com nossos{" "}
        <a href="/terms">Termos de Serviço</a> e{" "}
        <a href="/privacy">Política de Privacidade</a>.
      </TermsText>
    </AuthCard>
  );
};
