using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class PlayHistoryConfiguration : IEntityTypeConfiguration<PlayHistory>
{
    public void Configure(EntityTypeBuilder<PlayHistory> builder)
    {
        builder.HasOne(ph => ph.User)
               .WithMany(u => u.PlayHistories)
               .HasForeignKey(ph => ph.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ph => ph.MediaItem)
               .WithMany()
               .HasForeignKey(ph => ph.MediaItemId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(ph => new { ph.UserId, ph.LastPlayedAt });
    }
}