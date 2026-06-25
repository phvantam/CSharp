using TuneVault.Application.DTOs.Media;
namespace TuneVault.Application.Interfaces;
using TuneVault.Application.DTOs.Artist;
public interface IMediaService
{
    Task<MediaUploadResultDto> UploadMediaAsync(
    Stream fileStream,
    string fileName,
    string contentType,
    string userId,
    MediaUploadRequestDto request);              

    Task<Stream> GetMediaStreamAsync(long mediaItemId);
    Task<MediaItemDto?> GetMediaByIdAsync(long mediaItemId);
    Task<List<MediaItemDto>> GetUserMediaAsync(string userId, int page = 1, int pageSize = 20);
    
    Task<bool> UpdateMediaAsync(long mediaItemId, string userId, UpdateMediaRequest request);
    Task<List<MediaSearchResultDto>> SearchMediaAsync(string keyword, int page = 1, int pageSize = 20);
    Task<List<MediaItemDto>> GetTrendingMediaAsync(int limit = 12);
    Task<List<MediaItemDto>> GetNewReleasesAsync(int limit = 12);
    Task<bool> AddToFavoriteAsync(string userId, long mediaItemId);
    Task<bool> RemoveFromFavoriteAsync(string userId, long mediaItemId);
    Task<List<MediaItemDto>> GetUserFavoritesAsync(string userId);
    Task<bool> PlayMediaAsync(string userId, long mediaItemId);
    Task<List<MediaItemDto>> GetPlayHistoryAsync(string userId, int limit = 20);
    Task<bool> DeleteMediaAsync(string userId, long mediaItemId);
    Task<int> RecalculateMissingDurationsAsync();
    Task<List<ArtistDto>> SearchArtistsAsync(string keyword, int limit = 10);
    Task<MultiMediaUploadResultDto> UploadMultiMediaAsync(
    string userId,
    MultiMediaUploadRequestDto request,
    Stream? audioStream,
    string? audioFileName,
    Stream? videoStream,
    string? videoFileName,
    Stream? thumbnailStream,
    string? thumbnailFileName);
}