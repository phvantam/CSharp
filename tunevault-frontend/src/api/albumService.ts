import axiosInstance from "./axiosInstance";
import type {
  AlbumDetailDto,
  CreateAlbumRequest,
  MediaItemDto,
  UpdateAlbumRequest,
} from "./types/media";

const unwrap = <T>(payload: any): T => {
  return payload?.data?.data ?? payload?.data ?? payload;
};

const toAlbumFormData = (request: CreateAlbumRequest | UpdateAlbumRequest) => {
  const formData = new FormData();

  if ("artistId" in request && request.artistId !== undefined) {
    formData.append("ArtistId", String(request.artistId));
  }

  if ("artist" in request && request.artist !== undefined) {
    formData.append("Artist", request.artist || "");
  }

  if (request.title !== undefined) formData.append("Title", request.title);
  if (request.description !== undefined)
    formData.append("Description", request.description || "");
  if (request.releaseDate !== undefined && request.releaseDate)
    formData.append("ReleaseDate", request.releaseDate);
  if (request.albumType !== undefined)
    formData.append("AlbumType", request.albumType || "Album");
  if (request.coverImageFile)
    formData.append("CoverImageFile", request.coverImageFile);

  return formData;
};

export const albumService = {
  async getAlbumById(albumId: number): Promise<AlbumDetailDto> {
    const res = await axiosInstance.get(`/albums/${albumId}`);
    return unwrap<AlbumDetailDto>(res);
  },

  async getAlbumTracks(albumId: number): Promise<MediaItemDto[]> {
    const res = await axiosInstance.get(`/albums/${albumId}/tracks`);
    return unwrap<MediaItemDto[]>(res);
  },

  async createAlbum(request: CreateAlbumRequest): Promise<AlbumDetailDto> {
    const formData = toAlbumFormData(request);

    const res = await axiosInstance.post("/albums", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap<AlbumDetailDto>(res);
  },

  async updateAlbum(
    albumId: number,
    request: UpdateAlbumRequest,
  ): Promise<AlbumDetailDto> {
    const formData = toAlbumFormData(request);

    const res = await axiosInstance.put(`/albums/${albumId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap<AlbumDetailDto>(res);
  },

  async deleteAlbum(albumId: number): Promise<boolean> {
    const res = await axiosInstance.delete(`/albums/${albumId}`);
    return unwrap<boolean>(res);
  },

  async addTrackToAlbum(
    albumId: number,
    mediaItemId: number,
  ): Promise<boolean> {
    const res = await axiosInstance.post(
      `/albums/${albumId}/tracks/${mediaItemId}`,
    );
    return unwrap<boolean>(res);
  },

  async removeTrackFromAlbum(
    albumId: number,
    mediaItemId: number,
  ): Promise<boolean> {
    const res = await axiosInstance.delete(
      `/albums/${albumId}/tracks/${mediaItemId}`,
    );
    return unwrap<boolean>(res);
  },
};
