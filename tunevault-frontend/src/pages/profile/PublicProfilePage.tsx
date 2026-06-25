import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  UserPlus,
  UserMinus,
  ListMusic,
  Globe2,
  Users,
  UserCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { mediaService } from "../../api";
import { playlistService } from "../../api/playlistService";
import {
  userService,
  type PublicUserProfileDto,
  type UserListItemDto,
} from "../../api/userService";
import type { PlaylistDto } from "../../api/types/playlist";
import { useAuthStore } from "../../stores/authStore";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState<PublicUserProfileDto | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    type: "followers" | "following";
    title: string;
    users: UserListItemDto[];
  }>({
    isOpen: false,
    type: "followers",
    title: "",
    users: [],
  });

  const [loadingFollowList, setLoadingFollowList] = useState(false);

  const fetchData = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const [profileData, playlistData] = await Promise.all([
        userService.getPublicProfile(userId),
        playlistService.getPublicPlaylistsByUser(userId),
      ]);

      setProfile(profileData);
      setPlaylists(playlistData || []);
    } catch (error) {
      console.error("Lỗi tải hồ sơ công khai:", error);
      toast.error("Không thể tải hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const toggleFollow = async () => {
    if (!profile) return;

    setFollowLoading(true);

    try {
      if (profile.isFollowing) {
        await userService.unfollowUser(profile.userId);
        setProfile({
          ...profile,
          isFollowing: false,
          followerCount: Math.max(0, profile.followerCount - 1),
        });
        toast.success("Đã bỏ theo dõi");
      } else {
        await userService.followUser(profile.userId);
        setProfile({
          ...profile,
          isFollowing: true,
          followerCount: profile.followerCount + 1,
        });
        toast.success("Đã theo dõi");
      }
    } catch (error) {
      console.error("Follow lỗi:", error);
      toast.error("Thao tác thất bại");
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowList = async (type: "followers" | "following") => {
    if (!profile) return;

    const title = type === "followers" ? "Người theo dõi" : "Đang theo dõi";

    setFollowListModal({
      isOpen: true,
      type,
      title,
      users: [],
    });
    setLoadingFollowList(true);

    try {
      const users =
        type === "followers"
          ? await userService.getFollowers(profile.userId)
          : await userService.getFollowing(profile.userId);

      setFollowListModal({
        isOpen: true,
        type,
        title,
        users: users || [],
      });
    } catch (error) {
      console.error("Lỗi tải danh sách follow:", error);

      setFollowListModal({
        isOpen: true,
        type,
        title,
        users: [],
      });
    } finally {
      setLoadingFollowList(false);
    }
  };

  const goToUserProfile = (targetUserId: string) => {
    setFollowListModal({
      isOpen: false,
      type: "followers",
      title: "",
      users: [],
    });

    if (targetUserId === currentUser?.id) {
      navigate("/profile");
      return;
    }

    navigate(`/profile/${targetUserId}`);
  };

  if (loading) {
    return <p className="py-20 text-center text-gray-400">Đang tải hồ sơ...</p>;
  }

  if (!profile) {
    return (
      <p className="py-20 text-center text-gray-400">
        Không tìm thấy người dùng.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative rounded-3xl bg-[#181818] p-8 md:p-10">
        {/* Nút theo dõi dời lên góc phải */}
        <div className="absolute right-6 top-6">
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className={`inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold transition disabled:opacity-70 ${
              profile.isFollowing
                ? "bg-[#282828] text-white hover:bg-[#3a3a3a]"
                : "bg-green-500 text-black hover:bg-green-400"
            }`}
          >
            {profile.isFollowing ? (
              <UserMinus size={19} />
            ) : (
              <UserPlus size={19} />
            )}
            {followLoading
              ? "Đang xử lý..."
              : profile.isFollowing
                ? "Đang theo dõi"
                : "Theo dõi"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-8 pt-12 md:flex-row md:items-start md:pt-4">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#282828]">
            {profile.avatarUrl ? (
              <img
                src={mediaService.getFullMediaUrl(profile.avatarUrl)}
                alt={profile.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={58} className="text-gray-500" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gray-400">
              Hồ sơ người dùng
            </p>
            <h1 className="pr-0 text-5xl font-bold md:pr-48">
              {profile.displayName}
            </h1>

            {profile.bio && (
              <p className="mt-4 max-w-2xl text-gray-300">{profile.bio}</p>
            )}

            <div className="mt-6 flex justify-center gap-4 md:justify-start">
              <button
                onClick={() => openFollowList("followers")}
                className="rounded-2xl px-4 py-3 text-left transition hover:bg-white/5"
              >
                <p className="text-2xl font-bold">{profile.followerCount}</p>
                <p className="text-sm text-gray-400">Người theo dõi</p>
              </button>

              <button
                onClick={() => openFollowList("following")}
                className="rounded-2xl px-4 py-3 text-left transition hover:bg-white/5"
              >
                <p className="text-2xl font-bold">{profile.followingCount}</p>
                <p className="text-sm text-gray-400">Đang theo dõi</p>
              </button>

              <div className="rounded-2xl px-4 py-3 text-left">
                <p className="text-2xl font-bold">{playlists.length}</p>
                <p className="text-sm text-gray-400">Playlist công khai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <Globe2 className="text-green-400" />
          <h2 className="text-2xl font-semibold">Playlist công khai</h2>
        </div>

        {playlists.length === 0 ? (
          <div className="rounded-2xl bg-[#181818] p-10 text-center text-gray-400">
            Người dùng này chưa có playlist công khai.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <button
                key={playlist.playlistId}
                onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                className="rounded-2xl bg-[#181818] p-4 text-left transition hover:bg-[#282828]"
              >
                <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#282828]">
                  {playlist.coverImageUrl ? (
                    <img
                      src={mediaService.getFullMediaUrl(playlist.coverImageUrl)}
                      alt={playlist.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ListMusic size={50} className="text-green-400" />
                  )}
                </div>

                <h3 className="truncate text-xl font-bold">{playlist.title}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-gray-400">
                  {playlist.description || "Không có mô tả"}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {playlist.trackCount ?? 0} bài hát
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Modal xem Người theo dõi / Đang theo dõi */}
      {followListModal.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {followListModal.type === "followers" ? (
                  <Users className="text-green-400" />
                ) : (
                  <UserCheck className="text-green-400" />
                )}
                <h3 className="text-2xl font-bold">{followListModal.title}</h3>
              </div>

              <button
                onClick={() =>
                  setFollowListModal({
                    isOpen: false,
                    type: "followers",
                    title: "",
                    users: [],
                  })
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
                    onClick={() => goToUserProfile(item.userId)}
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

                    {item.isFollowing && item.userId !== currentUser?.id && (
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

export default PublicProfilePage;
