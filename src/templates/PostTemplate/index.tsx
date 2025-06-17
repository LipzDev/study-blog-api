/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Layout from "../../components/molecules/Layout";
import ButtonReturn from "../../components/atoms/ButtonReturn";
import timestamp from "time-stamp";
import { PostTypes } from "../../types/types";
import { postsService } from "src/services/posts";
import {
  Clock,
  Calendar,
  User,
  Share2,
  BookOpen,
  ArrowUp,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react";

type PostTemplateProps = {
  slug?: string;
};

const PostTemplate = ({ slug }: PostTemplateProps) => {
  const [post, setPost] = useState<PostTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  // Calcula tempo de leitura (aproximadamente 200 palavras por minuto)
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time;
  };

  // Controla o botão de scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Puxa o conteúdo
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        if (slug) {
          const response = await postsService.getPostBySlug(slug);
          setPost(response);
          setReadingTime(calculateReadingTime(response.text));
        }
      } catch (error) {
        console.error("Erro ao carregar post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Função para scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para copiar link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  // Funções de compartilhamento
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post?.title || "");
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Hero Section Skeleton */}
          <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="w-full">
                <div className="h-8 bg-white/20 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-12 bg-white/20 rounded-lg mb-6 animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-6 w-24 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="h-6 w-32 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Post não encontrado
              </h1>
              <p className="text-gray-600 mb-8">
                O post que você está procurando não existe ou foi removido.
              </p>
              <ButtonReturn returnTo="/blog" text="Voltar ao Blog" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const formattedDate = timestamp("DD/MM/YYYY", new Date(post.date));
  const authorName =
    typeof post.author === "string"
      ? post.author
      : post.author?.name || "Autor Desconhecido";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative">
          {post.image ? (
            <div className="relative h-96 lg:h-[500px] overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Hero Content */}
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                  <div className="text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {authorName}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {readingTime} min de leitura
                      </span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
                      {post.title}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {authorName}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formattedDate}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {readingTime} min de leitura
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
                    {post.title}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="absolute top-6 left-6">
            <ButtonReturn
              returnTo="/blog"
              text="Voltar ao Blog"
              className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white font-medium transition-colors py-2 px-3 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Article Content */}
            <article className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 lg:p-12">
                  {/* Article Meta */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {authorName}
                        </p>
                        <p className="text-sm text-gray-600">Autor</p>
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyLink}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                        title="Copiar link"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                        )}
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="Compartilhar no Facebook"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={shareOnTwitter}
                        className="p-2 rounded-full bg-sky-100 hover:bg-sky-200 transition-colors"
                        title="Compartilhar no Twitter"
                      >
                        <Twitter className="w-4 h-4 text-sky-600" />
                      </button>
                      <button
                        onClick={shareOnLinkedIn}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="Compartilhar no LinkedIn"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" />
                      </button>
                    </div>
                  </div>

                  {/* Article Text */}
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap font-light">
                      {post.text}
                    </div>
                  </div>

                  {/* Article Footer */}
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Publicado em {formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{readingTime} minutos de leitura</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Reading Progress */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Informações
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tempo de leitura</span>
                      <span className="font-medium text-gray-900">
                        {readingTime} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Publicado em</span>
                      <span className="font-medium text-gray-900">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Autor</span>
                      <span className="font-medium text-gray-900">
                        {authorName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    Compartilhar
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={shareOnFacebook}
                      className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center justify-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors text-sm font-medium text-sky-700"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </button>
                    <button
                      onClick={copyLink}
                      className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Back to Blog */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="font-semibold mb-3">Gostou do conteúdo?</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Explore mais artigos em nosso blog e fique por dentro das
                    novidades.
                  </p>
                  <ButtonReturn
                    returnTo="/blog"
                    text="Ver Mais Posts"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </Layout>
  );
};

export default PostTemplate;
