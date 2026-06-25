import { AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const variantConfig = {
  danger: {
    icon: <Trash2 size={24} />,
    iconClass: "bg-red-500/15 text-red-400 ring-red-500/20",
    confirmClass: "bg-red-500 text-white hover:bg-red-400",
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    iconClass: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/20",
    confirmClass: "bg-yellow-500 text-black hover:bg-yellow-400",
  },
  info: {
    icon: <Info size={24} />,
    iconClass: "bg-sky-500/15 text-sky-400 ring-sky-500/20",
    confirmClass: "bg-sky-500 text-white hover:bg-sky-400",
  },
  success: {
    icon: <CheckCircle2 size={24} />,
    iconClass: "bg-green-500/15 text-green-400 ring-green-500/20",
    confirmClass: "bg-green-500 text-black hover:bg-green-400",
  },
};

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const config = variantConfig[variant];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#181818] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="relative p-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>

          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${config.iconClass}`}
          >
            {config.icon}
          </div>

          <h3 className="pr-8 text-2xl font-bold text-white">{title}</h3>

          {message && (
            <p className="mt-3 leading-6 text-gray-300">{message}</p>
          )}

          <div className="mt-7 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full bg-[#282828] px-5 py-3 font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-full px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${config.confirmClass}`}
            >
              {loading ? "Đang xử lý..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
