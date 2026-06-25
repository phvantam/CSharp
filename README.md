# 🎵 TuneVault - Nền tảng Nghe Nhạc & Video Trực Tuyến

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![EF Core](https://img.shields.io/badge/EF_Core-8.x-512BD4)](https://learn.microsoft.com/ef/)
[![SignalR](https://img.shields.io/badge/SignalR-Real--time-FF6B6B)](https://learn.microsoft.com/aspnet/core/signalr)
[![MediatR](https://img.shields.io/badge/MediatR-Pipeline-FF6B6B)](https://github.com/jbogard/MediatR)
[![Status](https://img.shields.io/badge/Status-Hoàn%20thiện%20đồ%20án-success)](https://github.com/phvantam/CSharp)

**TuneVault** là đồ án môn **Lập trình C#** (Học kỳ 3 - 2026) tại Trường Đại học Sài Gòn. Dự án được xây dựng theo mô hình **Clean Architecture** kết hợp **MediatR Pipeline Behaviors**, hỗ trợ chia sẻ media, thông báo thời gian thực và tích hợp AI.

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [⭐ Điểm nổi bật của đồ án](#-điểm-nổi-bật-của-đồ-án)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Seed Data](#seed-data)
- [Kiểm thử API (Swagger & Postman)](#kiểm-thử-api-swagger--postman)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Tài khoản thử nghiệm](#tài-khoản-thử-nghiệm)
- [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 📝 Giới thiệu

**TuneVault** là nền tảng nghe nhạc và xem video trực tuyến được thiết kế theo chuẩn **Clean Architecture** 4 lớp. Toàn bộ logic nghiệp vụ được xử lý qua **MediatR Pipeline**, đảm bảo tính tách biệt rõ ràng giữa các layer và dễ dàng mở rộng.

Dự án đã hoàn thiện các chức năng cốt lõi theo yêu cầu đồ án, bao gồm chia sẻ media, thông báo real-time và tích hợp AI.

---

## ⭐ Điểm nổi bật của đồ án

Dự án được xây dựng với nhiều điểm mạnh về kiến trúc và tính năng:

### 1. **Clean Architecture + MediatR Pipeline (B1 & B8)**
- Tuân thủ nghiêm ngặt **4 layer**: Domain → Application → Infrastructure → API
- Tất cả chức năng chính đều đi qua **MediatR Pipeline** với 2 Behaviors quan trọng:
  - `ValidationBehavior`: Kiểm tra dữ liệu đầu vào bằng FluentValidation
  - `AuthorizationBehavior`: Kiểm tra quyền sở hữu (chỉ chủ sở hữu mới được sửa/xóa media, playlist)
- Logic nghiệp vụ được tách biệt hoàn toàn khỏi Controller

### 2. **Tích hợp AI (OpenRouter)**
- Chatbot hỗ trợ người dùng (TuneBot)
- Gợi ý bài hát thông minh dựa trên lịch sử nghe và yêu thích
- Triển khai đúng chuẩn Clean Architecture (Interface trong Application, Service trong Infrastructure)

### 3. **Thông báo thời gian thực (SignalR)**
- Khi chia sẻ media/playlist thành công → tự động tạo Notification + đẩy thông báo real-time qua SignalR
- Người nhận thấy thông báo ngay lập tức mà không cần reload trang

### 4. **Upload đa phương tiện nâng cao**
- Hỗ trợ upload đồng thời **Audio + Video + Thumbnail** trong 1 request
- Validate MIME type và giới hạn kích thước file
- Lưu file theo cấu trúc rõ ràng trong `wwwroot/media`

### 5. **Tính năng xã hội đầy đủ**
- Chia sẻ media/playlist cho người khác
- Follow/Unfollow nghệ sĩ và người dùng
- Yêu thích bài hát + Lịch sử nghe nhạc

---

## 🚀 Tính năng chính

### Backend

| Chức năng                        | Mô tả chi tiết                                                                 | Pipeline | Trạng thái    |
|----------------------------------|----------------------------------------------------------------------------------|----------|---------------|
| **Auth**                         | Đăng ký, Đăng nhập bằng JWT, Refresh Token                                       | ✅       | Hoàn thiện    |
| **Media Management**             | Upload (Audio + Video + Thumbnail), Update, Delete, Streaming                    | ✅       | Hoàn thiện    |
| **Playlist**                     | Tạo, Sửa, Xóa Playlist + Thêm/Xóa bài hát trong playlist                         | ✅       | Hoàn thiện    |
| **Share**                        | Chia sẻ Media/Playlist cho người khác + Danh sách đã gửi/nhận                    | ✅       | Hoàn thiện    |
| **Notification**                 | Lấy danh sách thông báo, Đánh dấu đã đọc, Real-time push qua SignalR             | ✅       | Hoàn thiện    |
| **Favorite & Play History**      | Thêm/Xóa yêu thích, Ghi nhận lịch sử nghe nhạc                                   | ✅       | Hoàn thiện    |
| **Artist & Album**               | Quản lý nghệ sĩ, Album, Tìm kiếm nghệ sĩ                                         | ✅       | Hoàn thiện    |
| **Search & Discovery**           | Tìm kiếm media, Xem Trending, New Releases                                       | ✅       | Hoàn thiện    |
| **AI Integration**               | Chatbot hỗ trợ + Gợi ý bài hát thông minh                                        | ✅       | Hoàn thiện    |
| **User Interaction**             | Follow/Unfollow người dùng và nghệ sĩ                                            | ✅       | Hoàn thiện    |

### Frontend

- Giao diện hiện đại, tối (Dark Theme)
- Trình phát nhạc và video chuyên nghiệp
- Hệ thống chia sẻ + thông báo real-time
- Trang Upload hỗ trợ đa phương tiện
- AI Chatbot tích hợp
- Trang Library, Search, Artist, Album chi tiết

---

## 🛠️ Công nghệ sử dụng

| Layer                  | Công nghệ                                      |
|------------------------|------------------------------------------------|
| **Backend**            | ASP.NET Core 8, Entity Framework Core, MediatR, FluentValidation, SignalR |
| **Architecture**       | Clean Architecture + CQRS + Pipeline Behaviors |
| **Database**           | SQL Server                                     |
| **Frontend**           | React 18 + TypeScript + Vite + Tailwind CSS    |
| **State Management**   | Zustand                                        |
| **Real-time**          | SignalR                                        |
| **AI**                 | OpenRouter API                                 |
| **Authentication**     | JWT + ASP.NET Identity                         |

---

## 📁 Cấu trúc dự án

```text
TuneVault/
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
