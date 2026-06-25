using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.MediaLibrary;

// --- Upload Media ---
public record UploadMediaCommand(
    string Title, string OwnerUserId, string FilePath, string Extension,
    string? ArtistName, int? AlbumId, string? AlbumTitle,
    string? ThumbnailUrl, string MediaType) : IRequest<ApiResponse>;

public sealed class UploadMediaCommandValidator : AbstractValidator<UploadMediaCommand>
{
    public UploadMediaCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty();
        RuleFor(x => x.OwnerUserId).NotEmpty();
        RuleFor(x => x.FilePath).NotEmpty();
    }
}

public sealed class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, ApiResponse>
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IUserRepository _userRepository;
    private readonly IArtistRepository _artistRepository;

    public UploadMediaCommandHandler(IMediaRepository mediaRepository, IUserRepository userRepository, IArtistRepository artistRepository)
    {
        _mediaRepository = mediaRepository;
        _userRepository = userRepository;
        _artistRepository = artistRepository;
    }

    public async Task<ApiResponse> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.OwnerUserId);
        var ownerName = user?.DisplayName ?? "Unknown";

        // Find or create artist
        var artistName = request.ArtistName?.Trim();
        if (string.IsNullOrWhiteSpace(artistName)) artistName = "Unknown Artist";
        var artist = await _artistRepository.GetByNameAsync(artistName);
        if (artist is null)
        {
            artist = new Artist
            {
                Name = artistName,
                Slug = artistName.ToLower().Replace(" ", "-").Replace("/", "-"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            artist = await _artistRepository.CreateAsync(artist);
        }

        var media = new MediaItem
        {
            OwnerUserId = request.OwnerUserId,
            Title = request.Title,
            FilePath = request.FilePath,
            ArtistId = artist.ArtistId,
            AlbumId = request.AlbumId,
            ThumbnailUrl = request.ThumbnailUrl,
            MediaType = request.MediaType,
            Slug = request.Title.ToLower().Replace(" ", "-").Replace("/", "-"),
            MimeType = request.MediaType == "Video" ? "video/mp4" : "audio/mpeg",
            FileSizeBytes = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _mediaRepository.CreateAsync(media);
        return ApiResponse.Ok(created);
    }
}

// --- Update Media ---
public record UpdateMediaCommand(
    long MediaItemId, string OwnerUserId, string? Title, string? ArtistName,
    int? AlbumId, string? AlbumTitle, string? ThumbnailUrl) : IRequest<ApiResponse>;

public sealed class UpdateMediaCommandHandler : IRequestHandler<UpdateMediaCommand, ApiResponse>
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IArtistRepository _artistRepository;

    public UpdateMediaCommandHandler(IMediaRepository mediaRepository, IArtistRepository artistRepository)
    {
        _mediaRepository = mediaRepository;
        _artistRepository = artistRepository;
    }

    public async Task<ApiResponse> Handle(UpdateMediaCommand request, CancellationToken cancellationToken)
    {
        var media = await _mediaRepository.GetByIdAsync(request.MediaItemId);
        if (media is null) return ApiResponse.Fail("Media not found");
        if (media.OwnerUserId != request.OwnerUserId) return ApiResponse.Fail("Forbidden");

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            media.Title = request.Title;
            media.Slug = request.Title.ToLower().Replace(" ", "-").Replace("/", "-");
        }

        if (request.ArtistName is not null)
        {
            var artistName = request.ArtistName.Trim();
            if (string.IsNullOrWhiteSpace(artistName)) artistName = "Unknown Artist";
            var artist = await _artistRepository.GetByNameAsync(artistName);
            if (artist is null)
            {
                artist = new Artist
                {
                    Name = artistName,
                    Slug = artistName.ToLower().Replace(" ", "-").Replace("/", "-"),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                artist = await _artistRepository.CreateAsync(artist);
            }
            media.ArtistId = artist.ArtistId;
        }

        media.AlbumId = request.AlbumId;
        if (request.ThumbnailUrl is not null) media.ThumbnailUrl = request.ThumbnailUrl;
        media.UpdatedAt = DateTime.UtcNow;

        var updated = await _mediaRepository.UpdateAsync(media);
        return ApiResponse.Ok(updated);
    }
}

// --- Delete Media ---
public record DeleteMediaCommand(long MediaItemId, string OwnerUserId) : IRequest<ApiResponse>;

public sealed class DeleteMediaCommandHandler : IRequestHandler<DeleteMediaCommand, ApiResponse>
{
    private readonly IMediaRepository _mediaRepository;

    public DeleteMediaCommandHandler(IMediaRepository mediaRepository) => _mediaRepository = mediaRepository;

    public async Task<ApiResponse> Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        var media = await _mediaRepository.GetByIdAsync(request.MediaItemId);
        if (media is null) return ApiResponse.Fail("Media not found");
        if (media.OwnerUserId != request.OwnerUserId) return ApiResponse.Fail("Forbidden");

        var success = await _mediaRepository.DeleteAsync(request.MediaItemId, request.OwnerUserId);
        return success ? ApiResponse.Ok(null) : ApiResponse.Fail("Failed to delete");
    }
}

// --- Get Media By Id ---
public record GetMediaByIdQuery(long MediaItemId) : IRequest<ApiResponse>;

public sealed class GetMediaByIdQueryHandler : IRequestHandler<GetMediaByIdQuery, ApiResponse>
{
    private readonly IMediaRepository _mediaRepository;
    public GetMediaByIdQueryHandler(IMediaRepository mediaRepository) => _mediaRepository = mediaRepository;

    public async Task<ApiResponse> Handle(GetMediaByIdQuery request, CancellationToken cancellationToken)
    {
        var media = await _mediaRepository.GetByIdAsync(request.MediaItemId);
        return media is null ? ApiResponse.Fail("Media not found") : ApiResponse.Ok(media);
    }
}

// --- Get Trending ---
public record GetTrendingMediaQuery(int Count = 10) : IRequest<ApiResponse>;

public sealed class GetTrendingMediaQueryHandler : IRequestHandler<GetTrendingMediaQuery, ApiResponse>
{
    private readonly IMediaRepository _mediaRepository;
    public GetTrendingMediaQueryHandler(IMediaRepository mediaRepository) => _mediaRepository = mediaRepository;

    public async Task<ApiResponse> Handle(GetTrendingMediaQuery request, CancellationToken cancellationToken)
    {
        var media = await _mediaRepository.GetTrendingAsync(request.Count);
        return ApiResponse.Ok(media);
    }
}
