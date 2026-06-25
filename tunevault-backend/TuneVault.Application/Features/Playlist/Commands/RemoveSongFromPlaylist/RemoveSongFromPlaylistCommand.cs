using MediatR;

namespace TuneVault.Application.Features.Playlist.Commands.RemoveSongFromPlaylist;

public record RemoveSongFromPlaylistCommand(
    string UserId,
    long PlaylistId,
    long MediaItemId
) : IRequest<bool>, Interfaces.IAuthorizableRequest
{
    public string ResourceOwnerId => UserId;
    public string ResourceType => "Playlist";
}