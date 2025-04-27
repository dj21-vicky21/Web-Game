'use client';

import { motion } from 'framer-motion';

interface ScoreboardProps {
  score: number;
  highScore: number;
  isPaused: boolean;
}

export function Scoreboard({ score, highScore, isPaused }: ScoreboardProps) {
  return (
    <motion.div 
      className="flex justify-between items-center bg-blue-900/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-700/30 shadow-lg"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex gap-2 items-center">
        <div className="text-xl text-white font-bold">
          {score}
        </div>
        <div className="text-xs text-gray-300">
          PTS
        </div>
      </div>
      
      {isPaused && (
        <div className="absolute left-1/2 transform -translate-x-1/2 text-white font-bold px-3 py-1 bg-orange-500/80 rounded-full text-xs">
          PAUSED
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        <div className="text-xs text-gray-300">
          BEST
        </div>
        <div className="text-xl text-yellow-400 font-bold">
          {highScore}
        </div>
      </div>
    </motion.div>
  );
} 