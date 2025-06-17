import { api } from "./api";

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  provider: "local" | "google";
  avatar?: string;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoteUserResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const usersService = {
  /**
   * Lista todos os usuários
   * Apenas admins podem usar esta funcionalidade
   */
  async getAllUsers(): Promise<UserSearchResult[]> {
    const response = await api.get("/users");
    return response.data;
  },

  /**
   * Busca um usuário pelo email
   * Apenas admins podem usar esta funcionalidade
   */
  async searchUserByEmail(email: string): Promise<UserSearchResult> {
    const response = await api.get(
      `/users/search?email=${encodeURIComponent(email)}`,
    );
    return response.data;
  },

  /**
   * Promove um usuário ao cargo de administrador
   * Apenas admins podem usar esta funcionalidade
   */
  async promoteToAdmin(userId: string): Promise<PromoteUserResponse> {
    const response = await api.patch(`/users/${userId}/promote-admin`);
    return response.data;
  },

  /**
   * Remove o cargo de administrador de um usuário
   * Apenas super admins podem usar esta funcionalidade
   */
  async revokeAdmin(userId: string): Promise<PromoteUserResponse> {
    const response = await api.patch(`/users/${userId}/revoke-admin`);
    return response.data;
  },
};
