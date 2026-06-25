using MediatR;
using TuneVault.Application.DTOs.Playlist;

namespace TuneVault.Application.Features.Playlist.Commands.UpdatePlaylist;

public record UpdatePlaylistCommand(
    string UserId,
    long PlaylistId,
    UpdatePlaylistRequestDto Request
) : IRequest<bool>, Interfaces.IAuthorizableRequest
{
    public string ResourceOwnerId => UserId;
    public string ResourceType => "Playlist";
}
