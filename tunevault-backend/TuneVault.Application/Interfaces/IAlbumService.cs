using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Interfaces;

public interface IAlbumService
{
    Task<AlbumDetailDto?> GetAlbumDetailAsync(
        int albumId,
        string? currentUserId = null,
        bool isAdmin = false);

    Task<List<MediaItemDto>> GetAlbumTracksAsync(int albumId);

    Task<AlbumDetailDto> CreateAlbumAsync(
        string userId,
        bool isAdmin,
        CreateAlbumRequestDto request);

    Task<AlbumDetailDto?> UpdateAlbumAsync(
        int albumId,
        string userId,
        bool isAdmin,
        UpdateAlbumRequestDto request);

    Task<bool> DeleteAlbumAsync(
        int albumId,
        string userId,
        bool isAdmin);

    Task<bool> AddTrackToAlbumAsync(
        int albumId,
        long mediaItemId,
        string userId,
        bool isAdmin);

    Task<bool> RemoveTrackFromAlbumAsync(
        int albumId,
        long mediaItemId,
        string userId,
        bool isAdmin);
}
