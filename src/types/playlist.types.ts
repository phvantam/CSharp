// ============================================================
// PLAYLIST TYPES
// ============================================================

import type { MediaItem } from './media.types';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  ownerId: string;
  ownerName: string;
  trackCount: number;
  tracks?: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverUrl?: string;
}

export interface AddTrackRequest {
  mediaItemId: string;
}
