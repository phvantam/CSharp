using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class MediaTagConfiguration : IEntityTypeConfiguration<MediaTag>
{
    public void Configure(EntityTypeBuilder<MediaTag> builder)
    {
        // Fix warning: Specify precision and scale for decimal
        builder.Property(x => x.Confidence)
            .HasPrecision(5, 4);           // Tương ứng với DECIMAL(5,4) trong database

        // Optional: Có thể thêm các cấu hình khác sau
        builder.Property(x => x.TagName)
            .HasMaxLength(80);
    }
}