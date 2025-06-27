import { User } from '../users/entities/user.entity';

export interface JwtAuthRequest {
  user: User;
}
