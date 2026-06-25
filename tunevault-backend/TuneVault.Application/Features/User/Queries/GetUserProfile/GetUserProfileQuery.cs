using MediatR;
using TuneVault.Application.DTOs.User;

namespace TuneVault.Application.Features.User.Queries.GetUserProfile;

public record GetUserProfileQuery(string UserId) : IRequest<UserProfileDto?>;