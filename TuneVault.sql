/* =========================
   0. CREATE DATABASE
   ========================= */
IF DB_ID(N'TuneVault') IS NULL
BEGIN
    CREATE DATABASE [TuneVault];
END
GO

USE [TuneVault];
GO

/* =========================
   1. DROP OLD TABLES
   ========================= */
DROP TABLE IF EXISTS dbo.[Follow];
DROP TABLE IF EXISTS dbo.[PlayHistory];
DROP TABLE IF EXISTS dbo.[Favorite];
DROP TABLE IF EXISTS dbo.[Notification];
DROP TABLE IF EXISTS dbo.[MediaShare];
DROP TABLE IF EXISTS dbo.[PlaylistTrack];
DROP TABLE IF EXISTS dbo.[Playlist];
DROP TABLE IF EXISTS dbo.[MediaTag];
DROP TABLE IF EXISTS dbo.[MediaItem];
DROP TABLE IF EXISTS dbo.[Album];
DROP TABLE IF EXISTS dbo.[Artist];
DROP TABLE IF EXISTS dbo.[UserProfile];
DROP TABLE IF EXISTS dbo.[AspNetUserRoles];
DROP TABLE IF EXISTS dbo.[AspNetRoles];
DROP TABLE IF EXISTS dbo.[AspNetUsers];
GO

/* =========================================================
   2. CREATE TABLES 
   ========================================================= */

