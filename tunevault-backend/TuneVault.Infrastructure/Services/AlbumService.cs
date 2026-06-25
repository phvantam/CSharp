using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class AlbumService : IAlbumService
{
    private static readonly string[] ValidAlbumTypes = { "Single", "EP", "Album", "Compilation" };

    private readonly ApplicationDbContext _context;
    private readonly string _webRootPath;

    public AlbumService(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _webRootPath = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
    }

    public async Task<AlbumDetailDto?> GetAlbumDetailAsync(
        int albumId,
        string? currentUserId = null,
        bool isAdmin = false)
    {
        var album = await _context.Albums
            .AsNoTracking()
            .Include(a => a.Artist)
            .FirstOrDefaultAsync(a => a.AlbumId == albumId);

        if (album == null)
            return null;

        var tracks = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m => m.AlbumId == albumId && m.Visibility == "Public")
            .OrderBy(m => m.MediaItemId)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(tracks.Select(t => t.MediaItemId).ToList());

        var canEdit = await CanEditAlbumAsync(album.ArtistId, currentUserId, isAdmin);
        var canDelete = await CanDeleteAlbumAsync(album.ArtistId, currentUserId, isAdmin);

        return ToAlbumDetailDto(
            album,
            tracks,
            likeMap,
            canEdit,
            canDelete,
            canEdit);
    }

    public async Task<List<MediaItemDto>> GetAlbumTracksAsync(int albumId)
    {
        var tracks = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m => m.AlbumId == albumId && m.Visibility == "Public")
            .OrderBy(m => m.MediaItemId)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(tracks.Select(t => t.MediaItemId).ToList());
        return tracks.Select(t => ToMediaItemDto(t, likeMap)).ToList();
    }

    public async Task<AlbumDetailDto> CreateAlbumAsync(
        string userId,
        bool isAdmin,
        CreateAlbumRequestDto request)
    {
        if (request.ArtistId <= 0)
            throw new ArgumentException("ArtistId không hợp lệ.");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("Tên album không được để trống.");

        var artist = await _context.Artists
            .FirstOrDefaultAsync(a => a.ArtistId == request.ArtistId);

        if (artist == null)
            throw new KeyNotFoundException("Không tìm thấy nghệ sĩ.");

        if (!await CanEditAlbumAsync(request.ArtistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Bạn không có quyền tạo album cho nghệ sĩ này.");

        var title = request.Title.Trim();
        var slug = await GenerateUniqueAlbumSlugAsync(request.ArtistId, title);

        var album = new Album
        {
            ArtistId = request.ArtistId,
            Title = title,
            Slug = slug,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            ReleaseDate = request.ReleaseDate,
            AlbumType = NormalizeAlbumType(request.AlbumType),
            CoverImageUrl = request.CoverImageFile != null && request.CoverImageFile.Length > 0
                ? await SaveCoverImageAsync(request.CoverImageFile)
                : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Albums.Add(album);
        await _context.SaveChangesAsync();

        var detail = await GetAlbumDetailAsync(album.AlbumId, userId, isAdmin);
        return detail!;
    }

    public async Task<AlbumDetailDto?> UpdateAlbumAsync(
        int albumId,
        string userId,
        bool isAdmin,
        UpdateAlbumRequestDto request)
    {
        var album = await _context.Albums
            .Include(a => a.Artist)
            .FirstOrDefaultAsync(a => a.AlbumId == albumId);

        if (album == null)
            return null;

        // Kiểm tra quyền theo nghệ sĩ hiện tại của album trước khi cho sửa.
        if (!await CanEditAlbumAsync(album.ArtistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Bạn không có quyền sửa album này.");

        var changedTitle = false;
        var changedArtist = false;

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            var nextTitle = request.Title.Trim();

            if (!string.Equals(album.Title, nextTitle, StringComparison.Ordinal))
            {
                album.Title = nextTitle;
                changedTitle = true;
            }
        }

        var nextArtistId = await ResolveAlbumArtistIdAsync(request, userId);

        if (nextArtistId.HasValue && nextArtistId.Value > 0 && nextArtistId.Value != album.ArtistId)
        {
            album.ArtistId = nextArtistId.Value;
            changedArtist = true;
        }

        if (changedTitle || changedArtist)
            album.Slug = await GenerateUniqueAlbumSlugAsync(album.ArtistId, album.Title, album.AlbumId);

        // Description gửi chuỗi rỗng vẫn phải được lưu là null để có thể xóa mô tả cũ.
        if (request.Description != null)
            album.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        if (request.ReleaseDate.HasValue)
            album.ReleaseDate = request.ReleaseDate;

        if (request.AlbumType != null)
            album.AlbumType = NormalizeAlbumType(request.AlbumType);

        if (request.CoverImageFile != null && request.CoverImageFile.Length > 0)
            album.CoverImageUrl = await SaveCoverImageAsync(request.CoverImageFile);

        album.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetAlbumDetailAsync(albumId, userId, isAdmin);
    }

    public async Task<bool> DeleteAlbumAsync(
        int albumId,
        string userId,
        bool isAdmin)
    {
        var album = await _context.Albums
            .FirstOrDefaultAsync(a => a.AlbumId == albumId);

        if (album == null)
            return false;

        if (!await CanDeleteAlbumAsync(album.ArtistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Chỉ Owner hoặc Admin mới được xóa album.");

        var tracks = await _context.MediaItems
            .Where(m => m.AlbumId == albumId)
            .ToListAsync();

        foreach (var track in tracks)
        {
            track.AlbumId = null;
            track.UpdatedAt = DateTime.UtcNow;
        }

        _context.Albums.Remove(album);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddTrackToAlbumAsync(
        int albumId,
        long mediaItemId,
        string userId,
        bool isAdmin)
    {
        var album = await _context.Albums
            .FirstOrDefaultAsync(a => a.AlbumId == albumId);

        if (album == null)
            throw new KeyNotFoundException("Không tìm thấy album.");

        if (!await CanEditAlbumAsync(album.ArtistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Bạn không có quyền thêm bài hát vào album này.");

        var media = await _context.MediaItems
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId);

        if (media == null)
            throw new KeyNotFoundException("Không tìm thấy bài hát.");

        if (media.ArtistId != album.ArtistId)
            throw new InvalidOperationException("Chỉ có thể thêm bài hát cùng nghệ sĩ vào album.");

        if (media.AlbumId == albumId)
            return true;

        media.AlbumId = albumId;
        media.UpdatedAt = DateTime.UtcNow;

        album.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveTrackFromAlbumAsync(
        int albumId,
        long mediaItemId,
        string userId,
        bool isAdmin)
    {
        var album = await _context.Albums
            .FirstOrDefaultAsync(a => a.AlbumId == albumId);

        if (album == null)
            throw new KeyNotFoundException("Không tìm thấy album.");

        if (!await CanEditAlbumAsync(album.ArtistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bài hát khỏi album này.");

        var media = await _context.MediaItems
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId && m.AlbumId == albumId);

        if (media == null)
            return false;

        media.AlbumId = null;
        media.UpdatedAt = DateTime.UtcNow;

        album.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private AlbumDetailDto ToAlbumDetailDto(
        Album album,
        List<MediaItem> tracks,
        Dictionary<long, int> likeMap,
        bool canEdit,
        bool canDelete,
        bool canManageTracks)
    {
        var trackDtos = tracks.Select(t => ToMediaItemDto(t, likeMap)).ToList();

        return new AlbumDetailDto
        {
            AlbumId = album.AlbumId,
            ArtistId = album.ArtistId,
            ArtistName = album.Artist?.Name ?? "Unknown Artist",
            Title = album.Title,
            Description = album.Description,
            CoverImageUrl = GetAlbumCoverUrl(album, tracks),
            ReleaseDate = album.ReleaseDate,
            AlbumType = album.AlbumType,
            TrackCount = tracks.Count,
            TotalPlayCount = tracks.Sum(t => (long)t.PlayCount),
            TotalLikeCount = likeMap.Values.Sum(),
            CanEdit = canEdit,
            CanDelete = canDelete,
            CanManageTracks = canManageTracks,
            Tracks = trackDtos
        };
    }

    private static string? GetAlbumCoverUrl(Album album, List<MediaItem> tracks)
    {
        if (!string.IsNullOrWhiteSpace(album.CoverImageUrl) &&
            !album.CoverImageUrl.Contains("default-cover", StringComparison.OrdinalIgnoreCase))
        {
            return album.CoverImageUrl;
        }

        return tracks
            .OrderByDescending(t => t.PlayCount)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => t.ThumbnailUrl)
            .FirstOrDefault(url => !string.IsNullOrWhiteSpace(url));
    }

    private async Task<int?> ResolveAlbumArtistIdAsync(
        UpdateAlbumRequestDto request,
        string userId)
    {
        if (request.ArtistId.HasValue && request.ArtistId.Value > 0)
        {
            var exists = await _context.Artists
                .AnyAsync(a => a.ArtistId == request.ArtistId.Value);

            if (!exists)
                throw new KeyNotFoundException("Không tìm thấy nghệ sĩ album.");

            return request.ArtistId.Value;
        }

        var artistName = !string.IsNullOrWhiteSpace(request.Artist)
            ? request.Artist.Trim()
            : request.ArtistName?.Trim();

        if (string.IsNullOrWhiteSpace(artistName))
            return null;

        var artist = await _context.Artists
            .FirstOrDefaultAsync(a => a.Name == artistName);

        if (artist != null)
            return artist.ArtistId;

        artist = new Artist
        {
            Name = artistName,
            Slug = await GenerateUniqueArtistSlugAsync(artistName),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Artists.Add(artist);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var existsManager = await _context.ArtistManagers.AnyAsync(x =>
                x.ArtistId == artist.ArtistId &&
                x.UserId == userId);

            if (!existsManager)
            {
                _context.ArtistManagers.Add(new ArtistManager
                {
                    ArtistId = artist.ArtistId,
                    UserId = userId,
                    Role = "Owner",
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }
        }

        return artist.ArtistId;
    }

    private async Task<string> GenerateUniqueArtistSlugAsync(string artistName)
    {
        var baseSlug = SlugHelper.GenerateSlug(artistName);

        if (string.IsNullOrWhiteSpace(baseSlug))
            baseSlug = $"artist-{Guid.NewGuid():N}";

        var slug = baseSlug;
        var index = 2;

        while (await _context.Artists.AnyAsync(a => a.Slug == slug))
        {
            slug = $"{baseSlug}-{index}";
            index++;
        }

        return slug;
    }

    private async Task<bool> CanEditAlbumAsync(
        int artistId,
        string? userId,
        bool isAdmin)
    {
        if (isAdmin)
            return true;

        if (string.IsNullOrWhiteSpace(userId))
            return false;

        return await _context.ArtistManagers.AnyAsync(x =>
            x.ArtistId == artistId &&
            x.UserId == userId &&
            (x.Role == "Owner" || x.Role == "Editor"));
    }

    private async Task<bool> CanDeleteAlbumAsync(
        int artistId,
        string? userId,
        bool isAdmin)
    {
        if (isAdmin)
            return true;

        if (string.IsNullOrWhiteSpace(userId))
            return false;

        return await _context.ArtistManagers.AnyAsync(x =>
            x.ArtistId == artistId &&
            x.UserId == userId &&
            x.Role == "Owner");
    }

    private static string NormalizeAlbumType(string? albumType)
    {
        var normalized = string.IsNullOrWhiteSpace(albumType)
            ? "Album"
            : albumType.Trim();

        var validType = ValidAlbumTypes
            .FirstOrDefault(x => string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));

        if (validType == null)
            throw new ArgumentException("Loại album không hợp lệ. Chỉ dùng Single, EP, Album hoặc Compilation.");

        return validType;
    }

    private async Task<string> GenerateUniqueAlbumSlugAsync(
        int artistId,
        string title,
        int? currentAlbumId = null)
    {
        var baseSlug = SlugHelper.GenerateSlug(title);

        if (string.IsNullOrWhiteSpace(baseSlug))
            baseSlug = $"album-{Guid.NewGuid():N}";

        var slug = baseSlug;
        var index = 2;

        while (await _context.Albums.AnyAsync(a =>
            a.ArtistId == artistId &&
            a.Slug == slug &&
            (!currentAlbumId.HasValue || a.AlbumId != currentAlbumId.Value)))
        {
            slug = $"{baseSlug}-{index}";
            index++;
        }

        return slug;
    }

    private async Task<string> SaveCoverImageAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new HashSet<string> { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.");

        var uploadPath = Path.Combine(_webRootPath, "media", "image", "album-cover");

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadPath, uniqueFileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/media/image/album-cover/{uniqueFileName}";
    }

    private async Task<Dictionary<long, int>> GetLikeMapAsync(List<long> mediaIds)
    {
        if (mediaIds.Count == 0)
            return new Dictionary<long, int>();

        return await _context.Favorites
            .AsNoTracking()
            .Where(f => mediaIds.Contains(f.MediaItemId))
            .GroupBy(f => f.MediaItemId)
            .Select(g => new { MediaItemId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.MediaItemId, x => x.Count);
    }

    private static MediaItemDto ToMediaItemDto(MediaItem media, Dictionary<long, int> likeMap)
    {
        var audioPath = !string.IsNullOrWhiteSpace(media.AudioFilePath)
            ? media.AudioFilePath
            : media.FilePath;

        return new MediaItemDto
        {
            MediaItemId = media.MediaItemId,
            OwnerUserId = media.OwnerUserId,
            OwnerDisplayName = media.Owner?.DisplayName ?? media.Owner?.UserName,
            ArtistId = media.ArtistId,
            ArtistName = media.Artist?.Name ?? "Unknown Artist",
            AlbumId = media.AlbumId,
            AlbumTitle = media.Album?.Title,
            Title = media.Title,
            VideoTitle = media.VideoTitle,
            Slug = media.Slug,
            Description = media.Description,
            Lyrics = media.Lyrics,
            MediaType = media.MediaType,
            Genre = media.Genre,
            DurationSeconds = media.DurationSeconds,
            PlayCount = media.PlayCount,
            LikeCount = likeMap.TryGetValue(media.MediaItemId, out var count) ? count : 0,
            FilePath = audioPath ?? string.Empty,
            AudioUrl = audioPath,
            VideoUrl = media.VideoFilePath,
            ThumbnailUrl = media.ThumbnailUrl,
            Visibility = media.Visibility,
            HasVideo = !string.IsNullOrWhiteSpace(media.VideoFilePath),
            CreatedAt = media.CreatedAt
        };
    }
}
