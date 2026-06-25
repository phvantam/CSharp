using MediatR;

namespace TuneVault.Application.Features.Favorite.Commands.AddToFavorite;

public record AddToFavoriteCommand(string UserId, long MediaItemId) : IRequest<bool>;
