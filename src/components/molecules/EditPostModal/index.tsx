/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PrimaryButton } from "../../atoms";
import Input from "../../atoms/Input";
import Textarea from "../../atoms/Textarea";
import { PostTypes } from "../../../types/types";
import { UpdatePostData } from "../../../services/posts";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    id: string,
    postData: UpdatePostData,
    imageFile?: File,
  ) => Promise<void>;
  post: PostTypes | null;
  isLoading?: boolean;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  post,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    text: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Função para extrair o nome do autor
  const getAuthorName = (
    author: string | { name?: string; [key: string]: any },
  ) => {
    return typeof author === "string"
      ? author
      : author?.name || "Autor não informado";
  };

  // Preenche o formulário quando o post é carregado
  useEffect(() => {
    if (post && isOpen) {
      setFormData({
        title: post.title || "",
        text: post.text || "",
      });
      setSelectedImage(null);
      setErrors({});
    }
  }, [post, isOpen]);

  // Limpa o formulário quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: "", text: "" });
      setSelectedImage(null);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.text.trim()) {
      newErrors.text = "Conteúdo é obrigatório";
    } else if (formData.text.trim().length < 50) {
      newErrors.text = "Conteúdo deve ter pelo menos 50 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !post) {
      return;
    }

    const postData: UpdatePostData = {
      title: formData.title.trim(),
      text: formData.text.trim(),
    };

    try {
      await onSubmit(post.id, postData, selectedImage || undefined);
      handleClose();
    } catch (error) {
      console.error("Erro ao editar post:", error);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", text: "" });
    setSelectedImage(null);
    setErrors({});
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Editar Postagem</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo Autor (apenas informativo) */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autor (não editável)
            </label>
            <p className="text-gray-900 font-medium">
              {getAuthorName(post.author)}
            </p>
          </div>

          {/* Campo Título */}
          <div>
            <Input
              key={`title-${post?.id}`} // Force re-render when post changes
              placeholder="Título da postagem"
              setValueToForm={(value: string) =>
                setFormData((prev) => ({ ...prev, title: value }))
              }
              initialValue={post?.title || ""}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Campo Conteúdo */}
          <div>
            <Textarea
              placeholder="Conteúdo da postagem (mínimo 50 caracteres)"
              setValueToForm={(value: string) =>
                setFormData((prev) => ({ ...prev, text: value }))
              }
              initialValue={formData.text}
              rows={8}
              required
            />
            {errors.text && (
              <p className="text-red-500 text-sm mt-1">{errors.text}</p>
            )}
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem (opcional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para enviar</span> ou
                    arraste e solte
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG ou JPEG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {selectedImage && (
              <p className="text-sm text-green-600 mt-2">
                Imagem selecionada: {selectedImage.name}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <PrimaryButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </PrimaryButton>
            <PrimaryButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
