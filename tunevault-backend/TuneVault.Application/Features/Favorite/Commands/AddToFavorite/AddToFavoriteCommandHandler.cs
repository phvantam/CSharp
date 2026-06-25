using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Favorite.Commands.AddToFavorite;

public class AddToFavoriteCommandHandler : IRequestHandler<AddToFavoriteCommand, bool>
{
    private readonly IFavoriteService _favoriteService;

    public AddToFavoriteCommandHandler(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    public async Task<bool> Handle(AddToFavoriteCommand command, CancellationToken cancellationToken)
    {
        return await _favoriteService.AddToFavoriteAsync(command.UserId, command.MediaItemId);
    }
}
