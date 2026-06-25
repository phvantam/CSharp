import { useEffect, useState } from "react";
import { ListPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { playlistService } from "../../api";
import type { PlaylistDto } from "../../api/types/playlist";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId: number | null;
  trackTitle: string;
}

const AddToPlaylistModal = ({
  isOpen,
  onClose,
  mediaItemId,
  trackTitle,
}: AddToPlaylistModalProps) => {
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const result = await playlistService.getMyPlaylists();
        setPlaylists(result);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [isOpen]);

  if (!isOpen || mediaItemId === null) return null;

  const handleAddToPlaylist = async (playlistId: number, playlistTitle: string) => {
    setSubmitting(true);
    try {
      await playlistService.addTrackToPlaylist(playlistId, mediaItemId);
      toast.success(`Đã thêm bài hát vào playlist "${playlistTitle}"`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào playlist (bài hát có thể đã tồn tại hoặc có lỗi xảy ra)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#181818] p-6 shadow-2xl border border-[#282828]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <ListPlus className="text-green-500" size={22} />
            Thêm vào playlist
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Chọn một danh sách phát để thêm bài hát <span className="font-semibold text-white">"{trackTitle}"</span>:
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-400 animate-pulse">
            Đang tải danh sách playlist...
          </div>
        ) : playlists.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Bạn chưa tạo playlist nào. Hãy tạo một playlist trong thư viện trước.
          </div>
        ) : (
          <div className="mb-6 max-h-60 overflow-y-auto rounded-lg border border-[#282828] bg-[#202020] divide-y divide-[#282828]">
            {playlists.map((playlist) => (
              <button
                key={playlist.playlistId}
                disabled={submitting}
                onClick={() => handleAddToPlaylist(playlist.playlistId, playlist.title)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-[#282828] text-white transition-colors disabled:opacity-60"
              >
                <div>
                  <p className="font-medium text-white">{playlist.title}</p>
                  <p className="text-xs text-gray-400">
                    {playlist.visibility === "Public" ? "Công khai" : "Riêng tư"}
                  </p>
                </div>
                <span className="text-xs text-green-500 bg-green-500/10 px-3 py-1 rounded-full font-semibold hover:bg-green-500 hover:text-black transition-colors">
                  Thêm
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-[#282828] px-5 py-2 text-sm font-semibold hover:bg-[#3a3a3a] transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
