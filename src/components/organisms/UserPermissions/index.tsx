import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  AlertCircle,
  Users,
  RefreshCw,
  Crown,
  UserMinus,
} from "lucide-react";
import { usersService, UserSearchResult } from "../../../services/users";
import { useToast } from "../../../hooks/toast";
import { useAdmin } from "../../../hooks/useAdmin";

const UserPermissions: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Estados para a tabela de usuários
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");

  const { addToast } = useToast();
  const { isAdmin, isSuperAdmin } = useAdmin();

  // Carregar lista de usuários quando o componente montar
  useEffect(() => {
    if (isAdmin) {
      loadAllUsers();
    }
  }, [isAdmin]);

  // Função para carregar todos os usuários
  const loadAllUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError("");

    try {
      const users = await usersService.getAllUsers();
      setAllUsers(users);
    } catch (error: any) {
      console.error("❌ Erro ao carregar usuários:", error);
      if (error.response?.status === 401) {
        setUsersError("Você precisa estar logado como administrador");
      } else if (error.response?.status === 403) {
        setUsersError("Você não tem permissão para listar usuários");
      } else {
        setUsersError("Erro ao carregar usuários. Tente novamente.");
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Verificação de segurança - só admins podem acessar
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Apenas administradores podem acessar esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchError("Por favor, digite um email para buscar");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(searchEmail.trim())) {
      setSearchError("Por favor, digite um email válido");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      console.log("🔍 Buscando usuário:", searchEmail.trim());
      const result = await usersService.searchUserByEmail(searchEmail.trim());
      console.log("✅ Usuário encontrado:", result);
      setSearchResult(result);
    } catch (error: any) {
      console.error("❌ Erro na busca:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);

      if (error.response?.status === 404) {
        setSearchError("Usuário não encontrado com este email");
      } else if (error.response?.status === 403) {
        setSearchError("Você não tem permissão para buscar usuários");
      } else if (error.response?.status === 401) {
        setSearchError("Você precisa estar logado como administrador");
      } else {
        setSearchError(
          `Erro ao buscar usuário: ${
            error.response?.data?.message || error.message
          }`,
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromoteToAdmin = async (user?: UserSearchResult) => {
    const targetUser = user || searchResult;
    if (!targetUser) return;

    if (!isSuperAdmin) {
      addToast({
        type: "error",
        title: "Acesso negado",
        description: "Apenas super administradores podem promover usuários",
      });
      return;
    }

    setIsPromoting(true);

    try {
      await usersService.promoteToAdmin(targetUser.id);

      // Atualizar o resultado da busca se for o mesmo usuário
      if (searchResult && searchResult.id === targetUser.id) {
        setSearchResult({
          ...searchResult,
          role: "admin",
        });
      }

      // Atualizar a lista de usuários
      setAllUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === targetUser.id ? { ...u, role: "admin" } : u,
        ),
      );

      addToast({
        type: "success",
        title: "Usuário promovido!",
        description: `${targetUser.name} agora é administrador`,
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        addToast({
          type: "error",
          title: "Erro",
          description: "Usuário já é administrador",
        });
      } else if (error.response?.status === 403) {
        addToast({
          type: "error",
          title: "Acesso negado",
          description: "Você não tem permissão para promover usuários",
        });
      } else {
        addToast({
          type: "error",
          title: "Erro",
          description: "Erro ao promover usuário. Tente novamente.",
        });
      }
    } finally {
      setIsPromoting(false);
    }
  };

  const handleRevokeAdmin = async (user: UserSearchResult) => {
    if (!isSuperAdmin) {
      addToast({
        type: "error",
        title: "Acesso negado",
        description: "Apenas super administradores podem revogar privilégios",
      });
      return;
    }

    setIsPromoting(true);

    try {
      await usersService.revokeAdmin(user.id);

      // Atualizar o resultado da busca se for o mesmo usuário
      if (searchResult && searchResult.id === user.id) {
        setSearchResult({
          ...searchResult,
          role: "user",
        });
      }

      // Atualizar a lista de usuários
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...u, role: "user" } : u)),
      );

      addToast({
        type: "success",
        title: "Privilégios revogados!",
        description: `${user.name} não é mais administrador`,
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        addToast({
          type: "error",
          title: "Acesso negado",
          description: "Apenas super administradores podem revogar privilégios",
        });
      } else if (error.response?.status === 400) {
        addToast({
          type: "error",
          title: "Erro",
          description:
            "Não é possível revogar privilégios de super administrador",
        });
      } else {
        addToast({
          type: "error",
          title: "Erro",
          description: "Erro ao revogar privilégios. Tente novamente.",
        });
      }
    } finally {
      setIsPromoting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Permissões de Usuário
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Busque e gerencie permissões de usuários
                  </p>
                </div>
              </div>

              {/* Super Admin Badge */}
              {isSuperAdmin && (
                <div className="bg-purple-500 bg-opacity-20 border border-purple-300 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-white">
                    <Crown className="w-5 h-5 text-yellow-300" />
                    <div>
                      <p className="font-semibold text-sm">
                        Super Administrador
                      </p>
                      <p className="text-xs text-purple-100">
                        Acesso total ao sistema
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Super Admin Warning */}
          {isSuperAdmin && (
            <div className="mx-6 mt-6 mb-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">
                    Você é Super Administrador
                  </h3>
                  <p className="text-purple-700 text-sm mb-2">
                    Como super admin, você tem controle total sobre permissões.
                    Apenas você pode promover usuários a admin e revogar
                    privilégios. Admins comuns não podem gerenciar outros
                    admins.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-600">
                    <Shield className="w-3 h-3" />
                    <span>
                      Privilégios exclusivos: Promover a Admin • Revogar Admin •
                      Controle total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Table Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Lista de Usuários
                </h2>
              </div>
              <button
                onClick={loadAllUsers}
                disabled={isLoadingUsers}
                className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                {isLoadingUsers ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                  </>
                )}
              </button>
            </div>

            {usersError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {usersError}
                </p>
              </div>
            )}

            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando usuários...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 w-48">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 w-64">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 w-48">
                        Cargo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 w-32">
                        Provedor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 w-44">
                        Membro desde
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 w-40">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 w-48">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 truncate">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 w-64">
                          <span className="text-gray-600 truncate block">
                            {user.email}
                          </span>
                        </td>
                        <td className="py-3 px-4 w-48">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                user.role === "admin"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role === "admin" ? (
                                <ShieldCheck className="w-3 h-3" />
                              ) : (
                                <User className="w-3 h-3" />
                              )}
                              {user.role === "admin" ? "Admin" : "Usuário"}
                            </span>
                            {user.isSuperAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                                <Crown className="w-3 h-3" />
                                Super Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 w-32">
                          <span className="text-gray-600 text-sm">
                            {user.provider === "local"
                              ? "Email"
                              : user.provider}
                          </span>
                        </td>
                        <td className="py-3 px-4 w-44">
                          <span className="text-gray-600 text-sm whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4 w-40">
                          <div className="flex flex-col gap-1">
                            {user.role !== "admin" ? (
                              // Apenas super admin pode promover usuários
                              isSuperAdmin ? (
                                <button
                                  onClick={() => handlePromoteToAdmin(user)}
                                  disabled={isPromoting}
                                  className="inline-flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 w-fit"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  Promover
                                </button>
                              ) : (
                                <span className="text-gray-500 text-xs">
                                  Usuário
                                </span>
                              )
                            ) : user.isSuperAdmin ? (
                              <span className="text-purple-600 text-xs font-medium">
                                Super Admin
                              </span>
                            ) : (
                              <>
                                <span className="text-green-600 text-xs font-medium">
                                  Admin
                                </span>
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => handleRevokeAdmin(user)}
                                    disabled={isPromoting}
                                    className="inline-flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 w-fit"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                    Revogar
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {allUsers.length === 0 && !isLoadingUsers && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum usuário encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email do usuário
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite o email do usuário..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isSearching}
                  />
                </div>
                {searchError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {searchError}
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {searchResult && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resultado da busca
              </h2>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {searchResult.name}
                      </h3>
                      <p className="text-gray-600">{searchResult.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            searchResult.role === "admin"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {searchResult.role === "admin" ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          {searchResult.role === "admin"
                            ? "Administrador"
                            : "Usuário"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            searchResult.emailVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {searchResult.emailVerified
                            ? "Email verificado"
                            : "Email não verificado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promote Button - apenas para super admin */}
                  {searchResult.role !== "admin" && isSuperAdmin && (
                    <button
                      onClick={() => handlePromoteToAdmin()}
                      disabled={isPromoting}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPromoting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Promovendo...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Promover a Admin
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Provedor de login</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {searchResult.provider === "local"
                        ? "Email/Senha"
                        : searchResult.provider}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Membro desde</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(searchResult.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPermissions;
