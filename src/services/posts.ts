import api from "./api";
import { PostTypes } from "../types/types";

export interface CreatePostData {
  slug: string;
  title: string;
  image?: string;
  imagePath?: string;
  text: string;
}

export interface UpdatePostData {
  slug?: string;
  title?: string;
  image?: string;
  imagePath?: string;
  text?: string;
  // author não é permitido em updates - o autor não pode ser alterado
}

export interface PaginatedResponse {
  posts: PostTypes[];
  total: number;
}

export interface UploadResponse {
  message: string;
  filename: string;
  originalName: string;
  size: number;
  url: string;
}

export const postsService = {
  // Upload de imagem
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Buscar posts paginados com filtros
  async getPaginatedPosts(
    page = 1,
    limit = 12,
    search?: string,
    startDate?: string,
    endDate?: string,
    authorId?: string,
  ): Promise<PaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    if (startDate) {
      params.append("startDate", startDate);
    }

    if (endDate) {
      params.append("endDate", endDate);
    }

    if (authorId) {
      params.append("authorId", authorId);
    }

    const response = await api.get(`/posts/paginated?${params.toString()}`);
    return response.data;
  },

  // Buscar post por slug
  async getPostBySlug(slug: string): Promise<PostTypes> {
    const response = await api.get(`/posts/slug/${slug}`);
    return response.data;
  },

  // Criar novo post
  async createPost(postData: CreatePostData): Promise<PostTypes> {
    const response = await api.post("/posts", postData);
    return response.data;
  },

  // Atualizar post
  async updatePost(id: string, postData: UpdatePostData): Promise<PostTypes> {
    const response = await api.patch(`/posts/${id}`, postData);
    return response.data;
  },

  // Deletar post
  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },
};
