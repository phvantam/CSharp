import { BellRing, Music2, ListMusic, Info, X, UserPlus } from "lucide-react";

type NotificationToastProps = {
  title: string;
  message?: string;
  type?: string;
  senderName?: string | null;
  onClose?: () => void;
  onView?: () => void;
};

const getTypeLabel = (type?: string) => {
  switch ((type || "").toLowerCase()) {
    case "mediashare":
      return "Bài hát";
    case "playlistshare":
      return "Playlist";
    case "follow":
      return "Theo dõi";
    default:
      return "Thông báo";
  }
};

const getTypeIcon = (type?: string) => {
  switch ((type || "").toLowerCase()) {
    case "mediashare":
      return <Music2 size={18} className="text-emerald-300" />;
    case "playlistshare":
      return <ListMusic size={18} className="text-violet-300" />;
    case "follow":
      return <UserPlus size={18} className="text-sky-300" />;
    default:
      return <Info size={18} className="text-sky-300" />;
  }
};

const NotificationToast = ({
  title,
  message,
  type,
  senderName,
  onClose,
  onView,
}: NotificationToastProps) => {
  return (
    <div className="w-[390px] max-w-[calc(100vw-24px)] overflow-hidden rounded-3xl border border-white/10 bg-[#151515]/95 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-400/10 ring-1 ring-emerald-400/20">
          <BellRing size={21} className="text-emerald-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-200">
              {getTypeIcon(type)}
              {getTypeLabel(type)}
            </span>

            {senderName && (
              <span className="truncate text-[11px] text-gray-400">
                từ {senderName}
              </span>
            )}
          </div>

          <h4 className="line-clamp-1 text-sm font-semibold text-white">
            {title}
          </h4>

          {message ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-300">
              {message}
            </p>
          ) : (
            <p className="mt-1 text-xs leading-5 text-gray-400">
              Bạn có một thông báo mới từ TuneVault.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onView}
              className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-emerald-400"
            >
              Xem ngay
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Đóng
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-1 w-full bg-white/5">
        <div className="h-full w-full origin-left animate-[toast-progress_5s_linear_forwards] bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400" />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
