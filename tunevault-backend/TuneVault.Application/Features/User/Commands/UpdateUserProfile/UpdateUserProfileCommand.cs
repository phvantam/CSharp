using MediatR;
using TuneVault.Application.DTOs.User;

namespace TuneVault.Application.Features.User.Commands.UpdateUserProfile;

public record UpdateUserProfileCommand(string UserId, UpdateProfileRequestDto Request) : IRequest<bool>;