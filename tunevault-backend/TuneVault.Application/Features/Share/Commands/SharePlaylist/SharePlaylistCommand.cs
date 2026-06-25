using MediatR;
using TuneVault.Application.DTOs.Share;

namespace TuneVault.Application.Features.Share.Commands.SharePlaylist;

public record SharePlaylistCommand(
    string SenderUserId,
    long PlaylistId,
    string ReceiverUserId,
    string? Message = null
) : IRequest<ShareResponseDto>;
