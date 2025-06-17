import React, { useState, useContext } from "react";
import { X, Save, FileText, User, Type } from "lucide-react";
import ImageUpload from "../ImageUpload";
import { CreatePostData } from "../../../services/posts";
import { UserContext } from "../../../context/user";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostData, image?: File) => Promise<void>;
  isLoading?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    title: "",
    text: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
      .replace(/[\s_-]+/g, "-") // Substitui espaços e underscores por hífens
      .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.text.trim()) {
      newErrors.text = "Conteúdo é obrigatório";
    }

    if (formData.text.trim().length < 50) {
      newErrors.text = "Conteúdo deve ter pelo menos 50 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const postData: CreatePostData = {
      slug: generateSlug(formData.title),
      title: formData.title.trim(),
      text: formData.text.trim(),
      // image e imagePath serão adicionados pelo hook apenas se houver upload
    };

    try {
      await onSubmit(postData, selectedImage || undefined);
      handleClose();
    } catch (error) {
      console.error("Erro ao criar post:", error);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", text: "" });
    setSelectedImage(null);
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Remove erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 py-8">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Criar Nova Postagem
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form
            id="create-post-form"
            onSubmit={handleSubmit}
            className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-160px)]"
          >
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4" />
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Digite o título da postagem..."
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Author Info */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Autor
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600">
                {user?.name || "Usuário não identificado"}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem da Postagem
              </label>
              <ImageUpload
                onImageSelect={setSelectedImage}
                className="w-full"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                rows={8}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.text ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Escreva o conteúdo da sua postagem..."
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                {errors.text && (
                  <p className="text-sm text-red-600">{errors.text}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.text.length} caracteres
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 pb-8 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="create-post-form"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Postagem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
