using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class AlbumConfiguration : IEntityTypeConfiguration<Album>
{
    public void Configure(EntityTypeBuilder<Album> builder)
    {
        builder.HasOne(a => a.Artist)
               .WithMany(ar => ar.Albums)
               .HasForeignKey(a => a.ArtistId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.ArtistId);
        builder.HasIndex(a => new { a.ReleaseDate, a.AlbumType });
    }
}