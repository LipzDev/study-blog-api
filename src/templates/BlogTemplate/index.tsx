/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { PostTypes } from "../../types/types";
import ButtonReturn from "../../components/atoms/ButtonReturn";
import Card from "../../components/molecules/Card";
import Layout from "../../components/molecules/Layout";
import { postsService } from "../../services/posts";
import PostFilters from "../../components/molecules/PostFilters";
import Pagination from "../../components/molecules/Pagination";
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
} from "lucide-react";

const LIMIT = 12;

const BlogTemplate = () => {
  const [posts, setPosts] = useState<PostTypes[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Estados dos filtros
  const [searchFilter, setSearchFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage, searchFilter, startDateFilter, endDateFilter]);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, startDateFilter, endDateFilter]);

  async function loadPosts(page: number) {
    try {
      setLoading(true);
      const response = await postsService.getPaginatedPosts(
        page,
        LIMIT,
        searchFilter || undefined,
        startDateFilter || undefined,
        endDateFilter || undefined,
      );

      setPosts(response.posts);
      setTotalPosts(response.total);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalPosts / LIMIT);

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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <ButtonReturn
                returnTo="/"
                text="Voltar ao Início"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors py-2 px-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
              />
            </div>

            <div className="text-center text-white mt-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                  <BookOpen className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Nosso Blog
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Explore nossa coleção de artigos, tutoriais e insights. Encontre
                exatamente o que você está procurando.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filtros e Controles */}
          <div className="mb-8">
            <PostFilters
              onSearch={handleSearch}
              onDateFilter={handleDateFilter}
              onClearFilters={handleClearFilters}
              searchValue={searchFilter}
              startDate={startDateFilter}
              endDate={endDateFilter}
            />
          </div>

          {/* Header com Estatísticas e View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">
                  {totalPosts}{" "}
                  {totalPosts === 1 ? "post encontrado" : "posts encontrados"}
                </span>
              </div>
              {(searchFilter || startDateFilter || endDateFilter) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros ativos</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="Visualização em grade"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="Visualização em lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="aspect-video bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Posts Grid/List */}
          {!loading && posts.length > 0 && (
            <div
              className={`mb-12 ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }`}
            >
              {posts.map((post: PostTypes, index: number) => (
                <div key={post.id || index} className="group">
                  <Card
                    id={post?.id}
                    slug={post?.slug}
                    hasDate={true}
                    date={new Date(post?.date).getTime() / 1000}
                    author={post?.author}
                    image={post?.image}
                    title={post?.title}
                  >
                    {post?.text}
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {searchFilter || startDateFilter || endDateFilter
                  ? "Tente ajustar seus filtros ou limpar a busca para ver mais resultados."
                  : "Parece que ainda não temos conteúdo publicado. Volte em breve!"}
              </p>
              {(searchFilter || startDateFilter || endDateFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Limpar Filtros
                </button>
              )}
            </div>
          )}

          {/* Paginação */}
          {!loading && posts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalPosts}
              itemsPerPage={LIMIT}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BlogTemplate;
