import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { playlistApi } from '../../api/playlist.api';
import { mediaApi }    from '../../api/media.api';
import { usePlayer }   from '../../contexts/PlayerContext';
import { Card } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import Button  from '../../components/common/Button';
import Modal   from '../../components/common/Modal';
import Input   from '../../components/common/Input';
import type { Playlist } from '../../types/playlist.types';
import type { MediaItem } from '../../types/media.types';

export default function LibraryPage() {
  const navigate   = useNavigate();
  const { play }   = usePlayer();

  const [playlists, setPlaylists]     = useState<Playlist[]>([]);
  const [myMedia, setMyMedia]         = useState<MediaItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<'playlist' | 'media'>('playlist');
  const [createOpen, setCreateOpen]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [creating, setCreating]       = useState(false);

  useEffect(() => {
    Promise.all([playlistApi.getMine(), mediaApi.getMyMedia()])
      .then(([plRes, mRes]) => {
        setPlaylists(plRes.data.data ?? []);
        setMyMedia(mRes.data.data?.items ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await playlistApi.create({ name: newName.trim(), isPublic: false });
      setPlaylists((p) => [res.data.data, ...p]);
      setCreateOpen(false);
      setNewName('');
    } catch { /* TODO: toast */ }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Thư viện của bạn</h1>
        <Button onClick={() => setCreateOpen(true)} icon={<Plus size={16} />} size="sm">
          Tạo playlist
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['playlist', 'media'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === t ? 'bg-white text-black' : 'bg-[#242424] text-[#b3b3b3] hover:text-white',
            ].join(' ')}
          >
            {t === 'playlist' ? '📋 Playlist' : '🎵 Nhạc của tôi'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : tab === 'playlist' ? (
        playlists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-white font-semibold">Chưa có playlist nào</p>
            <p className="text-[#b3b3b3] text-sm mt-1 mb-5">Tạo playlist đầu tiên của bạn</p>
            <Button onClick={() => setCreateOpen(true)} icon={<Plus size={16} />}>Tạo playlist</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <Card
                key={pl.id}
                coverUrl={pl.coverUrl}
                title={pl.name}
                subtitle={`${pl.trackCount} bài hát`}
                badge={pl.isPublic ? undefined : '🔒'}
                onClick={() => navigate(`/playlist/${pl.id}`)}
              />
            ))}
          </div>
        )
      ) : (
        myMedia.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-white font-semibold">Chưa có bài hát nào</p>
            <p className="text-[#b3b3b3] text-sm mt-1 mb-5">Tải lên bài hát đầu tiên</p>
            <Button onClick={() => navigate('/upload')}>Tải lên</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {myMedia.map((item) => (
              <Card
                key={item.id}
                coverUrl={item.coverUrl}
                title={item.title}
                subtitle={item.artist}
                onClick={() => play(item, myMedia)}
                onPlay={(e) => { e.stopPropagation(); play(item, myMedia); }}
              />
            ))}
          </div>
        )
      )}

      {/* Create playlist modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo playlist mới" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Tên playlist"
            placeholder="Playlist của tôi"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!newName.trim()}>Tạo</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
