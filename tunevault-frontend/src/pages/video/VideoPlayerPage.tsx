import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { mediaApi } from '../../api/media.api';
import { Loading } from '../../components/common/Loading';
import type { MediaItem } from '../../types/media.types';

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayerPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const videoRef    = useRef<HTMLVideoElement>(null);

  const [media, setMedia]         = useState<MediaItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(1);
  const [muted, setMuted]             = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!id) return;
    mediaApi.getById(id).then((res) => {
      setMedia(res.data.data);
      mediaApi.recordPlay(id).catch(() => {});
    }).catch(() => navigate('/404'))
      .finally(() => setLoading(false));
  }, [id]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.pause() : v.play();
    setIsPlaying(!isPlaying);
  };

  if (loading) return <Loading fullScreen />;
  if (!media)  return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Back */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">{media.title}</span>
        </button>
      </div>

      {/* Video */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
        onMouseMove={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          src={mediaApi.getStreamUrl(media.id)}
          className="max-w-full max-h-full"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          poster={media.coverUrl}
        />
      </div>

      {/* Controls */}
      {showControls && (
        <div className="bg-gradient-to-t from-black/90 to-transparent p-6 space-y-3">
          {/* Progress */}
          <div
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (videoRef.current) videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
            }}
          >
            <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }}
                className="text-white">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-white/70 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-white font-medium text-sm">{media.title}</p>
              <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
