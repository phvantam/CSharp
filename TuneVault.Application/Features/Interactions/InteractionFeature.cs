using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.Interactions;

// --- Toggle Favorite ---
public record ToggleFavoriteCommand(string UserId, long MediaItemId) : IRequest<ApiResponse>;

public sealed class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, ApiResponse>
{
    private readonly IFavoriteRepository _favoriteRepository;
    public ToggleFavoriteCommandHandler(IFavoriteRepository favoriteRepository) => _favoriteRepository = favoriteRepository;

    public async Task<ApiResponse> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        var isFavorited = await _favoriteRepository.ToggleAsync(request.UserId, request.MediaItemId);
        return ApiResponse.Ok(new { isFavorited });
    }
}

// --- Get Favorites ---
public record GetFavoritesQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetFavoritesQueryHandler : IRequestHandler<GetFavoritesQuery, ApiResponse>
{
    private readonly IFavoriteRepository _favoriteRepository;
    public GetFavoritesQueryHandler(IFavoriteRepository favoriteRepository) => _favoriteRepository = favoriteRepository;

    public async Task<ApiResponse> Handle(GetFavoritesQuery request, CancellationToken cancellationToken)
    {
        var favorites = await _favoriteRepository.GetFavoritesAsync(request.UserId);
        return ApiResponse.Ok(favorites);
    }
}

// --- Record Play History ---
public record RecordPlayHistoryCommand(string UserId, long MediaItemId) : IRequest<ApiResponse>;

public sealed class RecordPlayHistoryCommandHandler : IRequestHandler<RecordPlayHistoryCommand, ApiResponse>
{
    private readonly IPlayHistoryRepository _playHistoryRepository;
    public RecordPlayHistoryCommandHandler(IPlayHistoryRepository playHistoryRepository) => _playHistoryRepository = playHistoryRepository;

    public async Task<ApiResponse> Handle(RecordPlayHistoryCommand request, CancellationToken cancellationToken)
    {
        await _playHistoryRepository.RecordAsync(request.UserId, request.MediaItemId);
        return ApiResponse.Ok(null);
    }
}

// --- Get Recent History ---
public record GetRecentHistoryQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetRecentHistoryQueryHandler : IRequestHandler<GetRecentHistoryQuery, ApiResponse>
{
    private readonly IPlayHistoryRepository _playHistoryRepository;
    public GetRecentHistoryQueryHandler(IPlayHistoryRepository playHistoryRepository) => _playHistoryRepository = playHistoryRepository;

    public async Task<ApiResponse> Handle(GetRecentHistoryQuery request, CancellationToken cancellationToken)
    {
        var history = await _playHistoryRepository.GetRecentAsync(request.UserId);
        return ApiResponse.Ok(history);
    }
}
