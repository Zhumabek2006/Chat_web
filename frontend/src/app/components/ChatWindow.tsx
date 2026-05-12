import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MoreVertical, ArrowLeft } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Message, User } from '../services/api';

interface ChatWindowProps {
  currentUser: User | null;
  selectedUser: User | null;
  messages: Message[];
  onSendMessage: (content: string, imageUrl?: string) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  isTyping?: boolean;
  /** Mobile only: called when the back arrow is pressed */
  onBack?: () => void;
}

export function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isTyping,
  onBack,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Empty state ── */
  if (!selectedUser) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0 h-full"
        style={{ background: 'var(--sp-base)', fontFamily: 'var(--sp-font)' }}
      >
        <motion.div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 88,
            height: 88,
            background: 'var(--sp-surface)',
            boxShadow: 'var(--sp-shadow-heavy)',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MessageCircle className="w-10 h-10" style={{ color: 'var(--sp-green)' }} />
        </motion.div>

        <div className="text-center px-8">
          <h2
            className="text-2xl font-bold mb-2 tracking-tight"
            style={{ color: 'var(--sp-text)' }}
          >
            Welcome to VibeChat
          </h2>
          <p className="text-sm" style={{ color: 'var(--sp-text-muted)' }}>
            Pick a conversation from the sidebar to start messaging.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {['Real-time', 'Fast', 'Simple'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-bold uppercase"
              style={{
                background: 'var(--sp-elevated)',
                color: 'var(--sp-text-muted)',
                letterSpacing: '1px',
                fontFamily: 'var(--sp-font)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const initials = (name: string) => name.slice(0, 2).toUpperCase();
  const isOnline = selectedUser.status === 'online';

  return (
    <div
      className="flex flex-col min-w-0 h-full overflow-hidden"
      style={{ background: 'var(--sp-base)', fontFamily: 'var(--sp-font)', flex: 1 }}
    >
      {/* ── Chat header ── */}
      <motion.div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #282828', background: 'var(--sp-surface)' }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Left: back button (mobile only) + avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Back arrow — visible only on mobile */}
          {onBack && (
            <motion.button
              id="chat-back-btn"
              onClick={onBack}
              className="md:hidden flex-shrink-0 p-1.5 rounded-full"
              style={{ color: 'var(--sp-text-muted)', background: 'transparent' }}
              whileHover={{ background: 'var(--sp-elevated)', color: 'var(--sp-text)' }}
              whileTap={{ scale: 0.9 }}
              aria-label="Back to contacts"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #1ed760 0%, #1aa34a 100%)',
                color: '#000',
                boxShadow: 'var(--sp-shadow-card)',
              }}
            >
              {initials(selectedUser.username)}
            </div>
            {isOnline && (
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: 'var(--sp-green)', borderColor: 'var(--sp-surface)' }}
              />
            )}
          </div>

          {/* Name + status */}
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate" style={{ color: 'var(--sp-text)' }}>
              {selectedUser.username}
            </h3>
            <p
              className="text-xs"
              style={{ color: isOnline ? 'var(--sp-green)' : 'var(--sp-text-muted)' }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Right: more menu */}
        <div className="relative flex-shrink-0">
          <motion.button
            id="chat-more-btn"
            onClick={() => setMenuOpen((p) => !p)}
            className="p-2 rounded-full"
            style={{
              background: menuOpen ? 'var(--sp-elevated)' : 'transparent',
              color: 'var(--sp-text-muted)',
            }}
            whileHover={{ background: 'var(--sp-elevated)', color: 'var(--sp-text)' }}
            whileTap={{ scale: 0.92 }}
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                className="absolute right-0 top-full mt-1 py-1 rounded-lg z-30 min-w-[140px]"
                style={{
                  background: 'var(--sp-card)',
                  boxShadow: 'var(--sp-shadow-heavy)',
                  border: '1px solid var(--sp-border)',
                }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                {['Clear chat', 'View profile'].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-2 text-sm"
                    style={{
                      color: 'var(--sp-text-muted)',
                      fontFamily: 'var(--sp-font)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'var(--sp-elevated)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--sp-text)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--sp-text-muted)';
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSent={msg.sender_id === currentUser?.id}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
            />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <MessageInput onSend={(content, imageUrl) => onSendMessage(content, imageUrl)} disabled={!currentUser} />
    </div>
  );
}
