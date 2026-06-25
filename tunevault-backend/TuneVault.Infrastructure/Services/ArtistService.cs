using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Artist;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class ArtistService : IArtistService
{
    private static readonly string[] ValidManagerRoles = { "Owner", "Editor", "Viewer" };

    private readonly ApplicationDbContext _context;
    private readonly string _webRootPath;

    public ArtistService(ApplicationDbContext context, string webRootPath)
    {
        _context = context;
        _webRootPath = webRootPath;
    }

    public async Task<ArtistDetailDto?> GetArtistDetailAsync(
        int artistId,
        string? currentUserId = null,
        bool isAdmin = false)
    {
        var artist = await _context.Artists
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.ArtistId == artistId);

        if (artist == null)
            return null;

        var songs = await GetArtistSongsAsync(artistId, 10);
        var albums = await GetArtistAlbumsAsync(artistId);

        var followerCount = await _context.Follows
            .AsNoTracking()
            .CountAsync(f => f.TargetArtistId == artistId);

        var songStats = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.ArtistId == artistId && m.Visibility == "Public")
            .Select(m => new { m.MediaItemId, m.PlayCount })
            .ToListAsync();

        var myRole = await GetMyArtistRoleAsync(artistId, currentUserId);
        var canEdit = isAdmin || myRole is "Owner" or "Editor";
        var canManageManagers = isAdmin || myRole == "Owner";

        var isFollowing = !string.IsNullOrWhiteSpace(currentUserId) &&
            await _context.Follows
                .AsNoTracking()
                .AnyAsync(f => f.FollowerUserId == currentUserId && f.TargetArtistId == artistId);

        return new ArtistDetailDto
        {
            ArtistId = artist.ArtistId,
            Name = artist.Name,
            Slug = artist.Slug,
            Bio = artist.Bio,
            AvatarUrl = artist.AvatarUrl,
            ImageUrl = artist.ImageUrl,
            Country = artist.Country,
            IsVerified = artist.IsVerified,
            FollowerCount = followerCount,
            SongCount = songStats.Count,
            AlbumCount = albums.Count,
            TotalPlayCount = songStats.Sum(s => (long)s.PlayCount),
            CanEdit = canEdit,
            CanManageManagers = canManageManagers,
            MyArtistRole = isAdmin ? "Admin" : myRole,
            IsFollowing = isFollowing,
            TopSongs = songs,
            Albums = albums
        };
    }

    public async Task<List<MediaItemDto>> GetArtistSongsAsync(int artistId, int limit = 50)
    {
        limit = limit <= 0 ? 50 : limit;

        var songs = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m => m.ArtistId == artistId && m.Visibility == "Public")
            .OrderByDescending(m => m.PlayCount)
            .ThenByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(songs.Select(s => s.MediaItemId).ToList());
        return songs.Select(s => ToMediaItemDto(s, likeMap)).ToList();
    }

    public async Task<List<AlbumDto>> GetArtistAlbumsAsync(int artistId)
    {
        var albums = await _context.Albums
            .AsNoTracking()
            .Include(a => a.Artist)
            .Where(a => a.ArtistId == artistId)
            .OrderByDescending(a => a.ReleaseDate)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        var albumIds = albums.Select(a => a.AlbumId).ToList();

        var mediaStats = await _context.MediaItems
            .AsNoTracking()
            .Where(m => m.AlbumId != null && albumIds.Contains(m.AlbumId.Value) && m.Visibility == "Public")
            .GroupBy(m => m.AlbumId!.Value)
            .Select(g => new
            {
                AlbumId = g.Key,
                TrackCount = g.Count(),
                TotalPlayCount = g.Sum(x => (long)x.PlayCount),
                MediaIds = g.Select(x => x.MediaItemId).ToList()
            })
            .ToListAsync();

        var allMediaIds = mediaStats.SelectMany(s => s.MediaIds).ToList();
        var likeMap = await GetLikeMapAsync(allMediaIds);

        var albumCoverRows = await _context.MediaItems
            .AsNoTracking()
            .Where(m =>
                m.AlbumId != null &&
                albumIds.Contains(m.AlbumId.Value) &&
                !string.IsNullOrWhiteSpace(m.ThumbnailUrl))
            .OrderByDescending(m => m.PlayCount)
            .ThenByDescending(m => m.CreatedAt)
            .Select(m => new
            {
                AlbumId = m.AlbumId!.Value,
                m.ThumbnailUrl
            })
            .ToListAsync();

        var albumCoverMap = albumCoverRows
            .GroupBy(x => x.AlbumId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.ThumbnailUrl).FirstOrDefault()
            );

        return albums
            .Select(album =>
            {
                var stat = mediaStats.FirstOrDefault(s => s.AlbumId == album.AlbumId);
                var totalLikes = stat?.MediaIds.Sum(id => likeMap.TryGetValue(id, out var count) ? count : 0) ?? 0;

                return new AlbumDto
                {
                    AlbumId = album.AlbumId,
                    ArtistId = album.ArtistId,
                    ArtistName = album.Artist?.Name ?? "Unknown Artist",
                    Title = album.Title,
                    Description = album.Description,
                    CoverImageUrl = albumCoverMap.TryGetValue(album.AlbumId, out var fallbackCover) &&
                        !string.IsNullOrWhiteSpace(fallbackCover)
                            ? fallbackCover
                            : album.CoverImageUrl,
                    ReleaseDate = album.ReleaseDate,
                    AlbumType = album.AlbumType,
                    TrackCount = stat?.TrackCount ?? 0,
                    TotalPlayCount = stat?.TotalPlayCount ?? 0,
                    TotalLikeCount = totalLikes
                };
            })
            .Where(a => a.TrackCount > 0)
            .ToList();
    }

    public async Task<ArtistDetailDto?> UpdateArtistAsync(
        int artistId,
        string userId,
        bool isAdmin,
        UpdateArtistRequestDto request)
    {
        if (!await CanEditArtistAsync(artistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Bạn không có quyền sửa nghệ sĩ này.");

        var artist = await _context.Artists.FirstOrDefaultAsync(a => a.ArtistId == artistId);

        if (artist == null)
            return null;

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            artist.Name = request.Name.Trim();
            artist.Slug = SlugHelper.GenerateSlug(artist.Name);

            if (string.IsNullOrWhiteSpace(artist.Slug))
                artist.Slug = $"artist-{artist.ArtistId}";
        }

        if (request.Bio != null)
            artist.Bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim();

        if (request.Country != null)
            artist.Country = string.IsNullOrWhiteSpace(request.Country) ? null : request.Country.Trim();

        if (request.AvatarFile != null && request.AvatarFile.Length > 0)
            artist.AvatarUrl = await SaveImageAsync(request.AvatarFile, "artist-avatar");

        if (request.ImageFile != null && request.ImageFile.Length > 0)
            artist.ImageUrl = await SaveImageAsync(request.ImageFile, "artist-cover");

        artist.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetArtistDetailAsync(artistId, userId, isAdmin);
    }

    public async Task<List<ArtistManagerDto>> GetArtistManagersAsync(
        int artistId,
        string userId,
        bool isAdmin)
    {
        if (!await CanManageManagersAsync(artistId, userId, isAdmin))
            throw new UnauthorizedAccessException("Chỉ Owner hoặc Admin mới được xem danh sách quản lý nghệ sĩ.");

        return await _context.ArtistManagers
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.ArtistId == artistId)
            .OrderBy(x => x.Role == "Owner" ? 0 : x.Role == "Editor" ? 1 : 2)
            .ThenBy(x => x.User.DisplayName)
            .Select(x => new ArtistManagerDto
            {
                ArtistManagerId = x.ArtistManagerId,
                ArtistId = x.ArtistId,
                UserId = x.UserId,
                DisplayName = x.User.DisplayName ?? x.User.UserName,
                Email = x.User.Email,
                Role = x.Role,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ArtistManagerDto> AddArtistManagerAsync(
        int artistId,
        string currentUserId,
        bool isAdmin,
        AddArtistManagerRequestDto request)
    {
        if (!await CanManageManagersAsync(artistId, currentUserId, isAdmin))
            throw new UnauthorizedAccessException("Chỉ Owner hoặc Admin mới được thêm người quản lý nghệ sĩ.");

        var role = NormalizeRole(request.Role);

        if (string.IsNullOrWhiteSpace(request.UserId))
            throw new ArgumentException("UserId không được để trống.");

        var artistExists = await _context.Artists.AnyAsync(a => a.ArtistId == artistId);
        if (!artistExists)
            throw new KeyNotFoundException("Không tìm thấy nghệ sĩ.");

        var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists)
            throw new KeyNotFoundException("Không tìm thấy user cần thêm.");

        var existing = await _context.ArtistManagers
            .FirstOrDefaultAsync(x => x.ArtistId == artistId && x.UserId == request.UserId);

        if (existing != null)
        {
            existing.Role = role;
            await _context.SaveChangesAsync();
            return await GetManagerDtoAsync(existing.ArtistManagerId);
        }

        var manager = new ArtistManager
        {
            ArtistId = artistId,
            UserId = request.UserId,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        _context.ArtistManagers.Add(manager);
        await _context.SaveChangesAsync();

        return await GetManagerDtoAsync(manager.ArtistManagerId);
    }

    public async Task<ArtistManagerDto> UpdateArtistManagerRoleAsync(
        int artistId,
        string targetUserId,
        string currentUserId,
        bool isAdmin,
        UpdateArtistManagerRoleRequestDto request)
    {
        if (!await CanManageManagersAsync(artistId, currentUserId, isAdmin))
            throw new UnauthorizedAccessException("Chỉ Owner hoặc Admin mới được đổi quyền quản lý nghệ sĩ.");

        var role = NormalizeRole(request.Role);

        var manager = await _context.ArtistManagers
            .FirstOrDefaultAsync(x => x.ArtistId == artistId && x.UserId == targetUserId);

        if (manager == null)
            throw new KeyNotFoundException("Không tìm thấy người quản lý này.");

        if (manager.Role == "Owner" && role != "Owner")
            await EnsureNotLastOwnerAsync(artistId, targetUserId);

        manager.Role = role;
        await _context.SaveChangesAsync();

        return await GetManagerDtoAsync(manager.ArtistManagerId);
    }

    public async Task<bool> RemoveArtistManagerAsync(
        int artistId,
        string targetUserId,
        string currentUserId,
        bool isAdmin)
    {
        if (!await CanManageManagersAsync(artistId, currentUserId, isAdmin))
            throw new UnauthorizedAccessException("Chỉ Owner hoặc Admin mới được xóa người quản lý nghệ sĩ.");

        var manager = await _context.ArtistManagers
            .FirstOrDefaultAsync(x => x.ArtistId == artistId && x.UserId == targetUserId);

        if (manager == null)
            return false;

        if (manager.Role == "Owner")
            await EnsureNotLastOwnerAsync(artistId, targetUserId);

        _context.ArtistManagers.Remove(manager);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> FollowArtistAsync(int artistId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User không hợp lệ.");

        var artistExists = await _context.Artists
            .AsNoTracking()
            .AnyAsync(a => a.ArtistId == artistId);

        if (!artistExists)
            throw new KeyNotFoundException("Không tìm thấy nghệ sĩ.");

        var exists = await _context.Follows.AnyAsync(f =>
            f.FollowerUserId == userId &&
            f.TargetArtistId == artistId);

        if (exists)
            return true;

        _context.Follows.Add(new Follow
        {
            FollowerUserId = userId,
            TargetUserId = null,
            TargetArtistId = artistId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnfollowArtistAsync(int artistId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User không hợp lệ.");

        var follow = await _context.Follows.FirstOrDefaultAsync(f =>
            f.FollowerUserId == userId &&
            f.TargetArtistId == artistId);

        if (follow == null)
            return false;

        _context.Follows.Remove(follow);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<string?> GetMyArtistRoleAsync(int artistId, string? userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return null;

        return await _context.ArtistManagers
            .AsNoTracking()
            .Where(x => x.ArtistId == artistId && x.UserId == userId)
            .Select(x => x.Role)
            .FirstOrDefaultAsync();
    }

    private async Task<bool> CanEditArtistAsync(int artistId, string userId, bool isAdmin)
    {
        if (isAdmin)
            return true;

        return await _context.ArtistManagers.AnyAsync(x =>
            x.ArtistId == artistId &&
            x.UserId == userId &&
            (x.Role == "Owner" || x.Role == "Editor"));
    }

    private async Task<bool> CanManageManagersAsync(int artistId, string userId, bool isAdmin)
    {
        if (isAdmin)
            return true;

        return await _context.ArtistManagers.AnyAsync(x =>
            x.ArtistId == artistId &&
            x.UserId == userId &&
            x.Role == "Owner");
    }

    private static string NormalizeRole(string? role)
    {
        var normalized = string.IsNullOrWhiteSpace(role) ? "Editor" : role.Trim();

        var validRole = ValidManagerRoles
            .FirstOrDefault(x => string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));

        if (validRole == null)
            throw new ArgumentException("Role không hợp lệ. Chỉ dùng Owner, Editor hoặc Viewer.");

        return validRole;
    }

    private async Task EnsureNotLastOwnerAsync(int artistId, string targetUserId)
    {
        var ownerCount = await _context.ArtistManagers
            .CountAsync(x => x.ArtistId == artistId && x.Role == "Owner");

        var targetIsOwner = await _context.ArtistManagers
            .AnyAsync(x => x.ArtistId == artistId && x.UserId == targetUserId && x.Role == "Owner");

        if (targetIsOwner && ownerCount <= 1)
            throw new InvalidOperationException("Artist phải có ít nhất 1 Owner.");
    }

    private async Task<ArtistManagerDto> GetManagerDtoAsync(long artistManagerId)
    {
        return await _context.ArtistManagers
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.ArtistManagerId == artistManagerId)
            .Select(x => new ArtistManagerDto
            {
                ArtistManagerId = x.ArtistManagerId,
                ArtistId = x.ArtistId,
                UserId = x.UserId,
                DisplayName = x.User.DisplayName ?? x.User.UserName,
                Email = x.User.Email,
                Role = x.Role,
                CreatedAt = x.CreatedAt
            })
            .FirstAsync();
    }

    private async Task<string> SaveImageAsync(Microsoft.AspNetCore.Http.IFormFile file, string folderName)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new HashSet<string> { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.");

        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var uploadPath = Path.Combine(_webRootPath, "media", "image", folderName);

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, uniqueFileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/media/image/{folderName}/{uniqueFileName}";
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
