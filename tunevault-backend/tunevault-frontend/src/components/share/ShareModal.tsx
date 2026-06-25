import { useEffect, useState } from "react";
import { Search, User, X } from "lucide-react";
import toast from "react-hot-toast";
import { shareService, userService } from "../../api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId?: number;
  playlistId?: number;
  title: string;
}

interface ShareUser {
  id: string;
  name: string;
}

const ShareModal = ({
  isOpen,
  onClose,
  mediaItemId,
  playlistId,
  title,
}: ShareModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShareUser | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(async () => {
      setUserLoading(true);
      try {
        const result = await userService.searchUsers(searchTerm);
        setUsers(
          result.map((user) => ({
            id: user.id,
            name: user.displayName || user.email,
          })),
        );
      } catch {
        setUsers([]);
      } finally {
        setUserLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  const handleSelectUser = (user: ShareUser) => {
    setSelectedUser(user);
    setSearchTerm("");
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
    setSelectedUser(null);
    setMessage("");
  };

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error("Vui long chon nguoi nhan");
      return;
    }

    setLoading(true);
    try {
      await shareService.share({
        receiverUserId: selectedUser.id,
        mediaItemId,
        playlistId,
        message: message.trim() || undefined,
      });

      toast.success(`Da chia se thanh cong cho ${selectedUser.name}`);
      handleClose();
    } catch {
      toast.error("Chia se that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Chia se "{title}"</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-2 text-sm text-gray-400">
            <User size={16} /> Tim nguoi nhan
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhap ten, email hoac ma user..."
              className="w-full rounded-lg bg-[#282828] py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {users.length > 0 && (
          <div className="mb-4 max-h-44 overflow-y-auto rounded-lg border border-[#282828] bg-[#202020]">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#282828]"
              >
                <User size={16} className="text-gray-400" />
                <span>{user.name}</span>
                <span className="ml-auto text-xs text-gray-500">{user.id}</span>
              </div>
            ))}
          </div>
        )}

        {userLoading && (
          <div className="mb-4 text-sm text-gray-400">Dang tim nguoi dung...</div>
        )}

        {!userLoading && searchTerm && users.length === 0 && (
          <div className="mb-4 text-sm text-gray-500">
            Khong tim thay nguoi dung phu hop
          </div>
        )}

        {selectedUser && (
          <div className="mb-4 rounded-lg bg-[#282828] px-3 py-2 text-sm">
            Dang chia se cho:{" "}
            <span className="font-semibold text-green-400">{selectedUser.name}</span>
          </div>
        )}

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tin nhan tuy chon..."
          className="mb-5 w-full resize-none rounded-lg bg-[#282828] p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-full bg-[#282828] px-5 py-2 text-sm hover:bg-[#3a3a3a]"
          >
            Huy
          </button>
          <button
            onClick={handleShare}
            disabled={loading || !selectedUser}
            className="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
          >
            {loading ? "Dang gui..." : "Chia se"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
