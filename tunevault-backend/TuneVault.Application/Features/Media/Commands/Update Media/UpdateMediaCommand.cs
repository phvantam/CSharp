using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;           // ← Sửa lại using

namespace TuneVault.Application.Features.Media.Commands.UpdateMedia;

public record UpdateMediaCommand(
    string UserId,
    long MediaId,
    UpdateMediaRequestDto Request
) : IRequest<bool>, IAuthorizableRequest
{
    public string ResourceOwnerId => UserId;
    public string ResourceType => "Media";
}