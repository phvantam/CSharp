import { AuthProvider }   from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppRouter />
      </PlayerProvider>
    </AuthProvider>
  );
}
