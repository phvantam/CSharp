using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasOne(up => up.User)
               .WithOne(u => u.UserProfile)
               .HasForeignKey<UserProfile>(up => up.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(up => up.UserId).IsUnique();
    }
}