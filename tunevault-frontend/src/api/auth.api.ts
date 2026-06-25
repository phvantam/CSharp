import axiosInstance from './axiosInstance';
import type { LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest, User } from '../types/auth.types';
import type { ApiResponse } from '../types/common.types';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  getMe: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    axiosInstance.put<ApiResponse<User>>('/auth/profile', data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return axiosInstance.post<ApiResponse<{ avatarUrl: string }>>('/auth/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
