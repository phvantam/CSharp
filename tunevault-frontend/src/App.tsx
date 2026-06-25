import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

// Core Pages
import HomePage from "./pages/home/HomePage";
import SearchPage from "./pages/search/SearchPage";
import LibraryPage from "./pages/library/LibraryPage";
import PlaylistDetailPage from "./pages/playlist/PlaylistDetailPage";
import ShareInboxPage from "./pages/share/ShareInboxPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import VideoPlayerPage from "./pages/video/VideoPlayerPage";
import UploadPage from "./pages/upload/UploadPage";
import AIChatbot from "./pages/ai/AIChatbot";
import PublicProfilePage from "./pages/profile/PublicProfilePage";
import RecentlyPlayedPage from "./pages/history/RecentlyPlayedPage";
import NowPlayingPage from "./pages/player/NowPlayingPage";
import AlbumDetailPage from "./pages/album/AlbumDetailPage";
import ArtistDetailPage from "./pages/artist/ArtistDetailPage";
import MediaDetailPage from "./pages/media/MediaDetailPage";

function App() {
  return (
    <Routes>
      {/* Redirect mặc định về Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/history" element={<RecentlyPlayedPage />} />
          <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="/share-inbox" element={<ShareInboxPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/video/:id" element={<VideoPlayerPage />} />
          <Route path="/now-playing/:id" element={<NowPlayingPage />} />
          <Route path="/now-playing" element={<NowPlayingPage />} />
          <Route path="/album/:id" element={<AlbumDetailPage />} />
          <Route path="/artist/:id" element={<ArtistDetailPage />} />
          <Route path="/media/:id" element={<MediaDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/ai-chat" element={<AIChatbot />} />
          <Route path="/profile/:userId" element={<PublicProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
