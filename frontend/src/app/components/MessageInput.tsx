import { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const EMOJIS = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙌', '😎', '🤝', '💬'];

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const canSend = message.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="relative px-4 py-4 flex-shrink-0"
      style={{
        background: 'var(--sp-base)',
        borderTop: '1px solid #282828',
        fontFamily: 'var(--sp-font)',
      }}
    >
      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-4 mb-2 p-3 grid grid-cols-6 gap-1 rounded-xl z-20"
            style={{
              background: 'var(--sp-card)',
              boxShadow: 'var(--sp-shadow-heavy)',
              border: '1px solid var(--sp-border)',
            }}
          >
            {EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => {
                  setMessage((p) => p + emoji);
                  setShowEmoji(false);
                }}
                className="text-xl p-1.5 rounded-md"
                whileHover={{ scale: 1.3, background: 'var(--sp-elevated)' }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Emoji button */}
        <motion.button
          id="emoji-btn"
          onClick={() => setShowEmoji((p) => !p)}
          className="p-2 rounded-full flex-shrink-0"
          style={{
            background: showEmoji ? 'var(--sp-elevated)' : 'transparent',
            color: showEmoji ? 'var(--sp-text)' : 'var(--sp-text-muted)',
            border: '1px solid transparent',
          }}
          whileHover={{ background: 'var(--sp-elevated)', color: 'var(--sp-text)' }}
          whileTap={{ scale: 0.92 }}
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        {/* Text input */}
        <div className="relative flex-1">
          <input
            id="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Write a message…"
            disabled={disabled}
            autoComplete="off"
            className="w-full py-3 px-5 text-sm rounded-full disabled:opacity-40"
            style={{
              background: 'var(--sp-elevated)',
              color: 'var(--sp-text)',
              border: 'none',
              boxShadow: 'var(--sp-shadow-inset)',
              fontFamily: 'var(--sp-font)',
              outline: 'none',
              transition: 'box-shadow 150ms ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow =
                'rgb(18,18,18) 0px 1px 0px, rgb(255,255,255) 0px 0px 0px 1px inset';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'var(--sp-shadow-inset)';
            }}
          />
        </div>

        {/* Send button */}
        <motion.button
          id="send-btn"
          onClick={handleSend}
          disabled={!canSend}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: canSend ? 'var(--sp-green)' : 'var(--sp-elevated)',
            color: canSend ? '#000' : 'var(--sp-border)',
            border: 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'background 200ms ease',
          }}
          whileHover={canSend ? { scale: 1.08 } : {}}
          whileTap={canSend ? { scale: 0.92 } : {}}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
