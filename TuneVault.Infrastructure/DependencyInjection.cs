using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TuneVault.Application.Common;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;
using TuneVault.Infrastructure.Repositories;
using TuneVault.Infrastructure.Services;
using TuneVault.Infrastructure.SignalR;

namespace TuneVault.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, string uploadsRoot)
    {
        // Database
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost;Database=TuneVault;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString)
                   .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IMediaRepository, MediaRepository>();
        services.AddScoped<IPlaylistRepository, PlaylistRepository>();
        services.AddScoped<IAlbumRepository, AlbumRepository>();
        services.AddScoped<IShareRepository, ShareRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IPlayHistoryRepository, PlayHistoryRepository>();
        services.AddScoped<IFollowRepository, FollowRepository>();
        services.AddScoped<IArtistRepository, ArtistRepository>();

        // Services
        services.AddSingleton<ITokenService, TokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IFileStorageService>(new LocalFileStorageService(uploadsRoot));

        // SignalR
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, TuneVaultUserIdProvider>();

        return services;
    }
}
