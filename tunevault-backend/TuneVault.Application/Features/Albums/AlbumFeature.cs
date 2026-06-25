using System;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.Albums;

// --- Create Album ---
public record CreateAlbumCommand(string OwnerUserId, string Title, string? ArtistName, string? Description, string? CoverImageUrl) : IRequest<ApiResponse>;

public sealed class CreateAlbumCommandValidator : AbstractValidator<CreateAlbumCommand>
{
    public CreateAlbumCommandValidator()
    {
        RuleFor(x => x.OwnerUserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty();
    }
}

public sealed class CreateAlbumCommandHandler : IRequestHandler<CreateAlbumCommand, ApiResponse>
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IArtistRepository _artistRepository;

    public CreateAlbumCommandHandler(IAlbumRepository albumRepository, IArtistRepository artistRepository)
    {
        _albumRepository = albumRepository;
        _artistRepository = artistRepository;
    }

    public async Task<ApiResponse> Handle(CreateAlbumCommand request, CancellationToken cancellationToken)
    {
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

        var album = new Album
        {
            Title = request.Title,
            ArtistId = artist.ArtistId,
            OwnerUserId = request.OwnerUserId,
            Slug = request.Title.ToLower().Replace(" ", "-").Replace("/", "-"),
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            AlbumType = "Album",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var created = await _albumRepository.CreateAsync(album);
        return ApiResponse.Ok(created);
    }
}

// --- Update Album ---
public record UpdateAlbumCommand(int AlbumId, string OwnerUserId, string? Title, string? ArtistName, string? Description, string? CoverImageUrl) : IRequest<ApiResponse>;

public sealed class UpdateAlbumCommandHandler : IRequestHandler<UpdateAlbumCommand, ApiResponse>
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IArtistRepository _artistRepository;

    public UpdateAlbumCommandHandler(IAlbumRepository albumRepository, IArtistRepository artistRepository)
    {
        _albumRepository = albumRepository;
        _artistRepository = artistRepository;
    }

    public async Task<ApiResponse> Handle(UpdateAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await _albumRepository.GetByIdAsync(request.AlbumId);
        if (album is null) return ApiResponse.Fail("Album not found");

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            album.Title = request.Title;
            album.Slug = request.Title.ToLower().Replace(" ", "-").Replace("/", "-");
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
            album.ArtistId = artist.ArtistId;
        }

        if (request.Description is not null) album.Description = request.Description;
        if (request.CoverImageUrl is not null) album.CoverImageUrl = request.CoverImageUrl;
        album.UpdatedAt = DateTime.UtcNow;

        var updated = await _albumRepository.UpdateAsync(album);
        return ApiResponse.Ok(updated);
    }
}

// --- Delete Album ---
public record DeleteAlbumCommand(int AlbumId, string OwnerUserId) : IRequest<ApiResponse>;

public sealed class DeleteAlbumCommandHandler : IRequestHandler<DeleteAlbumCommand, ApiResponse>
{
    private readonly IAlbumRepository _albumRepository;
    public DeleteAlbumCommandHandler(IAlbumRepository albumRepository) => _albumRepository = albumRepository;

    public async Task<ApiResponse> Handle(DeleteAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await _albumRepository.GetByIdAsync(request.AlbumId);
        if (album is null) return ApiResponse.Fail("Album not found");

        var success = await _albumRepository.DeleteAsync(request.AlbumId, request.OwnerUserId);
        return success ? ApiResponse.Ok(null) : ApiResponse.Fail("Failed to delete");
    }
}

// --- Get Album ---
public record GetAlbumQuery(int AlbumId) : IRequest<ApiResponse>;

public sealed class GetAlbumQueryHandler : IRequestHandler<GetAlbumQuery, ApiResponse>
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IMediaRepository _mediaRepository;
    private readonly IUserRepository _userRepository;

    public GetAlbumQueryHandler(IAlbumRepository albumRepository, IMediaRepository mediaRepository, IUserRepository userRepository)
    {
        _albumRepository = albumRepository;
        _mediaRepository = mediaRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse> Handle(GetAlbumQuery request, CancellationToken cancellationToken)
    {
        var album = await _albumRepository.GetByIdAsync(request.AlbumId);
        if (album is null) return ApiResponse.Fail("Album not found");

        var songs = await _mediaRepository.GetByAlbumIdAsync(request.AlbumId);
        var resolvedSongs = new List<object>();
        foreach (var song in songs)
        {
            var uploader = await _userRepository.GetByIdAsync(song.OwnerUserId);
            resolvedSongs.Add(new
            {
                mediaItemId = song.MediaItemId, title = song.Title,
                artistName = song.ArtistName ?? "Unknown Artist",
                durationSeconds = song.DurationSeconds,
                hasVideo = song.MediaType == "Video",
                audioUrl = $"/api/media/{song.MediaItemId}/stream",
                thumbnailUrl = song.ThumbnailUrl,
                ownerUserId = song.OwnerUserId,
                ownerDisplayName = uploader?.DisplayName ?? "TuneVault"
            });
        }

        return ApiResponse.Ok(new
        {
            album = new
            {
                albumId = album.AlbumId,
                ownerUserId = album.OwnerUserId,
                title = album.Title, artistName = album.ArtistName,
                description = album.Description, coverImageUrl = album.CoverImageUrl,
                createdAt = album.CreatedAt, updatedAt = album.UpdatedAt,
                creatorName = album.ArtistName ?? "TuneVault"
            },
            songs = resolvedSongs
        });
    }
}

// --- Get All Albums ---
public record GetAllAlbumsQuery : IRequest<ApiResponse>;

public sealed class GetAllAlbumsQueryHandler : IRequestHandler<GetAllAlbumsQuery, ApiResponse>
{
    private readonly IAlbumRepository _albumRepository;
    public GetAllAlbumsQueryHandler(IAlbumRepository albumRepository) => _albumRepository = albumRepository;

    public async Task<ApiResponse> Handle(GetAllAlbumsQuery request, CancellationToken cancellationToken)
    {
        var albums = await _albumRepository.GetAllAsync();
        return ApiResponse.Ok(albums);
    }
}
