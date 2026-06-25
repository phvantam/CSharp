using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Artist;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class MediaService : IMediaService
{
    private const string DefaultThumbnailUrl = "/image/default-cover.svg";

    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _webRootPath;

    public MediaService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        string webRootPath)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _webRootPath = webRootPath;
    }

    // ==================== PLAY MEDIA ====================
    public async Task<bool> PlayMediaAsync(string userId, long mediaItemId)
    {
        var media = await _context.MediaItems
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId);

        if (media == null)
            return false;

        media.PlayCount += 1;

        var existingHistory = await _context.PlayHistories
            .FirstOrDefaultAsync(h => h.UserId == userId && h.MediaItemId == mediaItemId);

        if (existingHistory != null)
        {
            existingHistory.LastPlayedAt = DateTime.UtcNow;
            existingHistory.ProgressSeconds = 0;
        }
        else
        {
            await _context.PlayHistories.AddAsync(new PlayHistory
            {
                UserId = userId,
                MediaItemId = mediaItemId,
                StartedAt = DateTime.UtcNow,
                LastPlayedAt = DateTime.UtcNow,
                ProgressSeconds = 0
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // ==================== UPLOAD MEDIA ====================
    public async Task<MediaUploadResultDto> UploadMediaAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string userId,
        MediaUploadRequestDto request)
    {
        var artistIds = await ResolveArtistIdsAsync(request.ArtistId, request.Artist, userId);
        var primaryArtistId = artistIds.FirstOrDefault();

        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var mediaTypeFolder = contentType.StartsWith("video", StringComparison.OrdinalIgnoreCase)
            ? "video"
            : "audio";

        var uploadPath = Path.Combine(_webRootPath, "media", mediaTypeFolder);
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        var relativeFilePath = $"/media/{mediaTypeFolder}/{uniqueFileName}";
        var mediaType = contentType.StartsWith("video", StringComparison.OrdinalIgnoreCase)
            ? "Video"
            : "Audio";

        var durationSeconds = GetMediaDurationSeconds(relativeFilePath);

        var mediaItem = new MediaItem
        {
            Title = request.Title,
            VideoTitle = mediaType == "Video" ? request.Title : null,
            Description = request.Description,
            MediaType = mediaType,
            Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre.Trim(),
            FilePath = relativeFilePath,
            AudioFilePath = mediaType == "Audio" ? relativeFilePath : null,
            VideoFilePath = mediaType == "Video" ? relativeFilePath : null,
            ThumbnailUrl = request.ThumbnailUrl,
            OwnerUserId = userId,
            ArtistId = primaryArtistId > 0 ? primaryArtistId : null,
            MimeType = contentType,
            FileSizeBytes = fileStream.Length,
            Visibility = "Public",
            DurationSeconds = durationSeconds,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PlayCount = 0
        };

        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync();

        await AttachMediaArtistsAsync(mediaItem.MediaItemId, artistIds);

        return new MediaUploadResultDto
        {
            MediaItemId = mediaItem.MediaItemId,
            Title = mediaItem.Title,
            MediaType = mediaItem.MediaType,
            FilePath = mediaItem.FilePath
        };
    }

    // ==================== STREAM ====================
    public async Task<Stream> GetMediaStreamAsync(long mediaItemId)
    {
        var media = await _context.MediaItems.FindAsync(mediaItemId);

        if (media == null)
            throw new FileNotFoundException("Không tìm thấy media");

        var relativePath = GetPlayablePath(media);

        if (string.IsNullOrWhiteSpace(relativePath))
            throw new FileNotFoundException("Media chưa có đường dẫn file để phát");

        var fullPath = ToPhysicalPath(relativePath);

        if (!File.Exists(fullPath))
            throw new FileNotFoundException($"Không tìm thấy file media: {fullPath}");

        return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
    }

    // ==================== GET BY ID ====================
    public async Task<MediaItemDto?> GetMediaByIdAsync(long mediaItemId)
    {
        var media = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.MediaArtists)
                .ThenInclude(ma => ma.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId);

        if (media == null)
            return null;

        var likeMap = await GetLikeMapAsync(new List<long> { media.MediaItemId });
        return ToMediaItemDto(media, likeMap);
    }

    // ==================== GET USER MEDIA ====================
    public async Task<List<MediaItemDto>> GetUserMediaAsync(
        string userId,
        int page = 1,
        int pageSize = 20)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : pageSize;

        var mediaList = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.MediaArtists)
                .ThenInclude(ma => ma.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m => m.OwnerUserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(mediaList.Select(m => m.MediaItemId).ToList());
        return mediaList.Select(m => ToMediaItemDto(m, likeMap)).ToList();
    }

    // ==================== SEARCH ====================
    public async Task<List<MediaSearchResultDto>> SearchMediaAsync(
        string keyword,
        int page = 1,
        int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return new List<MediaSearchResultDto>();

        keyword = keyword.Trim();
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : pageSize;

        var mediaList = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.MediaArtists)
                .ThenInclude(ma => ma.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m =>
                m.Visibility == "Public" &&
                (
                    m.Title.Contains(keyword) ||
                    (m.VideoTitle != null && m.VideoTitle.Contains(keyword)) ||
                    (m.Genre != null && m.Genre.Contains(keyword)) ||
                    (m.Artist != null && m.Artist.Name.Contains(keyword)) ||
                    m.MediaArtists.Any(ma => ma.Artist.Name.Contains(keyword)) ||
                    (m.Album != null && m.Album.Title.Contains(keyword)) ||
                    (m.Owner != null && m.Owner.DisplayName != null && m.Owner.DisplayName.Contains(keyword))
                ))
            .OrderByDescending(m => m.PlayCount)
            .ThenByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(mediaList.Select(m => m.MediaItemId).ToList());
        return mediaList.Select(m => ToSearchDto(m, likeMap)).ToList();
    }

    // ==================== TRENDING ====================
    public async Task<List<MediaItemDto>> GetTrendingMediaAsync(int limit = 100)
    {
        limit = limit <= 0 ? 100 : limit;

        var trending = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.MediaArtists)
                .ThenInclude(ma => ma.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m => m.Visibility == "Public")
            .OrderByDescending(m => m.PlayCount)
            .ThenByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(trending.Select(m => m.MediaItemId).ToList());
        return trending.Select(m => ToMediaItemDto(m, likeMap)).ToList();
    }

    // ==================== NEW RELEASES ====================
    public async Task<List<MediaItemDto>> GetNewReleasesAsync(int limit = 6)
    {
        limit = limit <= 0 ? 6 : limit;

        var newReleases = await _context.MediaItems
            .AsNoTracking()
            .Include(m => m.Artist)
            .Include(m => m.MediaArtists)
                .ThenInclude(ma => ma.Artist)
            .Include(m => m.Album)
            .Include(m => m.Owner)
            .Where(m => m.Visibility == "Public")
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(newReleases.Select(m => m.MediaItemId).ToList());
        return newReleases.Select(m => ToMediaItemDto(m, likeMap)).ToList();
    }

    // ==================== FAVORITE ====================
    public async Task<bool> AddToFavoriteAsync(string userId, long mediaItemId)
    {
        var exists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.MediaItemId == mediaItemId);

        if (exists)
            return false;

        await _context.Favorites.AddAsync(new Favorite
        {
            UserId = userId,
            MediaItemId = mediaItemId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveFromFavoriteAsync(string userId, long mediaItemId)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.MediaItemId == mediaItemId);

        if (favorite == null)
            return false;

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<MediaItemDto>> GetUserFavoritesAsync(string userId)
    {
        var mediaList = await _context.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .Include(f => f.MediaItem)
                .ThenInclude(m => m.Artist)
            .Include(f => f.MediaItem)
                .ThenInclude(m => m.MediaArtists)
                    .ThenInclude(ma => ma.Artist)
            .Include(f => f.MediaItem)
                .ThenInclude(m => m.Album)
            .Include(f => f.MediaItem)
                .ThenInclude(m => m.Owner)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.MediaItem)
            .ToListAsync();

        var likeMap = await GetLikeMapAsync(mediaList.Select(m => m.MediaItemId).ToList());
        return mediaList.Select(m => ToMediaItemDto(m, likeMap)).ToList();
    }

    // ==================== PLAY HISTORY ====================
    public async Task<List<MediaItemDto>> GetPlayHistoryAsync(string userId, int limit = 20)
    {
        limit = limit <= 0 ? 20 : limit;

        var history = await _context.PlayHistories
            .AsNoTracking()
            .Where(h => h.UserId == userId)
            .Include(h => h.MediaItem)
                .ThenInclude(m => m.Artist)
            .Include(h => h.MediaItem)
                .ThenInclude(m => m.MediaArtists)
                    .ThenInclude(ma => ma.Artist)
            .Include(h => h.MediaItem)
                .ThenInclude(m => m.Album)
            .Include(h => h.MediaItem)
                .ThenInclude(m => m.Owner)
            .OrderByDescending(h => h.LastPlayedAt)
            .Take(limit)
            .ToListAsync();

        var mediaList = history
            .Where(h => h.MediaItem != null)
            .Select(h => h.MediaItem!)
            .ToList();

        var likeMap = await GetLikeMapAsync(mediaList.Select(m => m.MediaItemId).ToList());
        return mediaList.Select(m => ToMediaItemDto(m, likeMap)).ToList();
    }

    // ==================== DELETE ====================
    public async Task<bool> DeleteMediaAsync(string userId, long mediaItemId)
    {
        var media = await _context.MediaItems
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId && m.OwnerUserId == userId);

        if (media == null)
            return false;

        var playlistTracks = await _context.PlaylistTracks
            .Where(x => x.MediaItemId == mediaItemId)
            .ToListAsync();

        if (playlistTracks.Count > 0)
            _context.PlaylistTracks.RemoveRange(playlistTracks);

        var favorites = await _context.Favorites
            .Where(x => x.MediaItemId == mediaItemId)
            .ToListAsync();

        if (favorites.Count > 0)
            _context.Favorites.RemoveRange(favorites);

        var playHistories = await _context.PlayHistories
            .Where(x => x.MediaItemId == mediaItemId)
            .ToListAsync();

        if (playHistories.Count > 0)
            _context.PlayHistories.RemoveRange(playHistories);

        var shares = await _context.MediaShares
            .Where(x => x.MediaItemId == mediaItemId)
            .ToListAsync();

        if (shares.Count > 0)
            _context.MediaShares.RemoveRange(shares);

        var mediaArtists = await _context.MediaArtists
            .Where(x => x.MediaItemId == mediaItemId)
            .ToListAsync();

        if (mediaArtists.Count > 0)
            _context.MediaArtists.RemoveRange(mediaArtists);

        _context.MediaItems.Remove(media);
        await _context.SaveChangesAsync();

        TryDeletePhysicalFile(media.AudioFilePath);
        TryDeletePhysicalFile(media.VideoFilePath);

        if (!string.Equals(media.ThumbnailUrl, DefaultThumbnailUrl, StringComparison.OrdinalIgnoreCase))
            TryDeletePhysicalFile(media.ThumbnailUrl);

        return true;
    }

    // ==================== ARTIST SEARCH ====================
    public async Task<List<ArtistDto>> SearchArtistsAsync(string keyword, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return new List<ArtistDto>();

        limit = limit <= 0 ? 10 : limit;

        var artists = await _context.Artists
            .AsNoTracking()
            .Where(a => a.Name.Contains(keyword))
            .OrderBy(a => a.Name)
            .Take(limit)
            .ToListAsync();

        return artists.Select(a => new ArtistDto
        {
            ArtistId = a.ArtistId,
            Name = a.Name,
            Bio = a.Bio,
            AvatarUrl = a.AvatarUrl
        }).ToList();
    }

    // ==================== UPDATE ====================
    public async Task<bool> UpdateMediaAsync(long mediaItemId, string userId, UpdateMediaRequest request)
    {
        var media = await _context.MediaItems
            .Include(m => m.MediaArtists)
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId && m.OwnerUserId == userId);

        if (media == null)
            return false;

        if (!string.IsNullOrWhiteSpace(request.Title))
            media.Title = request.Title.Trim();

        if (request.Description != null)
            media.Description = request.Description;

        if (request.Genre != null)
            media.Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre.Trim();

        if (request.Lyrics != null)
            media.Lyrics = string.IsNullOrWhiteSpace(request.Lyrics) ? null : request.Lyrics.Trim();

        if (!string.IsNullOrWhiteSpace(request.Artist))
        {
            var artistIds = await ResolveArtistIdsAsync(null, request.Artist, userId);
            var primaryArtistId = artistIds.FirstOrDefault();

            media.ArtistId = primaryArtistId > 0 ? primaryArtistId : null;

            var oldLinks = await _context.MediaArtists
                .Where(x => x.MediaItemId == media.MediaItemId)
                .ToListAsync();

            if (oldLinks.Count > 0)
                _context.MediaArtists.RemoveRange(oldLinks);

            await _context.SaveChangesAsync();
            await AttachMediaArtistsAsync(media.MediaItemId, artistIds);
        }

        if (request.ThumbnailFile != null && request.ThumbnailFile.Length > 0)
        {
            if (!request.ThumbnailFile.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Ảnh bìa không hợp lệ.");

            var oldThumbnailUrl = media.ThumbnailUrl;

            using var thumbnailStream = request.ThumbnailFile.OpenReadStream();
            media.ThumbnailUrl = await SaveFileAsync(
                thumbnailStream,
                request.ThumbnailFile.FileName,
                "image"
            );

            if (!string.IsNullOrWhiteSpace(oldThumbnailUrl) &&
                !string.Equals(oldThumbnailUrl, DefaultThumbnailUrl, StringComparison.OrdinalIgnoreCase))
            {
                TryDeletePhysicalFile(oldThumbnailUrl);
            }
        }

        if (request.IsPublic.HasValue)
        {
            media.Visibility = request.IsPublic.Value ? "Public" : "Private";
        }
        else if (!string.IsNullOrWhiteSpace(request.Visibility))
        {
            media.Visibility = request.Visibility == "Public" ? "Public" : "Private";
        }

        media.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    // ==================== MULTI MEDIA UPLOAD ====================
    public async Task<MultiMediaUploadResultDto> UploadMultiMediaAsync(
        string userId,
        MultiMediaUploadRequestDto request,
        Stream? audioStream,
        string? audioFileName,
        Stream? videoStream,
        string? videoFileName,
        Stream? thumbnailStream,
        string? thumbnailFileName)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User không hợp lệ.");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ArgumentException("Tên media không được để trống.");

        if (audioStream == null && videoStream == null)
            throw new ArgumentException("Vui lòng chọn ít nhất 1 file Audio hoặc Video.");

        var artistIds = await ResolveArtistIdsAsync(request.ArtistId, request.Artist, userId);
        var primaryArtistId = artistIds.FirstOrDefault();

        var thumbnailUrl =
            thumbnailStream != null && !string.IsNullOrWhiteSpace(thumbnailFileName)
                ? await SaveFileAsync(thumbnailStream, thumbnailFileName, "image")
                : DefaultThumbnailUrl;

        string? audioPath = null;
        string? videoPath = null;

        if (audioStream != null && !string.IsNullOrWhiteSpace(audioFileName))
            audioPath = await SaveFileAsync(audioStream, audioFileName, "audio");

        if (videoStream != null && !string.IsNullOrWhiteSpace(videoFileName))
            videoPath = await SaveFileAsync(videoStream, videoFileName, "video");

        // Ưu tiên lấy thời lượng từ audio vì audio là file phát chính.
        // Nếu chỉ upload video thì lấy thời lượng từ video.
        var audioDurationSeconds = GetMediaDurationSeconds(audioPath);
        var durationSeconds = audioDurationSeconds > 0
            ? audioDurationSeconds
            : GetMediaDurationSeconds(videoPath);

        var mediaItem = new MediaItem
        {
            Title = request.Title.Trim(),
            VideoTitle = !string.IsNullOrWhiteSpace(request.VideoTitle)
                ? request.VideoTitle.Trim()
                : request.Title.Trim(),
            Description = request.Description,
            MediaType = audioPath != null ? "Audio" : "Video",
            Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre.Trim(),
            FilePath = audioPath ?? videoPath ?? string.Empty,
            AudioFilePath = audioPath,
            VideoFilePath = videoPath,
            ThumbnailUrl = thumbnailUrl,
            OwnerUserId = userId,
            ArtistId = primaryArtistId > 0 ? primaryArtistId : null,
            Visibility = "Public",
            DurationSeconds = durationSeconds,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PlayCount = 0
        };

        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync();

        // Lưu danh sách nhiều nghệ sĩ vào bảng MediaArtists.
        // Nếu không có dòng này, bảng MediaArtists sẽ rỗng và frontend chỉ fallback về ArtistId chính.
        await AttachMediaArtistsAsync(mediaItem.MediaItemId, artistIds);

        return new MultiMediaUploadResultDto
        {
            AudioMediaItemId = mediaItem.MediaItemId,
            VideoMediaItemId = mediaItem.MediaItemId,
            Title = mediaItem.Title,
            ThumbnailUrl = thumbnailUrl
        };
    }


    // ==================== RECALCULATE DURATION ====================
    public async Task<int> RecalculateMissingDurationsAsync()
    {
        var mediaList = await _context.MediaItems
            .Where(m => m.DurationSeconds <= 0)
            .ToListAsync();

        var updatedCount = 0;

        foreach (var media in mediaList)
        {
            var durationSeconds = GetBestMediaDurationSeconds(media);

            if (durationSeconds <= 0)
                continue;

            media.DurationSeconds = durationSeconds;
            media.UpdatedAt = DateTime.UtcNow;
            updatedCount++;
        }

        if (updatedCount > 0)
            await _context.SaveChangesAsync();

        return updatedCount;
    }

    private void TryDeletePhysicalFile(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return;

        if (!relativePath.StartsWith("/media/", StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            var fullPath = ToPhysicalPath(relativePath);

            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
        catch
        {
            // Không chặn thao tác chính nếu xóa file vật lý thất bại.
        }
    }

    private async Task<string> SaveFileAsync(Stream stream, string fileName, string folderType)
    {
        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var uploadPath = Path.Combine(_webRootPath, "media", folderType);

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await stream.CopyToAsync(fileStream);
        }

        return $"/media/{folderType}/{uniqueFileName}";
    }


    private int GetBestMediaDurationSeconds(MediaItem media)
    {
        var candidates = new[]
        {
            media.AudioFilePath,
            media.VideoFilePath,
            media.FilePath
        };

        foreach (var path in candidates)
        {
            var durationSeconds = GetMediaDurationSeconds(path);

            if (durationSeconds > 0)
                return durationSeconds;
        }

        return 0;
    }

    private int GetMediaDurationSeconds(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return 0;

        try
        {
            var fullPath = ToPhysicalPath(relativePath);

            if (!File.Exists(fullPath))
                return 0;

            using var file = TagLib.File.Create(fullPath);
            var seconds = file.Properties.Duration.TotalSeconds;

            if (seconds <= 0)
                return 0;

            return (int)Math.Round(seconds);
        }
        catch
        {
            return 0;
        }
    }

    private string ToPhysicalPath(string relativePath)
    {
        return Path.Combine(
            _webRootPath,
            relativePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
        );
    }

    private async Task<List<int>> ResolveArtistIdsAsync(int? artistId, string? artistNames, string userId)
    {
        var artistIds = new List<int>();

        if (artistId.HasValue && artistId.Value > 0)
        {
            var exists = await _context.Artists
                .AnyAsync(a => a.ArtistId == artistId.Value);

            if (exists)
                artistIds.Add(artistId.Value);
        }

        foreach (var artistName in SplitArtistNames(artistNames))
        {
            var resolvedId = await ResolveArtistIdAsync(null, artistName, userId);

            if (resolvedId.HasValue && resolvedId.Value > 0 && !artistIds.Contains(resolvedId.Value))
                artistIds.Add(resolvedId.Value);
        }

        return artistIds;
    }

    private static List<string> SplitArtistNames(string? artistNames)
    {
        if (string.IsNullOrWhiteSpace(artistNames))
            return new List<string>();

        var normalized = artistNames.Trim();

        // Tách các dạng thường gặp:
        // A, B, C
        // A x B
        // A ft. B
        // A feat. B
        // A & B
        var parts = Regex
            .Split(
                normalized,
                @"\s*(?:,|;|&|\s+x\s+|\s+X\s+|\s+ft\.?\s+|\s+feat\.?\s+|\s+featuring\s+)\s*",
                RegexOptions.IgnoreCase
            )
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return parts;
    }

    private async Task AttachMediaArtistsAsync(long mediaItemId, List<int> artistIds)
    {
        var distinctArtistIds = artistIds
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (distinctArtistIds.Count == 0)
            return;

        var existingArtistIds = await _context.MediaArtists
            .Where(x => x.MediaItemId == mediaItemId)
            .Select(x => x.ArtistId)
            .ToListAsync();

        var position = existingArtistIds.Count;

        foreach (var artistId in distinctArtistIds)
        {
            if (existingArtistIds.Contains(artistId))
                continue;

            _context.MediaArtists.Add(new MediaArtist
            {
                MediaItemId = mediaItemId,
                ArtistId = artistId,
                Role = position == 0 ? "Primary" : "Featured",
                Position = position,
                CreatedAt = DateTime.UtcNow
            });

            position++;
        }

        await _context.SaveChangesAsync();
    }

    private async Task<int?> ResolveArtistIdAsync(int? artistId, string? artistName, string userId)
    {
        if (artistId.HasValue && artistId.Value > 0)
            return artistId.Value;

        if (string.IsNullOrWhiteSpace(artistName))
            return null;

        var name = artistName.Trim();
        var slug = SlugHelper.GenerateSlug(name);

        if (string.IsNullOrWhiteSpace(slug))
            slug = $"artist-{Guid.NewGuid():N}";

        var existingArtist = await _context.Artists
            .FirstOrDefaultAsync(a => a.Slug == slug || a.Name == name);

        if (existingArtist != null)
            return existingArtist.ArtistId;

        var newArtist = new Artist
        {
            Name = name,
            Slug = slug,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Artists.Add(newArtist);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            _context.ArtistManagers.Add(new ArtistManager
            {
                ArtistId = newArtist.ArtistId,
                UserId = userId,
                Role = "Owner",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        return newArtist.ArtistId;
    }

    private static string? GetPlayablePath(MediaItem media)
    {
        if (!string.IsNullOrWhiteSpace(media.AudioFilePath))
            return media.AudioFilePath;

        if (!string.IsNullOrWhiteSpace(media.VideoFilePath))
            return media.VideoFilePath;

        if (!string.IsNullOrWhiteSpace(media.FilePath))
            return media.FilePath;

        return null;
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

        var artists = BuildArtistDtos(media);
        var firstArtist = artists.FirstOrDefault();

        return new MediaItemDto
        {
            MediaItemId = media.MediaItemId,
            OwnerUserId = media.OwnerUserId,
            OwnerDisplayName = media.Owner?.DisplayName ?? media.Owner?.UserName,
            ArtistId = firstArtist?.ArtistId ?? media.ArtistId,
            ArtistName = artists.Count > 0
                ? string.Join(", ", artists.Select(a => a.Name))
                : media.Artist?.Name ?? "Unknown Artist",
            Artists = artists,
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

    private static MediaSearchResultDto ToSearchDto(MediaItem media, Dictionary<long, int> likeMap)
    {
        var audioPath = !string.IsNullOrWhiteSpace(media.AudioFilePath)
            ? media.AudioFilePath
            : media.FilePath;

        var artists = BuildArtistDtos(media);
        var firstArtist = artists.FirstOrDefault();

        return new MediaSearchResultDto
        {
            MediaItemId = media.MediaItemId,
            OwnerUserId = media.OwnerUserId,
            OwnerDisplayName = media.Owner?.DisplayName ?? media.Owner?.UserName,
            ArtistId = firstArtist?.ArtistId ?? media.ArtistId,
            ArtistName = artists.Count > 0
                ? string.Join(", ", artists.Select(a => a.Name))
                : media.Artist?.Name ?? "Unknown Artist",
            Artists = artists,
            AlbumId = media.AlbumId,
            AlbumTitle = media.Album?.Title,
            Title = media.Title,
            VideoTitle = media.VideoTitle,
            MediaType = media.MediaType,
            Genre = media.Genre,
            DurationSeconds = media.DurationSeconds,
            PlayCount = media.PlayCount,
            LikeCount = likeMap.TryGetValue(media.MediaItemId, out var count) ? count : 0,
            ThumbnailUrl = media.ThumbnailUrl,
            FilePath = audioPath ?? string.Empty,
            AudioUrl = audioPath,
            VideoUrl = media.VideoFilePath,
            AudioFilePath = media.AudioFilePath ?? media.FilePath,
            VideoFilePath = media.VideoFilePath,
            HasVideo = !string.IsNullOrWhiteSpace(media.VideoFilePath)
        };
    }

    private static List<MediaArtistDto> BuildArtistDtos(MediaItem media)
    {
        var artists = media.MediaArtists?
            .Where(x => x.Artist != null)
            .OrderBy(x => x.Position)
            .Select(x => new MediaArtistDto
            {
                ArtistId = x.ArtistId,
                Name = x.Artist.Name,
                Slug = x.Artist.Slug,
                AvatarUrl = x.Artist.AvatarUrl,
                Role = x.Role,
                Position = x.Position
            })
            .ToList() ?? new List<MediaArtistDto>();

        if (artists.Count == 0 && media.Artist != null)
        {
            artists.Add(new MediaArtistDto
            {
                ArtistId = media.Artist.ArtistId,
                Name = media.Artist.Name,
                Slug = media.Artist.Slug,
                AvatarUrl = media.Artist.AvatarUrl,
                Role = "Primary",
                Position = 0
            });
        }

        return artists;
    }
}