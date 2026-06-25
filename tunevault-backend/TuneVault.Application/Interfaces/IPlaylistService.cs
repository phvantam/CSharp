using TuneVault.Application.DTOs.Playlist;

namespace TuneVault.Application.Interfaces;

public interface IPlaylistService
{
    Task<long> CreatePlaylistAsync(string userId, CreatePlaylistRequest request);
    
    Task<PlaylistDetailDto?> GetPlaylistDetailAsync(long playlistId);
    
    Task<List<PlaylistSummaryDto>> GetUserPlaylistsAsync(string userId);
    Task<List<PlaylistSummaryDto>> GetPublicPlaylistsByUserAsync(string userId);
    Task<bool> AddSongToPlaylistAsync(long playlistId, string userId, long mediaItemId);
    Task<bool> RemoveSongFromPlaylistAsync(long playlistId, string userId, long mediaItemId);
    Task<bool> UpdatePlaylistAsync(long playlistId, string userId, UpdatePlaylistRequestDto request);
    Task<bool> DeletePlaylistAsync(long playlistId, string userId);
    Task<List<PlaylistSummaryDto>> GetPopularPlaylistsAsync(int limit = 12);
}