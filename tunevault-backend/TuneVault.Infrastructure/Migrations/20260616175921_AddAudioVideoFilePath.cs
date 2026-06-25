using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuneVault.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioVideoFilePath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AudioFilePath",
                table: "MediaItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoFilePath",
                table: "MediaItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioFilePath",
                table: "MediaItems");

            migrationBuilder.DropColumn(
                name: "VideoFilePath",
                table: "MediaItems");
        }
    }
}
