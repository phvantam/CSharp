import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Pages - Person A
import LoginPage           from '../pages/auth/LoginPage';
import RegisterPage        from '../pages/auth/RegisterPage';
import HomePage            from '../pages/home/HomePage';
import SearchPage          from '../pages/search/SearchPage';
import LibraryPage         from '../pages/library/LibraryPage';

// Pages - Person B (import sẵn, Person B code nội dung)
import PlaylistDetailPage  from '../pages/playlist/PlaylistDetailPage';
import ShareInboxPage      from '../pages/share/ShareInboxPage';
import NotificationsPage   from '../pages/notifications/NotificationsPage';
import ProfilePage         from '../pages/profile/ProfilePage';
import VideoPlayerPage     from '../pages/video/VideoPlayerPage';
import NotFoundPage        from '../pages/NotFoundPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — dùng MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search"                   element={<SearchPage />} />
            <Route path="library"                  element={<LibraryPage />} />
            <Route path="playlist/:id"             element={<PlaylistDetailPage />} />
            <Route path="share"                    element={<ShareInboxPage />} />
            <Route path="notifications"            element={<NotificationsPage />} />
            <Route path="profile"                  element={<ProfilePage />} />
            <Route path="video/:id"                element={<VideoPlayerPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*"    element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
