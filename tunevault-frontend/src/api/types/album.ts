export interface AlbumDto {
  albumId: number;
  ownerUserId: string;
  title: string;
  artistName?: string;
  description?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  creatorName?: string;
}
