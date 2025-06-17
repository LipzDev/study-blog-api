import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../../lib/validations/auth";
import { UserContext } from "../../context/user";
import { authService } from "../../services/auth";
import {
  AuthCard,
  AuthTitle,
  AuthSubtitle,
  PrimaryButton,
  GoogleButton,
  AuthActionLink,
  TermsText,
} from "../atoms";

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onForgotPassword,
  onRegister,
}) => {
  const { authLogin } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await authLogin(data);
  };

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  return (
    <AuthCard>
      <AuthTitle>Entrar</AuthTitle>
      <AuthSubtitle>Digite seu email e senha para entrar!</AuthSubtitle>

      <GoogleButton onClick={handleGoogleLogin} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">
            Ou continue com
          </span>
        </div>
      </div>

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

        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Sua senha
          </label>
          <input
            type="password"
            placeholder="Sua senha"
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

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          fullWidth
          variant="primary"
          size="lg"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </PrimaryButton>
      </form>

      <div className="flex flex-col gap-2 text-center">
        <AuthActionLink type="button" onClick={onForgotPassword}>
          Esqueceu sua senha?
        </AuthActionLink>
        <AuthActionLink type="button" onClick={onRegister}>
          Não tem uma conta? Cadastre-se
        </AuthActionLink>
      </div>

      <TermsText>
        Ao criar uma conta ou continuar fazendo login, você concorda com nossos{" "}
        <a href="/terms">Termos de Serviço</a> e{" "}
        <a href="/privacy">Política de Privacidade</a>.
      </TermsText>
    </AuthCard>
  );
};
