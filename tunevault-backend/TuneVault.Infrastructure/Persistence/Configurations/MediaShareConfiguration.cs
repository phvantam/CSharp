using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class MediaShareConfiguration : IEntityTypeConfiguration<MediaShare>
{
    public void Configure(EntityTypeBuilder<MediaShare> builder)
    {
        // Sender → ApplicationUser
        builder.HasOne(ms => ms.Sender)
               .WithMany(u => u.SentShares)
               .HasForeignKey(ms => ms.SenderUserId)
               .OnDelete(DeleteBehavior.Restrict);

        // Receiver → ApplicationUser
        builder.HasOne(ms => ms.Receiver)
               .WithMany(u => u.ReceivedShares)
               .HasForeignKey(ms => ms.ReceiverUserId)
               .OnDelete(DeleteBehavior.Restrict);

        // MediaItem (nếu chia sẻ bài hát)
        builder.HasOne(ms => ms.MediaItem)
               .WithMany()
               .HasForeignKey(ms => ms.MediaItemId)
               .OnDelete(DeleteBehavior.Restrict);

        // Playlist (nếu chia sẻ playlist)
        builder.HasOne(ms => ms.Playlist)
               .WithMany()
               .HasForeignKey(ms => ms.PlaylistId)
               .OnDelete(DeleteBehavior.Restrict);

        // Check Constraint
        builder.ToTable(t => t.HasCheckConstraint("CK_MediaShare_OneTarget",
            "([MediaItemId] IS NOT NULL AND [PlaylistId] IS NULL) OR ([MediaItemId] IS NULL AND [PlaylistId] IS NOT NULL)"));

        // Index hỗ trợ query
        builder.HasIndex(ms => new { ms.ReceiverUserId, ms.CreatedAt });
        builder.HasIndex(ms => new { ms.SenderUserId, ms.CreatedAt });
    }
}