export type MediaType = "Audio" | "Video";
export type Visibility = "Public" | "Private" | "Unlisted";

export interface MediaArtistDto {
  artistId: number;
  name: string;
  slug?: string;
  avatarUrl?: string;
  role?: string;
  position?: number;
}

export interface MediaItemDto {
  mediaItemId: number;

  ownerUserId?: string;
  ownerDisplayName?: string;

  artistId?: number;
  artistName?: string;
  artists?: MediaArtistDto[];

  albumId?: number;
  albumTitle?: string;

  title: string;
  videoTitle?: string;
  slug?: string;
  description?: string;
  lyrics?: string;

  mediaType: MediaType;
  genre?: string;

  durationSeconds: number;
  playCount?: number;
  likeCount?: number;

  filePath?: string;
  audioUrl?: string;
  videoUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;

  mimeType?: string;
  fileSizeBytes?: number;
  visibility?: Visibility;
  isProcessed?: boolean;
  hasVideo?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface AlbumDto {
  albumId: number;
  artistId: number;
  artistName: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  coverUrl?: string;
  releaseDate?: string;
  albumType: string;
  trackCount: number;
  totalPlayCount: number;
  totalLikeCount: number;
  canEdit?: boolean;
  canDelete?: boolean;
  canManageTracks?: boolean;
}

export interface AlbumDetailDto extends AlbumDto {
  tracks: MediaItemDto[];
}

export interface ArtistDetailDto {
  artistId: number;
  name: string;
  slug?: string;
  bio?: string;
  avatarUrl?: string;
  imageUrl?: string;
  country?: string;
  isVerified: boolean;
  followerCount: number;
  songCount: number;
  albumCount: number;
  totalPlayCount: number;
  canEdit?: boolean;
  canManageManagers?: boolean;
  myArtistRole?: string;
  isFollowing?: boolean;
  topSongs: MediaItemDto[];
  albums: AlbumDto[];
}

export type ArtistManagerRole = "Owner" | "Editor" | "Viewer";

export interface ArtistManagerDto {
  artistManagerId: number;
  artistId: number;
  userId: string;
  displayName?: string;
  email?: string;
  role: ArtistManagerRole;
  createdAt: string;
}

export interface UpdateArtistRequest {
  name?: string;
  bio?: string;
  country?: string;
  avatarFile?: File | null;
  imageFile?: File | null;
}

export interface AddArtistManagerRequest {
  userId: string;
  role: ArtistManagerRole;
}

export interface CreateAlbumRequest {
  artistId: number;
  title: string;
  description?: string;
  releaseDate?: string;
  albumType?: string;
  coverImageFile?: File | null;
}

export interface UpdateAlbumRequest {
  artistId?: number;
  artist?: string;
  title?: string;
  description?: string;
  releaseDate?: string;
  albumType?: string;
  coverImageFile?: File | null;
}
