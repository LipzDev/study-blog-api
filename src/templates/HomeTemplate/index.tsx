/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Card from "../../components/molecules/Card";
import Layout from "../../components/molecules/Layout";
import { PostTypes } from "../../types/types";
import { postsService } from "src/services/posts";
import Link from "next/link";
import { useAdminOnly } from "../../hooks/useAdmin";
import {
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Calendar,
  Search,
  Sparkles,
  ChevronRight,
  Eye,
} from "lucide-react";

const HomeTemplate = () => {
  const [recentPosts, setRecentPosts] = useState<PostTypes[]>([]);
  const [featuredPost, setFeaturedPost] = useState<PostTypes | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalAuthors: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const { shouldShow: showAdminButtons } = useAdminOnly();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await postsService.getPaginatedPosts(1, 6);
        setRecentPosts(response.posts);
        setFeaturedPost(response.posts[0] || null);

        // Simular estatísticas (você pode implementar endpoints reais)
        setStats({
          totalPosts: response.total,
          totalAuthors: Math.ceil(response.total / 3), // Estimativa
          totalViews: response.total * 150, // Estimativa
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Hero Skeleton */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <div className="h-12 bg-white/20 rounded-lg mb-6 animate-pulse"></div>
                <div className="h-6 bg-white/20 rounded-lg mb-8 max-w-2xl mx-auto animate-pulse"></div>
                <div className="h-12 bg-white/20 rounded-lg max-w-xs mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center text-white">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                  <Sparkles className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Bem-vindo ao nosso
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Blog
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Descubra conteúdos incríveis, histórias inspiradoras e
                conhecimento que transforma. Junte-se à nossa comunidade de
                leitores apaixonados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/blog">
                  <span className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg">
                    <BookOpen className="w-5 h-5" />
                    Explorar Posts
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
                {showAdminButtons && (
                  <Link href="/admin">
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30">
                      <Users className="w-5 h-5" />
                      Área Admin
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalPosts}
              </h3>
              <p className="text-gray-600 font-medium">Posts Publicados</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalAuthors}
              </h3>
              <p className="text-gray-600 font-medium">Autores Ativos</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalViews.toLocaleString()}
              </h3>
              <p className="text-gray-600 font-medium">Visualizações</p>
            </div>
          </div>
        </div>

        {/* Featured Post Section */}
        {featuredPost && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Post em Destaque
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Leitura Recomendada
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Não perca nosso conteúdo mais popular desta semana
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              {featuredPost.image && (
                <div className="aspect-video lg:aspect-[21/9] overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}

              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {typeof featuredPost.author === "string"
                      ? featuredPost.author
                      : featuredPost.author?.name || "Autor"}
                  </div>
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {featuredPost.title}
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed mb-8 line-clamp-3">
                  {featuredPost.text.substring(0, 200)}...
                </p>

                <Link href={`/post/${featuredPost.slug}`}>
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg">
                    Ler Artigo Completo
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Posts Recentes
              </h2>
              <p className="text-xl text-gray-600">
                Fique por dentro das últimas publicações
              </p>
            </div>
            <Link href="/blog">
              <span className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Ver Todos
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
          </div>

          {recentPosts.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.slice(1, 6).map((post: PostTypes, index: number) => (
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
                    {post.text}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                Parece que ainda não temos conteúdo publicado. Volte em breve!
              </p>
              {showAdminButtons && (
                <Link href="/admin">
                  <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    <Users className="w-5 h-5" />
                    Acessar Admin
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Link href="/blog">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg sm:hidden">
                Ver Todos os Posts
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Explore Mais Conteúdo
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Descubra artigos, tutoriais e insights que vão transformar sua
                perspectiva. Nossa biblioteca está sempre crescendo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/blog">
                  <span className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg">
                    <BookOpen className="w-5 h-5" />
                    Navegar no Blog
                  </span>
                </Link>
                {showAdminButtons && (
                  <Link href="/admin">
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30">
                      <TrendingUp className="w-5 h-5" />
                      Painel Admin
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomeTemplate;
