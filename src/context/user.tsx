/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect, useState } from "react";
import { useToast } from "../hooks/toast";
import { useRouter } from "next/router";
import { authService, User } from "../services/auth";
import { LoginFormData } from "../lib/validations/auth";

type UserProviderProps = {
  children?: React.ReactNode;
};

interface UserContextType {
  authLogin: (data: LoginFormData) => Promise<void>;
  signed: boolean;
  logout: () => void;
  user: User | null;
  loading: boolean;
  updateUser: (userData: User) => void;
}

export const UserContext = createContext({} as UserContextType);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const route = useRouter();

  const loadStoreAuth = () => {
    try {
      const savedUser = authService.getSavedUser();
      const token = authService.getToken();

      if (savedUser && token) {
        setUser(savedUser);
      }
    } catch (e) {
      console.error("Erro ao carregar dados de autenticação:", e);
      // Não fazer logout automático aqui para evitar loops
      sessionStorage.removeItem("@BlogAuth:token");
      sessionStorage.removeItem("@BlogAuth:user");
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStoreAuth();
  }, []);

  // Função para atualizar o usuário externamente (para uso no callback)
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  function logout() {
    authService.logout();
    setUser(null);
    route.push("/");
  }

  async function authLogin(data: LoginFormData) {
    try {
      const response = await authService.login(data);

      authService.saveAuthData(response);
      setUser(response.user);
      route.push("/");

      addToast({
        title: "Login realizado com sucesso!",
        type: "success",
        duration: 5000,
      });
    } catch (error: any) {
      addToast({
        title: error.response?.data?.message || "Login ou senha inválidos!",
        type: "error",
        duration: 5000,
      });
    }
  }

  return (
    <UserContext.Provider
      value={{ authLogin, signed: !!user, logout, user, loading, updateUser }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};
