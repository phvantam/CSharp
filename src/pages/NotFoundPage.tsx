import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4 text-center px-4">
      <p className="text-8xl">🎵</p>
      <h1 className="text-3xl font-bold text-white">Trang không tồn tại</h1>
      <p className="text-[#b3b3b3]">Có vẻ trang bạn tìm không tồn tại hoặc đã bị xóa.</p>
      <Link to="/"><Button>Về trang chủ</Button></Link>
    </div>
  );
}
