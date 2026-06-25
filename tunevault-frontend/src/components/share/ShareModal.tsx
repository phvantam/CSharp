import { useState } from "react";
import {
  X,
  Search,
  User,
  CheckCircle2,
  Info,
  Music2,
  ListMusic,
} from "lucide-react";
import { shareService } from "../../api";
import toast from "react-hot-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId?: number;
  playlistId?: number;
  title: string;
}

interface UserResult {
  id: string;
  name: string;
  username?: string;
}

type ShareToastType = "success" | "duplicate";

const showShareToast = ({
  type,
  contentLabel,
  receiverName,
}: {
  type: ShareToastType;
  contentLabel: string;
  receiverName: string;
}) => {
  const isDuplicate = type === "duplicate";

  toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto flex w-[390px] max-w-[calc(100vw-32px)] items-center gap-4 rounded-2xl border border-green-400/25 bg-[#102018]/95 px-5 py-4 shadow-2xl shadow-green-950/30 backdrop-blur-xl transition-all duration-300 ${
          t.visible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500/15 text-green-300">
          {isDuplicate ? <Info size={23} /> : <CheckCircle2 size={23} />}
        </div>

        <div className="min-w-0 flex-1">
          <span className="mb-1.5 inline-flex rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-200">
            {isDuplicate ? "Đã chia sẻ trước đó" : "Chia sẻ thành công"}
          </span>

          <p className="text-[15px] font-semibold leading-snug text-white">
            {isDuplicate
              ? `${contentLabel} này đã được chia sẻ cho ${receiverName} rồi`
              : `Đã chia sẻ ${contentLabel.toLowerCase()} cho ${receiverName}`}
          </p>
        </div>

        <button
          onClick={() => toast.dismiss(t.id)}
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Đóng thông báo"
        >
          <X size={17} />
        </button>
      </div>
    ),
    {
      duration: isDuplicate ? 3600 : 3200,
      position: "top-center",
    },
  );
};

const ShareModal = ({
  isOpen,
  onClose,
  mediaItemId,
  playlistId,
  title,
}: ShareModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const isPlaylistShare = !!playlistId && !mediaItemId;
  const contentLabel = isPlaylistShare ? "Playlist" : "Bài hát";

  const handleSearch = async (keyword: string) => {
    setSearchTerm(keyword);

    if (keyword.trim().length < 2) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const results = await shareService.searchUsers(keyword.trim());
      setUsers(results);
    } catch {
      setUsers([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    setSearchTerm("");
    setUsers([]);
  };

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error("Vui lòng chọn người nhận");
      return;
    }

    if (!mediaItemId && !playlistId) {
      toast.error("Không xác định được nội dung cần chia sẻ");
      return;
    }

    setLoading(true);

    try {
      const result = await shareService.share({
        receiverUserId: selectedUser.id,
        mediaItemId,
        playlistId,
        message: message.trim() || undefined,
      });

      if (result?.isDuplicate) {
        showShareToast({
          type: "duplicate",
          contentLabel,
          receiverName: selectedUser.name,
        });
        return;
      }

      showShareToast({
        type: "success",
        contentLabel,
        receiverName: selectedUser.name,
      });

      onClose();
      resetForm();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Chia sẻ thất bại. Vui lòng thử lại.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setUsers([]);
    setSelectedUser(null);
    setMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-500/15 text-green-300">
                {isPlaylistShare ? (
                  <ListMusic size={20} />
                ) : (
                  <Music2 size={20} />
                )}
              </div>

              <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-200">
                {contentLabel}
              </span>
            </div>

            <h3 className="text-xl font-bold leading-snug text-white">
              Chia sẻ "{title}"
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-2 text-sm text-gray-400">
            <User size={16} /> Tìm người nhận theo tên
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Nhập tên hoặc username..."
              className="w-full rounded-xl bg-[#282828] py-3 pl-10 pr-4 text-white outline-none transition focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {searchTerm && users.length > 0 && (
          <div className="mb-4 max-h-44 overflow-y-auto rounded-xl border border-[#282828] bg-[#202020]">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#282828]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300">
                  <User size={17} />
                </div>

                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  {user.username && (
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm && users.length === 0 && !searching && (
          <p className="mb-4 rounded-xl bg-white/5 px-4 py-3 text-sm text-gray-400">
            Không tìm thấy người dùng nào.
          </p>
        )}

        {selectedUser && (
          <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-gray-200">
            Đang chia sẻ cho:{" "}
            <span className="font-bold text-green-300">
              {selectedUser.name}
            </span>
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tin nhắn (tùy chọn)..."
          className="mb-5 w-full resize-none rounded-xl bg-[#282828] p-4 text-white outline-none transition focus:ring-2 focus:ring-green-500"
          rows={3}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-full bg-[#282828] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a]"
          >
            Hủy
          </button>

          <button
            onClick={handleShare}
            disabled={loading || !selectedUser}
            className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Chia sẻ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
