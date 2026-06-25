using MediatR;
using TuneVault.Application.DTOs.Artist;

namespace TuneVault.Application.Features.Artist.Queries.SearchArtists;

public record SearchArtistsQuery(string Keyword, int Limit = 10) : IRequest<List<ArtistDto>>;