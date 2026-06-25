import axiosInstance from "./axiosInstance";
import type {
  AddArtistManagerRequest,
  AlbumDto,
  ArtistDetailDto,
  ArtistManagerDto,
  MediaItemDto,
  UpdateArtistRequest,
} from "./types/media";

const unwrap = <T>(payload: any): T => {
  return payload?.data?.data ?? payload?.data ?? payload;
};

export const artistService = {
  async getArtistById(artistId: number): Promise<ArtistDetailDto> {
    const res = await axiosInstance.get(`/artists/${artistId}`);
    return unwrap<ArtistDetailDto>(res);
  },

  async getArtistSongs(artistId: number, limit = 50): Promise<MediaItemDto[]> {
    const res = await axiosInstance.get(`/artists/${artistId}/songs`, {
      params: { limit },
    });
    return unwrap<MediaItemDto[]>(res);
  },

  async getArtistAlbums(artistId: number): Promise<AlbumDto[]> {
    const res = await axiosInstance.get(`/artists/${artistId}/albums`);
    return unwrap<AlbumDto[]>(res);
  },

  async followArtist(artistId: number): Promise<boolean> {
    const res = await axiosInstance.post(`/artists/${artistId}/follow`);
    return unwrap<boolean>(res);
  },

  async unfollowArtist(artistId: number): Promise<boolean> {
    const res = await axiosInstance.delete(`/artists/${artistId}/follow`);
    return unwrap<boolean>(res);
  },

  async updateArtist(
    artistId: number,
    request: UpdateArtistRequest,
  ): Promise<ArtistDetailDto> {
    const formData = new FormData();

    if (request.name !== undefined) formData.append("Name", request.name);
    if (request.bio !== undefined) formData.append("Bio", request.bio);
    if (request.country !== undefined)
      formData.append("Country", request.country);
    if (request.avatarFile) formData.append("AvatarFile", request.avatarFile);
    if (request.imageFile) formData.append("ImageFile", request.imageFile);

    const res = await axiosInstance.put(`/artists/${artistId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap<ArtistDetailDto>(res);
  },

  async getArtistManagers(artistId: number): Promise<ArtistManagerDto[]> {
    const res = await axiosInstance.get(`/artists/${artistId}/managers`);
    return unwrap<ArtistManagerDto[]>(res);
  },

  async addArtistManager(
    artistId: number,
    request: AddArtistManagerRequest,
  ): Promise<ArtistManagerDto> {
    const res = await axiosInstance.post(
      `/artists/${artistId}/managers`,
      request,
    );
    return unwrap<ArtistManagerDto>(res);
  },

  async updateArtistManagerRole(
    artistId: number,
    userId: string,
    role: "Owner" | "Editor" | "Viewer",
  ): Promise<ArtistManagerDto> {
    const res = await axiosInstance.put(
      `/artists/${artistId}/managers/${userId}/role`,
      { role },
    );
    return unwrap<ArtistManagerDto>(res);
  },

  async removeArtistManager(artistId: number, userId: string): Promise<void> {
    await axiosInstance.delete(`/artists/${artistId}/managers/${userId}`);
  },
};
