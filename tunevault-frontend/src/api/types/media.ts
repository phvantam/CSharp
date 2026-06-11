export type MediaType = "Audio" | "Video";
export type Visibility = "Public" | "Private" | "Unlisted";

export interface MediaItemDto {
  mediaItemId: number;
  ownerUserId?: string;
  artistId: number;
  albumId?: number;
  title: string;
  slug?: string;
  description?: string;
  mediaType: MediaType;
  genre?: string;
  durationSeconds: number;
  filePath?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  visibility: Visibility;
  playCount?: number;
  isProcessed?: boolean;
  createdAt?: string;
  updatedAt?: string;

  artistName?: string;
  albumTitle?: string;
  ownerDisplayName?: string;
  hasVideo?: boolean;
  audioUrl?: string;
}
