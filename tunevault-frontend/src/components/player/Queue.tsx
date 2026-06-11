import { X, Play } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";

interface QueueProps {
  onClose?: () => void;
}

const Queue = ({ onClose }: QueueProps) => {
  const { queue, currentTrack, removeFromQueue, playTrack } = usePlayerStore();

  if (queue.length === 0) {
    return (
      <div className="w-80 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#282828]">
          <span className="font-semibold text-lg">Queue</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-6 text-center text-gray-400">Queue đang trống</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl overflow-hidden max-h-[450px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#282828] flex-shrink-0">
        <div>
          <span className="font-semibold text-lg">Queue</span>
          <span className="ml-2 text-sm text-gray-400">
            ({queue.length} bài)
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Danh sách bài hát trong Queue */}
      <div className="overflow-y-auto flex-1">
        {queue.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;

          return (
            <div
              key={`${track.id}-${index}`}
              className={`group flex items-center justify-between px-4 py-3 hover:bg-[#282828] transition cursor-pointer ${
                isCurrentTrack ? "bg-[#282828]" : ""
              }`}
              onClick={() => playTrack(track)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="w-11 h-11 flex-shrink-0 rounded overflow-hidden bg-[#282828]">
                  {track.thumbnailUrl ? (
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Play size={18} />
                    </div>
                  )}
                </div>

                {/* Thông tin bài hát */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium truncate ${isCurrentTrack ? "text-green-500" : "text-white"}`}
                  >
                    {track.title}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Nút xóa */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromQueue(index);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition p-1"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#282828] text-center text-xs text-gray-500 flex-shrink-0">
        {queue.length} bài trong hàng đợi
      </div>
    </div>
  );
};

export default Queue;
