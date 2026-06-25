import { useEffect, useState } from "react";
import { Check, ListMusic, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { playlistService } from "../../api/playlistService";

interface Playlist {
  playlistId: number;
  title: string;
  trackCount?: number;
  coverImageUrl?: string | null;
}

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId: number;
  mediaTitle: string;
}

const AddToPlaylistModal = ({
  isOpen,
  onClose,
  mediaItemId,
  mediaTitle,
}: AddToPlaylistModalProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIds, setAddingIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setAddedIds([]);

    playlistService
      .getMyPlaylists()
      .then((data: any[]) => {
        setPlaylists(
          (data || []).map((p: any) => ({
            playlistId: p.playlistId,
            title: p.title || p.name || "Playlist không tên",
            trackCount: p.trackCount ?? 0,
            coverImageUrl: p.coverImageUrl || null,
          })),
        );
      })
      .catch((error: any) => {
        console.error("Lỗi tải playlist:", error);
        toast.error("Không thể tải playlist");
        setPlaylists([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleAdd = async (playlist: Playlist) => {
    if (addingIds.includes(playlist.playlistId)) return;

    setAddingIds((prev) => [...prev, playlist.playlistId]);

    try {
      await playlistService.addTrackToPlaylist(
        playlist.playlistId,
        mediaItemId,
      );
      setAddedIds((prev) => [...prev, playlist.playlistId]);
      toast.success(`Đã thêm vào "${playlist.title}"`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Thêm vào playlist thất bại";

      if (
        String(message).toLowerCase().includes("already") ||
        String(message).toLowerCase().includes("duplicate") ||
        String(message).toLowerCase().includes("đã có")
      ) {
        setAddedIds((prev) => [...prev, playlist.playlistId]);
        toast("Bài hát đã có trong playlist");
      } else {
        toast.error(message);
      }
    } finally {
      setAddingIds((prev) => prev.filter((id) => id !== playlist.playlistId));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
        >
          <X size={22} />
        </button>

        <div className="mb-5 pr-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
              <ListMusic size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Thêm vào playlist</h3>
              <p className="mt-1 line-clamp-1 text-sm text-gray-400">
                {mediaTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto pr-1">
          {loading ? (
            <p className="py-8 text-center text-gray-400">
              Đang tải playlist...
            </p>
          ) : playlists.length === 0 ? (
            <div className="rounded-2xl bg-[#222] p-8 text-center text-gray-400">
              Bạn chưa có playlist nào.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => {
                const isAdding = addingIds.includes(playlist.playlistId);
                const isAdded = addedIds.includes(playlist.playlistId);

                return (
                  <div
                    key={playlist.playlistId}
                    className="flex items-center gap-3 rounded-2xl bg-[#202020] p-3 transition hover:bg-[#282828]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#121212] text-green-400">
                      <ListMusic size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {playlist.title}
                      </p>
                      <p className="text-sm text-gray-400">
                        {playlist.trackCount ?? 0} bài hát
                      </p>
                    </div>

                    <button
                      onClick={() => handleAdd(playlist)}
                      disabled={isAdding || isAdded}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                        isAdded
                          ? "bg-green-500/20 text-green-400"
                          : "bg-green-500 text-black hover:bg-green-400"
                      } disabled:cursor-default`}
                      title={isAdded ? "Đã thêm" : "Thêm"}
                    >
                      {isAdded ? <Check size={19} /> : <Plus size={19} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
