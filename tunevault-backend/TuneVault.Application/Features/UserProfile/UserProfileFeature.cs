using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.UserProfile;

// --- Get Profile ---
public record GetProfileQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    public GetProfileQueryHandler(IUserRepository userRepository) => _userRepository = userRepository;

    public async Task<ApiResponse> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user is null) return ApiResponse.Fail("User not found");
        return ApiResponse.Ok(new UserDto(user.Id, user.DisplayName, user.Email, user.AvatarUrl, user.Bio, user.CreatedAt));
    }
}

// --- Update Profile ---
public record UpdateProfileCommand(string UserId, string? DisplayName, string? Bio, string? AvatarUrl) : IRequest<ApiResponse>;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public sealed class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    public UpdateProfileCommandHandler(IUserRepository userRepository) => _userRepository = userRepository;

    public async Task<ApiResponse> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user is null) return ApiResponse.Fail("User not found");

        if (!string.IsNullOrWhiteSpace(request.DisplayName)) user.DisplayName = request.DisplayName;
        if (request.Bio is not null) user.Bio = request.Bio;
        if (request.AvatarUrl is not null) user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return ApiResponse.Ok(new UserDto(user.Id, user.DisplayName, user.Email, user.AvatarUrl, user.Bio, user.CreatedAt));
    }
}

// --- Search Users ---
public record SearchUsersQuery(string Query) : IRequest<ApiResponse>;

public sealed class SearchUsersQueryHandler : IRequestHandler<SearchUsersQuery, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    public SearchUsersQueryHandler(IUserRepository userRepository) => _userRepository = userRepository;

    public async Task<ApiResponse> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.SearchAsync(request.Query);
        var dtos = users.Select(u => new UserDto(u.Id, u.DisplayName, u.Email, u.AvatarUrl, u.Bio, u.CreatedAt));
        return ApiResponse.Ok(dtos);
    }
}
