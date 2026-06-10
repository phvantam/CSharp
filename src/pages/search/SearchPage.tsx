import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { mediaApi } from '../../api/media.api';
import { usePlayer } from '../../contexts/PlayerContext';
import { Card } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import Input from '../../components/common/Input';
import type { MediaItem, MediaType } from '../../types/media.types';

const TYPE_TABS: { label: string; value: MediaType | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: '🎵 Nhạc',  value: 'audio' },
  { label: '🎬 Video', value: 'video' },
];

export default function SearchPage() {
  const { play }    = usePlayer();
  const [keyword, setKeyword]   = useState('');
  const [type, setType]         = useState<MediaType | 'all'>('all');
  const [results, setResults]   = useState<MediaItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (kw: string, t: MediaType | 'all') => {
    if (!kw.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await mediaApi.search({ keyword: kw, type: t === 'all' ? undefined : t });
      setResults(res.data.data?.items ?? []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch(keyword, type);
  };

  const onTypeChange = (t: MediaType | 'all') => {
    setType(t);
    if (keyword.trim()) handleSearch(keyword, t);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tìm kiếm</h1>

      {/* Search input */}
      <div className="max-w-xl">
        <Input
          placeholder="Tìm bài hát, nghệ sĩ, album..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={onKeyDown}
          icon={<Search size={16} />}
        />
      </div>

      {/* Type tabs */}
      <div className="flex gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTypeChange(tab.value)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              type === tab.value
                ? 'bg-white text-black'
                : 'bg-[#242424] text-[#b3b3b3] hover:text-white',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-20 text-[#b3b3b3]">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-white">Không tìm thấy kết quả</p>
          <p className="text-sm mt-1">Thử tìm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((item) => (
            <Card
              key={item.id}
              coverUrl={item.coverUrl}
              title={item.title}
              subtitle={item.artist}
              badge={item.mediaType === 'video' ? 'VIDEO' : undefined}
              onClick={() => play(item, results.filter((r) => r.mediaType === 'audio'))}
              onPlay={(e) => { e.stopPropagation(); play(item, results); }}
            />
          ))}
        </div>
      )}

      {/* Empty state — chưa tìm */}
      {!searched && (
        <div className="text-center py-20 text-[#b3b3b3]">
          <p className="text-4xl mb-4">🎵</p>
          <p className="text-sm">Nhập từ khóa và nhấn Enter để tìm kiếm</p>
        </div>
      )}
    </div>
  );
}
