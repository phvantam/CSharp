import { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Heart,
  Music,
  Play,
  ListMusic,
  Lock,
  Globe2,
  Users,
  UserCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import { favoriteService } from "../../api/favoriteService";
import { playlistService } from "../../api/playlistService";
import { userService, type UserListItemDto } from "../../api/userService";
import type { MediaItemDto } from "../../api/types/media";
import type { PlaylistDto } from "../../api/types/playlist";

const safeDate = (value?: string) => {
  if (!value) return "Không rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return date.toLocaleDateString("vi-VN");
};

const isPublicPlaylist = (playlist: PlaylistDto) =>
  String(playlist.visibility).toLowerCase() === "public";

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likedSongs, setLikedSongs] = useState<MediaItemDto[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const [followStats, setFollowStats] = useState({
    followerCount: 0,
    followingCount: 0,
  });

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
  });

  const publicPlaylists = useMemo(
    () => playlists.filter(isPublicPlaylist),
    [playlists],
  );

  const privatePlaylistCount = useMemo(
    () => playlists.filter((playlist) => !isPublicPlaylist(playlist)).length,
    [playlists],
  );

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    title: string;
    users: UserListItemDto[];
  }>({
    isOpen: false,
    title: "",
    users: [],
  });
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      displayName: user.displayName || "",
      bio: user.bio || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      setLoadingFavorites(true);
      setLoadingPlaylists(true);

      try {
        // Lấy profile trước để lấy đúng userId từ backend.
        // Tránh lỗi authStore lưu thiếu/sai id làm follower/following luôn = 0.
        const serverProfile = await userService.getProfile().catch(() => null);

        const profileUserId =
          serverProfile?.userId || serverProfile?.id || user.id;

        const [favorites, myPlaylists, stats] = await Promise.all([
          favoriteService.getMyFavorites(),
          playlistService.getMyPlaylists(),
          profileUserId
            ? userService.getFollowStats(profileUserId).catch(() => ({
                followerCount: 0,
                followingCount: 0,
              }))
            : Promise.resolve({
                followerCount: 0,
                followingCount: 0,
              }),
        ]);

        if (serverProfile) {
          const nextUser = {
            id: profileUserId,
            displayName:
              serverProfile.displayName ||
              serverProfile.fullName ||
              user.displayName,
            email: serverProfile.email || user.email,
            bio: serverProfile.bio ?? user.bio,
            avatarUrl: serverProfile.avatarUrl || user.avatarUrl,
            createdAt: serverProfile.createdAt || user.createdAt,
          };

          updateUser(nextUser);

          setFormData({
            displayName: nextUser.displayName || "",
            bio: nextUser.bio || "",
          });
        }

        setLikedSongs(favorites || []);
        setPlaylists(myPlaylists || []);
        setFollowStats({
          followerCount: stats?.followerCount ?? 0,
          followingCount: stats?.followingCount ?? 0,
        });
      } catch (error) {
        console.error("Lỗi tải hồ sơ:", error);
        toast.error("Không thể tải đầy đủ dữ liệu hồ sơ");
      } finally {
        setLoadingFavorites(false);
        setLoadingPlaylists(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-400">
          Vui lòng đăng nhập để xem hồ sơ cá nhân.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error("Tên hiển thị không được để trống");
      return;
    }

    setLoading(true);

    try {
      await userService.updateProfile({
        fullName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        privacyLevel: "Public",
      });

      updateUser({
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
      });

      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Cập nhật hồ sơ lỗi:", error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName,
      bio: user.bio || "",
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện tối đa 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);

    try {
      const result = await userService.uploadAvatar(file);
      const avatarUrl =
        typeof result === "string"
          ? result
          : result?.avatarUrl || result?.url || "";

      if (!avatarUrl) {
        throw new Error("Backend không trả về avatarUrl");
      }

      updateUser({ avatarUrl });
      setAvatarPreview("");
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      console.error("Upload avatar lỗi:", error);
      setAvatarPreview("");
      toast.error("Cập nhật ảnh đại diện thất bại");
    } finally {
      setUploadingAvatar(false);
      if (event.target) event.target.value = "";
    }
  };

  const openFollowList = async (type: "followers" | "following") => {
    const title = type === "followers" ? "Người theo dõi" : "Đang theo dõi";

    setFollowListModal({
      isOpen: true,
      title,
      users: [],
    });
    setLoadingFollowList(true);

    try {
      const profileUserId = user.id;

      if (!profileUserId) {
        setFollowListModal({
          isOpen: true,
          title,
          users: [],
        });
        return;
      }

      const users =
        type === "followers"
          ? await userService.getFollowers(profileUserId)
          : await userService.getFollowing(profileUserId);

      setFollowListModal({
        isOpen: true,
        title,
        users: users || [],
      });
    } catch (error) {
      console.error("Lỗi tải danh sách follow:", error);

      // Không hiện toast lỗi ở đây.
      // Nếu chưa có người follow / đang follow hoặc backend trả rỗng/lỗi nhẹ,
      // modal chỉ hiển thị "Chưa có người dùng nào."
      setFollowListModal({
        isOpen: true,
        title,
        users: [],
      });
    } finally {
      setLoadingFollowList(false);
    }
  };

  const handlePlaySong = (song: MediaItemDto) => {
    const rawAudioUrl =
      song.audioUrl ||
      song.filePath ||
      mediaService.getStreamUrl(song.mediaItemId);

    playTrack({
      id: song.mediaItemId,
      title: song.title,
      artist: song.artistName || "Unknown Artist",
      duration: song.durationSeconds ?? 0,
      thumbnailUrl: mediaService.getFullMediaUrl(song.thumbnailUrl),
      audioUrl: rawAudioUrl?.startsWith("http")
        ? rawAudioUrl
        : mediaService.getFullMediaUrl(rawAudioUrl),
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Hồ sơ cá nhân</h1>
      </div>

      <div className="relative rounded-3xl bg-[#181818] p-8 md:p-10">
        <div className="absolute right-6 top-6 flex flex-wrap justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-green-400 disabled:opacity-70"
              >
                <Save size={17} /> {loading ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-full bg-[#282828] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#3a3a3a]"
              >
                <X size={17} /> Hủy
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                <Edit3 size={17} /> Chỉnh sửa hồ sơ
              </button>
            </>
          )}
        </div>
        <div className="mb-10 mt-12 flex flex-col items-center gap-8 md:mt-8 md:flex-row md:items-start">
          <div className="relative group">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#181818] bg-[#282828]">
              {avatarPreview || user.avatarUrl ? (
                <img
                  src={
                    avatarPreview ||
                    mediaService.getFullMediaUrl(user.avatarUrl)
                  }
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={52} className="text-gray-500" />
              )}
            </div>

            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-2 right-2 rounded-full bg-[#282828] p-2.5 transition hover:bg-[#3a3a3a] disabled:opacity-70"
              title="Thay đổi ảnh đại diện"
            >
              <Camera size={16} />
            </button>

            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-xs font-semibold">
                Đang tải...
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold">{user.displayName}</h2>
            <p className="mt-1 text-gray-400">{user.email}</p>
            <p className="mt-1 text-sm text-gray-500">
              Thành viên từ {safeDate(user.createdAt)}
            </p>

            <div className="mt-5 flex justify-center gap-8 md:justify-start">
              <button
                onClick={() => openFollowList("followers")}
                className="rounded-2xl px-3 py-2 text-left transition hover:bg-white/5"
              >
                <p className="text-2xl font-bold">
                  {followStats.followerCount}
                </p>
                <p className="text-sm text-gray-400">Người theo dõi</p>
              </button>
              <button
                onClick={() => openFollowList("following")}
                className="rounded-2xl px-3 py-2 text-left transition hover:bg-white/5"
              >
                <p className="text-2xl font-bold">
                  {followStats.followingCount}
                </p>
                <p className="text-sm text-gray-400">Đang theo dõi</p>
              </button>
              <div>
                <p className="text-2xl font-bold">{publicPlaylists.length}</p>
                <p className="text-sm text-gray-400">Playlist</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Tên người dùng
            </label>

            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full rounded-2xl bg-[#282828] px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-2xl font-semibold">{user.displayName}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Giới thiệu
            </label>

            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                className="w-full resize-none rounded-2xl bg-[#282828] px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Viết vài dòng giới thiệu về bạn..."
              />
            ) : (
              <p className="min-h-[60px] whitespace-pre-line text-gray-300">
                {user.bio || "Chưa có giới thiệu."}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ListMusic className="text-green-400" />
            <h3 className="text-2xl font-semibold">Playlist</h3>
          </div>

          {privatePlaylistCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-gray-400">
              <Lock size={15} />
              {privatePlaylistCount} playlist riêng tư không hiển thị trên hồ sơ
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#181818] p-4">
          {loadingPlaylists ? (
            <p className="py-6 text-center text-gray-400">
              Đang tải playlist...
            </p>
          ) : publicPlaylists.length === 0 ? (
            <p className="py-6 text-center text-gray-400">
              Chưa có playlist công khai.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicPlaylists.map((playlist) => (
                <button
                  key={playlist.playlistId}
                  onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                  className="rounded-2xl bg-[#222] p-4 text-left transition hover:bg-[#2d2d2d]"
                >
                  <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#282828]">
                    {playlist.coverImageUrl ? (
                      <img
                        src={mediaService.getFullMediaUrl(
                          playlist.coverImageUrl,
                        )}
                        alt={playlist.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ListMusic size={44} className="text-green-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe2 size={15} className="text-green-400" />
                    <p className="truncate font-bold">{playlist.title}</p>
                  </div>

                  <p className="mt-1 line-clamp-1 text-sm text-gray-400">
                    {playlist.description || "Không có mô tả"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {playlist.trackCount ?? 0} bài hát
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <Heart className="text-red-500" />
          <h3 className="text-2xl font-semibold">Bài hát đã thích</h3>
        </div>

        <div className="rounded-2xl bg-[#181818] p-4">
          {loadingFavorites ? (
            <p className="py-6 text-center text-gray-400">
              Đang tải bài hát đã thích...
            </p>
          ) : likedSongs.length === 0 ? (
            <p className="py-6 text-center text-gray-400">
              Bạn chưa thích bài hát nào.
            </p>
          ) : (
            <div className="space-y-1">
              {likedSongs.slice(0, 6).map((song) => (
                <div
                  key={song.mediaItemId}
                  className="flex items-center justify-between rounded-xl p-3 transition hover:bg-[#282828]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-[#282828]">
                      {song.thumbnailUrl ? (
                        <img
                          src={mediaService.getFullMediaUrl(song.thumbnailUrl)}
                          alt={song.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Music size={18} className="text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        to={`/media/${song.mediaItemId}`}
                        className="block truncate font-medium text-white hover:text-green-400 hover:underline"
                      >
                        {song.title}
                      </Link>

                      {song.artistId ? (
                        <Link
                          to={`/artist/${song.artistId}`}
                          className="block truncate text-sm text-gray-400 hover:text-green-400 hover:underline"
                        >
                          {song.artistName || "Unknown Artist"}
                        </Link>
                      ) : (
                        <p className="truncate text-sm text-gray-400">
                          {song.artistName || "Unknown Artist"}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlaySong(song)}
                    className="rounded-full p-2 text-gray-400 hover:bg-[#333] hover:text-white"
                  >
                    <Play size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {followListModal.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {followListModal.title === "Người theo dõi" ? (
                  <Users className="text-green-400" />
                ) : (
                  <UserCheck className="text-green-400" />
                )}
                <h3 className="text-2xl font-bold">{followListModal.title}</h3>
              </div>

              <button
                onClick={() =>
                  setFollowListModal({ isOpen: false, title: "", users: [] })
                }
                className="rounded-full p-2 text-gray-400 hover:bg-[#282828] hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {loadingFollowList ? (
              <p className="py-10 text-center text-gray-400">
                Đang tải danh sách...
              </p>
            ) : followListModal.users.length === 0 ? (
              <p className="rounded-2xl bg-[#222] py-10 text-center text-gray-400">
                Chưa có người dùng nào.
              </p>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {followListModal.users.map((item) => (
                  <button
                    key={item.userId}
                    onClick={() => {
                      setFollowListModal({
                        isOpen: false,
                        title: "",
                        users: [],
                      });
                      navigate(
                        item.userId === user.id
                          ? "/profile"
                          : `/profile/${item.userId}`,
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-[#222] p-3 text-left transition hover:bg-[#2d2d2d]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#333]">
                      {item.avatarUrl ? (
                        <img
                          src={mediaService.getFullMediaUrl(item.avatarUrl)}
                          alt={item.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {item.displayName}
                      </p>
                      <p className="truncate text-sm text-gray-400">
                        {item.email || item.bio || "TuneVault user"}
                      </p>
                    </div>

                    {item.isFollowing && item.userId !== user.id && (
                      <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
                        Đang theo dõi
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
