using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.Follows;

// --- Follow User ---
public record FollowUserCommand(string FollowerUserId, string TargetUserId) : IRequest<ApiResponse>;

public sealed class FollowUserCommandValidator : AbstractValidator<FollowUserCommand>
{
    public FollowUserCommandValidator()
    {
        RuleFor(x => x.FollowerUserId).NotEmpty();
        RuleFor(x => x.TargetUserId).NotEmpty();
        RuleFor(x => x).Must(x => x.FollowerUserId != x.TargetUserId)
            .WithMessage("Cannot follow yourself");
    }
}

public sealed class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, ApiResponse>
{
    private readonly IFollowRepository _followRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;

    public FollowUserCommandHandler(IFollowRepository followRepository, INotificationRepository notificationRepository, IUserRepository userRepository)
    {
        _followRepository = followRepository;
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        var target = await _userRepository.GetByIdAsync(request.TargetUserId);
        if (target is null) return ApiResponse.Fail("Target user not found");

        var success = await _followRepository.FollowAsync(request.FollowerUserId, request.TargetUserId);
        if (!success) return ApiResponse.Fail("Already following this user");

        // Create notification for the followed user
        var notification = new Notification
        {
            UserId = request.TargetUserId,
            Title = "New Follower",
            Type = "NewFollower",
            Body = "Someone started following you",
            ActorUserId = request.FollowerUserId
        };
        await _notificationRepository.CreateAsync(notification);

        return ApiResponse.Ok(new { isFollowing = true });
    }
}

// --- Unfollow User ---
public record UnfollowUserCommand(string FollowerUserId, string TargetUserId) : IRequest<ApiResponse>;

public sealed class UnfollowUserCommandHandler : IRequestHandler<UnfollowUserCommand, ApiResponse>
{
    private readonly IFollowRepository _followRepository;
    public UnfollowUserCommandHandler(IFollowRepository followRepository) => _followRepository = followRepository;

    public async Task<ApiResponse> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
    {
        var success = await _followRepository.UnfollowAsync(request.FollowerUserId, request.TargetUserId);
        return success ? ApiResponse.Ok(new { isFollowing = false }) : ApiResponse.Fail("Not following this user");
    }
}

// --- Get Followers ---
public record GetFollowersQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetFollowersQueryHandler : IRequestHandler<GetFollowersQuery, ApiResponse>
{
    private readonly IFollowRepository _followRepository;
    public GetFollowersQueryHandler(IFollowRepository followRepository) => _followRepository = followRepository;

    public async Task<ApiResponse> Handle(GetFollowersQuery request, CancellationToken cancellationToken)
    {
        var followers = await _followRepository.GetFollowersAsync(request.UserId);
        return ApiResponse.Ok(followers.Select(u => new { u.Id, u.DisplayName, u.AvatarUrl }));
    }
}

// --- Get Following ---
public record GetFollowingQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetFollowingQueryHandler : IRequestHandler<GetFollowingQuery, ApiResponse>
{
    private readonly IFollowRepository _followRepository;
    public GetFollowingQueryHandler(IFollowRepository followRepository) => _followRepository = followRepository;

    public async Task<ApiResponse> Handle(GetFollowingQuery request, CancellationToken cancellationToken)
    {
        var following = await _followRepository.GetFollowingAsync(request.UserId);
        return ApiResponse.Ok(following.Select(u => new { u.Id, u.DisplayName, u.AvatarUrl }));
    }
}
