using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ==================== DbSet cho tất cả bảng ====================
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<MediaItem> MediaItems { get; set; }
    public DbSet<MediaArtist> MediaArtists { get; set; }
    public DbSet<MediaTag> MediaTags { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<PlaylistTrack> PlaylistTracks { get; set; }
    public DbSet<MediaShare> MediaShares { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<PlayHistory> PlayHistories { get; set; }
    public DbSet<Follow> Follows { get; set; }
    public DbSet<ArtistManager> ArtistManagers { get; set; }


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Áp dụng tất cả các file Configuration trong thư mục Configurations
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);


        builder.Entity<MediaArtist>(entity =>
        {
            entity.ToTable("MediaArtists");

            entity.HasKey(x => new { x.MediaItemId, x.ArtistId });

            entity.Property(x => x.Role)
                  .HasMaxLength(30)
                  .HasDefaultValue("Primary");

            entity.Property(x => x.Position)
                  .HasDefaultValue(0);

            entity.Property(x => x.CreatedAt)
                  .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(x => x.MediaItem)
                  .WithMany(x => x.MediaArtists)
                  .HasForeignKey(x => x.MediaItemId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Artist)
                  .WithMany(x => x.MediaArtists)
                  .HasForeignKey(x => x.ArtistId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ArtistManager>(entity =>
        {
            entity.HasKey(x => x.ArtistManagerId);

            entity.HasIndex(x => new { x.ArtistId, x.UserId })
                  .IsUnique();

            entity.Property(x => x.Role)
                  .HasMaxLength(30)
                  .IsRequired();

            entity.Property(x => x.CreatedAt)
                  .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(x => x.Artist)
                  .WithMany(x => x.Managers)
                  .HasForeignKey(x => x.ArtistId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                  .WithMany()
                  .HasForeignKey(x => x.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}