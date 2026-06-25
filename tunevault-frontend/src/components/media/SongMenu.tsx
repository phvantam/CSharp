import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Album,
  Copy,
  ListPlus,
  Mic2,
  MoreHorizontal,
  Share2,
  UserRound,
  Film,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { MediaItemDto } from "../../api/types/media";
import AddToPlaylistModal from "./AddToPlaylistModal";
import ShareModal from "../share/ShareModal";

interface SongMenuProps {
  media: MediaItemDto;
  align?: "left" | "right";
}

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_WIDTH = 260;
const MENU_GAP = 10;

const SongMenu = ({ media, align = "right" }: SongMenuProps) => {
  const [open, setOpen] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const updatePosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    let left = align === "right" ? rect.right - MENU_WIDTH : rect.left;

    left = Math.max(12, Math.min(left, window.innerWidth - MENU_WIDTH - 12));

    // Ưu tiên mở xuống dưới. Nếu gần đáy màn hình thì mở lên trên.
    const estimatedHeight = 360;
    const hasSpaceBelow =
      rect.bottom + MENU_GAP + estimatedHeight < window.innerHeight;

    const top = hasSpaceBelow
      ? rect.bottom + MENU_GAP
      : Math.max(12, rect.top - estimatedHeight - MENU_GAP);

    setPosition({ top, left });
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleWindowChange = () => {
      updatePosition();
    };

    window.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);

    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const copyLink = async () => {
    const url = `${window.location.origin}/media/${media.mediaItemId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Đã sao chép link");
    setOpen(false);
  };

  const menuItems = [
    {
      icon: ListPlus,
      label: "Thêm vào playlist",
      onClick: () => {
        setShowAddPlaylist(true);
        setOpen(false);
      },
    },
    {
      icon: Share2,
      label: "Chia sẻ",
      onClick: () => {
        setShowShare(true);
        setOpen(false);
      },
    },
    {
      icon: Album,
      label: "Xem album",
      disabled: !media.albumId,
      onClick: () => {
        if (media.albumId) navigate(`/album/${media.albumId}`);
        setOpen(false);
      },
    },
    {
      icon: UserRound,
      label: "Xem nghệ sĩ",
      disabled: !media.artistId,
      onClick: () => {
        if (media.artistId) navigate(`/artist/${media.artistId}`);
        setOpen(false);
      },
    },
    {
      icon: Mic2,
      label: "Xem lời bài hát",
      onClick: () => {
        navigate(`/now-playing/${media.mediaItemId}`);
        setOpen(false);
      },
    },
    {
      icon: Film,
      label: "Xem MV",
      disabled: !media.hasVideo,
      onClick: () => {
        if (media.hasVideo) navigate(`/video/${media.mediaItemId}`);
        setOpen(false);
      },
    },
    {
      icon: Copy,
      label: "Sao chép link",
      onClick: copyLink,
    },
  ];

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            top: position.top,
            left: position.left,
            width: MENU_WIDTH,
          }}
          className="fixed z-[9999] overflow-hidden rounded-2xl border border-green-500/20 bg-[#102016] p-2 shadow-2xl shadow-black/60"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                disabled={item.disabled}
                onClick={item.onClick}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-100 transition hover:bg-green-500/15 hover:text-green-300 disabled:cursor-not-allowed disabled:text-gray-600 disabled:hover:bg-transparent disabled:hover:text-gray-600"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="mt-2 border-t border-green-500/20 px-3 py-2 text-xs text-gray-400">
            Cung cấp bởi{" "}
            <span className="font-semibold text-green-300">
              {media.ownerDisplayName || "TuneVault"}
            </span>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`rounded-full p-2 transition ${
          open
            ? "bg-green-500/20 text-green-300"
            : "text-gray-400 hover:bg-green-500/15 hover:text-green-300"
        }`}
        title="Tùy chọn"
      >
        <MoreHorizontal size={20} />
      </button>

      {menu}

      <AddToPlaylistModal
        isOpen={showAddPlaylist}
        onClose={() => setShowAddPlaylist(false)}
        mediaItemId={media.mediaItemId}
        mediaTitle={media.title}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        mediaItemId={media.mediaItemId}
        title={media.title}
      />
    </>
  );
};

export default SongMenu;
