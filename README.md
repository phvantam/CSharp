# 🎵 TuneVault - Nền tảng Nghe Nhạc & Video Trực Tuyến

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![EF Core](https://img.shields.io/badge/EF_Core-8.x-512BD4)](https://learn.microsoft.com/ef/)
[![SignalR](https://img.shields.io/badge/SignalR-Real--time-FF6B6B)](https://learn.microsoft.com/aspnet/core/signalr)
[![Status](https://img.shields.io/badge/Status-Hoàn%20thiện%20đồ%20án-success)](https://github.com/phvantam/CSharp)

**TuneVault** là ứng dụng nghe nhạc và xem video trực tuyến được xây dựng theo mô hình **Clean Architecture** kết hợp **MediatR Pipeline**, hỗ trợ chia sẻ media, thông báo thời gian thực (SignalR) và tích hợp AI.

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Tài khoản thử nghiệm](#tài-khoản-thử-nghiệm)
- [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 📝 Giới thiệu

**TuneVault** là đồ án môn **Lập trình C#** (Học kỳ 3 - 2026) tại Trường Đại học Sài Gòn.  
Dự án được thiết kế theo **Clean Architecture** 4 lớp, sử dụng **MediatR + Pipeline Behaviors** cho tất cả các chức năng chính, kết hợp **SignalR** cho thông báo thời gian thực và tích hợp **AI** (OpenRouter).

---

## 🚀 Tính năng chính

### Backend (10+ chức năng cốt lõi)

| STT | Chức năng                          | Pipeline | Trạng thái |
|-----|------------------------------------|----------|------------|
| 1   | Đăng ký / Đăng nhập (JWT)          | ✅       | Hoàn thiện |
| 2   | Upload Media (Audio + Video + Thumbnail) | ✅   | Hoàn thiện |
| 3   | Quản lý Playlist (CRUD + Add/Remove Track) | ✅ | Hoàn thiện |
| 4   | Chia sẻ Media / Playlist           | ✅       | Hoàn thiện |
| 5   | Thông báo Real-time (SignalR)      | ✅       | Hoàn thiện |
| 6   | Yêu thích & Lịch sử nghe           | ✅       | Hoàn thiện |
| 7   | Follow / Unfollow Nghệ sĩ & User   | ✅       | Hoàn thiện |
| 8   | Tìm kiếm & Trending / New Releases | ✅       | Hoàn thiện |
| 9   | AI Chatbot + Gợi ý bài hát         | ✅       | Hoàn thiện |
| 10  | Quản lý Nghệ sĩ & Album            | ✅       | Hoàn thiện |

### Frontend

- Giao diện tối hiện đại (Dark Theme)
- Trình phát nhạc + video chuyên nghiệp
- Hệ thống chia sẻ + thông báo thời gian thực
- Trang Upload đa phương tiện
- AI Chatbot tích hợp

---

## 🛠️ Công nghệ sử dụng

| Layer              | Công nghệ                              |
|--------------------|----------------------------------------|
| **Backend**        | ASP.NET Core 8, EF Core, MediatR, FluentValidation, SignalR |
| **Architecture**   | Clean Architecture + CQRS + Pipeline Behaviors |
| **Database**       | SQL Server + EF Core Migrations        |
| **Frontend**       | React 18 + TypeScript + Vite + TailwindCSS |
| **State**          | Zustand                                |
| **Real-time**      | SignalR Client                         |
| **AI**             | OpenRouter API                         |
| **Authentication** | JWT + ASP.NET Identity                 |

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
