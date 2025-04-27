'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreboardProps {
  score: number;
  highScore: number;
  isPaused: boolean;
}

export function Scoreboard({ score, highScore, isPaused }: ScoreboardProps) {
  return (
    <div className="flex justify-between items-center p-3 sm:p-4 md:p-5 rounded-xl shadow-lg mb-4 md:mb-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to right, #1e293b, #0f172a)',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute h-16 w-16 rounded-full bg-blue-500/30 -top-8 -left-8 blur-lg"></div>
        <div className="absolute h-16 w-16 rounded-full bg-green-500/30 -bottom-8 -right-8 blur-lg"></div>
      </div>
      
      {/* Score */}
      <div className="relative z-10">
        <div className="text-emerald-400 font-medium mb-1 text-xs sm:text-sm tracking-wide">SCORE</div>
        <motion.div 
          key={score}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="flex items-baseline"
        >
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mr-1">{score}</span>
          {score > 0 && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs text-emerald-400 font-bold hidden sm:block"
              style={{ transformOrigin: 'left center' }}
            >
              {score % 5 === 0 && score > 0 ? '🔥 SPEED UP!' : ''}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Pause Indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg shadow-lg flex items-center">
              <div className="h-3 w-3 sm:h-4 sm:w-4 mr-2 relative">
                <div className="absolute inset-0 bg-white rounded-sm"></div>
                <div className="absolute left-[40%] top-0 bottom-0 w-[25%] bg-amber-600"></div>
              </div>
              <span className="text-white font-bold tracking-wider text-xs sm:text-sm">PAUSED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* High Score */}
      <div className="relative z-10 text-right">
        <div className="text-blue-400 font-medium mb-1 text-xs sm:text-sm tracking-wide">HIGH SCORE</div>
        <motion.div
          key={highScore}
          initial={{ scale: highScore > 0 ? 1.2 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white relative"
        >
          {highScore}
          {score > 0 && score === highScore && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.7, 1] }}
              className="absolute -top-2 -right-2 text-lg"
            >
              👑
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 