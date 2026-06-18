using MediatR;
using TuneVault.Application.Features.Profile.DTOs;
using TuneVault.Application.Interfaces;
namespace TuneVault.Application.Features.Profile.Queries;

// Query
public record GetCurrentProfileQuery(string UserId) : IRequest<ProfileDto>;

// Handler
public class GetCurrentProfileQueryHandler : IRequestHandler<GetCurrentProfileQuery, ProfileDto>
{
    private readonly IUserRepository _userRepository;

    public GetCurrentProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ProfileDto> Handle(GetCurrentProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId)
            ?? throw new KeyNotFoundException("User not found");

        return new ProfileDto
        {
            Id          = user.Id.ToString(),
            DisplayName = user.DisplayName,
            Email       = user.Email,
            AvatarUrl   = user.AvatarUrl,
            Bio         = user.Bio,
            CreatedAt   = user.CreatedAt
        };
    }
}