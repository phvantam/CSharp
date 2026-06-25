using Microsoft.EntityFrameworkCore;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class FavoriteService : IFavoriteService
{
    private readonly ApplicationDbContext _context;

    public FavoriteService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> AddToFavoriteAsync(string userId, long mediaItemId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("Không xác định được người dùng.");

        var mediaExists = await _context.MediaItems
            .AnyAsync(m => m.MediaItemId == mediaItemId);

        if (!mediaExists)
            return false;

        var alreadyExists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.MediaItemId == mediaItemId);

        // Idempotent: đã thích rồi thì vẫn xem là thành công
        if (alreadyExists)
            return true;

        var favorite = new Favorite
        {
            UserId = userId,
            MediaItemId = mediaItemId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Favorites.AddAsync(favorite);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RemoveFromFavoriteAsync(string userId, long mediaItemId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("Không xác định được người dùng.");

        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.MediaItemId == mediaItemId);

        if (favorite == null)
            return false;

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<MediaItemDto>> GetMyFavoritesAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("Không xác định được người dùng.");

        var favorites = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.MediaItem)
                .ThenInclude(m => m.Artist)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return favorites
            .Where(f => f.MediaItem != null)
            .Select(f =>
            {
                var media = f.MediaItem;
                var audioPath = !string.IsNullOrWhiteSpace(media.AudioFilePath)
                    ? media.AudioFilePath
                    : media.FilePath;

                return new MediaItemDto
                {
                    MediaItemId = media.MediaItemId,
                    ArtistId = media.ArtistId,
                    Title = media.Title,
                    ArtistName = media.Artist?.Name ?? "Unknown Artist",

                    DurationSeconds = media.DurationSeconds,
                    PlayCount = media.PlayCount,
                    MediaType = media.MediaType,

                    FilePath = audioPath ?? string.Empty,
                    AudioUrl = audioPath,
                    VideoUrl = media.VideoFilePath,
                    ThumbnailUrl = media.ThumbnailUrl,

                    Visibility = media.Visibility,
                    HasVideo = !string.IsNullOrWhiteSpace(media.VideoFilePath),
                    CreatedAt = media.CreatedAt
                };
            })
            .ToList();
    }
}
