import { useState } from "react";
import { X, Search, User } from "lucide-react";
import { shareService } from "../../api";
import toast from "react-hot-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId?: number;
  playlistId?: number;
  title: string;
}

const ShareModal = ({
  isOpen,
  onClose,
  mediaItemId,
  playlistId,
  title,
}: ShareModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock danh sách user (sau này sẽ lấy từ API)
  const allUsers = [
    { id: "U001", name: "Nguyễn Yến Vy" },
    { id: "U002", name: "Trần Minh Khang" },
    { id: "U003", name: "Lê Hoài Linh" },
    { id: "U004", name: "Phạm Thị Mai" },
    { id: "U005", name: "Nguyễn Văn An" },
    { id: "U006", name: "Trần Thị Bình" },
  ];

  const filteredUsers = searchTerm
    ? allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  if (!isOpen) return null;

  const handleSelectUser = (user: { id: string; name: string }) => {
    setSelectedUser(user);
    setSearchTerm("");
  };

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error("Vui lòng chọn người nhận");
      return;
    }

    setLoading(true);
    try {
      // TODO: Khi có Backend thật, gọi API:
      // await shareService.share({
      //   receiverUserId: selectedUser.id,        // Gửi ID
      //   receiverUserName: selectedUser.name,    // Gửi thêm tên (nếu backend cần)
      //   mediaItemId,
      //   playlistId,
      //   message: message.trim() || undefined,
      // });

      await shareService.share({
        receiverUserId: selectedUser.id,
        mediaItemId,
        playlistId,
        message: message.trim() || undefined,
      });

      toast.success(`Đã chia sẻ thành công cho ${selectedUser.name}`);
      onClose();
      setSearchTerm("");
      setSelectedUser(null);
      setMessage("");
    } catch (error) {
      toast.error("Chia sẻ thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-[#181818] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold">Chia sẻ "{title}"</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Tìm theo tên người dùng */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
            <User size={16} /> Tìm người nhận theo tên
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên người dùng..."
              className="w-full bg-[#282828] pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
          </div>
        </div>

        {/* Danh sách gợi ý theo tên */}
        {searchTerm && filteredUsers.length > 0 && (
          <div className="max-h-44 overflow-y-auto mb-4 border border-[#282828] rounded-lg bg-[#202020]">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="px-4 py-2.5 hover:bg-[#282828] cursor-pointer flex items-center gap-2 text-sm"
              >
                <User size={16} className="text-gray-400" />
                {user.name}
              </div>
            ))}
          </div>
        )}

        {/* Hiển thị người đã chọn */}
        {selectedUser && (
          <div className="mb-4 px-3 py-2 bg-[#282828] rounded-lg text-sm">
            Đang chia sẻ cho:{" "}
            <span className="font-semibold text-green-400">
              {selectedUser.name}
            </span>
          </div>
        )}

        {/* Tin nhắn */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tin nhắn (tùy chọn)..."
          className="w-full bg-[#282828] p-3 rounded-lg mb-5 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#282828] hover:bg-[#3a3a3a] text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleShare}
            disabled={loading || !selectedUser}
            className="px-5 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 disabled:opacity-60 text-sm"
          >
            {loading ? "Đang gửi..." : "Chia sẻ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
