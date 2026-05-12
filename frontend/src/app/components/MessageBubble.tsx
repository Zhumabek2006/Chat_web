import { motion } from 'motion/react';
import { Edit2, Trash2 } from 'lucide-react';
import { Message } from '../services/api';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isSent, onEdit, onDelete }: MessageBubbleProps) {
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4 group`}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`relative px-4 py-2.5 rounded-2xl ${
            isSent
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm'
              : 'bg-white/10 backdrop-blur-md border border-white/10 text-gray-100 rounded-bl-sm'
          } shadow-lg`}
        >
          <p className="text-sm break-words">{message.content}</p>
          {message.edited && (
            <span className="text-xs opacity-70 italic ml-2">(edited)</span>
          )}

          {isSent && (
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              {onEdit && (
                <motion.button
                  onClick={() => onEdit(message)}
                  className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-300" />
                </motion.button>
              )}
              {onDelete && message.id && (
                <motion.button
                  onClick={() => onDelete(message.id!)}
                  className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </motion.button>
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
