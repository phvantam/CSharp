using MediatR;

namespace TuneVault.Application.Features.Playlist.Commands.DeletePlaylist;

public record DeletePlaylistCommand(
    string UserId,
    long PlaylistId
) : IRequest<bool>, Interfaces.IAuthorizableRequest
{
    public string ResourceOwnerId => UserId;
    public string ResourceType => "Playlist";
}