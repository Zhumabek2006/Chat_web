import { motion } from 'motion/react';
import { User } from '../services/api';

interface UserCardProps {
  user: User;
  isActive?: boolean;
  onClick: () => void;
  lastMessage?: string;
}

export function UserCard({ user, isActive, onClick, lastMessage }: UserCardProps) {
  const initials = user.username.slice(0, 2).toUpperCase();
  const isOnline = user.status === 'online';

  return (
    <motion.button
      id={`user-card-${user.id}`}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-150"
      style={{
        background: isActive ? 'var(--sp-card)' : 'transparent',
        cursor: 'pointer',
        border: 'none',
        fontFamily: 'var(--sp-font)',
      }}
      whileHover={{ background: isActive ? 'var(--sp-card)' : 'var(--sp-elevated)' }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-11 h-11 rounded-full object-cover"
            style={{ boxShadow: 'var(--sp-shadow-card)' }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #1ed760 0%, #1aa34a 100%)',
              color: '#000',
              boxShadow: 'var(--sp-shadow-card)',
            }}
          >
            {initials}
          </div>
        )}
        {/* Online pulse dot */}
        {isOnline && (
          <motion.div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
            style={{
              background: 'var(--sp-green)',
              borderColor: 'var(--sp-base)',
            }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold truncate"
          style={{ color: isActive ? 'var(--sp-green)' : 'var(--sp-text)' }}
        >
          {user.username}
        </p>
        {lastMessage && (
          <p className="text-xs truncate" style={{ color: 'var(--sp-text-muted)' }}>
            {isOnline ? 'Online' : lastMessage}
          </p>
        )}
      </div>

      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ background: 'var(--sp-green)' }}
          layoutId="active-bar"
        />
      )}
    </motion.button>
  );
}
