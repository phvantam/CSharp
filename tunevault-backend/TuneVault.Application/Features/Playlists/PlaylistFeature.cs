using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.Playlists;

// --- Create Playlist ---
public record CreatePlaylistCommand(string OwnerUserId, string Title, string? Visibility) : IRequest<ApiResponse>;

public sealed class CreatePlaylistCommandValidator : AbstractValidator<CreatePlaylistCommand>
{
    public CreatePlaylistCommandValidator()
    {
        RuleFor(x => x.OwnerUserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty();
    }
}

public sealed class CreatePlaylistCommandHandler : IRequestHandler<CreatePlaylistCommand, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    public CreatePlaylistCommandHandler(IPlaylistRepository playlistRepository) => _playlistRepository = playlistRepository;

    public async Task<ApiResponse> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = new Playlist
        {
            OwnerUserId = request.OwnerUserId,
            Title = request.Title,
            Visibility = request.Visibility ?? "Private",
            Slug = request.Title.ToLower().Replace(" ", "-").Replace("/", "-"),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var created = await _playlistRepository.CreateAsync(playlist);
        return ApiResponse.Ok(created);
    }
}

// --- Update Playlist ---
public record UpdatePlaylistCommand(long PlaylistId, string OwnerUserId, string? Title, string? Visibility) : IRequest<ApiResponse>;

public sealed class UpdatePlaylistCommandHandler : IRequestHandler<UpdatePlaylistCommand, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    public UpdatePlaylistCommandHandler(IPlaylistRepository playlistRepository) => _playlistRepository = playlistRepository;

    public async Task<ApiResponse> Handle(UpdatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist is null) return ApiResponse.Fail("Playlist not found");
        if (playlist.OwnerUserId != request.OwnerUserId) return ApiResponse.Fail("Forbidden");

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            playlist.Title = request.Title;
            playlist.Slug = request.Title.ToLower().Replace(" ", "-").Replace("/", "-");
        }
        if (!string.IsNullOrWhiteSpace(request.Visibility)) playlist.Visibility = request.Visibility;
        playlist.UpdatedAt = DateTime.UtcNow;

        var updated = await _playlistRepository.UpdateAsync(playlist);
        return ApiResponse.Ok(updated);
    }
}

// --- Delete Playlist ---
public record DeletePlaylistCommand(long PlaylistId, string OwnerUserId) : IRequest<ApiResponse>;

public sealed class DeletePlaylistCommandHandler : IRequestHandler<DeletePlaylistCommand, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    public DeletePlaylistCommandHandler(IPlaylistRepository playlistRepository) => _playlistRepository = playlistRepository;

    public async Task<ApiResponse> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
    {
        var success = await _playlistRepository.DeleteAsync(request.PlaylistId, request.OwnerUserId);
        return success ? ApiResponse.Ok(null) : ApiResponse.Fail("Playlist not found or forbidden");
    }
}

// --- Get Playlist ---
public record GetPlaylistQuery(long PlaylistId) : IRequest<ApiResponse>;

public sealed class GetPlaylistQueryHandler : IRequestHandler<GetPlaylistQuery, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IMediaRepository _mediaRepository;
    private readonly IUserRepository _userRepository;

    public GetPlaylistQueryHandler(IPlaylistRepository playlistRepository, IMediaRepository mediaRepository, IUserRepository userRepository)
    {
        _playlistRepository = playlistRepository;
        _mediaRepository = mediaRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse> Handle(GetPlaylistQuery request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId);
        if (playlist is null) return ApiResponse.Fail("Playlist not found");

        var trackDtos = new List<object>();
        foreach (var t in playlist.Tracks)
        {
            var media = await _mediaRepository.GetByIdAsync(t.MediaItemId);
            if (media is not null)
            {
                var uploader = await _userRepository.GetByIdAsync(media.OwnerUserId);
                trackDtos.Add(new
                {
                    mediaItemId = media.MediaItemId, title = media.Title,
                    artistName = media.ArtistName ?? "Unknown Artist",
                    durationSeconds = media.DurationSeconds,
                    hasVideo = media.MediaType == "Video",
                    audioUrl = $"/api/media/{media.MediaItemId}/stream",
                    thumbnailUrl = media.ThumbnailUrl,
                    ownerUserId = media.OwnerUserId,
                    ownerDisplayName = uploader?.DisplayName ?? "TuneVault"
                });
            }
        }

        var user = await _userRepository.GetByIdAsync(playlist.OwnerUserId);
        return ApiResponse.Ok(new
        {
            playlistId = playlist.PlaylistId, ownerUserId = playlist.OwnerUserId,
            title = playlist.Title, visibility = playlist.Visibility,
            isCollaborative = playlist.IsCollaborative,
            createdAt = playlist.CreatedAt, updatedAt = playlist.UpdatedAt,
            creator = user?.DisplayName ?? "TuneVault", tracks = trackDtos
        });
    }
}

// --- Get User Playlists ---
public record GetUserPlaylistsQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetUserPlaylistsQueryHandler : IRequestHandler<GetUserPlaylistsQuery, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    public GetUserPlaylistsQueryHandler(IPlaylistRepository playlistRepository) => _playlistRepository = playlistRepository;

    public async Task<ApiResponse> Handle(GetUserPlaylistsQuery request, CancellationToken cancellationToken)
    {
        var playlists = await _playlistRepository.GetByUserIdAsync(request.UserId);
        return ApiResponse.Ok(playlists);
    }
}

// --- Add Track To Playlist ---
public record AddTrackToPlaylistCommand(long PlaylistId, long MediaItemId, string OwnerUserId) : IRequest<ApiResponse>;

public sealed class AddTrackToPlaylistCommandHandler : IRequestHandler<AddTrackToPlaylistCommand, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    public AddTrackToPlaylistCommandHandler(IPlaylistRepository playlistRepository) => _playlistRepository = playlistRepository;

    public async Task<ApiResponse> Handle(AddTrackToPlaylistCommand request, CancellationToken cancellationToken)
    {
        var success = await _playlistRepository.AddTrackAsync(request.PlaylistId, request.MediaItemId, request.OwnerUserId);
        return success ? ApiResponse.Ok(null) : ApiResponse.Fail("Failed to add track");
    }
}

// --- Remove Track From Playlist ---
public record RemoveTrackFromPlaylistCommand(long PlaylistId, long MediaItemId, string OwnerUserId) : IRequest<ApiResponse>;

public sealed class RemoveTrackFromPlaylistCommandHandler : IRequestHandler<RemoveTrackFromPlaylistCommand, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    public RemoveTrackFromPlaylistCommandHandler(IPlaylistRepository playlistRepository) => _playlistRepository = playlistRepository;

    public async Task<ApiResponse> Handle(RemoveTrackFromPlaylistCommand request, CancellationToken cancellationToken)
    {
        var success = await _playlistRepository.RemoveTrackAsync(request.PlaylistId, request.MediaItemId, request.OwnerUserId);
        return success ? ApiResponse.Ok(null) : ApiResponse.Fail("Failed to remove track");
    }
}