CREATE TABLE dbo.[AspNetUsers]
(
    [Id] NVARCHAR(450) NOT NULL,
    [UserName] NVARCHAR(256) NOT NULL,
    [NormalizedUserName] NVARCHAR(256) NOT NULL,
    [Email] NVARCHAR(256) NOT NULL,
    [NormalizedEmail] NVARCHAR(256) NOT NULL,
    [EmailConfirmed] BIT NOT NULL,
    [PasswordHash] NVARCHAR(MAX) NULL,
    [SecurityStamp] NVARCHAR(MAX) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    [PhoneNumber] NVARCHAR(30) NULL,
    [PhoneNumberConfirmed] BIT NOT NULL,
    [TwoFactorEnabled] BIT NOT NULL,
    [LockoutEnd] DATETIMEOFFSET NULL,
    [LockoutEnabled] BIT NOT NULL,
    [AccessFailedCount] INT NOT NULL,

    -- Extended fields
    [DisplayName] NVARCHAR(120) NOT NULL,
    [AvatarUrl] NVARCHAR(500) NULL,
    [Bio] NVARCHAR(1000) NULL,
    [DateOfBirth] DATE NULL,
    [Gender] NVARCHAR(20) NULL,
    [IsActive] BIT NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[AspNetRoles]
(
    [Id] NVARCHAR(450) NOT NULL,
    [Name] NVARCHAR(256) NOT NULL,
    [NormalizedName] NVARCHAR(256) NOT NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[AspNetUserRoles]
(
    [UserId] NVARCHAR(450) NOT NULL,
    [RoleId] NVARCHAR(450) NOT NULL,
    [AssignedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[UserProfile]
(
    [UserProfileId] INT IDENTITY(1,1) NOT NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    [FullName] NVARCHAR(150) NOT NULL,
    [CoverImageUrl] NVARCHAR(500) NULL,
    [City] NVARCHAR(100) NULL,
    [Country] NVARCHAR(100) NULL,
    [WebsiteUrl] NVARCHAR(500) NULL,
    [FacebookUrl] NVARCHAR(500) NULL,
    [PrivacyLevel] NVARCHAR(20) NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[Artist]
(
    [ArtistId] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(150) NOT NULL,
    [Slug] NVARCHAR(180) NOT NULL,
    [Bio] NVARCHAR(1000) NULL,
    [Country] NVARCHAR(100) NULL,
    [ImageUrl] NVARCHAR(500) NULL,
    [IsVerified] BIT NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[Album]
(
    [AlbumId] INT IDENTITY(1,1) NOT NULL,
    [ArtistId] INT NOT NULL,
    [OwnerUserId] NVARCHAR(450) NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Slug] NVARCHAR(220) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [CoverImageUrl] NVARCHAR(500) NULL,
    [ReleaseDate] DATE NULL,
    [AlbumType] NVARCHAR(30) NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[MediaItem]
(
    [MediaItemId] BIGINT IDENTITY(1,1) NOT NULL,
    [OwnerUserId] NVARCHAR(450) NOT NULL,
    [ArtistId] INT NOT NULL,
    [AlbumId] INT NULL,
    [Title] NVARCHAR(250) NOT NULL,
    [Slug] NVARCHAR(280) NOT NULL,
    [Description] NVARCHAR(1500) NULL,
    [MediaType] NVARCHAR(20) NOT NULL,
    [Genre] NVARCHAR(80) NULL,
    [DurationSeconds] INT NOT NULL,
    [FilePath] NVARCHAR(500) NOT NULL,
    [ExternalUrl] NVARCHAR(500) NULL,
    [ThumbnailUrl] NVARCHAR(500) NULL,
    [MimeType] NVARCHAR(100) NOT NULL,
    [FileSizeBytes] BIGINT NOT NULL,
    [Visibility] NVARCHAR(20) NOT NULL,
    [PlayCount] INT NOT NULL,
    [IsProcessed] BIT NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[MediaTag]
(
    [MediaTagId] BIGINT IDENTITY(1,1) NOT NULL,
    [MediaItemId] BIGINT NOT NULL,
    [TagName] NVARCHAR(80) NOT NULL,
    [Confidence] DECIMAL(5,4) NOT NULL,
    [CreatedBy] NVARCHAR(30) NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[Playlist]
(
    [PlaylistId] BIGINT IDENTITY(1,1) NOT NULL,
    [OwnerUserId] NVARCHAR(450) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Slug] NVARCHAR(240) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [CoverImageUrl] NVARCHAR(500) NULL,
    [Visibility] NVARCHAR(20) NOT NULL,
    [IsCollaborative] BIT NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [UpdatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[PlaylistTrack]
(
    [PlaylistTrackId] BIGINT IDENTITY(1,1) NOT NULL,
    [PlaylistId] BIGINT NOT NULL,
    [MediaItemId] BIGINT NOT NULL,
    [Position] INT NOT NULL,
    [AddedByUserId] NVARCHAR(450) NOT NULL,
    [AddedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[MediaShare]
(
    [MediaShareId] BIGINT IDENTITY(1,1) NOT NULL,
    [SenderUserId] NVARCHAR(450) NOT NULL,
    [ReceiverUserId] NVARCHAR(450) NOT NULL,
    [MediaItemId] BIGINT NULL,
    [PlaylistId] BIGINT NULL,
    [Message] NVARCHAR(500) NULL,
    [ShareType] NVARCHAR(20) NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL,
    [RevokedAt] DATETIME2(0) NULL,
    [IsRevoked] BIT NOT NULL
);
GO

CREATE TABLE dbo.[Notification]
(
    [NotificationId] BIGINT IDENTITY(1,1) NOT NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    [ActorUserId] NVARCHAR(450) NULL,
    [Type] NVARCHAR(50) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Body] NVARCHAR(1000) NULL,
    [PayloadJson] NVARCHAR(MAX) NULL,
    [IsRead] BIT NOT NULL,
    [ReadAt] DATETIME2(0) NULL,
    [CreatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[Favorite]
(
    [FavoriteId] BIGINT IDENTITY(1,1) NOT NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    [MediaItemId] BIGINT NOT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL
);
GO

CREATE TABLE dbo.[PlayHistory]
(
    [PlayHistoryId] BIGINT IDENTITY(1,1) NOT NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    [MediaItemId] BIGINT NOT NULL,
    [StartedAt] DATETIME2(0) NOT NULL,
    [LastPlayedAt] DATETIME2(0) NOT NULL,
    [ProgressSeconds] INT NOT NULL,
    [IsCompleted] BIT NOT NULL,
    [DeviceInfo] NVARCHAR(200) NULL,
    [IpAddress] NVARCHAR(45) NULL
);
GO

CREATE TABLE dbo.[Follow]
(
    [FollowId] BIGINT IDENTITY(1,1) NOT NULL,
    [FollowerUserId] NVARCHAR(450) NOT NULL,
    [TargetUserId] NVARCHAR(450) NULL,
    [TargetArtistId] INT NULL,
    [CreatedAt] DATETIME2(0) NOT NULL
);
GO

/* =========================================================
   3. ADD PRIMARY KEYS
   ========================================================= */
ALTER TABLE dbo.[AspNetUsers]
ADD CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED ([Id]);
GO

ALTER TABLE dbo.[AspNetRoles]
ADD CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED ([Id]);
GO

ALTER TABLE dbo.[AspNetUserRoles]
ADD CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY CLUSTERED ([UserId], [RoleId]);
GO

ALTER TABLE dbo.[UserProfile]
ADD CONSTRAINT [PK_UserProfile] PRIMARY KEY CLUSTERED ([UserProfileId]);
GO

ALTER TABLE dbo.[Artist]
ADD CONSTRAINT [PK_Artist] PRIMARY KEY CLUSTERED ([ArtistId]);
GO

ALTER TABLE dbo.[Album]
ADD CONSTRAINT [PK_Album] PRIMARY KEY CLUSTERED ([AlbumId]);
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [PK_MediaItem] PRIMARY KEY CLUSTERED ([MediaItemId]);
GO

ALTER TABLE dbo.[MediaTag]
ADD CONSTRAINT [PK_MediaTag] PRIMARY KEY CLUSTERED ([MediaTagId]);
GO

ALTER TABLE dbo.[Playlist]
ADD CONSTRAINT [PK_Playlist] PRIMARY KEY CLUSTERED ([PlaylistId]);
GO

ALTER TABLE dbo.[PlaylistTrack]
ADD CONSTRAINT [PK_PlaylistTrack] PRIMARY KEY CLUSTERED ([PlaylistTrackId]);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [PK_MediaShare] PRIMARY KEY CLUSTERED ([MediaShareId]);
GO

ALTER TABLE dbo.[Notification]
ADD CONSTRAINT [PK_Notification] PRIMARY KEY CLUSTERED ([NotificationId]);
GO

ALTER TABLE dbo.[Favorite]
ADD CONSTRAINT [PK_Favorite] PRIMARY KEY CLUSTERED ([FavoriteId]);
GO

ALTER TABLE dbo.[PlayHistory]
ADD CONSTRAINT [PK_PlayHistory] PRIMARY KEY CLUSTERED ([PlayHistoryId]);
GO

ALTER TABLE dbo.[Follow]
ADD CONSTRAINT [PK_Follow] PRIMARY KEY CLUSTERED ([FollowId]);
GO

/* =========================================================
   4. ADD DEFAULT CONSTRAINTS
   ========================================================= */
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_EmailConfirmed] DEFAULT (0) FOR [EmailConfirmed];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_PhoneNumberConfirmed] DEFAULT (0) FOR [PhoneNumberConfirmed];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_TwoFactorEnabled] DEFAULT (0) FOR [TwoFactorEnabled];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_LockoutEnabled] DEFAULT (1) FOR [LockoutEnabled];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_AccessFailedCount] DEFAULT (0) FOR [AccessFailedCount];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_IsActive] DEFAULT (1) FOR [IsActive];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[AspNetUsers] ADD CONSTRAINT [DF_AspNetUsers_UpdatedAt] DEFAULT (SYSDATETIME()) FOR [UpdatedAt];
GO

ALTER TABLE dbo.[AspNetRoles] ADD CONSTRAINT [DF_AspNetRoles_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[AspNetUserRoles] ADD CONSTRAINT [DF_AspNetUserRoles_AssignedAt] DEFAULT (SYSDATETIME()) FOR [AssignedAt];
GO

ALTER TABLE dbo.[UserProfile] ADD CONSTRAINT [DF_UserProfile_PrivacyLevel] DEFAULT (N'Public') FOR [PrivacyLevel];
ALTER TABLE dbo.[UserProfile] ADD CONSTRAINT [DF_UserProfile_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[UserProfile] ADD CONSTRAINT [DF_UserProfile_UpdatedAt] DEFAULT (SYSDATETIME()) FOR [UpdatedAt];
GO

ALTER TABLE dbo.[Artist] ADD CONSTRAINT [DF_Artist_IsVerified] DEFAULT (0) FOR [IsVerified];
ALTER TABLE dbo.[Artist] ADD CONSTRAINT [DF_Artist_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[Artist] ADD CONSTRAINT [DF_Artist_UpdatedAt] DEFAULT (SYSDATETIME()) FOR [UpdatedAt];
GO

ALTER TABLE dbo.[Album] ADD CONSTRAINT [DF_Album_AlbumType] DEFAULT (N'Single') FOR [AlbumType];
ALTER TABLE dbo.[Album] ADD CONSTRAINT [DF_Album_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[Album] ADD CONSTRAINT [DF_Album_UpdatedAt] DEFAULT (SYSDATETIME()) FOR [UpdatedAt];
GO

ALTER TABLE dbo.[MediaItem] ADD CONSTRAINT [DF_MediaItem_Visibility] DEFAULT (N'Public') FOR [Visibility];
ALTER TABLE dbo.[MediaItem] ADD CONSTRAINT [DF_MediaItem_PlayCount] DEFAULT (0) FOR [PlayCount];
ALTER TABLE dbo.[MediaItem] ADD CONSTRAINT [DF_MediaItem_IsProcessed] DEFAULT (0) FOR [IsProcessed];
ALTER TABLE dbo.[MediaItem] ADD CONSTRAINT [DF_MediaItem_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[MediaItem] ADD CONSTRAINT [DF_MediaItem_UpdatedAt] DEFAULT (SYSDATETIME()) FOR [UpdatedAt];
GO

ALTER TABLE dbo.[MediaTag] ADD CONSTRAINT [DF_MediaTag_Confidence] DEFAULT (1.0000) FOR [Confidence];
ALTER TABLE dbo.[MediaTag] ADD CONSTRAINT [DF_MediaTag_CreatedBy] DEFAULT (N'AI') FOR [CreatedBy];
ALTER TABLE dbo.[MediaTag] ADD CONSTRAINT [DF_MediaTag_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
GO

ALTER TABLE dbo.[Playlist] ADD CONSTRAINT [DF_Playlist_Visibility] DEFAULT (N'Private') FOR [Visibility];
ALTER TABLE dbo.[Playlist] ADD CONSTRAINT [DF_Playlist_IsCollaborative] DEFAULT (0) FOR [IsCollaborative];
ALTER TABLE dbo.[Playlist] ADD CONSTRAINT [DF_Playlist_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[Playlist] ADD CONSTRAINT [DF_Playlist_UpdatedAt] DEFAULT (SYSDATETIME()) FOR [UpdatedAt];
GO

ALTER TABLE dbo.[PlaylistTrack] ADD CONSTRAINT [DF_PlaylistTrack_AddedAt] DEFAULT (SYSDATETIME()) FOR [AddedAt];
GO

ALTER TABLE dbo.[MediaShare] ADD CONSTRAINT [DF_MediaShare_ShareType] DEFAULT (N'Media') FOR [ShareType];
ALTER TABLE dbo.[MediaShare] ADD CONSTRAINT [DF_MediaShare_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
ALTER TABLE dbo.[MediaShare] ADD CONSTRAINT [DF_MediaShare_IsRevoked] DEFAULT (0) FOR [IsRevoked];
GO

ALTER TABLE dbo.[Notification] ADD CONSTRAINT [DF_Notification_IsRead] DEFAULT (0) FOR [IsRead];
ALTER TABLE dbo.[Notification] ADD CONSTRAINT [DF_Notification_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
GO

ALTER TABLE dbo.[Favorite] ADD CONSTRAINT [DF_Favorite_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
GO

ALTER TABLE dbo.[PlayHistory] ADD CONSTRAINT [DF_PlayHistory_StartedAt] DEFAULT (SYSDATETIME()) FOR [StartedAt];
ALTER TABLE dbo.[PlayHistory] ADD CONSTRAINT [DF_PlayHistory_LastPlayedAt] DEFAULT (SYSDATETIME()) FOR [LastPlayedAt];
ALTER TABLE dbo.[PlayHistory] ADD CONSTRAINT [DF_PlayHistory_ProgressSeconds] DEFAULT (0) FOR [ProgressSeconds];
ALTER TABLE dbo.[PlayHistory] ADD CONSTRAINT [DF_PlayHistory_IsCompleted] DEFAULT (0) FOR [IsCompleted];
GO

ALTER TABLE dbo.[Follow] ADD CONSTRAINT [DF_Follow_CreatedAt] DEFAULT (SYSDATETIME()) FOR [CreatedAt];
GO

/* =========================================================
   5. ADD CHECK CONSTRAINTS
   ========================================================= */
ALTER TABLE dbo.[AspNetUsers]
ADD CONSTRAINT [CK_AspNetUsers_Gender]
CHECK ([Gender] IS NULL OR [Gender] IN (N'Male', N'Female', N'Other'));
GO

ALTER TABLE dbo.[UserProfile]
ADD CONSTRAINT [CK_UserProfile_PrivacyLevel]
CHECK ([PrivacyLevel] IN (N'Public', N'Private', N'FriendsOnly'));
GO

ALTER TABLE dbo.[Album]
ADD CONSTRAINT [CK_Album_AlbumType]
CHECK ([AlbumType] IN (N'Single', N'EP', N'Album', N'Compilation'));
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [CK_MediaItem_MediaType]
CHECK ([MediaType] IN (N'Audio', N'Video'));
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [CK_MediaItem_Visibility]
CHECK ([Visibility] IN (N'Public', N'Private', N'Unlisted'));
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [CK_MediaItem_NonNegative]
CHECK ([DurationSeconds] >= 0 AND [FileSizeBytes] >= 0 AND [PlayCount] >= 0);
GO

ALTER TABLE dbo.[MediaTag]
ADD CONSTRAINT [CK_MediaTag_Confidence]
CHECK ([Confidence] >= 0 AND [Confidence] <= 1);
GO

ALTER TABLE dbo.[MediaTag]
ADD CONSTRAINT [CK_MediaTag_CreatedBy]
CHECK ([CreatedBy] IN (N'AI', N'User', N'Admin', N'Seed'));
GO

ALTER TABLE dbo.[Playlist]
ADD CONSTRAINT [CK_Playlist_Visibility]
CHECK ([Visibility] IN (N'Public', N'Private', N'Unlisted'));
GO

ALTER TABLE dbo.[PlaylistTrack]
ADD CONSTRAINT [CK_PlaylistTrack_Position]
CHECK ([Position] > 0);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [CK_MediaShare_OneTarget]
CHECK
(
    ([MediaItemId] IS NOT NULL AND [PlaylistId] IS NULL)
    OR
    ([MediaItemId] IS NULL AND [PlaylistId] IS NOT NULL)
);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [CK_MediaShare_SenderReceiver]
CHECK ([SenderUserId] <> [ReceiverUserId]);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [CK_MediaShare_ShareType]
CHECK ([ShareType] IN (N'Media', N'Playlist'));
GO

ALTER TABLE dbo.[Notification]
ADD CONSTRAINT [CK_Notification_Type]
CHECK ([Type] IN (N'MediaShared', N'PlaylistShared', N'Followed', N'Favorite', N'System'));
GO

ALTER TABLE dbo.[PlayHistory]
ADD CONSTRAINT [CK_PlayHistory_Progress]
CHECK ([ProgressSeconds] >= 0);
GO

ALTER TABLE dbo.[Follow]
ADD CONSTRAINT [CK_Follow_OneTarget]
CHECK
(
    ([TargetUserId] IS NOT NULL AND [TargetArtistId] IS NULL)
    OR
    ([TargetUserId] IS NULL AND [TargetArtistId] IS NOT NULL)
);
GO

ALTER TABLE dbo.[Follow]
ADD CONSTRAINT [CK_Follow_NotSelf]
CHECK ([TargetUserId] IS NULL OR [FollowerUserId] <> [TargetUserId]);
GO


/* =========================================================
   6. ADD FOREIGN KEYS
   ========================================================= */
ALTER TABLE dbo.[AspNetUserRoles]
ADD CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId]
FOREIGN KEY ([UserId]) REFERENCES dbo.[AspNetUsers] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[AspNetUserRoles]
ADD CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
FOREIGN KEY ([RoleId]) REFERENCES dbo.[AspNetRoles] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[UserProfile]
ADD CONSTRAINT [FK_UserProfile_AspNetUsers_UserId]
FOREIGN KEY ([UserId]) REFERENCES dbo.[AspNetUsers] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[Album]
ADD CONSTRAINT [FK_Album_Artist_ArtistId]
FOREIGN KEY ([ArtistId]) REFERENCES dbo.[Artist] ([ArtistId]);
GO

ALTER TABLE dbo.[Album]
ADD CONSTRAINT [FK_Album_AspNetUsers_OwnerUserId]
FOREIGN KEY ([OwnerUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [FK_MediaItem_AspNetUsers_OwnerUserId]
FOREIGN KEY ([OwnerUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [FK_MediaItem_Artist_ArtistId]
FOREIGN KEY ([ArtistId]) REFERENCES dbo.[Artist] ([ArtistId]);
GO

ALTER TABLE dbo.[MediaItem]
ADD CONSTRAINT [FK_MediaItem_Album_AlbumId]
FOREIGN KEY ([AlbumId]) REFERENCES dbo.[Album] ([AlbumId]);
GO

ALTER TABLE dbo.[MediaTag]
ADD CONSTRAINT [FK_MediaTag_MediaItem_MediaItemId]
FOREIGN KEY ([MediaItemId]) REFERENCES dbo.[MediaItem] ([MediaItemId]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[Playlist]
ADD CONSTRAINT [FK_Playlist_AspNetUsers_OwnerUserId]
FOREIGN KEY ([OwnerUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[PlaylistTrack]
ADD CONSTRAINT [FK_PlaylistTrack_Playlist_PlaylistId]
FOREIGN KEY ([PlaylistId]) REFERENCES dbo.[Playlist] ([PlaylistId]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[PlaylistTrack]
ADD CONSTRAINT [FK_PlaylistTrack_MediaItem_MediaItemId]
FOREIGN KEY ([MediaItemId]) REFERENCES dbo.[MediaItem] ([MediaItemId]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[PlaylistTrack]
ADD CONSTRAINT [FK_PlaylistTrack_AspNetUsers_AddedByUserId]
FOREIGN KEY ([AddedByUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [FK_MediaShare_AspNetUsers_SenderUserId]
FOREIGN KEY ([SenderUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [FK_MediaShare_AspNetUsers_ReceiverUserId]
FOREIGN KEY ([ReceiverUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [FK_MediaShare_MediaItem_MediaItemId]
FOREIGN KEY ([MediaItemId]) REFERENCES dbo.[MediaItem] ([MediaItemId]);
GO

ALTER TABLE dbo.[MediaShare]
ADD CONSTRAINT [FK_MediaShare_Playlist_PlaylistId]
FOREIGN KEY ([PlaylistId]) REFERENCES dbo.[Playlist] ([PlaylistId]);
GO

ALTER TABLE dbo.[Notification]
ADD CONSTRAINT [FK_Notification_AspNetUsers_UserId]
FOREIGN KEY ([UserId]) REFERENCES dbo.[AspNetUsers] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[Notification]
ADD CONSTRAINT [FK_Notification_AspNetUsers_ActorUserId]
FOREIGN KEY ([ActorUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[Favorite]
ADD CONSTRAINT [FK_Favorite_AspNetUsers_UserId]
FOREIGN KEY ([UserId]) REFERENCES dbo.[AspNetUsers] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[Favorite]
ADD CONSTRAINT [FK_Favorite_MediaItem_MediaItemId]
FOREIGN KEY ([MediaItemId]) REFERENCES dbo.[MediaItem] ([MediaItemId]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[PlayHistory]
ADD CONSTRAINT [FK_PlayHistory_AspNetUsers_UserId]
FOREIGN KEY ([UserId]) REFERENCES dbo.[AspNetUsers] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[PlayHistory]
ADD CONSTRAINT [FK_PlayHistory_MediaItem_MediaItemId]
FOREIGN KEY ([MediaItemId]) REFERENCES dbo.[MediaItem] ([MediaItemId]) ON DELETE CASCADE;
GO

ALTER TABLE dbo.[Follow]
ADD CONSTRAINT [FK_Follow_AspNetUsers_FollowerUserId]
FOREIGN KEY ([FollowerUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[Follow]
ADD CONSTRAINT [FK_Follow_AspNetUsers_TargetUserId]
FOREIGN KEY ([TargetUserId]) REFERENCES dbo.[AspNetUsers] ([Id]);
GO

ALTER TABLE dbo.[Follow]
ADD CONSTRAINT [FK_Follow_Artist_TargetArtistId]
FOREIGN KEY ([TargetArtistId]) REFERENCES dbo.[Artist] ([ArtistId]);
GO

/* =========================================================
   7. ADD NORMAL INDEXES
   ========================================================= */
CREATE INDEX [IX_AspNetUserRoles_RoleId] ON dbo.[AspNetUserRoles] ([RoleId]);
GO

CREATE INDEX [IX_Album_ArtistId] ON dbo.[Album] ([ArtistId]);
GO

CREATE INDEX [IX_MediaItem_ArtistId] ON dbo.[MediaItem] ([ArtistId]);
GO

CREATE INDEX [IX_MediaItem_AlbumId] ON dbo.[MediaItem] ([AlbumId]);
GO

CREATE INDEX [IX_MediaItem_OwnerUserId] ON dbo.[MediaItem] ([OwnerUserId]);
GO

CREATE INDEX [IX_MediaItem_Type_Genre_Visibility]
ON dbo.[MediaItem] ([MediaType], [Genre], [Visibility]);
GO

CREATE INDEX [IX_MediaItem_Title]
ON dbo.[MediaItem] ([Title]);
GO

CREATE INDEX [IX_MediaTag_TagName]
ON dbo.[MediaTag] ([TagName]);
GO

CREATE INDEX [IX_Playlist_OwnerUserId]
ON dbo.[Playlist] ([OwnerUserId]);
GO

CREATE INDEX [IX_PlaylistTrack_MediaItemId]
ON dbo.[PlaylistTrack] ([MediaItemId]);
GO

CREATE INDEX [IX_MediaShare_Receiver_CreatedAt]
ON dbo.[MediaShare] ([ReceiverUserId], [CreatedAt] DESC);
GO

CREATE INDEX [IX_MediaShare_Sender_CreatedAt]
ON dbo.[MediaShare] ([SenderUserId], [CreatedAt] DESC);
GO

CREATE INDEX [IX_Notification_User_Read_CreatedAt]
ON dbo.[Notification] ([UserId], [IsRead], [CreatedAt] DESC);
GO

CREATE INDEX [IX_PlayHistory_User_LastPlayed]
ON dbo.[PlayHistory] ([UserId], [LastPlayedAt] DESC);
GO

CREATE INDEX [IX_Follow_FollowerUserId]
ON dbo.[Follow] ([FollowerUserId]);
GO

/* =========================================================
   9. SEED DATA
   ========================================================= */

INSERT INTO dbo.[AspNetRoles]
(
    [Id], [Name], [NormalizedName], [ConcurrencyStamp], [CreatedAt]
)
VALUES
(N'ROLE_ADMIN', N'Quản trị viên', N'QUAN_TRI_VIEN', CONVERT(NVARCHAR(36), NEWID()), SYSDATETIME()),
(N'ROLE_USER',  N'Người dùng',    N'NGUOI_DUNG',    CONVERT(NVARCHAR(36), NEWID()), SYSDATETIME());
GO

INSERT INTO dbo.[AspNetUsers]
(
    [Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail],
    [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp],
    [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd],
    [LockoutEnabled], [AccessFailedCount], [DisplayName], [AvatarUrl], [Bio],
    [DateOfBirth], [Gender], [IsActive], [CreatedAt], [UpdatedAt]
)
VALUES
(
    N'U001', N'admin', N'ADMIN', N'admin@tunevault.vn', N'ADMIN@TUNEVAULT.VN',
    1, N'HASH_PLACEHOLDER_ADMIN', CONVERT(NVARCHAR(36), NEWID()), CONVERT(NVARCHAR(36), NEWID()),
    N'0900000001', 1, 0, NULL, 1, 0, N'TuneVault Admin',
    N'/images/avatars/admin.png', N'Tài khoản quản trị hệ thống TuneVault.',
    '1998-01-01', N'Other', 1, SYSDATETIME(), SYSDATETIME()
),
(
    N'U002', N'vy.nguyen', N'VY.NGUYEN', N'vy@tunevault.vn', N'VY@TUNEVAULT.VN',
    1, N'HASH_PLACEHOLDER_USER', CONVERT(NVARCHAR(36), NEWID()), CONVERT(NVARCHAR(36), NEWID()),
    N'0900000002', 1, 0, NULL, 1, 0, N'Nguyễn Yến Vy',
    N'/images/avatars/vy.png', N'Thích nghe V-Pop, ballad và nhạc chill khi học bài.',
    '2003-11-27', N'Female', 1, SYSDATETIME(), SYSDATETIME()
),
(
    N'U003', N'minh.khang', N'MINH.KHANG', N'minh@tunevault.vn', N'MINH@TUNEVAULT.VN',
    1, N'HASH_PLACEHOLDER_USER', CONVERT(NVARCHAR(36), NEWID()), CONVERT(NVARCHAR(36), NEWID()),
    N'0900000003', 1, 0, NULL, 1, 0, N'Trần Minh Khang',
    N'/images/avatars/khang.png', N'Nghe rap Việt, indie và xem MV chất lượng cao.',
    '2002-05-12', N'Male', 1, SYSDATETIME(), SYSDATETIME()
),
(
    N'U004', N'hoai.linh', N'HOAI.LINH', N'linh@tunevault.vn', N'LINH@TUNEVAULT.VN',
    1, N'HASH_PLACEHOLDER_USER', CONVERT(NVARCHAR(36), NEWID()), CONVERT(NVARCHAR(36), NEWID()),
    N'0900000004', 1, 0, NULL, 1, 0, N'Lê Hoài Linh',
    N'/images/avatars/linh.png', N'Thường tạo playlist học tập và thư giãn cuối ngày.',
    '2004-03-20', N'Female', 1, SYSDATETIME(), SYSDATETIME()
),
(
    N'U005', N'quoc.an', N'QUOC.AN', N'an@tunevault.vn', N'AN@TUNEVAULT.VN',
    1, N'HASH_PLACEHOLDER_USER', CONVERT(NVARCHAR(36), NEWID()), CONVERT(NVARCHAR(36), NEWID()),
    N'0900000005', 1, 0, NULL, 1, 0, N'Phạm Quốc An',
    N'/images/avatars/an.png', N'Thích khám phá nghệ sĩ mới và chia sẻ bài hát cho bạn bè.',
    '2001-09-15', N'Male', 1, SYSDATETIME(), SYSDATETIME()
);
GO

INSERT INTO dbo.[AspNetUserRoles] ([UserId], [RoleId], [AssignedAt])
VALUES
(N'U001', N'ROLE_ADMIN', SYSDATETIME()),
(N'U002', N'ROLE_USER',  SYSDATETIME()),
(N'U003', N'ROLE_USER',  SYSDATETIME()),
(N'U004', N'ROLE_USER',  SYSDATETIME()),
(N'U005', N'ROLE_USER',  SYSDATETIME());
GO

INSERT INTO dbo.[UserProfile]
(
    [UserId], [FullName], [CoverImageUrl], [City], [Country], [WebsiteUrl],
    [FacebookUrl], [PrivacyLevel], [CreatedAt], [UpdatedAt]
)
VALUES
(N'U001', N'TuneVault Admin', N'/images/covers/admin-cover.jpg', N'TP. Hồ Chí Minh', N'Việt Nam', N'https://tunevault.local', NULL, N'Private', SYSDATETIME(), SYSDATETIME()),
(N'U002', N'Nguyễn Yến Vy', N'/images/covers/vy-cover.jpg', N'TP. Hồ Chí Minh', N'Việt Nam', NULL, NULL, N'Public', SYSDATETIME(), SYSDATETIME()),
(N'U003', N'Trần Minh Khang', N'/images/covers/khang-cover.jpg', N'TP. Hồ Chí Minh', N'Việt Nam', NULL, NULL, N'Public', SYSDATETIME(), SYSDATETIME()),
(N'U004', N'Lê Hoài Linh', N'/images/covers/linh-cover.jpg', N'Đà Nẵng', N'Việt Nam', NULL, NULL, N'FriendsOnly', SYSDATETIME(), SYSDATETIME()),
(N'U005', N'Phạm Quốc An', N'/images/covers/an-cover.jpg', N'Hà Nội', N'Việt Nam', NULL, NULL, N'Public', SYSDATETIME(), SYSDATETIME());
GO

SET IDENTITY_INSERT dbo.[Artist] ON;
INSERT INTO dbo.[Artist]
(
    [ArtistId], [Name], [Slug], [Bio], [Country], [ImageUrl], [IsVerified], [CreatedAt], [UpdatedAt]
)
VALUES
(1,  N'Sơn Tùng M-TP',  N'son-tung-mtp',     N'Ca sĩ, nhạc sĩ V-Pop nổi bật với nhiều MV đạt lượng xem lớn.', N'Việt Nam', N'/images/artists/son-tung-mtp.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(2,  N'Hoàng Thùy Linh', N'hoang-thuy-linh', N'Nghệ sĩ V-Pop kết hợp chất liệu dân gian và pop hiện đại.', N'Việt Nam', N'/images/artists/hoang-thuy-linh.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(3,  N'Đen',            N'den',              N'Rapper Việt Nam với phong cách tự sự, đời thường.', N'Việt Nam', N'/images/artists/den.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(4,  N'Phương Mỹ Chi',  N'phuong-my-chi',    N'Ca sĩ trẻ nổi bật với màu sắc dân gian đương đại.', N'Việt Nam', N'/images/artists/phuong-my-chi.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(5,  N'Mỹ Tâm',         N'my-tam',           N'Ca sĩ V-Pop được yêu thích với nhiều bản hit ballad.', N'Việt Nam', N'/images/artists/my-tam.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(6,  N'Bích Phương',    N'bich-phuong',      N'Ca sĩ V-Pop có nhiều sản phẩm âm nhạc bắt tai, hình ảnh chỉn chu.', N'Việt Nam', N'/images/artists/bich-phuong.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(7,  N'Trúc Nhân',      N'truc-nhan',        N'Ca sĩ nổi bật với sản phẩm âm nhạc sáng tạo và cá tính.', N'Việt Nam', N'/images/artists/truc-nhan.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(8,  N'Vũ.',            N'vu',               N'Nghệ sĩ indie Việt Nam với nhiều ca khúc nhẹ nhàng, sâu lắng.', N'Việt Nam', N'/images/artists/vu.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(9,  N'Hòa Minzy',      N'hoa-minzy',        N'Ca sĩ V-Pop sở hữu nhiều bản ballad cảm xúc.', N'Việt Nam', N'/images/artists/hoa-minzy.jpg', 1, SYSDATETIME(), SYSDATETIME()),
(10, N'ERIK',           N'erik',             N'Ca sĩ trẻ với nhiều ca khúc ballad và pop được yêu thích.', N'Việt Nam', N'/images/artists/erik.jpg', 1, SYSDATETIME(), SYSDATETIME());
SET IDENTITY_INSERT dbo.[Artist] OFF;
GO

SET IDENTITY_INSERT dbo.[Album] ON;
INSERT INTO dbo.[Album]
(
    [AlbumId], [ArtistId], [Title], [Slug], [Description], [CoverImageUrl],
    [ReleaseDate], [AlbumType], [CreatedAt], [UpdatedAt]
)
VALUES
(1, 1,  N'Nơi Này Có Anh',                  N'noi-nay-co-anh',                  N'Single của Sơn Tùng M-TP.', N'/images/albums/noi-nay-co-anh.jpg', '2017-02-14', N'Single', SYSDATETIME(), SYSDATETIME()),
(2, 2,  N'See Tình',                        N'see-tinh',                        N'Single của Hoàng Thùy Linh.', N'/images/albums/see-tinh.jpg', '2022-02-20', N'Single', SYSDATETIME(), SYSDATETIME()),
(3, 3,  N'Mang Tiền Về Cho Mẹ',             N'mang-tien-ve-cho-me',             N'Single của Đen kết hợp Nguyên Thảo.', N'/images/albums/mang-tien-ve-cho-me.jpg', '2021-12-29', N'Single', SYSDATETIME(), SYSDATETIME()),
(4, 4,  N'Vũ Trụ Có Anh',                   N'vu-tru-co-anh',                   N'Single của Phương Mỹ Chi x DTAP ft. Pháo.', N'/images/albums/vu-tru-co-anh.jpg', '2023-09-18', N'Single', SYSDATETIME(), SYSDATETIME()),
(5, 5,  N'Đúng Cũng Thành Sai',             N'dung-cung-thanh-sai',             N'Single của Mỹ Tâm.', N'/images/albums/dung-cung-thanh-sai.jpg', '2020-09-29', N'Single', SYSDATETIME(), SYSDATETIME()),
(6, 6,  N'Bùa Yêu',                         N'bua-yeu',                         N'Single của Bích Phương.', N'/images/albums/bua-yeu.jpg', '2018-05-12', N'Single', SYSDATETIME(), SYSDATETIME()),
(7, 7,  N'Sáng Mắt Chưa?',                  N'sang-mat-chua',                   N'Single của Trúc Nhân.', N'/images/albums/sang-mat-chua.jpg', '2019-07-31', N'Single', SYSDATETIME(), SYSDATETIME()),
(8, 8,  N'Lạ Lùng',                         N'la-lung',                         N'Single của Vũ.', N'/images/albums/la-lung.jpg', '2016-01-01', N'Single', SYSDATETIME(), SYSDATETIME()),
(9, 9,  N'Không Thể Cùng Nhau Suốt Kiếp',   N'khong-the-cung-nhau-suot-kiep',   N'Single của Hòa Minzy ft. Mr. Siro.', N'/images/albums/khong-the-cung-nhau-suot-kiep.jpg', '2020-05-13', N'Single', SYSDATETIME(), SYSDATETIME()),
(10, 10, N'Sau Tất Cả',                     N'sau-tat-ca',                      N'Single của ERIK.', N'/images/albums/sau-tat-ca.jpg', '2016-01-12', N'Single', SYSDATETIME(), SYSDATETIME());
SET IDENTITY_INSERT dbo.[Album] OFF;
GO

SET IDENTITY_INSERT dbo.[MediaItem] ON;
INSERT INTO dbo.[MediaItem]
(
    [MediaItemId], [OwnerUserId], [ArtistId], [AlbumId], [Title], [Slug], [Description],
    [MediaType], [Genre], [DurationSeconds], [FilePath], [ExternalUrl], [ThumbnailUrl],
    [MimeType], [FileSizeBytes], [Visibility], [PlayCount], [IsProcessed], [CreatedAt], [UpdatedAt]
)
VALUES
(1,  N'U002', 1, 1, N'Nơi Này Có Anh', N'noi-nay-co-anh-son-tung-mtp',
    N'MV V-Pop lãng mạn của Sơn Tùng M-TP, dùng làm dữ liệu video mẫu cho TuneVault.',
    N'Video', N'V-Pop', 278, N'/media/videos/noi-nay-co-anh.mp4', N'https://www.youtube.com/watch?v=FN7ALfpGxiI', N'/images/thumbs/noi-nay-co-anh.jpg',
    N'video/mp4', 145000000, N'Public', 3200, 1, SYSDATETIME(), SYSDATETIME()),

(2,  N'U002', 2, 2, N'See Tình', N'see-tinh-hoang-thuy-linh',
    N'Ca khúc V-Pop có màu sắc dân gian hiện đại của Hoàng Thùy Linh.',
    N'Video', N'V-Pop', 207, N'/media/videos/see-tinh.mp4', N'https://www.youtube.com/watch?v=gJHSDZfJrRY', N'/images/thumbs/see-tinh.jpg',
    N'video/mp4', 128000000, N'Public', 2900, 1, SYSDATETIME(), SYSDATETIME()),

(3,  N'U003', 3, 3, N'Mang Tiền Về Cho Mẹ', N'mang-tien-ve-cho-me-den-nguyen-thao',
    N'Bản rap/ballad của Đen kết hợp Nguyên Thảo, phù hợp playlist gia đình và chill.',
    N'Video', N'Rap Việt', 407, N'/media/videos/mang-tien-ve-cho-me.mp4', N'https://www.youtube.com/watch?v=UVbv-PJXm14', N'/images/thumbs/mang-tien-ve-cho-me.jpg',
    N'video/mp4', 170000000, N'Public', 4100, 1, SYSDATETIME(), SYSDATETIME()),

(4,  N'U002', 4, 4, N'Vũ Trụ Có Anh', N'vu-tru-co-anh-phuong-my-chi-dtap',
    N'Sản phẩm âm nhạc dân gian đương đại của Phương Mỹ Chi x DTAP ft. Pháo.',
    N'Video', N'Dân gian đương đại', 265, N'/media/videos/vu-tru-co-anh.mp4', N'https://www.youtube.com/watch?v=V1ah6tmNUz8', N'/images/thumbs/vu-tru-co-anh.jpg',
    N'video/mp4', 152000000, N'Public', 1850, 1, SYSDATETIME(), SYSDATETIME()),

(5,  N'U004', 5, 5, N'Đúng Cũng Thành Sai', N'dung-cung-thanh-sai-my-tam',
    N'Bản ballad của Mỹ Tâm dùng để seed thư viện nhạc Việt.',
    N'Video', N'Ballad', 343, N'/media/videos/dung-cung-thanh-sai.mp4', N'https://www.youtube.com/watch?v=5_ozB0ImkYA', N'/images/thumbs/dung-cung-thanh-sai.jpg',
    N'video/mp4', 149000000, N'Public', 2450, 1, SYSDATETIME(), SYSDATETIME()),

(6,  N'U004', 6, 6, N'Bùa Yêu', N'bua-yeu-bich-phuong',
    N'Ca khúc pop của Bích Phương, phù hợp màn hình khám phá và gợi ý trending.',
    N'Video', N'Pop', 258, N'/media/videos/bua-yeu.mp4', N'https://www.youtube.com/watch?v=FkOt19CUC30', N'/images/thumbs/bua-yeu.jpg',
    N'video/mp4', 131000000, N'Public', 3650, 1, SYSDATETIME(), SYSDATETIME()),

(7,  N'U003', 7, 7, N'Sáng Mắt Chưa?', N'sang-mat-chua-truc-nhan',
    N'MV cá tính của Trúc Nhân, dùng cho chức năng video player và chia sẻ media.',
    N'Video', N'Pop', 301, N'/media/videos/sang-mat-chua.mp4', N'https://www.youtube.com/watch?v=rDhx4ejrPPA', N'/images/thumbs/sang-mat-chua.jpg',
    N'video/mp4', 138000000, N'Public', 2140, 1, SYSDATETIME(), SYSDATETIME()),

(8,  N'U005', 8, 8, N'Lạ Lùng', N'la-lung-vu',
    N'Bản indie nhẹ nhàng của Vũ., dùng làm dữ liệu audio mẫu cho player bar.',
    N'Audio', N'Indie', 260, N'/media/audio/la-lung.mp3', N'https://www.youtube.com/watch?v=F5tS5m86bOI', N'/images/thumbs/la-lung.jpg',
    N'audio/mpeg', 9400000, N'Public', 5120, 1, SYSDATETIME(), SYSDATETIME()),

(9,  N'U004', 9, 9, N'Không Thể Cùng Nhau Suốt Kiếp', N'khong-the-cung-nhau-suot-kiep-hoa-minzy',
    N'MV ballad của Hòa Minzy ft. Mr. Siro, dùng làm video seed cho thư viện.',
    N'Video', N'Ballad', 320, N'/media/videos/khong-the-cung-nhau-suot-kiep.mp4', N'https://www.youtube.com/watch?v=ayJY9ieBuEU', N'/images/thumbs/khong-the-cung-nhau-suot-kiep.jpg',
    N'video/mp4', 158000000, N'Public', 1980, 1, SYSDATETIME(), SYSDATETIME()),

(10, N'U005', 10, 10, N'Sau Tất Cả', N'sau-tat-ca-erik',
    N'Ca khúc ballad của ERIK, dùng làm dữ liệu audio mẫu cho chức năng favorite và play history.',
    N'Audio', N'Ballad', 296, N'/media/audio/sau-tat-ca.mp3', N'https://www.youtube.com/watch?v=wHF3Jv6Gk2o', N'/images/thumbs/sau-tat-ca.jpg',
    N'audio/mpeg', 10500000, N'Public', 2760, 1, SYSDATETIME(), SYSDATETIME());
SET IDENTITY_INSERT dbo.[MediaItem] OFF;
GO

SET IDENTITY_INSERT dbo.[MediaTag] ON;
INSERT INTO dbo.[MediaTag]
(
    [MediaTagId], [MediaItemId], [TagName], [Confidence], [CreatedBy], [CreatedAt]
)
VALUES
(1, 1, N'vpop', 0.9500, N'Seed', SYSDATETIME()),
(2, 1, N'romantic', 0.9100, N'Seed', SYSDATETIME()),
(3, 1, N'mv', 0.9800, N'Seed', SYSDATETIME()),
(4, 2, N'vpop', 0.9400, N'Seed', SYSDATETIME()),
(5, 2, N'dance', 0.8800, N'Seed', SYSDATETIME()),
(6, 2, N'folk-pop', 0.8500, N'Seed', SYSDATETIME()),
(7, 3, N'rap-viet', 0.9600, N'Seed', SYSDATETIME()),
(8, 3, N'family', 0.8400, N'Seed', SYSDATETIME()),
(9, 3, N'chill', 0.8600, N'Seed', SYSDATETIME()),
(10, 4, N'dan-gian-duong-dai', 0.9700, N'Seed', SYSDATETIME()),
(11, 4, N'vpop', 0.9200, N'Seed', SYSDATETIME()),
(12, 4, N'female-vocal', 0.9000, N'Seed', SYSDATETIME()),
(13, 5, N'ballad', 0.9600, N'Seed', SYSDATETIME()),
(14, 5, N'vpop', 0.8900, N'Seed', SYSDATETIME()),
(15, 5, N'sad', 0.8200, N'Seed', SYSDATETIME()),
(16, 6, N'pop', 0.9300, N'Seed', SYSDATETIME()),
(17, 6, N'dance', 0.8500, N'Seed', SYSDATETIME()),
(18, 6, N'vpop', 0.9000, N'Seed', SYSDATETIME()),
(19, 7, N'pop', 0.9100, N'Seed', SYSDATETIME()),
(20, 7, N'mv', 0.9500, N'Seed', SYSDATETIME()),
(21, 7, N'creative', 0.8700, N'Seed', SYSDATETIME()),
(22, 8, N'indie', 0.9700, N'Seed', SYSDATETIME()),
(23, 8, N'chill', 0.9300, N'Seed', SYSDATETIME()),
(24, 8, N'audio', 0.9900, N'Seed', SYSDATETIME()),
(25, 9, N'ballad', 0.9500, N'Seed', SYSDATETIME()),
(26, 9, N'vpop', 0.9000, N'Seed', SYSDATETIME()),
(27, 9, N'mv', 0.9600, N'Seed', SYSDATETIME()),
(28, 10, N'ballad', 0.9800, N'Seed', SYSDATETIME()),
(29, 10, N'audio', 0.9900, N'Seed', SYSDATETIME()),
(30, 10, N'vpop', 0.8800, N'Seed', SYSDATETIME());
SET IDENTITY_INSERT dbo.[MediaTag] OFF;
GO

SET IDENTITY_INSERT dbo.[Playlist] ON;
INSERT INTO dbo.[Playlist]
(
    [PlaylistId], [OwnerUserId], [Title], [Slug], [Description], [CoverImageUrl],
    [Visibility], [IsCollaborative], [CreatedAt], [UpdatedAt]
)
VALUES
(1, N'U002', N'V-Pop thư giãn cuối ngày', N'vpop-thu-gian-cuoi-ngay',
    N'Tuyển tập nhạc Việt nhẹ nhàng để học bài, làm việc và nghỉ ngơi.',
    N'/images/playlists/vpop-thu-gian.jpg', N'Public', 0, SYSDATETIME(), SYSDATETIME()),
(2, N'U003', N'Video MV Việt nổi bật', N'video-mv-viet-noi-bat',
    N'Các MV Việt Nam phù hợp để demo video player, share media và notification.',
    N'/images/playlists/video-mv-viet.jpg', N'Public', 1, SYSDATETIME(), SYSDATETIME()),
(3, N'U004', N'Ballad Việt cảm xúc', N'ballad-viet-cam-xuc',
    N'Playlist ballad cho những lúc cần nhạc nhẹ và sâu lắng.',
    N'/images/playlists/ballad-viet.jpg', N'Private', 0, SYSDATETIME(), SYSDATETIME());
SET IDENTITY_INSERT dbo.[Playlist] OFF;
GO

SET IDENTITY_INSERT dbo.[PlaylistTrack] ON;
INSERT INTO dbo.[PlaylistTrack]
(
    [PlaylistTrackId], [PlaylistId], [MediaItemId], [Position], [AddedByUserId], [AddedAt]
)
VALUES
(1, 1, 8,  1, N'U002', SYSDATETIME()),
(2, 1, 10, 2, N'U002', SYSDATETIME()),
(3, 1, 5,  3, N'U002', SYSDATETIME()),
(4, 1, 9,  4, N'U002', SYSDATETIME()),
(5, 2, 1,  1, N'U003', SYSDATETIME()),
(6, 2, 2,  2, N'U003', SYSDATETIME()),
(7, 2, 3,  3, N'U003', SYSDATETIME()),
(8, 2, 4,  4, N'U003', SYSDATETIME()),
(9, 2, 6,  5, N'U003', SYSDATETIME()),
(10, 2, 7, 6, N'U003', SYSDATETIME()),
(11, 3, 5, 1, N'U004', SYSDATETIME()),
(12, 3, 9, 2, N'U004', SYSDATETIME()),
(13, 3, 10, 3, N'U004', SYSDATETIME());
SET IDENTITY_INSERT dbo.[PlaylistTrack] OFF;
GO

SET IDENTITY_INSERT dbo.[MediaShare] ON;
INSERT INTO dbo.[MediaShare]
(
    [MediaShareId], [SenderUserId], [ReceiverUserId], [MediaItemId], [PlaylistId],
    [Message], [ShareType], [CreatedAt], [RevokedAt], [IsRevoked]
)
VALUES
(1, N'U002', N'U003', 1, NULL, N'Nghe bài này đi, hợp giao diện Spotify-like của nhóm mình nè.', N'Media', SYSDATETIME(), NULL, 0),
(2, N'U003', N'U002', NULL, 2, N'Mình share playlist MV Việt để test tính năng share inbox.', N'Playlist', SYSDATETIME(), NULL, 0),
(3, N'U004', N'U002', 9, NULL, N'Ballad này hợp playlist cuối ngày lắm.', N'Media', SYSDATETIME(), NULL, 0),
(4, N'U005', N'U004', 8, NULL, N'Lạ Lùng nghe chill, thử thêm vào playlist học tập nha.', N'Media', SYSDATETIME(), NULL, 0);
SET IDENTITY_INSERT dbo.[MediaShare] OFF;
GO

SET IDENTITY_INSERT dbo.[Notification] ON;
INSERT INTO dbo.[Notification]
(
    [NotificationId], [UserId], [ActorUserId], [Type], [Title], [Body], [PayloadJson], [IsRead], [ReadAt], [CreatedAt]
)
VALUES
(1, N'U003', N'U002', N'MediaShared', N'Bạn nhận được một bài hát mới',
    N'Nguyễn Yến Vy đã chia sẻ “Nơi Này Có Anh” cho bạn.',
    N'{"mediaShareId":1,"mediaItemId":1,"title":"Nơi Này Có Anh"}', 0, NULL, SYSDATETIME()),
(2, N'U002', N'U003', N'PlaylistShared', N'Bạn nhận được một playlist mới',
    N'Trần Minh Khang đã chia sẻ playlist “Video MV Việt nổi bật”.',
    N'{"mediaShareId":2,"playlistId":2,"title":"Video MV Việt nổi bật"}', 0, NULL, SYSDATETIME()),
(3, N'U002', N'U004', N'MediaShared', N'Bạn nhận được một bài hát mới',
    N'Lê Hoài Linh đã chia sẻ “Không Thể Cùng Nhau Suốt Kiếp”.',
    N'{"mediaShareId":3,"mediaItemId":9,"title":"Không Thể Cùng Nhau Suốt Kiếp"}', 1, SYSDATETIME(), SYSDATETIME()),
(4, N'U004', N'U005', N'MediaShared', N'Bạn nhận được một bài hát mới',
    N'Phạm Quốc An đã chia sẻ “Lạ Lùng”.',
    N'{"mediaShareId":4,"mediaItemId":8,"title":"Lạ Lùng"}', 0, NULL, SYSDATETIME()),
(5, N'U002', N'U005', N'Followed', N'Có người theo dõi bạn',
    N'Phạm Quốc An đã theo dõi hồ sơ của bạn.',
    N'{"followerUserId":"U005"}', 0, NULL, SYSDATETIME()),
(6, N'U001', NULL, N'System', N'Dữ liệu seed đã sẵn sàng',
    N'Hệ thống đã có user, artist, album, media, playlist, share, notification, favorite, history và follow.',
    N'{"seedVersion":"2026.06"}', 1, SYSDATETIME(), SYSDATETIME());
SET IDENTITY_INSERT dbo.[Notification] OFF;
GO

SET IDENTITY_INSERT dbo.[Favorite] ON;
INSERT INTO dbo.[Favorite]
(
    [FavoriteId], [UserId], [MediaItemId], [CreatedAt]
)
VALUES
(1, N'U002', 8,  SYSDATETIME()),
(2, N'U002', 10, SYSDATETIME()),
(3, N'U003', 3,  SYSDATETIME()),
(4, N'U003', 7,  SYSDATETIME()),
(5, N'U004', 5,  SYSDATETIME()),
(6, N'U004', 9,  SYSDATETIME()),
(7, N'U005', 1,  SYSDATETIME()),
(8, N'U005', 2,  SYSDATETIME());
SET IDENTITY_INSERT dbo.[Favorite] OFF;
GO

SET IDENTITY_INSERT dbo.[PlayHistory] ON;
INSERT INTO dbo.[PlayHistory]
(
    [PlayHistoryId], [UserId], [MediaItemId], [StartedAt], [LastPlayedAt],
    [ProgressSeconds], [IsCompleted], [DeviceInfo], [IpAddress]
)
VALUES
(1, N'U002', 8,  DATEADD(HOUR, -8, SYSDATETIME()), DATEADD(HOUR, -8, SYSDATETIME()), 260, 1, N'Chrome / Windows', N'127.0.0.1'),
(2, N'U002', 10, DATEADD(HOUR, -7, SYSDATETIME()), DATEADD(HOUR, -7, SYSDATETIME()), 190, 0, N'Chrome / Windows', N'127.0.0.1'),
(3, N'U002', 1,  DATEADD(HOUR, -5, SYSDATETIME()), DATEADD(HOUR, -5, SYSDATETIME()), 278, 1, N'Edge / Windows', N'127.0.0.1'),
(4, N'U003', 3,  DATEADD(HOUR, -6, SYSDATETIME()), DATEADD(HOUR, -6, SYSDATETIME()), 407, 1, N'Firefox / Windows', N'127.0.0.1'),
(5, N'U003', 7,  DATEADD(HOUR, -4, SYSDATETIME()), DATEADD(HOUR, -4, SYSDATETIME()), 120, 0, N'Chrome / Android', N'127.0.0.1'),
(6, N'U004', 5,  DATEADD(HOUR, -3, SYSDATETIME()), DATEADD(HOUR, -3, SYSDATETIME()), 343, 1, N'Safari / iOS', N'127.0.0.1'),
(7, N'U004', 9,  DATEADD(HOUR, -2, SYSDATETIME()), DATEADD(HOUR, -2, SYSDATETIME()), 320, 1, N'Chrome / Windows', N'127.0.0.1'),
(8, N'U005', 2,  DATEADD(HOUR, -1, SYSDATETIME()), DATEADD(HOUR, -1, SYSDATETIME()), 207, 1, N'Chrome / Windows', N'127.0.0.1'),
(9, N'U005', 4,  DATEADD(MINUTE, -35, SYSDATETIME()), DATEADD(MINUTE, -35, SYSDATETIME()), 210, 0, N'Edge / Windows', N'127.0.0.1'),
(10, N'U002', 6, DATEADD(MINUTE, -15, SYSDATETIME()), DATEADD(MINUTE, -15, SYSDATETIME()), 258, 1, N'Chrome / Windows', N'127.0.0.1');
SET IDENTITY_INSERT dbo.[PlayHistory] OFF;
GO

SET IDENTITY_INSERT dbo.[Follow] ON;
INSERT INTO dbo.[Follow]
(
    [FollowId], [FollowerUserId], [TargetUserId], [TargetArtistId], [CreatedAt]
)
VALUES
(1, N'U002', NULL, 1, SYSDATETIME()),
(2, N'U002', NULL, 4, SYSDATETIME()),
(3, N'U002', NULL, 8, SYSDATETIME()),
(4, N'U003', NULL, 3, SYSDATETIME()),
(5, N'U003', NULL, 7, SYSDATETIME()),
(6, N'U004', NULL, 5, SYSDATETIME()),
(7, N'U004', NULL, 9, SYSDATETIME()),
(8, N'U005', NULL, 2, SYSDATETIME()),
(9, N'U005', N'U002', NULL, SYSDATETIME()),
(10, N'U002', N'U003', NULL, SYSDATETIME()),
(11, N'U003', N'U004', NULL, SYSDATETIME());
SET IDENTITY_INSERT dbo.[Follow] OFF;
GO

/* =========================================================
   9. QUICK CHECK QUERIES
   ========================================================= */
SELECT N'AspNetUsers' AS [TableName], COUNT(*) AS [Rows] FROM dbo.[AspNetUsers]
UNION ALL SELECT N'Artist', COUNT(*) FROM dbo.[Artist]
UNION ALL SELECT N'Album', COUNT(*) FROM dbo.[Album]
UNION ALL SELECT N'MediaItem', COUNT(*) FROM dbo.[MediaItem]
UNION ALL SELECT N'MediaTag', COUNT(*) FROM dbo.[MediaTag]
UNION ALL SELECT N'Playlist', COUNT(*) FROM dbo.[Playlist]
UNION ALL SELECT N'PlaylistTrack', COUNT(*) FROM dbo.[PlaylistTrack]
UNION ALL SELECT N'MediaShare', COUNT(*) FROM dbo.[MediaShare]
UNION ALL SELECT N'Notification', COUNT(*) FROM dbo.[Notification]
UNION ALL SELECT N'Favorite', COUNT(*) FROM dbo.[Favorite]
UNION ALL SELECT N'PlayHistory', COUNT(*) FROM dbo.[PlayHistory]
UNION ALL SELECT N'Follow', COUNT(*) FROM dbo.[Follow];
GO

SELECT
    m.[MediaItemId],
    m.[Title],
    a.[Name] AS [Artist],
    m.[MediaType],
    m.[Genre],
    m.[Visibility],
    m.[ExternalUrl]
FROM dbo.[MediaItem] AS m
JOIN dbo.[Artist] AS a ON a.[ArtistId] = m.[ArtistId]
ORDER BY m.[MediaItemId];
GO
