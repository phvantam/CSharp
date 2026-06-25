using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Artist;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Interfaces;

public interface IArtistService
{
    Task<ArtistDetailDto?> GetArtistDetailAsync(int artistId, string? currentUserId = null, bool isAdmin = false);
    Task<List<MediaItemDto>> GetArtistSongsAsync(int artistId, int limit = 50);
    Task<List<AlbumDto>> GetArtistAlbumsAsync(int artistId);

    Task<ArtistDetailDto?> UpdateArtistAsync(int artistId, string userId, bool isAdmin, UpdateArtistRequestDto request);

    Task<List<ArtistManagerDto>> GetArtistManagersAsync(int artistId, string userId, bool isAdmin);
    Task<ArtistManagerDto> AddArtistManagerAsync(int artistId, string currentUserId, bool isAdmin, AddArtistManagerRequestDto request);
    Task<ArtistManagerDto> UpdateArtistManagerRoleAsync(int artistId, string targetUserId, string currentUserId, bool isAdmin, UpdateArtistManagerRoleRequestDto request);
    Task<bool> RemoveArtistManagerAsync(int artistId, string targetUserId, string currentUserId, bool isAdmin);

    Task<bool> FollowArtistAsync(int artistId, string userId);
    Task<bool> UnfollowArtistAsync(int artistId, string userId);
}
