using MediatR;

namespace TuneVault.Application.Features.Favorite.Commands.RemoveFromFavorite;

public record RemoveFromFavoriteCommand(string UserId, long MediaItemId) : IRequest<bool>;