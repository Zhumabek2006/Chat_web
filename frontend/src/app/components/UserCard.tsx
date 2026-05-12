import { motion } from 'motion/react';
import { User } from '../services/api';

interface UserCardProps {
  user: User;
  isActive?: boolean;
  onClick: () => void;
  lastMessage?: string;
}

export function UserCard({ user, isActive, onClick, lastMessage }: UserCardProps) {
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const isOnline = user.status === 'online';

  return (
    <motion.div
      onClick={onClick}
      className={`relative p-3 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
          : 'bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-white/10'
      }`}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-medium">{getInitials(user.username)}</span>
          </div>
          {isOnline && (
            <motion.div
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#16213e]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{user.username}</h4>
          {lastMessage && (
            <p className="text-xs text-gray-400 truncate">{lastMessage}</p>
          )}
        </div>
        {isActive && (
          <motion.div
            className="w-2 h-2 rounded-full bg-indigo-500"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
