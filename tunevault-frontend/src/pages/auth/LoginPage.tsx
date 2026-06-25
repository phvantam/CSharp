import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input  from '../../components/common/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0];
      setError(msg || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎵</div>
          <h1 className="text-2xl font-bold text-white">Đăng nhập vào TuneVault</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          {error && (
            <p className="text-sm text-[#e91429] text-center bg-[#e9142915] py-2 px-3 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
            Đăng nhập
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-[#b3b3b3]">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-white font-semibold hover:text-[#1db954] transition-colors underline">
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
}
