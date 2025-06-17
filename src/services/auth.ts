import api from "./api";
import {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "../lib/validations/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  provider: "local" | "google";
  role: "user" | "admin";
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export const authService = {
  // Registro de usuário
  async register(
    data: Omit<RegisterFormData, "confirmPassword">,
  ): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Login com email e senha
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Esqueci minha senha
  async forgotPassword(
    data: ForgotPasswordFormData,
  ): Promise<{ message: string }> {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  // Reset de senha
  async resetPassword(
    data: ResetPasswordFormData,
  ): Promise<{ message: string }> {
    const response = await api.post("/auth/reset-password", {
      token: data.token,
      password: data.password,
    });
    return response.data;
  },

  // Verificar email
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // Obter perfil do usuário
  async getProfile(): Promise<User> {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Login com Google (redireciona para o backend)
  loginWithGoogle(): void {
    window.location.href = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    }/auth/google`;
  },

  // Logout
  logout(): void {
    sessionStorage.removeItem("@BlogAuth:token");
    sessionStorage.removeItem("@BlogAuth:user");
    // Não redirecionar automaticamente - deixar o componente decidir
  },

  // Salvar dados de autenticação
  saveAuthData(authResponse: AuthResponse): void {
    sessionStorage.setItem("@BlogAuth:token", authResponse.access_token);
    sessionStorage.setItem("@BlogAuth:user", JSON.stringify(authResponse.user));
  },

  // Obter token salvo
  getToken(): string | null {
    return sessionStorage.getItem("@BlogAuth:token");
  },

  // Obter usuário salvo
  getSavedUser(): User | null {
    const userStr = sessionStorage.getItem("@BlogAuth:user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getSavedUser();
  },

  // Verificar status de verificação de email
  async checkVerificationStatus(
    email: string,
  ): Promise<{ verified: boolean; message: string }> {
    const response = await api.post("/auth/check-verification-status", {
      email,
    });
    return response.data;
  },

  // Reenviar email de verificação
  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  // Obter dados de autenticação salvos (para compatibilidade com testes)
  getStoredAuthData(): { token: string | null; user: User | null } {
    return {
      token: this.getToken(),
      user: this.getSavedUser(),
    };
  },
};
