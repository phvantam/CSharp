using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class PlaylistItemConfiguration : IEntityTypeConfiguration<PlaylistItem>
{
    public void Configure(EntityTypeBuilder<PlaylistItem> builder)
    {
        // Khóa hợp thành (Composite Key) đảm bảo 1 bài hát không bị add trùng vào 1 playlist
        builder.HasKey(pi => new { pi.PlaylistId, pi.MediaItemId });

        builder.HasOne<Playlist>()
               .WithMany() 
               .HasForeignKey(pi => pi.PlaylistId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<MediaItem>()
               .WithMany()
               .HasForeignKey(pi => pi.MediaItemId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}