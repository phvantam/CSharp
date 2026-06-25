import { useState, useEffect, useRef } from "react";
import { Search, User, Menu } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mediaService, playlistService, albumService } from "../../api";
import { useMediaActions } from "../../hooks/useMediaActions";
import type { MediaItemDto } from "../../api/types/media";
import type { PlaylistDto } from "../../api/types/playlist";
import type { AlbumDto } from "../../api/types/album";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [localQuery, setLocalQuery] = useState(queryParam);
  const [isOpen, setIsOpen] = useState(false);
  const [songs, setSongs] = useState<MediaItemDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSong } = useMediaActions();

  // Sync local query with URL search param when page loads or parameter changes
  useEffect(() => {
    setLocalQuery(queryParam);
  }, [queryParam]);

  // Debounced quick search
  useEffect(() => {
    if (!localQuery.trim()) {
      setSongs([]);
      setPlaylists([]);
      setAlbums([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const [songData, playlistData, albumData] = await Promise.all([
          mediaService.searchMedia(localQuery),
          playlistService.searchPlaylists(localQuery),
          albumService.searchAlbums(localQuery),
        ]);
        setSongs(songData.slice(0, 5));
        setPlaylists(playlistData.slice(0, 3));
        setAlbums(albumData.slice(0, 3));
      } catch (err) {
        console.error("Quick search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigateToSearch = (queryVal: string) => {
    setIsOpen(false);
    const isSearchPage = window.location.pathname === "/search";
    navigate(`/search?q=${encodeURIComponent(queryVal)}`, {
      replace: isSearchPage,
    });
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-[#282828] bg-[#121212] px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Nút menu cho mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white"
        >
          <Menu size={22} />
        </button>

        {/* Search Bar & Dropdown */}
        <div ref={containerRef} className="relative w-64 md:w-96">
          <Search
            className="absolute left-4 top-3 text-gray-400 pointer-events-none"
            size={18}
          />
          <input
            type="search"
            autoComplete="off"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => {
              if (localQuery.trim()) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              } else if (e.key === "Enter") {
                handleNavigateToSearch(localQuery);
              }
            }}
            onDrop={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onPaste={(e) => {
              const hasFiles = e.clipboardData?.files?.length > 0;
              if (hasFiles) e.preventDefault();
            }}
            placeholder="Bạn muốn nghe nhạc gì?"
            className="w-full rounded-full bg-[#282828] py-2 pl-12 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-white [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />

          {/* Quick Search Dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 w-full z-50 rounded-xl border border-[#282828] bg-[#181818]/95 backdrop-blur-md shadow-2xl overflow-hidden max-h-[30rem] overflow-y-auto">
              {loading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </div>
              ) : songs.length === 0 &&
                playlists.length === 0 &&
                albums.length === 0 ? (
                <div className="p-4 text-gray-400 text-sm text-center">
                  Không tìm thấy kết quả cho "{localQuery}"
                </div>
              ) : (
                <div className="divide-y divide-[#282828]">
                  {/* Songs Section */}
                  {songs.length > 0 && (
                    <div className="p-2">
                      <h4 className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Bài hát
                      </h4>
                      <div className="space-y-0.5">
                        {songs.map((song) => (
                          <div
                            key={song.mediaItemId}
                            onClick={() => {
                              playSong(song, songs);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] cursor-pointer group transition-colors"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden bg-[#282828] flex-shrink-0 flex items-center justify-center text-gray-500">
                              {song.thumbnailUrl ? (
                                <img
                                  src={song.thumbnailUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                "♪"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate group-hover:text-green-500 transition-colors">
                                {song.title}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {song.artistName || "Unknown Artist"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Albums Section */}
                  {albums.length > 0 && (
                    <div className="p-2">
                      <h4 className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Albums
                      </h4>
                      <div className="space-y-0.5">
                        {albums.map((album) => (
                          <div
                            key={album.albumId}
                            onClick={() => {
                              navigate(`/album/${album.albumId}`);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] cursor-pointer group transition-colors"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden bg-[#282828] flex-shrink-0 flex items-center justify-center text-gray-500">
                              {album.coverImageUrl ? (
                                <img
                                  src={album.coverImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                "💿"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate group-hover:text-green-500 transition-colors">
                                {album.title}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                Album • {album.artistName || "Unknown Artist"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Playlists Section */}
                  {playlists.length > 0 && (
                    <div className="p-2">
                      <h4 className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Playlists
                      </h4>
                      <div className="space-y-0.5">
                        {playlists.map((playlist) => (
                          <div
                            key={playlist.playlistId}
                            onClick={() => {
                              navigate(`/playlist/${playlist.playlistId}`);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] cursor-pointer group transition-colors"
                          >
                            <div className="w-10 h-10 rounded bg-[#282828] flex-shrink-0 flex items-center justify-center text-lg text-gray-500 bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
                              🎶
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate group-hover:text-green-500 transition-colors">
                                {playlist.title}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                Playlist • {playlist.trackCount || 0} bài hát
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Bottom Link */}
                  <div
                    onClick={() => handleNavigateToSearch(localQuery)}
                    className="p-3 text-center text-xs font-semibold text-green-500 hover:text-green-400 hover:bg-[#282828]/50 cursor-pointer transition-colors"
                  >
                    Xem tất cả kết quả cho "{localQuery}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#282828] px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-600">
                <User size={16} />
              </div>
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#282828] px-4 py-1.5 text-sm font-medium hover:bg-[#3a3a3a]"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-gray-200"
          >
            Log in
          </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;
