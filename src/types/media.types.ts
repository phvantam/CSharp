// ============================================================
// MEDIA TYPES
// ============================================================

export type MediaType = 'audio' | 'video';

export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;        // seconds
  coverUrl?: string;
  fileUrl: string;
  mediaType: MediaType;
  genre?: string;
  description?: string;
  tags?: string[];
  ownerId: string;
  ownerName: string;
  playCount: number;
  likeCount: number;
  isLiked?: boolean;
  isPublic: boolean;
  uploadedAt: string;
}

export interface UploadMediaRequest {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  description?: string;
  isPublic: boolean;
  file: File;
  cover?: File;
}

export interface SearchMediaQuery {
  keyword: string;
  type?: MediaType;
  page?: number;
  pageSize?: number;
}

export interface PlayHistory {
  id: string;
  mediaItem: MediaItem;
  playedAt: string;
}
