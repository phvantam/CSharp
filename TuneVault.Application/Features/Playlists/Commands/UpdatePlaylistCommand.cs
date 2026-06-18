using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands;

public record UpdatePlaylistCommand(
    Guid PlaylistId,
    string UserId,
    string? Title,
    string? Description,
    string? CoverImageUrl
) : IRequest<PlaylistDto>;

public class UpdatePlaylistCommandHandler : IRequestHandler<UpdatePlaylistCommand, PlaylistDto>
{
    private readonly IPlaylistRepository _playlistRepository;

    public UpdatePlaylistCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<PlaylistDto> Handle(UpdatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId)
            ?? throw new KeyNotFoundException("Playlist not found");

        // Authorization: chỉ owner mới được sửa
        if (playlist.OwnerUserId != Guid.Parse(request.UserId))
            throw new UnauthorizedAccessException("You do not own this playlist");

        if (request.Title        is not null) playlist.Title        = request.Title;
        if (request.Description  is not null) playlist.Description  = request.Description;
        if (request.CoverImageUrl is not null) playlist.CoverImageUrl = request.CoverImageUrl;

        await _playlistRepository.UpdateAsync(playlist);

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