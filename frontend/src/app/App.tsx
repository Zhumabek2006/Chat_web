import { Toaster } from 'sonner';
import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { User } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const { theme, toggleTheme } = useTheme();
  // NOTE: do NOT force-add 'dark' here — useTheme already manages it

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
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: '#252525',
            border: '1px solid #4d4d4d',
            color: '#ffffff',
            fontFamily: 'var(--sp-font)',
            fontSize: '14px',
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
