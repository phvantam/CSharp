using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class PlaylistTrackConfiguration : IEntityTypeConfiguration<PlaylistTrack>
{
    public void Configure(EntityTypeBuilder<PlaylistTrack> builder)
    {
        builder.HasOne(pt => pt.Playlist)
               .WithMany(p => p.PlaylistTracks)
               .HasForeignKey(pt => pt.PlaylistId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pt => pt.MediaItem)
               .WithMany(m => m.PlaylistTracks)
               .HasForeignKey(pt => pt.MediaItemId)
               .OnDelete(DeleteBehavior.Cascade);

        // Đảm bảo không có trùng bài hát trong cùng playlist
        builder.HasIndex(pt => new { pt.PlaylistId, pt.MediaItemId }).IsUnique();
    }
}