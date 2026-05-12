import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, LogOut } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { UserCard } from './UserCard';
import { ThemeToggle } from './ThemeToggle';
import { User } from '../services/api';

interface SidebarProps {
  currentUser: User | null;
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Sidebar({
  currentUser,
  users,
  selectedUser,
  onSelectUser,
  onLogout,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <div
      className="h-full flex flex-col w-full"
      style={{ background: 'var(--sp-base)', fontFamily: 'var(--sp-font)' }}
    >
      {/* ── Brand header ── */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #282828' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--sp-green)' }}
        >
          <MessageSquare className="w-5 h-5" style={{ color: '#000' }} />
        </div>
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--sp-text)' }}
        >
          VibeChat
        </span>
      </div>

      {/* ── Search ── */}
      <div className="px-3 py-3 flex-shrink-0">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search conversations…"
        />
      </div>

      {/* ── User list ── */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        <p
          className="px-4 pt-2 pb-1 text-xs font-bold uppercase"
          style={{ color: 'var(--sp-text-muted)', letterSpacing: '1.5px' }}
        >
          Direct Messages
        </p>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <MessageSquare
              className="w-8 h-8 opacity-20"
              style={{ color: 'var(--sp-text-muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--sp-text-dim)' }}>
              No users found
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <UserCard
                  user={user}
                  isActive={selectedUser?.id === user.id}
                  onClick={() => onSelectUser(user)}
                  lastMessage="Click to start chatting"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="px-4 py-4 flex-shrink-0 flex flex-col gap-3"
        style={{
          borderTop: '1px solid #282828',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        {/* Current user row */}
        {currentUser && (
          <div className="flex items-center gap-3">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid var(--sp-green)' }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--sp-green)', color: '#000' }}
              >
                {initials(currentUser.username)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--sp-text)' }}>
                {currentUser.username}
              </p>
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--sp-green)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                Online
              </p>
            </div>
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <motion.button
            id="logout-btn"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase"
            style={{
              background: 'transparent',
              border: '1px solid var(--sp-border)',
              color: 'var(--sp-error)',
              letterSpacing: '1px',
              fontFamily: 'var(--sp-font)',
            }}
            whileHover={{ borderColor: 'var(--sp-error)', background: 'rgba(243,114,127,0.08)' }}
            whileTap={{ scale: 0.96 }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
}
