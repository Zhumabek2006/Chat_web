import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      id="theme-toggle"
      onClick={onToggle}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
      style={{
        background: 'var(--sp-elevated)',
        color: 'var(--sp-text-muted)',
        border: '1px solid var(--sp-border)',
        fontFamily: 'var(--sp-font)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}
      whileHover={{ borderColor: 'var(--sp-border-lt)', color: 'var(--sp-text)' }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" style={{ color: '#ffa42b' }} />
        )}
      </motion.span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
}
