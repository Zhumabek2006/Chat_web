import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, ZoomIn } from 'lucide-react';
import { Message } from '../services/api';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isSent, onEdit, onDelete }: MessageBubbleProps) {
  const [lightbox, setLightbox] = useState(false);

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const hasImage = !!message.image_url;
  const hasText = message.content && message.content.trim().length > 0 && !message.deleted;
  const isDeleted = message.deleted;

  return (
    <>
      {/* Lightbox overlay */}
      {lightbox && message.image_url && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.88)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setLightbox(false)}
        >
          <motion.img
            src={message.image_url}
            alt="Full size"
            className="max-w-full max-h-full rounded-xl"
            style={{ boxShadow: 'var(--sp-shadow-heavy)' }}
            initial={{ scale: 0.88 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          />
          <p
            className="absolute bottom-6 text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Tap anywhere to close
          </p>
        </motion.div>
      )}

      <motion.div
        className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[68%]`}>
          {/* Bubble */}
          <div className="relative">
            <div
              style={
                isSent
                  ? {
                      background: isDeleted ? 'var(--sp-elevated)' : 'var(--sp-green)',
                      color: isDeleted ? 'var(--sp-text-muted)' : '#000',
                      borderRadius: hasImage && !hasText ? '18px 18px 4px 18px' : '18px 18px 4px 18px',
                      fontFamily: 'var(--sp-font)',
                      fontWeight: 400,
                      boxShadow: 'var(--sp-shadow-card)',
                      overflow: 'hidden',
                    }
                  : {
                      background: 'var(--sp-elevated)',
                      color: isDeleted ? 'var(--sp-text-muted)' : 'var(--sp-text)',
                      borderRadius: hasImage && !hasText ? '18px 18px 18px 4px' : '18px 18px 18px 4px',
                      fontFamily: 'var(--sp-font)',
                      fontWeight: 400,
                      boxShadow: 'var(--sp-shadow-card)',
                      overflow: 'hidden',
                    }
              }
            >
              {/* Image */}
              {hasImage && !isDeleted && (
                <div className="relative group/img cursor-pointer" onClick={() => setLightbox(true)}>
                  <img
                    src={message.image_url!}
                    alt="sent image"
                    className="block"
                    style={{
                      maxWidth: 260,
                      maxHeight: 220,
                      width: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-150"
                    style={{ background: 'rgba(0,0,0,0.35)' }}
                  >
                    <ZoomIn className="w-7 h-7 text-white" />
                  </div>
                </div>
              )}

              {/* Text */}
              {(hasText || isDeleted) && (
                <p
                  className="px-4 py-2.5 text-sm leading-relaxed break-words"
                  style={{ fontStyle: isDeleted ? 'italic' : 'normal' }}
                >
                  {isDeleted ? 'This message was deleted.' : message.content}
                  {message.edited && !isDeleted && (
                    <span
                      className="text-xs ml-2 opacity-60 italic"
                      style={{ color: isSent ? '#000' : 'var(--sp-text-muted)' }}
                    >
                      edited
                    </span>
                  )}
                </p>
              )}

              {/* Image-only: show tiny padding so bubble has some height if no text */}
              {hasImage && !hasText && !isDeleted && <div style={{ height: 0 }} />}
            </div>

            {/* Hover action buttons — only on sent, non-deleted, text messages */}
            {isSent && !isDeleted && (
              <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1">
                {onEdit && hasText && (
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
    </>
  );
}
