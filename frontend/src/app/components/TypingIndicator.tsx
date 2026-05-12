import { motion } from 'motion/react';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-2xl w-fit">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">typing...</span>
    </div>
  );
}
