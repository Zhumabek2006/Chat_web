import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Menu, X } from 'lucide-react';
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser?.id &&
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#16213e] border-r border-white/10">
      <motion.div
        className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">VibeChat</h1>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
        />
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 px-2">
            Conversations ({filteredUsers.length})
          </h3>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isActive={selectedUser?.id === user.id}
                onClick={() => {
                  onSelectUser(user);
                  setIsMobileOpen(false);
                }}
                lastMessage="Click to start chatting"
              />
            ))
          )}
        </motion.div>
      </div>

      <motion.div
        className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentUser && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(currentUser.username)}
                </span>
              </div>
              <div>
                <p className="font-medium text-white text-sm">{currentUser.username}</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <motion.button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden md:block w-80 h-full">
        {sidebarContent}
      </div>

      {isMobileOpen && (
        <motion.div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
        >
          <motion.div
            className="w-80 h-full"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
