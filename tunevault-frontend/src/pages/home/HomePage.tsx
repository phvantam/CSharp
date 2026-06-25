import { useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth }   from '../../contexts/AuthContext';
import { mediaApi }  from '../../api/media.api';
import { Card } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import type { MediaItem } from '../../types/media.types';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function HomePage() {
  const { user }        = useAuth();
  const { play }        = usePlayer();
  const [trending, setTrending]   = useState<MediaItem[]>([]);
  const [history, setHistory]     = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      mediaApi.getTrending(12),
      mediaApi.getHistory(),
    ]).then(([tRes, hRes]) => {
      setTrending(tRes.data.data ?? []);
      setHistory((hRes.data.data ?? []).slice(0, 6).map((h) => h.mediaItem));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <section>
        <h1 className="text-3xl font-bold text-white">
          {greeting()}{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>

        {/* Recent history grid */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => play(item, history)}
                className="flex items-center gap-3 bg-[#ffffff1a] hover:bg-[#ffffff2d] rounded-md overflow-hidden text-left transition-colors group"
              >
                <div className="w-14 h-14 shrink-0 bg-[#282828] overflow-hidden">
                  {item.coverUrl
                    ? <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">♪</div>
                  }
                </div>
                <span className="text-sm font-semibold text-white truncate pr-3">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Xu hướng hôm nay</h2>
          <button className="text-sm text-[#b3b3b3] hover:text-white transition-colors font-medium">
            Xem tất cả
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((item) => (
              <Card
                key={item.id}
                coverUrl={item.coverUrl}
                title={item.title}
                subtitle={item.artist}
                onClick={() => play(item, trending)}
                onPlay={(e) => { e.stopPropagation(); play(item, trending); }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
