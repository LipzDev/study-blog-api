/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import ButtonReturn from "../../components/atoms/ButtonReturn";
import Card from "../../components/molecules/Card";
import Layout from "../../components/molecules/Layout";
import { PrimaryButton } from "../../components/atoms";

import CreatePostModal from "../../components/molecules/CreatePostModal";
import EditPostModal from "../../components/molecules/EditPostModal";
import PostFilters from "../../components/molecules/PostFilters";
import ConfirmDeleteModal from "../../components/molecules/ConfirmDeleteModal";
import Pagination from "../../components/molecules/Pagination";
import { PostTypes } from "../../types/types";
import { useManagePosts } from "../../hooks/useManagePosts";
import { postsService, UpdatePostData } from "../../services/posts";
import { useToast } from "../../hooks/toast";
import { UserContext } from "../../context/user";
import { useAdmin } from "../../hooks/useAdmin";
import Link from "next/link";

const AdminTemplate = () => {
  const { posts, setPosts, addPost, removePost, refreshPage, isLoading } =
    useManagePosts();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<PostTypes | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostTypes | null>(null);

  // Estados dos filtros
  const [searchFilter, setSearchFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const ITEMS_PER_PAGE = 12;

  const router = useRouter();
  const { signed, user } = useContext(UserContext);
  const { addToast } = useToast();
  const { isAdmin } = useAdmin();

  // Redirecionamento removido - o contexto UserContext já cuida disso

  // Carrega os posts da API

  useEffect(() => {
    loadPosts();
  }, [refreshPage, searchFilter, startDateFilter, endDateFilter, currentPage]);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, startDateFilter, endDateFilter]);

  async function loadPosts() {
    try {
      // Se não for admin, filtrar apenas posts do usuário atual
      const authorIdFilter = !isAdmin && user?.id ? user.id : undefined;

      const response = await postsService.getPaginatedPosts(
        currentPage,
        ITEMS_PER_PAGE,
        searchFilter || undefined,
        startDateFilter || undefined,
        endDateFilter || undefined,
        authorIdFilter,
      );
      setPosts(response.posts);
      setTotalPosts(response.total);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  }

  // Verifica se o usuário pode editar/excluir um post
  function canUserManagePost(post: PostTypes): boolean {
    // Admin pode gerenciar qualquer post
    if (isAdmin) {
      return true;
    }

    // Usuário comum só pode gerenciar seus próprios posts
    const authorId =
      typeof post.author === "string" ? post.author : post.author?.id;
    return user?.id === authorId;
  }

  // Exclui a publicação
  function confirmDeletion(post: PostTypes) {
    if (!canUserManagePost(post)) {
      addToast({
        type: "error",
        title: "Acesso negado",
        description: "Você não tem permissão para excluir esta postagem",
      });
      return;
    }

    setPostToDelete(post);
    setDeleteModalIsOpen(true);
  }

  function handleDeleteConfirm() {
    if (postToDelete?.id) {
      removePost(postToDelete.id);
      setDeleteModalIsOpen(false);
      setPostToDelete(null);
    }
  }

  // Edita a publicação
  function handleClickToEditPost(post: PostTypes) {
    if (!canUserManagePost(post)) {
      addToast({
        type: "error",
        title: "Acesso negado",
        description: "Você não tem permissão para editar esta postagem",
      });
      return;
    }

    setPostToEdit(post);
    setEditModalIsOpen(true);
  }

  // Controla os modais
  function closeModal() {
    setModalIsOpen(false);
  }

  function openModal() {
    setModalIsOpen(true);
  }

  function closeEditModal() {
    setEditModalIsOpen(false);
    setPostToEdit(null);
  }

  function closeDeleteModal() {
    setDeleteModalIsOpen(false);
    setPostToDelete(null);
  }

  // Atualiza uma postagem
  async function handleUpdatePost(
    id: string,
    postData: UpdatePostData,
    imageFile?: File,
  ) {
    try {
      const finalPostData = { ...postData };

      // Se há uma nova imagem selecionada, faz upload primeiro
      if (imageFile) {
        const uploadResponse = await postsService.uploadImage(imageFile);
        finalPostData.image = `http://localhost:3001${uploadResponse.url}`;
        finalPostData.imagePath = uploadResponse.filename;
      }

      await postsService.updatePost(id, finalPostData);

      addToast({
        title: "Postagem editada com sucesso!",
        type: "success",
        duration: 5000,
      });

      // Recarrega os posts
      loadPosts();
    } catch (error) {
      addToast({
        title: "Erro ao editar postagem",
        type: "error",
        duration: 5000,
      });
    }
  }

  // Funções dos filtros
  const handleSearch = (search: string) => {
    setSearchFilter(search);
  };

  const handleDateFilter = (startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
  };

  const handleClearFilters = () => {
    setSearchFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);

  return (
    signed && (
      <Layout isLoggedIn={true}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ButtonReturn returnTo="/" />

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Olá seja bem vindo(a).
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <PrimaryButton onClick={openModal} variant="primary" size="lg">
                  Criar nova postagem
                </PrimaryButton>

                {/* Botão de Permissões - apenas para admins */}
                {isAdmin && (
                  <Link href="/admin/permissions">
                    <span className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 cursor-pointer">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.3-.72 4.396-1.96 6.24-3.622.469-.423.898-.87 1.282-1.344L21 9a12.02 12.02 0 00-.382-6.016z"
                        />
                      </svg>
                      Permissões de Usuário
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Filtros */}
            <PostFilters
              onSearch={handleSearch}
              onDateFilter={handleDateFilter}
              onClearFilters={handleClearFilters}
              searchValue={searchFilter}
              startDate={startDateFilter}
              endDate={endDateFilter}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post: PostTypes, index: number) => (
                <Card
                  id={post?.id}
                  slug={post?.slug}
                  key={index}
                  hasDate={true}
                  date={new Date(post?.date).getTime() / 1000}
                  author={post.author}
                  image={post?.image}
                  title={post?.title}
                  isAdmin={true}
                  exclude={() => confirmDeletion(post)}
                  edit={() => handleClickToEditPost(post)}
                >
                  {post.text}
                </Card>
              ))}
            </div>

            {/* Paginação */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalPosts}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        </div>

        <CreatePostModal
          isOpen={modalIsOpen}
          onClose={closeModal}
          onSubmit={addPost}
          isLoading={isLoading}
        />

        <EditPostModal
          isOpen={editModalIsOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdatePost}
          post={postToEdit}
          isLoading={isLoading}
        />

        <ConfirmDeleteModal
          isOpen={deleteModalIsOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title={`Excluir "${postToDelete?.title}"`}
          message="Você tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita."
          isLoading={isLoading}
        />
      </Layout>
    )
  );
};

export default AdminTemplate;
