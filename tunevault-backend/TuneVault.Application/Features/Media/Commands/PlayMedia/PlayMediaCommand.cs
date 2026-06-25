using MediatR;

namespace TuneVault.Application.Features.Media.Commands.PlayMedia;

public record PlayMediaCommand(string UserId, long MediaItemId) : IRequest<bool>;