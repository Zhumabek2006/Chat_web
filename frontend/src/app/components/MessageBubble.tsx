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
  const formatTime = (ts?: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[68%]`}>
        {/* Bubble */}
        <div className="relative">
          <div
            className="px-4 py-2.5 text-sm leading-relaxed break-words"
            style={
              isSent
                ? {
                    background: 'var(--sp-green)',
                    color: '#000',
                    borderRadius: '18px 18px 4px 18px',
                    fontFamily: 'var(--sp-font)',
                    fontWeight: 400,
                    boxShadow: 'var(--sp-shadow-card)',
                  }
                : {
                    background: 'var(--sp-elevated)',
                    color: 'var(--sp-text)',
                    borderRadius: '18px 18px 18px 4px',
                    fontFamily: 'var(--sp-font)',
                    fontWeight: 400,
                    boxShadow: 'var(--sp-shadow-card)',
                  }
            }
          >
            {message.content}
            {message.edited && (
              <span
                className="text-xs ml-2 opacity-60 italic"
                style={{ color: isSent ? '#000' : 'var(--sp-text-muted)' }}
              >
                edited
              </span>
            )}
          </div>

          {/* Hover action buttons — only on sent messages */}
          {isSent && (
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1">
              {onEdit && (
                <motion.button
                  onClick={() => onEdit(message)}
                  className="p-1.5 rounded-full"
                  style={{
                    background: 'var(--sp-elevated)',
                    border: '1px solid var(--sp-border)',
                    color: 'var(--sp-text-muted)',
                  }}
                  whileHover={{ scale: 1.1, color: 'var(--sp-text)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="w-3 h-3" />
                </motion.button>
              )}
              {onDelete && message.id && (
                <motion.button
                  onClick={() => onDelete(message.id!)}
                  className="p-1.5 rounded-full"
                  style={{
                    background: 'var(--sp-elevated)',
                    border: '1px solid var(--sp-border)',
                    color: 'var(--sp-text-muted)',
                  }}
                  whileHover={{ scale: 1.1, color: 'var(--sp-error)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          className="text-xs mt-1.5 px-1 select-none"
          style={{ color: 'var(--sp-text-dim)', fontFamily: 'var(--sp-font)' }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
