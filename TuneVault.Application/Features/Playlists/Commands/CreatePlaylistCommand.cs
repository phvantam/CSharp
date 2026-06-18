using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Commands;

public record CreatePlaylistCommand(
    string UserId,
    string Title,
    string? Description,
    string? CoverImageUrl
) : IRequest<PlaylistDto>;

public class CreatePlaylistCommandHandler : IRequestHandler<CreatePlaylistCommand, PlaylistDto>
{
    private readonly IPlaylistRepository _playlistRepository;

    public CreatePlaylistCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<PlaylistDto> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = new Playlist
        {
            Id            = Guid.NewGuid(),
            Title         = request.Title,
            Description = request.Description ?? string.Empty,
            CoverImageUrl = request.CoverImageUrl,
            OwnerUserId   = Guid.Parse(request.UserId),
            CreatedAt     = DateTime.UtcNow
        };

        await _playlistRepository.AddAsync(playlist);

        return new PlaylistDto
        {
            Id            = playlist.Id,
            Title         = playlist.Title,
            Description   = playlist.Description,
            CoverImageUrl = playlist.CoverImageUrl,
            OwnerUserId   = playlist.OwnerUserId,
            CreatedAt     = playlist.CreatedAt
        };
    }
}