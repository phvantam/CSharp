using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class MediaItemConfiguration : IEntityTypeConfiguration<MediaItem>
{
    public void Configure(EntityTypeBuilder<MediaItem> builder)
    {
        // Quan hệ với ApplicationUser (Owner)
        builder.HasOne(m => m.Owner)
               .WithMany(u => u.MediaItems)
               .HasForeignKey(m => m.OwnerUserId)
               .OnDelete(DeleteBehavior.Restrict);   // Tránh cascade delete

        // Quan hệ với Artist
        builder.HasOne(m => m.Artist)
               .WithMany(a => a.MediaItems)
               .HasForeignKey(m => m.ArtistId)
               .OnDelete(DeleteBehavior.Restrict);

        // Quan hệ với Album (có thể null)
        builder.HasOne(m => m.Album)
               .WithMany(a => a.MediaItems)
               .HasForeignKey(m => m.AlbumId)
               .OnDelete(DeleteBehavior.SetNull);

        // Index hỗ trợ tìm kiếm và filter
        builder.HasIndex(m => m.Title);
        builder.HasIndex(m => new { m.MediaType, m.Visibility });
        builder.HasIndex(m => m.OwnerUserId);
    }
}