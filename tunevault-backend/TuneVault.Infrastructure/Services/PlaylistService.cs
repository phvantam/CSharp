using Microsoft.EntityFrameworkCore;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class PlaylistService : IPlaylistService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public PlaylistService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<long> CreatePlaylistAsync(string userId, CreatePlaylistRequest request)
    {
        var playlist = new Playlist
        {
            OwnerUserId = userId,
            Title = request.Name,
            Description = request.Description,
            Visibility = request.Visibility,
            CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl)
                ? null
                : request.CoverImageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Playlists.AddAsync(playlist);
        await _unitOfWork.CompleteAsync();

        return playlist.PlaylistId;
    }

    public async Task<PlaylistDetailDto?> GetPlaylistDetailAsync(long playlistId)
    {
        var playlist = await _context.Playlists
            .Include(p => p.Owner)
            .Include(p => p.PlaylistTracks)
                .ThenInclude(pt => pt.MediaItem)
                    .ThenInclude(m => m.Artist)
            .FirstOrDefaultAsync(p => p.PlaylistId == playlistId);

        if (playlist == null) return null;

        return new PlaylistDetailDto
        {
            PlaylistId = playlist.PlaylistId,
            Name = playlist.Title,
            Description = playlist.Description,
            Visibility = playlist.Visibility,
            OwnerName = playlist.Owner?.DisplayName ?? playlist.Owner?.UserName ?? "Unknown",
            TrackCount = playlist.PlaylistTracks.Count,
            CoverImageUrl = playlist.CoverImageUrl,
            Tracks = playlist.PlaylistTracks
                .OrderBy(pt => pt.Position)
                .Select(pt =>
                {
                    var media = pt.MediaItem;
                    var audioPath = !string.IsNullOrWhiteSpace(media.AudioFilePath)
                        ? media.AudioFilePath
                        : media.FilePath;

                    return new MediaItemDto
                    {
                        MediaItemId = media.MediaItemId,
                        ArtistId = media.ArtistId,
                        Title = media.Title,
                        ArtistName = media.Artist?.Name ?? "Unknown Artist",
                        MediaType = media.MediaType,
                        FilePath = audioPath ?? string.Empty,
                        AudioUrl = audioPath,
                        VideoUrl = media.VideoFilePath,
                        ThumbnailUrl = media.ThumbnailUrl,
                        DurationSeconds = media.DurationSeconds,
                        PlayCount = media.PlayCount,
                        Visibility = media.Visibility,
                        HasVideo = !string.IsNullOrWhiteSpace(media.VideoFilePath),
                        CreatedAt = media.CreatedAt
                    };
                })
                .ToList()
        };
    }

    public async Task<List<PlaylistSummaryDto>> GetUserPlaylistsAsync(string userId)
    {
        var playlists = await _context.Playlists
            .Where(p => p.OwnerUserId == userId)
            .Include(p => p.PlaylistTracks)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return playlists.Select(p => new PlaylistSummaryDto
        {
            PlaylistId = p.PlaylistId,
            Name = p.Title,
            Description = p.Description,
            Visibility = p.Visibility,
            TrackCount = p.PlaylistTracks.Count,
            CreatedAt = p.CreatedAt,
            CoverImageUrl = p.CoverImageUrl
        }).ToList();
    }


    public async Task<List<PlaylistSummaryDto>> GetPublicPlaylistsByUserAsync(string userId)
    {
        var playlists = await _context.Playlists
            .Where(p => p.OwnerUserId == userId && p.Visibility == "Public")
            .Include(p => p.PlaylistTracks)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return playlists.Select(p => new PlaylistSummaryDto
        {
            PlaylistId = p.PlaylistId,
            Name = p.Title,
            Description = p.Description,
            Visibility = p.Visibility,
            TrackCount = p.PlaylistTracks.Count,
            CreatedAt = p.CreatedAt,
            CoverImageUrl = p.CoverImageUrl
        }).ToList();
    }

    // ==================== THÊM BÀI HÁT VÀO PLAYLIST ====================
    public async Task<bool> AddSongToPlaylistAsync(long playlistId, string userId, long mediaItemId)
    {
        var playlist = await _context.Playlists
            .FirstOrDefaultAsync(p => p.PlaylistId == playlistId && p.OwnerUserId == userId);

        if (playlist == null) return false;

        var mediaExists = await _context.MediaItems
            .AnyAsync(m => m.MediaItemId == mediaItemId);

        if (!mediaExists) return false;

        var exists = await _context.PlaylistTracks
            .AnyAsync(pt => pt.PlaylistId == playlistId && pt.MediaItemId == mediaItemId);

        if (exists) return false;

        var maxPosition = await _context.PlaylistTracks
            .Where(pt => pt.PlaylistId == playlistId)
            .MaxAsync(pt => (int?)pt.Position) ?? 0;

        var playlistTrack = new PlaylistTrack
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId,
            AddedByUserId = userId,
            Position = maxPosition + 1,
            AddedAt = DateTime.UtcNow
        };

        await _unitOfWork.PlaylistTracks.AddAsync(playlistTrack);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    // ==================== XÓA BÀI HÁT KHỎI PLAYLIST ====================
    public async Task<bool> RemoveSongFromPlaylistAsync(long playlistId, string userId, long mediaItemId)
    {
        var playlist = await _context.Playlists
            .FirstOrDefaultAsync(p => p.PlaylistId == playlistId && p.OwnerUserId == userId);

        if (playlist == null) return false;

        var playlistTrack = await _context.PlaylistTracks
            .FirstOrDefaultAsync(pt => pt.PlaylistId == playlistId && pt.MediaItemId == mediaItemId);

        if (playlistTrack == null) return false;

        _context.PlaylistTracks.Remove(playlistTrack);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    // ==================== CẬP NHẬT PLAYLIST ====================
    public async Task<bool> UpdatePlaylistAsync(long playlistId, string userId, UpdatePlaylistRequestDto request)
    {
        var playlist = await _context.Playlists
            .FirstOrDefaultAsync(p => p.PlaylistId == playlistId && p.OwnerUserId == userId);

        if (playlist == null) return false;

        if (!string.IsNullOrWhiteSpace(request.Name))
            playlist.Title = request.Name;

        if (request.Description != null)
            playlist.Description = request.Description;

        if (!string.IsNullOrWhiteSpace(request.Visibility))
            playlist.Visibility = request.Visibility;

        if (!string.IsNullOrWhiteSpace(request.CoverImageUrl))
            playlist.CoverImageUrl = request.CoverImageUrl;

        playlist.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();
        return true;
    }

    // ==================== XÓA PLAYLIST ====================
    public async Task<bool> DeletePlaylistAsync(long playlistId, string userId)
    {
        var playlist = await _context.Playlists
            .Include(p => p.PlaylistTracks)
            .FirstOrDefaultAsync(p => p.PlaylistId == playlistId && p.OwnerUserId == userId);

        if (playlist == null) return false;

        _context.PlaylistTracks.RemoveRange(playlist.PlaylistTracks);
        _context.Playlists.Remove(playlist);

        await _unitOfWork.CompleteAsync();

        return true;
    }

    // ==================== GET POPULAR PLAYLISTS ====================
    public async Task<List<PlaylistSummaryDto>> GetPopularPlaylistsAsync(int limit = 12)
    {
        var popularPlaylists = await _context.Playlists
            .Where(p => p.Visibility == "Public")
            .Include(p => p.PlaylistTracks)
            .OrderByDescending(p => p.PlaylistTracks.Count)
            .Take(limit)
            .ToListAsync();

        return popularPlaylists.Select(p => new PlaylistSummaryDto
        {
            PlaylistId = p.PlaylistId,
            Name = p.Title,
            Description = p.Description,
            Visibility = p.Visibility,
            TrackCount = p.PlaylistTracks.Count,
            CreatedAt = p.CreatedAt,
            CoverImageUrl = p.CoverImageUrl
        }).ToList();
    }
}
