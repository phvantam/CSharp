using MediatR;

namespace TuneVault.Application.Features.User.Commands.UnfollowUser;

public record UnfollowUserCommand(string FollowerId, string FollowingId) : IRequest<bool>;
