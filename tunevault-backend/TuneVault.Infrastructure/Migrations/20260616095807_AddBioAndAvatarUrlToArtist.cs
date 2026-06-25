using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuneVault.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBioAndAvatarUrlToArtist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Artists",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Artists");
        }
    }
}
