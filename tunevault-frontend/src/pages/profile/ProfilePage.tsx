import { useState } from "react";
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Share2,
  Heart,
  Music,
  Play,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import ShareModal from "../../components/share/ShareModal";

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Mock data cho bài hát đã thích
  const likedSongs = [
    { id: 1, title: "Lạ Lùng", artist: "Vũ." },
    { id: 8, title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP" },
    { id: 3, title: "Mang Tiền Về Cho Mẹ", artist: "Đen" },
  ];

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
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
      await new Promise((resolve) => setTimeout(resolve, 600));

      updateUser({
        displayName: formData.displayName,
        bio: formData.bio,
      });

      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Hồ sơ cá nhân</h1>
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#282828] hover:bg-[#3a3a3a] text-sm"
        >
          <Share2 size={18} /> Chia sẻ hồ sơ
        </button>
      </div>

      <div className="bg-[#181818] rounded-3xl p-8 md:p-10">
        {/* Avatar + Thông tin cơ bản */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-[#282828] flex items-center justify-center overflow-hidden border-4 border-[#181818]">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={52} className="text-gray-500" />
              )}
            </div>
            <button
              className="absolute bottom-2 right-2 bg-[#282828] p-2.5 rounded-full hover:bg-[#3a3a3a] transition"
              title="Thay đổi ảnh đại diện"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold">{user.displayName}</h2>
            <p className="text-gray-400 mt-1">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Thành viên từ{" "}
              {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Form thông tin */}
        <div className="space-y-6">
          {/* Tên hiển thị */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tên người dùng
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full bg-[#282828] px-5 py-3 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-2xl font-semibold">{user.displayName}</p>
            )}
          </div>

          {/* Giới thiệu */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Giới thiệu
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                className="w-full bg-[#282828] px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Viết vài dòng giới thiệu về bạn..."
              />
            ) : (
              <p className="text-gray-300 whitespace-pre-line min-h-[60px]">
                {user.bio || "Chưa có giới thiệu."}
              </p>
            )}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-8 flex flex-wrap gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-full font-semibold transition disabled:opacity-70"
              >
                <Save size={18} /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-[#282828] hover:bg-[#3a3a3a] px-8 py-3 rounded-full font-semibold transition"
              >
                <X size={18} /> Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              <Edit3 size={18} /> Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Bài hát đã thích (mới thêm) */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="text-red-500" />
          <h3 className="text-2xl font-semibold">Bài hát đã thích</h3>
        </div>

        <div className="bg-[#181818] rounded-2xl p-4">
          {likedSongs.length > 0 ? (
            <div className="space-y-1">
              {likedSongs.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#282828] transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center">
                      <Music size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <Play size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 py-4">Bạn chưa thích bài hát nào.</p>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={`${user.displayName}'s Profile`}
      />
    </div>
  );
};

export default ProfilePage;
