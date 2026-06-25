using MediatR;
using TuneVault.Application.Interfaces;           // ← Sửa lại using

namespace TuneVault.Application.Features.Playlist.Commands.AddTrackToPlaylist;

public record AddTrackToPlaylistCommand(
    string UserId,
    long PlaylistId,
    long MediaItemId
) : IRequest<bool>, IAuthorizableRequest
{
    public string ResourceOwnerId => UserId;
    public string ResourceType => "Playlist";
}