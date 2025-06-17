export interface PostTypes {
  id: string;
  slug: string;
  author: string | User;
  title: string;
  date: string | Date;
  imagePath?: string;
  image?: string;
  text: string;
  updatedAt?: string | Date;
}

// User types for authentication
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
