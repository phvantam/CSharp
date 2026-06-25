using MediatR;

namespace TuneVault.Application.Features.User.Commands.FollowUser;

public record FollowUserCommand(string FollowerId, string FollowingId) : IRequest<bool>;
