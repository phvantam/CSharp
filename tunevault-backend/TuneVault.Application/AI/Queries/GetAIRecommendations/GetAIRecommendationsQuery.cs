using MediatR;

namespace TuneVault.Application.AI.Queries.GetAIRecommendations;

public record GetAIRecommendationsQuery(string UserId) : IRequest<List<string>>;