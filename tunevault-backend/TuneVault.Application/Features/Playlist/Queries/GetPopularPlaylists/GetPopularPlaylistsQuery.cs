using MediatR;
using TuneVault.Application.DTOs.Playlist;

namespace TuneVault.Application.Features.Playlist.Queries.GetPopularPlaylists;

public record GetPopularPlaylistsQuery(int Limit = 12) : IRequest<List<PlaylistSummaryDto>>;