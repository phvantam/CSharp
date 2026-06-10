import axiosInstance from './axiosInstance';
import type { MediaShare, ShareRequest } from '../types/share.types';
import type { ApiResponse } from '../types/common.types';

export const shareApi = {
  share: (data: ShareRequest) =>
    axiosInstance.post<ApiResponse<MediaShare>>('/shares', data),

  getSharedWithMe: () =>
    axiosInstance.get<ApiResponse<MediaShare[]>>('/shares/received'),

  getSharedByMe: () =>
    axiosInstance.get<ApiResponse<MediaShare[]>>('/shares/sent'),

  markRead: (id: string) =>
    axiosInstance.patch(`/shares/${id}/read`),
};
