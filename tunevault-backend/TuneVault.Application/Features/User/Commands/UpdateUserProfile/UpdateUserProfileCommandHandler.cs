using MediatR;
using TuneVault.Application.Features.User.Commands.UpdateUserProfile;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.User.Commands.UpdateUserProfile;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, bool>
{
    private readonly IUserService _userService;

    public UpdateUserProfileCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<bool> Handle(UpdateUserProfileCommand command, CancellationToken cancellationToken)
    {
        return await _userService.UpdateUserProfileAsync(command.UserId, command.Request);
    }
}