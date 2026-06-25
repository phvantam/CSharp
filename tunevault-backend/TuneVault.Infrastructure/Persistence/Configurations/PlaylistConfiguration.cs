using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class PlaylistConfiguration : IEntityTypeConfiguration<Playlist>
{
    public void Configure(EntityTypeBuilder<Playlist> builder)
    {
        builder.HasOne(p => p.Owner)
               .WithMany(u => u.Playlists)
               .HasForeignKey(p => p.OwnerUserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.OwnerUserId);
        builder.HasIndex(p => new { p.Visibility, p.CreatedAt });
    }
}