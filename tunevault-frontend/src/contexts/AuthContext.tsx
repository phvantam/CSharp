import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { User, LoginRequest, RegisterRequest } from '../types/auth.types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(localStorage.getItem('tv_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('tv_token');
    }
  }, []);

  // Khởi động — kiểm tra token còn hợp lệ không
  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('tv_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('tv_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('tv_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoading,
        isAuthenticated: !!user,
        login, register, logout, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
