export interface UserDto {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
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
