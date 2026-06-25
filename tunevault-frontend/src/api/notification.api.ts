import axiosInstance from './axiosInstance';
import type { Notification } from '../types/notification.types';
import type { ApiResponse } from '../types/common.types';

export const notificationApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<Notification[]>>('/notifications'),

  markRead: (id: string) =>
    axiosInstance.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    axiosInstance.patch('/notifications/read-all'),

  getUnreadCount: () =>
    axiosInstance.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};
