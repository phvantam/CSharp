export type PlaylistVisibility = "Public" | "Private";

export interface PlaylistDto {
  playlistId: number;
  title: string;
  name?: string;
  description?: string;
  visibility: PlaylistVisibility | string;
  isPublic?: boolean;
  trackCount?: number;
  coverImageUrl?: string | null;
  createdAt?: string;
  ownerUserId?: string;
  ownerName?: string;
}
