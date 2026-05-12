import { useRef, useState } from 'react';
import { Send, Smile, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { messageService } from '../services/api';
import { toast } from 'sonner';

interface MessageInputProps {
  onSend: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
}

const EMOJIS = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙌', '😎', '🤝', '💬'];

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = (message.trim().length > 0 || imagePreview !== null) && !disabled && !uploading;

  const handleSend = async () => {
    if (!canSend) return;
    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        setUploading(true);
        imageUrl = await messageService.uploadImage(imageFile);
      } catch {
        toast.error('Image upload failed');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }
    onSend(message.trim(), imageUrl);
    setMessage('');
    setImagePreview(null);
    setImageFile(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large — max 5 MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div
      className="px-3 md:px-4 py-3 flex-shrink-0"
      style={{
        background: 'var(--sp-base)',
        borderTop: '1px solid #282828',
        fontFamily: 'var(--sp-font)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      {/* Image preview strip */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mb-2 relative inline-block"
          >
            <img
              src={imagePreview}
              alt="preview"
              className="rounded-xl object-cover"
              style={{ maxHeight: 120, maxWidth: 200, border: '2px solid var(--sp-green)' }}
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--sp-error)', color: '#fff' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="relative flex items-center gap-2">
        {/* Emoji button */}
        <motion.button
          id="emoji-btn"
          onClick={() => setShowEmoji((p) => !p)}
          className="p-2 rounded-full flex-shrink-0"
          style={{
            background: showEmoji ? 'var(--sp-elevated)' : 'transparent',
            color: showEmoji ? 'var(--sp-text)' : 'var(--sp-text-muted)',
          }}
          whileHover={{ background: 'var(--sp-elevated)', color: 'var(--sp-text)' }}
          whileTap={{ scale: 0.92 }}
          disabled={disabled}
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        {/* Image upload button */}
        <motion.button
          id="image-upload-btn"
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-full flex-shrink-0"
          style={{
            background: imagePreview ? 'var(--sp-elevated)' : 'transparent',
            color: imagePreview ? 'var(--sp-green)' : 'var(--sp-text-muted)',
          }}
          whileHover={{ background: 'var(--sp-elevated)', color: 'var(--sp-green)' }}
          whileTap={{ scale: 0.92 }}
          disabled={disabled}
          title="Attach image"
        >
          <ImagePlus className="w-5 h-5" />
        </motion.button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <div className="relative flex-1">
          <input
            id="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
            placeholder={disabled ? 'Select a chat to message…' : 'Write a message…'}
            disabled={disabled}
            autoComplete="off"
            className="w-full py-2.5 px-4 text-sm rounded-full disabled:opacity-40"
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
          className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
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
          {uploading ? (
            <span className="sp-spinner" style={{ width: 16, height: 16 }} />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
