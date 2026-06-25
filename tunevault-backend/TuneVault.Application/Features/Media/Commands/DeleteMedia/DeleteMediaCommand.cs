using MediatR;

namespace TuneVault.Application.Features.Media.Commands.DeleteMedia;

public record DeleteMediaCommand(string UserId, long MediaItemId) : IRequest<bool>;