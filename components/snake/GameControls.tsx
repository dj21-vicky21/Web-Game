'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface GameControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onPauseToggle: () => void;
  onReset: () => void;
  isPaused: boolean;
  isGameOver: boolean;
}

export function GameControls({
  onDirectionChange,
  onPauseToggle,
  onReset,
  isPaused,
  isGameOver
}: GameControlsProps) {
  return (
    <div className="mt-4 lg:mt-0 w-full">
      {/* Pause/Resume & Restart Buttons */}
      <div className="flex justify-center mb-6 md:mb-8 gap-4 md:gap-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-white shadow-lg
            ${isPaused 
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/20' 
              : 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/20'
            }
            transition-all duration-200 hover:shadow-xl
          `}
          onClick={onPauseToggle}
          disabled={isGameOver}
          style={{ 
            opacity: isGameOver ? 0.6 : 1,
            cursor: isGameOver ? 'not-allowed' : 'pointer',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center">
            {isPaused ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            )}
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-xl"
          onClick={onReset}
          style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
            </svg>
            Restart
          </div>
        </motion.button>
      </div>
      
      {/* Direction Controls */}
      <div className="relative max-w-[240px] mx-auto">
        <AnimatePresence>
          {!isGameOver && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-3 gap-3 md:gap-5"
            >
              {/* Top Row - Up Button */}
              <div className="col-start-1">
              <DirectionButton 
                direction="LEFT" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                  </svg>
                } 
                onClick={onDirectionChange} 
                disabled={isGameOver || isPaused}
              />
              
              </div>
              
              {/* Middle Row - Left and Right Buttons */}
              <DirectionButton 
                  direction="UP" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M11.47 4.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 6.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                    </svg>
                  } 
                  onClick={onDirectionChange} 
                  disabled={isGameOver || isPaused}
                />
              <DirectionButton 
                direction="RIGHT" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                  </svg>
                } 
                onClick={onDirectionChange} 
                disabled={isGameOver || isPaused}
              />
              
              {/* Bottom Row - Down Button */}
              <div className="col-start-2">
                <DirectionButton 
                  direction="DOWN" 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                    </svg>
                  } 
                  onClick={onDirectionChange} 
                  disabled={isGameOver || isPaused}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
              onClick={onReset}
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
                Play Again
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-gray-400 text-center mt-8 bg-gray-800/30 rounded-full py-2 px-4 max-w-xs mx-auto border border-gray-700/30"
      >
        <kbd className="px-2 py-0.5 text-xs font-semibold bg-gray-700 text-gray-200 rounded-md mr-1">↑←↓→</kbd>
        to move
        <span className="mx-2">•</span>
        <kbd className="px-2 py-0.5 text-xs font-semibold bg-gray-700 text-gray-200 rounded-md mr-1">Space</kbd>
        to pause
        <span className="mx-2">•</span>
        <kbd className="px-2 py-0.5 text-xs font-semibold bg-gray-700 text-gray-200 rounded-md mr-1">R</kbd>
        to restart
      </motion.div>
    </div>
  );
}

interface DirectionButtonProps {
  direction: Direction;
  icon: React.ReactNode;
  onClick: (direction: Direction) => void;
  disabled: boolean;
}

function DirectionButton({ direction, icon, onClick, disabled }: DirectionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      className={`
        w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center
        rounded-full text-2xl font-bold
        ${disabled
          ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
        }
        transition-all duration-200
      `}
      onClick={() => !disabled && onClick(direction)}
      disabled={disabled}
    >
      {icon}
    </motion.button>
  );
} 