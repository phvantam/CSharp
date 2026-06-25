using MediatR;
using TuneVault.Application.DTOs.Share;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

public record ShareMediaCommand(
    string SenderUserId,
    ShareMediaRequestDto Request
) : IRequest<ShareResponseDto>;