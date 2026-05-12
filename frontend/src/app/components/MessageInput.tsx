import { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯'];

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="relative p-4 bg-white/5 backdrop-blur-md border-t border-white/10">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="grid grid-cols-4 gap-2">
              {emojis.map((emoji, index) => (
                <motion.button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-2 rounded-lg hover:bg-white/10"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-3">
        <motion.button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Smile className="w-5 h-5 text-gray-400" />
        </motion.button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300"
        />

        <motion.button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            message.trim() && !disabled
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50'
              : 'bg-gray-700 opacity-50 cursor-not-allowed'
          }`}
          whileHover={message.trim() && !disabled ? { scale: 1.05 } : {}}
          whileTap={message.trim() && !disabled ? { scale: 0.95 } : {}}
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  );
}
