using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistTrack> PlaylistTracks => Set<PlaylistTrack>();
    public DbSet<MediaShare> MediaShares => Set<MediaShare>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<PlayHistory> PlayHistories => Set<PlayHistory>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(entity =>
        {
            entity.ToTable("AspNetUsers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AvatarUrl).HasMaxLength(500);
            entity.Property(e => e.Bio).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.DisplayName).HasMaxLength(120);
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LockoutEnabled).HasDefaultValue(true);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.PhoneNumber).HasMaxLength(30);
            entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.UserName).HasMaxLength(256);
        });

        builder.Entity<Artist>(entity =>
        {
            entity.ToTable("Artist");
            entity.HasKey(e => e.ArtistId);
            entity.Property(e => e.Bio).HasMaxLength(1000);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Slug).HasMaxLength(180);
            entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
        });

        builder.Entity<Album>(entity =>
        {
            entity.ToTable("Album");
            entity.HasKey(e => e.AlbumId);
            entity.Property(e => e.AlbumType).HasMaxLength(30).HasDefaultValue("Single");
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Slug).HasMaxLength(220);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.OwnerUserId).HasMaxLength(450);

            entity.HasOne(d => d.Artist)
                .WithMany(p => p.Albums)
                .HasForeignKey(d => d.ArtistId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Owner)
                .WithMany(p => p.Albums)
                .HasForeignKey(d => d.OwnerUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        builder.Entity<MediaItem>(entity =>
        {
            entity.ToTable("MediaItem");
            entity.HasKey(e => e.MediaItemId);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(1500);
            entity.Property(e => e.ExternalUrl).HasMaxLength(500);
            entity.Property(e => e.FilePath).HasMaxLength(500);
            entity.Property(e => e.Genre).HasMaxLength(80);
            entity.Property(e => e.MediaType).HasMaxLength(20);
            entity.Property(e => e.MimeType).HasMaxLength(100);
            entity.Property(e => e.Slug).HasMaxLength(280);
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(250);
            entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Visibility).HasMaxLength(20).HasDefaultValue("Public");

            entity.HasOne(d => d.Album)
                .WithMany(p => p.MediaItems)
                .HasForeignKey(d => d.AlbumId);

            entity.HasOne(d => d.Artist)
                .WithMany(p => p.MediaItems)
                .HasForeignKey(d => d.ArtistId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Owner)
                .WithMany(p => p.MediaItems)
                .HasForeignKey(d => d.OwnerUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        builder.Entity<Playlist>(entity =>
        {
            entity.ToTable("Playlist");
            entity.HasKey(e => e.PlaylistId);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Slug).HasMaxLength(240);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Visibility).HasMaxLength(20).HasDefaultValue("Private");

            entity.HasOne(d => d.Owner)
                .WithMany(p => p.Playlists)
                .HasForeignKey(d => d.OwnerUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        builder.Entity<PlaylistTrack>(entity =>
        {
            entity.ToTable("PlaylistTrack");
            entity.HasKey(e => e.PlaylistTrackId);
            entity.Property(e => e.AddedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.AddedByUserId).HasMaxLength(450);

            entity.HasOne(d => d.AddedByUser)
                .WithMany(p => p.PlaylistTracks)
                .HasForeignKey(d => d.AddedByUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.MediaItem)
                .WithMany(p => p.PlaylistTracks)
                .HasForeignKey(d => d.MediaItemId)
                .OnDelete(DeleteBehavior.Cascade); // cascade deleting a track from playlist when media is deleted is fine

            entity.HasOne(d => d.Playlist)
                .WithMany(p => p.Tracks)
                .HasForeignKey(d => d.PlaylistId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Favorite>(entity =>
        {
            entity.ToTable("Favorite");
            entity.HasKey(e => e.FavoriteId);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.MediaItem)
                .WithMany(p => p.Favorites)
                .HasForeignKey(d => d.MediaItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.User)
                .WithMany(p => p.Favorites)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PlayHistory>(entity =>
        {
            entity.ToTable("PlayHistory");
            entity.HasKey(e => e.PlayHistoryId);
            entity.Property(e => e.DeviceInfo).HasMaxLength(200);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.LastPlayedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.StartedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.MediaItem)
                .WithMany(p => p.PlayHistories)
                .HasForeignKey(d => d.MediaItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.User)
                .WithMany(p => p.PlayHistories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<MediaShare>(entity =>
        {
            entity.ToTable("MediaShare");
            entity.HasKey(e => e.MediaShareId);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Message).HasMaxLength(500);
            entity.Property(e => e.RevokedAt).HasPrecision(0);
            entity.Property(e => e.ShareType).HasMaxLength(20).HasDefaultValue("Media");

            entity.HasOne(d => d.MediaItem)
                .WithMany(p => p.MediaShares)
                .HasForeignKey(d => d.MediaItemId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Playlist)
                .WithMany(p => p.MediaShares)
                .HasForeignKey(d => d.PlaylistId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.ReceiverUser)
                .WithMany(p => p.MediaShareReceiverUsers)
                .HasForeignKey(d => d.ReceiverUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.SenderUser)
                .WithMany(p => p.MediaShareSenderUsers)
                .HasForeignKey(d => d.SenderUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        builder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notification");
            entity.HasKey(e => e.NotificationId);
            entity.Property(e => e.ActorUserId).HasMaxLength(450);
            entity.Property(e => e.Body).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.ReadAt).HasPrecision(0);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.ActorUser)
                .WithMany(p => p.NotificationActorUsers)
                .HasForeignKey(d => d.ActorUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.User)
                .WithMany(p => p.NotificationUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Follow>(entity =>
        {
            entity.ToTable("Follow");
            entity.HasKey(e => e.FollowId);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.TargetUserId).HasMaxLength(450);

            entity.HasOne(d => d.FollowerUser)
                .WithMany(p => p.FollowFollowerUsers)
                .HasForeignKey(d => d.FollowerUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.TargetArtist)
                .WithMany(p => p.Follows)
                .HasForeignKey(d => d.TargetArtistId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.TargetUser)
                .WithMany(p => p.FollowTargetUsers)
                .HasForeignKey(d => d.TargetUserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        builder.Entity<UserProfile>(entity =>
        {
            entity.ToTable("UserProfile");
            entity.HasKey(e => e.UserProfileId);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.FacebookUrl).HasMaxLength(500);
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.PrivacyLevel).HasMaxLength(20).HasDefaultValue("Public");
            entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.UserId).HasMaxLength(450);
            entity.Property(e => e.WebsiteUrl).HasMaxLength(500);

            entity.HasOne(d => d.User)
                .WithMany(p => p.UserProfiles)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
