using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class ShareConfiguration : IEntityTypeConfiguration<Share>
{
    public void Configure(EntityTypeBuilder<Share> builder)
    {
        builder.HasKey(s => s.Id);

        // Người gửi: Dùng NoAction/Restrict để tránh lỗi "nhân bản vòng lặp cascade" trong SQL Server
        builder.HasOne<User>()
               .WithMany()
               .HasForeignKey(s => s.SenderUserId)
               .OnDelete(DeleteBehavior.NoAction);

        // Người nhận
        builder.HasOne<User>()
               .WithMany()
               .HasForeignKey(s => s.ReceiverUserId)
               .OnDelete(DeleteBehavior.Cascade);

        // Media Item được share (có thể null)
        builder.HasOne<MediaItem>()
               .WithMany()
               .HasForeignKey(s => s.MediaItemId)
               .OnDelete(DeleteBehavior.SetNull);

        // Playlist được share (có thể null)
        builder.HasOne<Playlist>()
               .WithMany()
               .HasForeignKey(s => s.PlaylistId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}