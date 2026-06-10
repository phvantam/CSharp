// ============================================================
// SHARE TYPES
// ============================================================

import type { MediaItem } from './media.types';
import type { Playlist } from './playlist.types';

export type ShareTargetType = 'media' | 'playlist';

export interface MediaShare {
  id: string;
  sender: { id: string; username: string; avatarUrl?: string };
  receiver: { id: string; username: string; avatarUrl?: string };
  mediaItem?: MediaItem;
  playlist?: Playlist;
  targetType: ShareTargetType;
  message?: string;
  sharedAt: string;
  isRead: boolean;
}

export interface ShareRequest {
  receiverUserId: string;
  targetType: ShareTargetType;
  mediaItemId?: string;
  playlistId?: string;
  message?: string;
}
