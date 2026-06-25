using MediatR;
using TuneVault.Application.DTOs.User;
using TuneVault.Application.Features.User.Queries.GetUserProfile;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.User.Queries.GetUserProfile;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto?>
{
    private readonly IUserService _userService; // Bạn cần tạo interface này

    public GetUserProfileQueryHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<UserProfileDto?> Handle(GetUserProfileQuery query, CancellationToken cancellationToken)
    {
        return await _userService.GetUserProfileAsync(query.UserId);
    }
}