import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MoreVertical, Search as SearchIcon } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Message, User } from '../services/api';

interface ChatWindowProps {
  currentUser: User | null;
  selectedUser: User | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  isTyping?: boolean;
}

export function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isTyping,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredMessages = messages.filter(msg =>
    searchQuery ? msg.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-16 h-16 text-indigo-400" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome to VibeChat</h2>
          <p className="text-gray-400">Select a conversation to start messaging</p>
        </motion.div>
      </div>
    );
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
      <motion.div
        className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">{getInitials(selectedUser.username)}</span>
            </div>
            {selectedUser.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a2e]" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{selectedUser.username}</h3>
            <p className="text-xs text-gray-400">
              {selectedUser.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </motion.button>
          <motion.button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {filteredMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isSent={message.sender_id === currentUser?.id}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
            />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={onSendMessage} disabled={!currentUser} />
    </div>
  );
}
