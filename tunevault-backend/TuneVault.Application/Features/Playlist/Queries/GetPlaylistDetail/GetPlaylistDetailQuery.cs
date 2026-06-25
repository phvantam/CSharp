using MediatR;
using TuneVault.Application.DTOs.Playlist;

namespace TuneVault.Application.Features.Playlist.Queries.GetPlaylistDetail;

public record GetPlaylistDetailQuery(long PlaylistId) : IRequest<PlaylistDetailDto?>;