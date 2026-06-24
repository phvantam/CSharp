# TuneVault

## Backend ASP.NET Core

Backend nam trong thu muc `TuneVault.Api` va phu cac chuc nang:

- Auth: register, login, refresh token, logout, JWT tu ky.
- User profile: xem/sua display name, bio, avatar.
- Media library: upload audio/video metadata + file, thumbnail/poster, stream co ho tro range requests.
- Playlist: CRUD playlist, them/xoa track, public/private.
- Search/trending, favorite, play history 10 bai gan nhat.
- Share media/playlist cho user khac va notification realtime qua SignalR.

Chay backend:

```bash
cd TuneVault.Api
dotnet restore --configfile ../NuGet.Config
dotnet run --urls http://localhost:5000
```

Tai khoan seed de test:

```txt
email: eddypham@gmail.com
password: 123456
```

API base URL mac dinh cua frontend la:

```txt
http://localhost:5000/api
```

Hub notification:

```txt
http://localhost:5000/api/notificationHub
```

# TuneVault Frontend

## Cài đặt dự án

Clone repository:

```bash
git clone https://github.com/phvantam/CSharp.git
```

Di chuyển vào thư mục frontend:

```bash
cd CSharp/tunevault-frontend
```

Cài đặt dependencies:

```bash
npm install
```

Chạy development server:

```bash
npm run dev
```

Sau khi chạy thành công, mở trình duyệt tại:

```txt
http://localhost:5173
```
