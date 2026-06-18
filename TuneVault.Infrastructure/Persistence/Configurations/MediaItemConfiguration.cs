using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class MediaItemConfiguration : IEntityTypeConfiguration<MediaItem>
{
    public void Configure(EntityTypeBuilder<MediaItem> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Title).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Url).IsRequired();
        builder.Property(m => m.MediaType).IsRequired().HasMaxLength(20); // "Audio" hoặc "Video"
    }
}