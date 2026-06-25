export interface UserDto {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface LoginRequest {
  loginIdentifier: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: UserDto;
  };
}
