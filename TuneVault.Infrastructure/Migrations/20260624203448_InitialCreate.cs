using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TuneVault.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Albums",
                columns: table => new
                {
                    AlbumId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ArtistName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoverImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Albums", x => x.AlbumId);
                    table.ForeignKey(
                        name: "FK_Albums_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Follows",
                columns: table => new
                {
                    FollowId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FollowerUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FollowingUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Follows", x => x.FollowId);
                    table.ForeignKey(
                        name: "FK_Follows_Users_FollowerUserId",
                        column: x => x.FollowerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Follows_Users_FollowingUserId",
                        column: x => x.FollowingUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MediaItems",
                columns: table => new
                {
                    MediaItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MediaType = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Audio"),
                    Genre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MimeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(450)", nullable: false, defaultValue: "Public"),
                    PlayCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsProcessed = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ArtistName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlbumTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlbumId = table.Column<int>(type: "int", nullable: true),
                    OwnerDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaItems", x => x.MediaItemId);
                    table.ForeignKey(
                        name: "FK_MediaItems_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ActorUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    MediaShareId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Playlists",
                columns: table => new
                {
                    PlaylistId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Visibility = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Private"),
                    IsCollaborative = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Playlists", x => x.PlaylistId);
                    table.ForeignKey(
                        name: "FK_Playlists_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    FavoriteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MediaItemId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.FavoriteId);
                    table.ForeignKey(
                        name: "FK_Favorites_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "MediaItemId");
                    table.ForeignKey(
                        name: "FK_Favorites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlayHistories",
                columns: table => new
                {
                    PlayHistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MediaItemId = table.Column<int>(type: "int", nullable: false),
                    PlayedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayHistories", x => x.PlayHistoryId);
                    table.ForeignKey(
                        name: "FK_PlayHistories_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "MediaItemId");
                    table.ForeignKey(
                        name: "FK_PlayHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MediaShares",
                columns: table => new
                {
                    MediaShareId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SenderUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ReceiverUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MediaItemId = table.Column<int>(type: "int", nullable: true),
                    PlaylistId = table.Column<int>(type: "int", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaShares", x => x.MediaShareId);
                    table.ForeignKey(
                        name: "FK_MediaShares_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "MediaItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MediaShares_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "PlaylistId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MediaShares_Users_ReceiverUserId",
                        column: x => x.ReceiverUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MediaShares_Users_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlaylistTracks",
                columns: table => new
                {
                    PlaylistTrackId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlaylistId = table.Column<int>(type: "int", nullable: false),
                    MediaItemId = table.Column<int>(type: "int", nullable: false),
                    AddedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaylistTracks", x => x.PlaylistTrackId);
                    table.ForeignKey(
                        name: "FK_PlaylistTracks_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "MediaItemId");
                    table.ForeignKey(
                        name: "FK_PlaylistTracks_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "PlaylistId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarUrl", "Bio", "CreatedAt", "DisplayName", "Email", "IsActive", "PasswordHash", "UpdatedAt" },
                values: new object[,]
                {
                    { "U001", null, null, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(7091), new TimeSpan(0, 0, 0, 0, 0)), "TuneVault Admin", "admin@tunevault.com", true, "A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(7096), new TimeSpan(0, 0, 0, 0, 0)) },
                    { "U002", null, null, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8784), new TimeSpan(0, 0, 0, 0, 0)), "Nguyễn Yến Vy", "vy@tunevault.com", true, "A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8786), new TimeSpan(0, 0, 0, 0, 0)) },
                    { "U003", null, null, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8900), new TimeSpan(0, 0, 0, 0, 0)), "Trần Minh Khang", "khang@tunevault.com", true, "A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8900), new TimeSpan(0, 0, 0, 0, 0)) },
                    { "U004", null, null, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8906), new TimeSpan(0, 0, 0, 0, 0)), "Lê Hoài Linh", "linh@tunevault.com", true, "A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8907), new TimeSpan(0, 0, 0, 0, 0)) },
                    { "U005", null, null, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8911), new TimeSpan(0, 0, 0, 0, 0)), "Phạm Quốc An", "an@tunevault.com", true, "A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86F7F7A27AE3", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 912, DateTimeKind.Unspecified).AddTicks(8912), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "Albums",
                columns: new[] { "AlbumId", "ArtistName", "CoverImageUrl", "CreatedAt", "Description", "OwnerUserId", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Sơn Tùng M-TP", "/image/noinaycoanh.png", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 913, DateTimeKind.Unspecified).AddTicks(6911), new TimeSpan(0, 0, 0, 0, 0)), "Album V-Pop Hay Nhất", "U001", "V-Pop Hits", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 913, DateTimeKind.Unspecified).AddTicks(6912), new TimeSpan(0, 0, 0, 0, 0)) },
                    { 2, "Đen", "/image/mangtienvechome.jpg", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 913, DateTimeKind.Unspecified).AddTicks(8470), new TimeSpan(0, 0, 0, 0, 0)), "Album nhạc Rap ý nghĩa", "U001", "Rap Việt", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 913, DateTimeKind.Unspecified).AddTicks(8471), new TimeSpan(0, 0, 0, 0, 0)) }
                });

            migrationBuilder.InsertData(
                table: "MediaItems",
                columns: new[] { "MediaItemId", "AlbumId", "AlbumTitle", "ArtistName", "CreatedAt", "Description", "DurationSeconds", "FilePath", "FileSizeBytes", "Genre", "IsProcessed", "MediaType", "MimeType", "OwnerDisplayName", "OwnerUserId", "Slug", "ThumbnailUrl", "Title", "UpdatedAt", "Visibility" },
                values: new object[,]
                {
                    { 1, 1, "V-Pop Hits", "Sơn Tùng M-TP", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 913, DateTimeKind.Unspecified).AddTicks(9997), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "TuneVault Admin", "U001", null, "/image/noinaycoanh.png", "Nơi Này Có Anh", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 913, DateTimeKind.Unspecified).AddTicks(9998), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 2, null, null, "Hoàng Thùy Linh", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2542), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "TuneVault Admin", "U001", null, "/image/seetinh.jpg", "See Tình", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2543), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 3, 2, "Rap Việt", "Đen", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2551), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "TuneVault Admin", "U001", null, "/image/mangtienvechome.jpg", "Mang Tiền Về Cho Mẹ", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2551), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 8, null, null, "Vũ.", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2556), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "TuneVault Admin", "U001", null, "/image/lalung.jpg", "Lạ Lùng", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2557), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 10, null, null, "ERIK", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2560), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "TuneVault Admin", "U001", null, "/image/sautatca.jpg", "Sau Tất Cả", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2560), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 15, null, null, "MONSTAR, GREY D", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2563), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Nguyễn Yến Vy", "U002", null, "/image/cohenvoithanhxuan.jpg", "Có Hẹn Với Thanh Xuân", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2564), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 16, null, null, "Sơn Tùng MTP", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2566), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Nguyễn Yến Vy", "U002", null, "/image/comemyway.jpg", "Come My Way", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2567), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 17, null, null, "Min Quỳnh Anh", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2570), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Trần Minh Khang", "U003", null, "/image/emthuacota.jpg", "Em Thua Cô Ta", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2571), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 18, null, null, "HIEUTHUHAI", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2573), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Trần Minh Khang", "U003", null, "/image/khongthesay.jpg", "Không Thể Say", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2574), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 19, null, null, "MONO", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2576), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Lê Hoài Linh", "U004", null, "/image/waitingforyou.jpg", "Waiting For You", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2577), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 20, null, null, "Phan Mạnh Quỳnh", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2580), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Lê Hoài Linh", "U004", null, "/image/cochangtrai.jpg", "Có Chàng Trai Viết Lên Cây", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2580), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 21, null, null, "Nguyễn Thành Đạt", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2583), new TimeSpan(0, 0, 0, 0, 0)), null, 0, "temp-upload-test.mp3", 0L, null, true, "Audio", null, "Phạm Quốc An", "U005", null, "/image/thiephongsaiten.jpg", "Thiệp Hồng Sai Tên", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(2584), new TimeSpan(0, 0, 0, 0, 0)), "Public" }
                });

            migrationBuilder.InsertData(
                table: "Playlists",
                columns: new[] { "PlaylistId", "CreatedAt", "IsCollaborative", "OwnerUserId", "Title", "UpdatedAt", "Visibility" },
                values: new object[,]
                {
                    { 1, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(3744), new TimeSpan(0, 0, 0, 0, 0)), false, "U001", "V-Pop Hits Collection", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(3745), new TimeSpan(0, 0, 0, 0, 0)), "Public" },
                    { 2, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(4720), new TimeSpan(0, 0, 0, 0, 0)), false, "U002", "Chill Vibes", new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(4721), new TimeSpan(0, 0, 0, 0, 0)), "Public" }
                });

            migrationBuilder.InsertData(
                table: "PlaylistTracks",
                columns: new[] { "PlaylistTrackId", "AddedAt", "MediaItemId", "PlaylistId" },
                values: new object[,]
                {
                    { 1, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(5485), new TimeSpan(0, 0, 0, 0, 0)), 1, 1 },
                    { 2, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(6328), new TimeSpan(0, 0, 0, 0, 0)), 8, 1 },
                    { 3, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(6331), new TimeSpan(0, 0, 0, 0, 0)), 10, 1 },
                    { 4, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(6333), new TimeSpan(0, 0, 0, 0, 0)), 15, 2 },
                    { 5, new DateTimeOffset(new DateTime(2026, 6, 24, 20, 34, 47, 914, DateTimeKind.Unspecified).AddTicks(6334), new TimeSpan(0, 0, 0, 0, 0)), 16, 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Albums_OwnerUserId",
                table: "Albums",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_MediaItemId",
                table: "Favorites",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId_MediaItemId",
                table: "Favorites",
                columns: new[] { "UserId", "MediaItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Follows_FollowerUserId_FollowingUserId",
                table: "Follows",
                columns: new[] { "FollowerUserId", "FollowingUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Follows_FollowingUserId",
                table: "Follows",
                column: "FollowingUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_OwnerUserId",
                table: "MediaItems",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_Title",
                table: "MediaItems",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_Visibility",
                table: "MediaItems",
                column: "Visibility");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_MediaItemId",
                table: "MediaShares",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_PlaylistId",
                table: "MediaShares",
                column: "PlaylistId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_ReceiverUserId",
                table: "MediaShares",
                column: "ReceiverUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_SenderUserId",
                table: "MediaShares",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ActorUserId",
                table: "Notifications",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayHistories_MediaItemId",
                table: "PlayHistories",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayHistories_UserId",
                table: "PlayHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_OwnerUserId",
                table: "Playlists",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistTracks_MediaItemId",
                table: "PlaylistTracks",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistTracks_PlaylistId_MediaItemId",
                table: "PlaylistTracks",
                columns: new[] { "PlaylistId", "MediaItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Albums");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "Follows");

            migrationBuilder.DropTable(
                name: "MediaShares");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PlayHistories");

            migrationBuilder.DropTable(
                name: "PlaylistTracks");

            migrationBuilder.DropTable(
                name: "MediaItems");

            migrationBuilder.DropTable(
                name: "Playlists");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
