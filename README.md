# 🎵 TuneVault - Media Streaming Web Application

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-10.0-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core/)
[![Entity Framework Core](https://img.shields.io/badge/EF_Core-10.0.9-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/ef/core/)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-Database-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server/)
[![SignalR](https://img.shields.io/badge/SignalR-Realtime-0A7F3F)](https://learn.microsoft.com/aspnet/core/signalr/)

## Thông tin dự án

- **Tên dự án:** TuneVault
- **Loại ứng dụng:** Media Streaming Web Application
- **Môn học:** Ngôn ngữ lập trình C#
- **Repository:** `https://github.com/phvantam/CSharp.git`
- **Frontend:** React, TypeScript, Vite
- **Backend:** ASP.NET Core Web API
- **Database:** SQL Server, Entity Framework Core
- **Kiến trúc:** Clean Architecture
- **Realtime:** SignalR Notification Hub
- **AI:** OpenRouter API

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Chức năng chính](#2-chức-năng-chính)
3. [Công nghệ và phiên bản](#3-công-nghệ-và-phiên-bản)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Thiết kế cơ sở dữ liệu](#6-thiết-kế-cơ-sở-dữ-liệu)
7. [Cài đặt và chạy dự án](#7-cài-đặt-và-chạy-dự-án)
8. [Cấu hình môi trường](#8-cấu-hình-môi-trường)
9. [Tài khoản seed](#9-tài-khoản-seed)
10. [Danh sách API chính](#10-danh-sách-api-chính)
11. [Application Pipeline](#11-application-pipeline)
12. [Màn hình frontend](#12-màn-hình-frontend)
13. [Kiểm thử API](#13-kiểm-thử-api)
14. [Lỗi thường gặp](#14-lỗi-thường-gặp)
15. [Thành viên nhóm](#15-thành-viên-nhóm)
16. [Tài liệu tham khảo](#16-tài-liệu-tham-khảo)

---

## 1. Giới thiệu

**TuneVault** là ứng dụng nghe nhạc và xem video trực tuyến, được xây dựng theo định hướng giao diện giống các nền tảng streaming hiện đại (lấy ý tưởng từ [Sportify](https://open.spotify.com/) . Hệ thống hỗ trợ người dùng đăng ký, đăng nhập, upload audio/video, phát nhạc, xem MV, tạo playlist, quản lý album/nghệ sĩ, yêu thích bài hát, xem lịch sử nghe, chia sẻ media hoặc playlist cho người dùng khác và nhận thông báo theo thời gian thực.

Backend được tổ chức theo **Clean Architecture** với bốn project chính: `Domain`, `Application`, `Infrastructure` và `API`. Các chức năng nghiệp vụ được triển khai theo hướng **CQRS** thông qua MediatR, kết hợp pipeline cho validation và authorization. Frontend sử dụng **React + TypeScript + Vite**, tách riêng phần gọi API, quản lý trạng thái và giao diện theo từng module.

---

## 2. Chức năng chính

### 2.1 Xác thực và người dùng

- Đăng ký tài khoản.
- Đăng nhập bằng email và mật khẩu.
- Cấp JWT token sau khi đăng nhập.
- Tự động gắn token vào request từ frontend.
- Tự đăng xuất và chuyển về trang login khi API trả về `401 Unauthorized`.
- Cập nhật hồ sơ cá nhân.
- Upload avatar.
- Xem hồ sơ công khai của người dùng khác.
- Follow / Unfollow người dùng.
- Xem danh sách followers và following.

### 2.2 Media

- Upload audio.
- Upload video.
- Upload thumbnail.
- Upload đồng thời audio, video và thumbnail trong cùng một request.
- Cập nhật title, description, artist, album, lyrics và visibility.
- Xóa media theo quyền sở hữu.
- Lấy danh sách media trending.
- Lấy danh sách media mới phát hành.
- Tìm kiếm media.
- Stream audio/video.
- Ghi nhận lượt phát và lịch sử nghe.

### 2.3 Audio Player và Video Player

- Player bar cố định phía dưới giao diện.
- Play / pause.
- Next / previous.
- Seek thời gian phát.
- Quản lý queue.
- Hiển thị title, artist và thumbnail.
- Trang xem video riêng qua route `/video/:id`.
- Hỗ trợ điều hướng sang trang lời bài hát qua `/now-playing` hoặc `/now-playing/:id`.

### 2.4 Playlist

- Tạo playlist.
- Cập nhật tên, mô tả, trạng thái public/private và ảnh bìa.
- Xóa playlist.
- Thêm bài hát vào playlist.
- Xóa bài hát khỏi playlist.
- Xem playlist public của người dùng khác.
- Chia sẻ playlist cho người dùng khác.

### 2.5 Album và Artist

- Xem chi tiết nghệ sĩ.
- Xem danh sách bài hát của nghệ sĩ.
- Xem album của nghệ sĩ.
- Cập nhật thông tin nghệ sĩ.
- Quản lý người phụ trách nghệ sĩ thông qua Artist Manager.
- Follow / Unfollow nghệ sĩ.
- Xem chi tiết album.
- Tạo, sửa, xóa album.
- Thêm hoặc xóa bài hát khỏi album.

### 2.6 Share và Notification

- Chia sẻ media cho người dùng khác.
- Chia sẻ playlist.
- Xem danh sách được chia sẻ với mình.
- Xem danh sách đã chia sẻ.
- Tìm kiếm người dùng để chia sẻ.
- Hạn chế việc chia sẻ trùng lặp.
- Lưu notification vào database.
- Đánh dấu một thông báo hoặc tất cả thông báo là đã đọc.
- Hỗ trợ SignalR cho thông báo realtime.

### 2.7 Favorite, lịch sử nghe và lyrics

- Thêm bài hát vào danh sách yêu thích.
- Xóa bài hát khỏi danh sách yêu thích.
- Xem danh sách yêu thích.
- Ghi lại lịch sử nghe.
- Xem Recently Played.
- Hiển thị lyrics ở trang Now Playing.
- Cập nhật lyrics cho bài hát.

### 2.8 AI Assistant

- Chat với AI qua endpoint `/api/ai/chat`.
- Chat dạng streaming qua endpoint `/api/ai/chat/stream`.
- Gợi ý bài hát qua endpoint `/api/ai/recommendations`.

---

## 3. Công nghệ và phiên bản

### 3.1 Frontend

| Công nghệ | Phiên bản | Vai trò |
|---|---:|---|
| React | 19.2.6 | Xây dựng giao diện SPA |
| React DOM | 19.2.6 | Render React app |
| Vite | 8.0.12 | Dev server và build tool |
| TypeScript | ~6.0.2 | Kiểu dữ liệu cho frontend |
| React Router DOM | 7.17.0 | Routing |
| Axios | 1.17.0 | Gọi HTTP API |
| Zustand | 5.0.14 | Quản lý trạng thái |
| Tailwind CSS | 3.4.17 | Xây dựng giao diện |
| Microsoft SignalR Client | 10.0.0 | Kết nối realtime notification |
| Lucide React | 1.17.0 | Icon |
| Framer Motion | 12.40.0 | Animation |
| React Hot Toast | 2.6.0 | Toast notification |

### 3.2 Backend

| Công nghệ | Phiên bản | Vai trò |
|---|---:|---|
| .NET Target Framework | net10.0 | Framework backend |
| ASP.NET Core | 10.0.x | Web API |
| Entity Framework Core SQL Server | 10.0.9 | ORM và SQL Server provider |
| Entity Framework Core Tools | 10.0.9 | Migration / database update |
| ASP.NET Core Identity | 10.0.9 | Quản lý user và role |
| JWT Bearer Authentication | 10.0.9 | Xác thực bằng JWT |
| MediatR | 14.1.0 | CQRS và request pipeline |
| FluentValidation | 12.1.1 | Validate command/request |
| Swashbuckle.AspNetCore | 7.2.0 | Swagger/OpenAPI |
| TagLibSharp | 2.3.0 | Đọc metadata media |

### 3.3 Database và công cụ

| Thành phần | Công nghệ |
|---|---|
| Database | SQL Server / SQL Server Express |
| Database script | `database/TuneVault.sql` |
| API testing | Swagger UI / Postman |
| Version control | Git, GitHub |

---

## 4. Kiến trúc hệ thống

### 4.1 Tổng quan layer

```text
React SPA
  ↓ HTTP request
TuneVault.API
  ↓ Command / Query
TuneVault.Application
  ↓ Interface service / repository
TuneVault.Infrastructure
  ↓
SQL Server / File System / SignalR / OpenRouter
```

### 4.2 Quy tắc phụ thuộc

```text
Domain không phụ thuộc layer khác.
Application phụ thuộc Domain.
Infrastructure triển khai interface từ Application/Domain.
API cấu hình DI, middleware và gọi Application thông qua Controller.
Controller không chứa logic nghiệp vụ phức tạp.
```

### 4.3 Backend solution

```text
TuneVault.slnx
├── TuneVault.API
├── TuneVault.Application
├── TuneVault.Domain
└── TuneVault.Infrastructure
```

### 4.4 Vai trò từng project

| Project | Vai trò |
|---|---|
| `TuneVault.Domain` | Chứa entity, domain interface và các kiểu dữ liệu cốt lõi |
| `TuneVault.Application` | Chứa DTO, Command, Query, Handler, Validator, Pipeline Behavior |
| `TuneVault.Infrastructure` | Cài đặt EF Core, DbContext, Repository, Service, SignalR Hub, AI Service |
| `TuneVault.API` | Chứa Controller, Program.cs, Middleware, Swagger, JWT, CORS |

---

## 5. Cấu trúc thư mục

```text
CSharp/
│
├── 📁 database/
│   └── 📄 TuneVault.sql
├── 📁 tunevault-backend/                              # Backend ASP.NET Core 8 (Clean Architecture)
│   ├── 📄 TuneVault.slnx
│   │
│   ├── 📁 TuneVault.Domain/                           # Layer 1: Domain
│   │   ├── 📁 Entities/                               # MediaItem, Playlist, UserProfile, Artist, Album, MediaShare, Notification...
│   │   └── 📁 Interfaces/                             # IRepository.cs, IUnitOfWork.cs
│   │
│   ├── 📁 TuneVault.Application/                      # Layer 2: Application (Business Logic + MediatR)
│   │   ├── 📁 Features/                               # Tách theo chức năng
│   │   │   ├── 📁 Auth/
│   │   │   ├── 📁 Media/                              # Upload, Update, Delete, Trending, New Releases, PlayMedia...
│   │   │   ├── 📁 Playlist/                           # Create, Update, Delete, Add/Remove Track
│   │   │   ├── 📁 Share/                              # Share Media + Share Playlist
│   │   │   ├── 📁 User/                               # Follow/Unfollow, Update Profile
│   │   │   ├── 📁 Favorite/
│   │   │   ├── 📁 Notification/
│   │   │   ├── 📁 PlayHistory/
│   │   │   ├── 📁 Artist/
│   │   │   └── 📁 AI/                                 # Chatbot + AI Recommendation
│   │   ├── 📁 DTOs/                                   # Tất cả DTO theo module (Media, Playlist, Share, User...)
│   │   ├── 📁 PipelineBehaviors/                      # AuthorizationBehavior + ValidationBehavior
│   │   └── 📁 Interfaces/                             # IMediaService, IPlaylistService, IShareService, IUserService...
│   │
│   ├── 📁 TuneVault.Infrastructure/                   # Layer 3: Infrastructure
│   │   ├── 📁 Persistence/                            # ApplicationDbContext + Configurations + SeedData
│   │   ├── 📁 Repositories/                           # GenericRepository + UnitOfWork
│   │   ├── 📁 Services/                               # MediaService, PlaylistService, ShareService, NotificationService...
│   │   ├── 📁 Hubs/                                   # NotificationHub (SignalR)
│   │   ├── 📁 Migrations/
│   │   └── 📁 AI/                                     # OpenRouterService
│   │
│   └── 📁 TuneVault.API/                              # Layer 4: Web API
│       ├── 📁 Controllers/                            # Auth, Media, Playlist, Share, Notification, Favorite, PlayHistory, Artist, Album...
│       └── 📁 wwwroot/media/                          # Lưu file upload (audio, video, image, avatar, artist-avatar, playlists)
│
├── 📁 tunevault-frontend/                             # Frontend React + TypeScript (Vite)
│   ├── 📁 src/
│   │   ├── 📁 api/                                    # Gọi API Backend
│   │   │
│   │   ├── 📁 components/                             # Component dùng chung
│   │   │   ├── 📁 common/                             # ConfirmModal, ImageAdjustModal, NotificationToast
│   │   │   ├── 📁 layout/                             # Sidebar, Topbar, PlayerBar
│   │   │   ├── 📁 media/                              # AddToPlaylistModal, SongMenu
│   │   │   ├── 📁 player/                             # Queue
│   │   │   ├── 📁 playlist/                           # AddSongsToPlaylistModal
│   │   │   └── 📁 share/                              # ShareModal
│   │   │
│   │   ├── 📁 hooks/                                  # useSignalR.ts
│   │   ├── 📁 layouts/                                # MainLayout.tsx
│   │   │
│   │   ├── 📁 pages/                                  # Các trang chính
│   │   │   ├── 📁 ai/                                 # AIChatbot.tsx
│   │   │   ├── 📁 album/                              # AlbumDetailPage.tsx
│   │   │   ├── 📁 artist/                             # ArtistDetailPage.tsx
│   │   │   ├── 📁 auth/                               # LoginPage, RegisterPage
│   │   │   ├── 📁 history/                            # RecentlyPlayedPage.tsx
│   │   │   ├── 📁 home/                               # HomePage.tsx
│   │   │   ├── 📁 library/                            # LibraryPage.tsx
│   │   │   ├── 📁 media/                              # MediaDetailPage.tsx
│   │   │   ├── 📁 notifications/                      # NotificationsPage.tsx
│   │   │   ├── 📁 player/                             # NowPlayingPage.tsx
│   │   │   ├── 📁 playlist/                           # PlaylistDetailPage.tsx
│   │   │   ├── 📁 profile/                            # ProfilePage, PublicProfilePage
│   │   │   ├── 📁 search/                             # SearchPage.tsx
│   │   │   ├── 📁 share/                              # ShareInboxPage.tsx
│   │   │   ├── 📁 upload/                             # UploadPage.tsx
│   │   │   └── 📁 video/                              # VideoPlayerPage.tsx
│   │   │
│   │   ├── 📁 stores/                                 # Zustand State Management
│   │   └── 📁 utils/                                  # formatCount.ts
│   │
│   ├── 📁 public/                                     # Static assets (audio, image, videos)
│   └── 📄 package.json
│
└── 📄 README.md
```

---

## 6. Thiết kế cơ sở dữ liệu

Dự án sử dụng **SQL Server** và **Entity Framework Core**. Database có thể được tạo bằng EF Core Migration hoặc import trực tiếp file SQL trong thư mục `database`.

### 6.1 Các bảng chính

| Bảng | Mục đích |
|---|---|
| `AspNetUsers` | Lưu tài khoản người dùng |
| `AspNetRoles` | Lưu role |
| `AspNetUserRoles` | Liên kết user và role |
| `UserProfiles` | Hồ sơ người dùng |
| `Artists` | Nghệ sĩ |
| `ArtistManagers` | Người quản lý nghệ sĩ |
| `Albums` | Album |
| `MediaItems` | Bài hát hoặc video |
| `MediaArtists` | Liên kết nhiều nghệ sĩ cho một media |
| `MediaTags` | Tag của media |
| `Playlists` | Playlist |
| `PlaylistTracks` | Bài hát trong playlist |
| `MediaShares` | Lịch sử chia sẻ media/playlist |
| `Notifications` | Thông báo |
| `Favorites` | Bài hát yêu thích |
| `PlayHistories` | Lịch sử nghe |
| `Follows` | Theo dõi user/artist |

### 6.2 Quan hệ chính

```text
AspNetUsers 1 - n MediaItems
AspNetUsers 1 - n Playlists
AspNetUsers n - n MediaItems thông qua Favorites
AspNetUsers 1 - n PlayHistories
AspNetUsers 1 - n Notifications
AspNetUsers 1 - n MediaShares với vai trò sender/receiver

Artists 1 - n Albums
Artists 1 - n MediaItems qua ArtistId chính
MediaItems n - n Artists thông qua MediaArtists
Albums 1 - n MediaItems

Playlists n - n MediaItems thông qua PlaylistTracks
Artists n - n AspNetUsers thông qua ArtistManagers
```

### 6.3 Khởi tạo database

#### Cách 1: Import file SQL

Mở SQL Server Management Studio và chạy file:

```text
database/TuneVault.sql
```

#### Cách 2: Dùng EF Core Migration

```bash
cd tunevault-backend
dotnet ef database update -p TuneVault.Infrastructure -s TuneVault.API -c ApplicationDbContext
```

---

## 7. Cài đặt và chạy dự án

### 7.1 Yêu cầu môi trường

- Visual Studio Code hoặc Visual Studio
- SQL Server hoặc SQL Server Express
- Git
- Node.js 18+ hoặc mới hơn
- npm
- .NET SDK hỗ trợ `net10.0`


### 7.2 Clone repository

```bash
git clone https://github.com/phvantam/CSharp.git
cd CSharp
```

### 7.3 Chạy backend

```bash
cd tunevault-backend
dotnet restore
dotnet build
dotnet ef database update -p TuneVault.Infrastructure -s TuneVault.API -c ApplicationDbContext
dotnet run --project TuneVault.API
```

Backend chạy tại:

```text
http://localhost:5090
```

Swagger:

```text
http://localhost:5090/swagger
```

SignalR hub:

```text
http://localhost:5090/notificationHub
```

### 7.4 Chạy frontend

Mở terminal khác:

```bash
cd tunevault-frontend
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

---

## 8. Cấu hình môi trường

### 8.1 Frontend `.env`

Tạo file:

```text
tunevault-frontend/.env
```

Nội dung:

```env
VITE_API_URL=http://localhost:5090/api
VITE_OPENROUTER_API_KEY=your_key
```

Nếu không tạo `.env`, frontend vẫn dùng mặc định:

```text
http://localhost:5090/api
```

### 8.2 Backend `appsettings.json`

Ví dụ cấu hình:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=EDDY\\\\SQLEXPRESS;Database=TuneVaultDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "your_secret_key",
    "Issuer": "TuneVault",
    "Audience": "TuneVaultUsers"
  },
  "OpenRouter": {
    "ApiKey": "your_api_key",
    "Model": "openai/gpt-oss-120b:free",
    "HttpReferer": "http://localhost:5173",
    "XTitle": "TuneVault",
    "Temperature": 0.7,
    "MaxTokens": 600
  }
}
```
---

## 9. Tài khoản seed

Dữ liệu mẫu được tạo trong `SeedData.cs`.

| UserName | Email | Mật khẩu |
|---|---|---|
| `tampham` | `tampham@gmail.com` | `Tam@123456` |
| `nguyenvana` | `nguyenvana@gmail.com` | `Tam@123456` |

Seed data có thêm danh sách nghệ sĩ, album collection, media mẫu và playlist mẫu.

---

## 10. Danh sách API chính

### 10.1 Auth

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |

### 10.2 User

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/user/profile` | Lấy profile hiện tại |
| PUT | `/api/user/profile` | Cập nhật profile |
| POST | `/api/user/avatar` | Upload avatar |
| GET | `/api/user/{id}/profile` | Xem profile công khai |
| GET | `/api/user/{id}/follow-stats` | Lấy thống kê follow |
| GET | `/api/user/{id}/followers` | Danh sách followers |
| GET | `/api/user/{id}/following` | Danh sách following |
| POST | `/api/user/{id}/follow` | Follow user |
| DELETE | `/api/user/{id}/follow` | Unfollow user |
| GET | `/api/user/search` | Tìm user |

### 10.3 Media

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/media/upload` | Upload media đơn |
| POST | `/api/media/upload-multi` | Upload audio/video/thumbnail |
| GET | `/api/media/stream/{id}` | Stream media |
| GET | `/api/media/{id}` | Chi tiết media |
| GET | `/api/media/{id}/detail` | Chi tiết media |
| GET | `/api/media/my-uploads` | Media của tôi |
| PUT | `/api/media/{id}` | Cập nhật media |
| DELETE | `/api/media/{id}` | Xóa media |
| GET | `/api/media/search` | Tìm kiếm media |
| GET | `/api/media/trending` | Media nổi bật |
| GET | `/api/media/new-releases` | Media mới |
| POST | `/api/media/{id}/play` | Ghi nhận lượt phát |
| GET | `/api/media/artists/search` | Tìm kiếm artist |

### 10.4 Playlist

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/playlist` | Tạo playlist |
| GET | `/api/playlist/{id}` | Chi tiết playlist |
| GET | `/api/playlist/my-playlists` | Playlist của tôi |
| GET | `/api/playlist/user/{userId}/public` | Playlist public của user |
| GET | `/api/playlist/popular` | Playlist phổ biến |
| PUT | `/api/playlist/{id}` | Cập nhật playlist |
| DELETE | `/api/playlist/{id}` | Xóa playlist |
| POST | `/api/playlist/{playlistId}/songs/{mediaItemId}` | Thêm bài hát |
| DELETE | `/api/playlist/{playlistId}/songs/{mediaItemId}` | Xóa bài hát |

### 10.5 Favorite và History

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/favorite` | Danh sách yêu thích |
| POST | `/api/favorite/{mediaItemId}` | Thêm vào yêu thích |
| DELETE | `/api/favorite/{mediaItemId}` | Xóa khỏi yêu thích |
| GET | `/api/history` | Lịch sử nghe |

### 10.6 Share

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/share` | Chia sẻ media |
| POST | `/api/share/playlist` | Chia sẻ playlist |
| GET | `/api/share/received` | Danh sách nhận chia sẻ |
| GET | `/api/share/sent` | Danh sách đã gửi |

### 10.7 Notification

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/notification` | Lấy danh sách thông báo |
| PUT | `/api/notification/{id}/read` | Đánh dấu đã đọc |
| PUT | `/api/notification/read-all` | Đánh dấu tất cả đã đọc |

### 10.8 Artist

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/artists/{id}` | Chi tiết artist |
| GET | `/api/artists/{id}/songs` | Bài hát của artist |
| GET | `/api/artists/{id}/albums` | Album của artist |
| PUT | `/api/artists/{id}` | Cập nhật artist |
| GET | `/api/artists/{id}/managers` | Danh sách manager |
| POST | `/api/artists/{id}/managers` | Thêm manager |
| PUT | `/api/artists/{id}/managers/{targetUserId}/role` | Sửa quyền manager |
| DELETE | `/api/artists/{id}/managers/{targetUserId}` | Xóa manager |
| POST | `/api/artists/{id}/follow` | Follow artist |
| DELETE | `/api/artists/{id}/follow` | Unfollow artist |

### 10.9 Album

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/albums/{id}` | Chi tiết album |
| GET | `/api/albums/{id}/tracks` | Danh sách bài hát trong album |
| POST | `/api/albums` | Tạo album |
| PUT | `/api/albums/{id}` | Cập nhật album |
| DELETE | `/api/albums/{id}` | Xóa album |
| POST | `/api/albums/{id}/tracks/{mediaItemId}` | Thêm bài hát vào album |
| DELETE | `/api/albums/{id}/tracks/{mediaItemId}` | Xóa bài hát khỏi album |

### 10.10 AI

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/ai/chat` | Chat với AI |
| POST | `/api/ai/chat/stream` | Chat AI dạng streaming SSE |
| GET | `/api/ai/recommendations` | Gợi ý bài hát |

---

## 11. Application Pipeline

### 11.1 Pipeline tổng quát

```text
HTTP Request
    ↓
Controller
    ↓
Command / Query
    ↓
ValidationBehavior
    ↓
AuthorizationBehavior
    ↓
Handler
    ↓
Service / Repository
    ↓
Database / File Storage / SignalR
    ↓
DTO Response
```

### 11.2 Pipeline đăng nhập

```text
LoginDto
    ↓
AuthController.Login
    ↓
LoginCommand
    ↓
LoginCommandValidator
    ↓
LoginCommandHandler
    ↓
AuthService / UserManager
    ↓
JwtTokenService
    ↓
AuthResponseDto
```

### 11.3 Pipeline upload media

```text
MultiMediaUploadRequestDto
    ↓
MediaController.UploadMulti
    ↓
MultiMediaUploadCommand
    ↓
MultiMediaUploadCommandValidator
    ↓
MultiMediaUploadCommandHandler
    ↓
MediaService
    ↓
Lưu file audio/video/thumbnail
    ↓
Tạo MediaItem + MediaArtists + Album nếu có
    ↓
SaveChangesAsync
    ↓
MultiMediaUploadResultDto
```

### 11.4 Pipeline share media

```text
ShareMediaRequestDto
    ↓
ShareController.Share
    ↓
ShareMediaCommand
    ↓
ShareMediaCommandValidator
    ↓
ShareMediaCommandHandler
    ↓
Tạo MediaShare
    ↓
Tạo Notification
    ↓
Push realtime qua SignalR
    ↓
ShareResponseDto
```

### 11.5 Pipeline notification

```text
GetMyNotificationsQuery
    ↓
NotificationController
    ↓
GetMyNotificationsQueryHandler
    ↓
NotificationService / DbContext
    ↓
Map NotificationDto
    ↓
Trả danh sách notification cho frontend
```

---

## 12. Giao diện chính

| Route | Trang |
|---|---|
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/home` | Trang chủ |
| `/search` | Tìm kiếm |
| `/library` | Thư viện |
| `/history` | Lịch sử nghe |
| `/playlist/:id` | Chi tiết playlist |
| `/share-inbox` | Hộp thư chia sẻ |
| `/notifications` | Thông báo |
| `/profile` | Hồ sơ cá nhân |
| `/profile/:userId` | Hồ sơ công khai |
| `/video/:id` | Xem video |
| `/now-playing` | Now Playing |
| `/now-playing/:id` | Now Playing theo bài |
| `/album/:id` | Chi tiết album |
| `/artist/:id` | Chi tiết nghệ sĩ |
| `/media/:id` | Chi tiết media |
| `/upload` | Upload media |
| `/ai-chat` | AI Chatbot |

---

## 13. Kiểm thử API

### 13.1 Swagger

Sau khi chạy backend, truy cập:

```text
http://localhost:5090/swagger
```

### 13.2 Luồng test đề xuất

```text
1. Đăng nhập bằng tài khoản seed.
2. Copy JWT token.
3. Authorize trong Swagger bằng Bearer token.
4. Upload media bằng /api/media/upload-multi.
5. Lấy danh sách media trending.
6. Stream media bằng /api/media/stream/{id}.
7. Tạo playlist.
8. Thêm bài hát vào playlist.
9. Share media hoặc playlist cho user khác.
10. Đăng nhập user nhận share để xem Share Inbox.
11. Kiểm tra notification.
12. Like bài hát.
13. Xem history.
14. Test AI chat.
```

### 13.3 Cách nhập JWT trong Swagger

```text
Bearer your_jwt_token
```

---


## 14. Lỗi thường gặp

### 14.1 Frontend không gọi được API

Kiểm tra file `.env`:

```env
VITE_API_URL=http://localhost:5090/api
```

Kiểm tra backend đã chạy ở:

```text
http://localhost:5090
```


### 14.2 Database chưa cập nhật migration

Chạy:

```bash
dotnet ef database update -p TuneVault.Infrastructure -s TuneVault.API -c ApplicationDbContext
```

Nếu báo pending model changes:

```bash
dotnet ef migrations add SyncFinalDatabase -p TuneVault.Infrastructure -s TuneVault.API -c ApplicationDbContext -o Persistence/Migrations
dotnet ef database update -p TuneVault.Infrastructure -s TuneVault.API -c ApplicationDbContext
```

### 14.3 Upload file lớn bị lỗi

Backend đã cấu hình upload limit 200MB. Nếu vẫn lỗi, kiểm tra:

```text
MultipartBodyLengthLimit
MaxRequestBodySize
RequestSizeLimit
```
---

## 15. Thành viên nhóm

| STT | Thành viên | MSSV | Vai trò | Đóng góp |
|---|---|---|---|---|
| 1 | Phạm Văn Tâm | 3121410438 | Backend, Frontend, Database | 30% |
| 2 | Trần Quang Duy | 3124410051 | Frontend  | 19% |
| 3 | Hà Nguyễn Yến Vy | 3121410584 | Backend | 19% |
| 4 | Tạ Ngọc Khánh Huy | 3124560035 | Backend | 16% |
| 5 | Phạm Duy Phương | 3124410290 | Backend | 16% |
| 6 | Huỳnh Tấn Phát | 3122410292 | Không tham gia làm bài | 0% |

---
## 16. Trích dẫn thư viện,

Dự án có sử dụng một số thư viện, công cụ và tài liệu mã nguồn mở để hỗ trợ xây dựng frontend, backend, database, realtime notification và giao diện người dùng. Các thư viện được dùng đúng mục đích học tập và phát triển đồ án.

### 16.1 Thư viện frontend

| Thư viện / Công cụ | Mục đích sử dụng | Nguồn |
|---|---|---|
| React | Xây dựng giao diện người dùng dạng SPA | https://react.dev |
| React DOM | Render React app lên trình duyệt | https://react.dev |
| Vite | Dev server và build tool cho frontend | https://vite.dev |
| TypeScript | Bổ sung kiểu dữ liệu cho JavaScript | https://www.typescriptlang.org |
| React Router DOM | Quản lý route phía client | https://reactrouter.com |
| Axios | Gửi HTTP request từ frontend đến backend API | https://axios-http.com |
| Zustand | Quản lý trạng thái như auth store, player store | https://zustand.docs.pmnd.rs |
| Tailwind CSS | Xây dựng giao diện bằng utility classes | https://tailwindcss.com |
| Lucide React | Sử dụng bộ icon trong giao diện | https://lucide.dev |
| Framer Motion | Hỗ trợ animation trong UI | https://www.framer.com/motion |
| React Hot Toast | Hiển thị toast notification | https://react-hot-toast.com |
| Microsoft SignalR Client | Kết nối realtime notification với backend | https://learn.microsoft.com/aspnet/core/signalr |

### 16.2 Thư viện backend

| Thư viện / Công cụ | Mục đích sử dụng | Nguồn |
|---|---|---|
| ASP.NET Core Web API | Xây dựng REST API cho backend | https://learn.microsoft.com/aspnet/core |
| Entity Framework Core | ORM để thao tác với SQL Server | https://learn.microsoft.com/ef/core |
| EF Core SQL Server Provider | Kết nối EF Core với SQL Server | https://learn.microsoft.com/ef/core/providers/sql-server |
| ASP.NET Core Identity | Quản lý user, password và xác thực | https://learn.microsoft.com/aspnet/core/security/authentication/identity |
| JWT Bearer Authentication | Xác thực API bằng JWT token | https://learn.microsoft.com/aspnet/core/security/authentication |
| MediatR | Triển khai CQRS, Command/Query và request pipeline | https://github.com/jbogard/MediatR |
| FluentValidation | Validate dữ liệu đầu vào cho command/request | https://docs.fluentvalidation.net |
| SignalR | Đẩy notification theo thời gian thực | https://learn.microsoft.com/aspnet/core/signalr |
| Swashbuckle.AspNetCore | Tạo Swagger/OpenAPI document | https://github.com/domaindrivendev/Swashbuckle.AspNetCore |
| TagLibSharp | Đọc metadata file audio/video | https://github.com/mono/taglib-sharp |

## 17. Tài liệu tham khảo

- ASP.NET Core: https://learn.microsoft.com/aspnet/core
- Entity Framework Core: https://learn.microsoft.com/ef/core
- SignalR: https://learn.microsoft.com/aspnet/core/signalr
- React: https://react.dev
- Vite: https://vitejs.dev
- MediatR: https://github.com/jbogard/MediatR
- FluentValidation: https://docs.fluentvalidation.net
- Clean Architecture: https://github.com/jasontaylordev/CleanArchitecture
- OpenRouter: https://openrouter.ai/docs

---

