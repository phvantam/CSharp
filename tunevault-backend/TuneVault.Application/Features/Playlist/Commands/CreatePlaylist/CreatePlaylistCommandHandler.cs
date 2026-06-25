using MediatR;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Commands.CreatePlaylist;

public class CreatePlaylistCommandHandler
    : IRequestHandler<CreatePlaylistCommand, long>
{
    private readonly IPlaylistService _playlistService;

    public CreatePlaylistCommandHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<long> Handle(
        CreatePlaylistCommand command,
        CancellationToken cancellationToken)
    {
        var playlistRequest = new CreatePlaylistRequest
        {
            Name = command.Request.Title,
            Description = command.Request.Description,
            Visibility = command.Request.IsPublic ? "Public" : "Private",
            CoverImageUrl = command.Request.CoverImageUrl
        };

        return await _playlistService.CreatePlaylistAsync(
            command.UserId,
            playlistRequest
        );
    }
}