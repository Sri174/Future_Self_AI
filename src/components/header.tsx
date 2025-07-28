import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Logo from './icons/logo';

const Header: React.FC = () => {
  return (
    <header className="py-8 px-4 relative z-20">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="relative"
        >
          <Logo className="h-14 w-14 text-primary drop-shadow-lg" />
          <motion.div
            className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-lg"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            FutureSelf AI
          </h1>
          <motion.div
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="h-6 w-6 text-yellow-500 drop-shadow-sm" />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
