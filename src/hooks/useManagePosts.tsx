/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from "react";

import { useToast } from "./toast";
import { PostTypes } from "../types/types";
import { postsService, CreatePostData } from "../services/posts";

interface PostsContext {
  children: React.ReactNode;
}

interface PostContextType {
  setPosts: (posts: PostTypes[]) => void;
  posts: PostTypes[];
  setRefreshPage: (refresh: boolean) => void;
  refreshPage: boolean;
  addPost: (post: CreatePostData, imageFile?: File) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  setImage: (image: any) => void;
  image: any;
  isLoading: boolean;
}

const PostContext = createContext({} as PostContextType);

export const PostProvider = ({ children }: PostsContext) => {
  const [posts, setPosts] = useState<PostTypes[]>([]);
  const [image, setImage] = useState<any>("");
  const [refreshPage, setRefreshPage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  async function addPost(postData: CreatePostData, imageFile?: File) {
    try {
      setIsLoading(true);
      const finalPostData = { ...postData };

      // Se há uma imagem selecionada, faz upload primeiro
      const selectedImage = imageFile || image;
      if (selectedImage && selectedImage instanceof File) {
        const uploadResponse = await postsService.uploadImage(selectedImage);
        finalPostData.image = `http://localhost:3001${uploadResponse.url}`;
        finalPostData.imagePath = uploadResponse.filename;
      } else {
        // Se não há imagem, remover os campos image e imagePath do payload
        delete finalPostData.image;
        delete finalPostData.imagePath;
      }

      const newPost = await postsService.createPost(finalPostData);

      addToast({
        title: "Postagem criada com sucesso!",
        type: "success",
        duration: 5000,
      });

      setPosts((prev: PostTypes[]) => [newPost, ...prev]);
      setImage(null); // Limpa a imagem após sucesso

      setTimeout(() => {
        setRefreshPage(!refreshPage);
      }, 1000);
    } catch (e) {
      addToast({
        title: "Ocorreu um erro ao criar esta postagem.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function removePost(id: string) {
    try {
      await postsService.deletePost(id);

      addToast({
        title: "Publicação excluida com sucesso!",
        type: "success",
        duration: 5000,
      });

      setTimeout(() => {
        setRefreshPage(!refreshPage);
      }, 1000);
    } catch (e) {
      addToast({
        title: "Erro ao excluir publicação",
        type: "error",
        duration: 5000,
      });
    }
  }

  return (
    <PostContext.Provider
      value={{
        setPosts,
        posts,
        setRefreshPage,
        refreshPage,
        addPost,
        removePost,
        setImage,
        image,
        isLoading,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export function useManagePosts() {
  const context = useContext(PostContext);
  return context;
}
