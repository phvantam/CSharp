using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.User.Commands.FollowUser;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, bool>
{
    private readonly IUserService _userService;

    public FollowUserCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<bool> Handle(FollowUserCommand command, CancellationToken cancellationToken)
    {
        return await _userService.FollowUserAsync(command.FollowerId, command.FollowingId);
    }
}
