import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input  from '../../components/common/Input';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: '', username: '', email: '', password: '', confirm: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      await register({ displayName: form.displayName, username: form.username, email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0];
      setError(msg || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎵</div>
          <h1 className="text-2xl font-bold text-white">Tạo tài khoản miễn phí</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Tên hiển thị" placeholder="Nguyễn Văn A" value={form.displayName}
            onChange={set('displayName')} icon={<User size={16} />} required />
          <Input label="Tên người dùng" placeholder="nguyenvana" value={form.username}
            onChange={set('username')} icon={<AtSign size={16} />} required />
          <Input label="Email" type="email" placeholder="name@example.com" value={form.email}
            onChange={set('email')} icon={<Mail size={16} />} required />
          <Input label="Mật khẩu" type="password" placeholder="Tối thiểu 6 ký tự" value={form.password}
            onChange={set('password')} icon={<Lock size={16} />} required />
          <Input label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm}
            onChange={set('confirm')} icon={<Lock size={16} />} required />

          {error && (
            <p className="text-sm text-[#e91429] text-center bg-[#e9142915] py-2 px-3 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
            Tạo tài khoản
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-[#b3b3b3]">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-white font-semibold hover:text-[#1db954] transition-colors underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
