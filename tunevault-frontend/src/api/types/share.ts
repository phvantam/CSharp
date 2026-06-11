export interface ShareMediaRequest {
  receiverUserId: string;
  mediaItemId?: number;
  playlistId?: number;
  message?: string;
}
