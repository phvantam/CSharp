using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.User.Commands.UnfollowUser;

public class UnfollowUserCommandHandler : IRequestHandler<UnfollowUserCommand, bool>
{
    private readonly IUserService _userService;

    public UnfollowUserCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<bool> Handle(UnfollowUserCommand command, CancellationToken cancellationToken)
    {
        return await _userService.UnfollowUserAsync(command.FollowerId, command.FollowingId);
    }
}
