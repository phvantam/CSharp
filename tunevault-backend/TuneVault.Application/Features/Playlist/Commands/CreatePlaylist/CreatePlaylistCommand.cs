using MediatR;
using TuneVault.Application.DTOs.Playlist;

namespace TuneVault.Application.Features.Playlist.Commands.CreatePlaylist;

public record CreatePlaylistCommand(
    string UserId,
    CreatePlaylistRequestDto Request
) : IRequest<long>;