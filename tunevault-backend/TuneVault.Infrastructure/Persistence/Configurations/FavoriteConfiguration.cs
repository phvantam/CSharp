using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
{
    public void Configure(EntityTypeBuilder<Favorite> builder)
    {
        builder.HasOne(f => f.User)
               .WithMany(u => u.Favorites)
               .HasForeignKey(f => f.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.MediaItem)
               .WithMany()
               .HasForeignKey(f => f.MediaItemId)
               .OnDelete(DeleteBehavior.Cascade);

        // Một user chỉ like 1 bài hát 1 lần
        builder.HasIndex(f => new { f.UserId, f.MediaItemId }).IsUnique();
    }
}