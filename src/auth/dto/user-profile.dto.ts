export class UserProfileDto {
  id: string;
  name: string;
  email: string;
  provider: string;
  providerId?: string;
  avatar?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
