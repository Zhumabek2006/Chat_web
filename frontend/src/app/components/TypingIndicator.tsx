import { motion } from 'motion/react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 w-fit">
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-full"
        style={{ background: 'var(--sp-elevated)', boxShadow: 'var(--sp-shadow-card)' }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--sp-green)' }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span
        className="text-xs"
        style={{ color: 'var(--sp-text-muted)', fontFamily: 'var(--sp-font)' }}
      >
        typing…
      </span>
    </div>
  );
}
