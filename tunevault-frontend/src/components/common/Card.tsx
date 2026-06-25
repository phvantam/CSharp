// ============================================================
// CARD — dùng cho bài hát, album, playlist
// ============================================================
import type { ReactNode } from 'react';

interface CardProps {
  coverUrl?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
  badge?: string;
  children?: ReactNode;
}

export function Card({ coverUrl, title, subtitle, onClick, onPlay, badge }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[#181818] hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-colors duration-200"
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-4 bg-[#282828]">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6b6b6b] text-4xl">♪</div>
        )}
        {/* Play button */}
        {onPlay && (
          <button
            onClick={onPlay}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] text-black
                       flex items-center justify-center shadow-lg
                       opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                       transition-all duration-200"
          >
            ▶
          </button>
        )}
        {badge && (
          <span className="absolute top-2 left-2 bg-[#1db954] text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-white truncate">{title}</p>
      {subtitle && <p className="text-xs text-[#b3b3b3] mt-1 truncate">{subtitle}</p>}
    </div>
  );
}

