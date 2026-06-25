using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Favorite.Commands.RemoveFromFavorite;

public class RemoveFromFavoriteCommandHandler : IRequestHandler<RemoveFromFavoriteCommand, bool>
{
    private readonly IFavoriteService _favoriteService;

    public RemoveFromFavoriteCommandHandler(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    public async Task<bool> Handle(RemoveFromFavoriteCommand command, CancellationToken cancellationToken)
    {
        return await _favoriteService.RemoveFromFavoriteAsync(command.UserId, command.MediaItemId);
    }
}
