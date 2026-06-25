using MediatR;
using TuneVault.Application.DTOs.Playlist;

namespace TuneVault.Application.Features.Playlist.Queries.GetMyPlaylists;

public record GetMyPlaylistsQuery(string UserId) : IRequest<List<PlaylistSummaryDto>>;