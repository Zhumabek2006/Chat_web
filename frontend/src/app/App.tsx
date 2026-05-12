import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { User } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="size-full">
      <Toaster
        position="top-right"
        theme={theme}
        richColors
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1a1a2e' : '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: theme === 'dark' ? '#e5e7eb' : '#1a1a2e',
          },
        }}
      />
      {!currentUser ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <ChatPage
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}
