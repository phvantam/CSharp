using MediatR;
using TuneVault.Application.Features.Profile.DTOs;

namespace TuneVault.Application.Features.Profile.Commands;
using TuneVault.Application.Interfaces;
// Command
public record UpdateProfileCommand(
    string UserId,
    string? DisplayName,
    string? AvatarUrl,
    string? Bio
) : IRequest<ProfileDto>;

// Handler
public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ProfileDto>
{
    private readonly IUserRepository _userRepository;

    public UpdateProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId)
            ?? throw new KeyNotFoundException("User not found");

        if (request.DisplayName is not null) user.DisplayName = request.DisplayName;
        if (request.AvatarUrl   is not null) user.AvatarUrl   = request.AvatarUrl;
        if (request.Bio         is not null) user.Bio         = request.Bio;

        await _userRepository.UpdateAsync(user);

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