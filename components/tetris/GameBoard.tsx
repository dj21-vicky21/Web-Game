'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridCell, GameState } from './TetrisGame';

// Interface for props
interface GameBoardProps {
  grid: GridCell[][];
  gameState: GameState;
  onStartGame: () => void;
}

export function GameBoard({ grid, gameState, onStartGame }: GameBoardProps) {
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate the cell size based on the device width
  const calculateCellSize = () => {
    const baseSize = Math.min(windowWidth, 1200);
    let availableSpace = baseSize - 80; // Accounting for padding
    
    // On smaller screens, scale the board down further
    if (windowWidth < 500) {
      availableSpace = windowWidth - 40;
    } else if (windowWidth < 768) {
      availableSpace = windowWidth - 60;
    }
    
    return Math.min(Math.floor(availableSpace / grid[0].length), windowWidth < 768 ? 22 : 28);
  };
  
  const cellSize = calculateCellSize();
  const boardWidth = grid[0].length * cellSize;
  const boardHeight = grid.length * cellSize;
  
  // Get the grid background color
  const getGridBackground = () => {
    if (gameState === 'game-over') {
      return "linear-gradient(45deg, #1f1f1f, #2d0808)";
    } else if (gameState === 'paused') {
      return "linear-gradient(45deg, #0f1826, #1e293b)";
    } else {
      return "linear-gradient(45deg, #0f172a, #1e293b)";
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl
        border-4 ${gameState === 'game-over' ? 'border-red-600/70' : 'border-indigo-600/40'}
      `}
      style={{
        width: `${boardWidth}px`,
        height: `${boardHeight}px`,
        background: getGridBackground(),
        boxShadow: gameState === 'game-over' ? 
          '0 0 20px rgba(220, 38, 38, 0.3), inset 0 0 30px rgba(220, 38, 38, 0.2)' : 
          '0 0 20px rgba(79, 70, 229, 0.2), inset 0 0 30px rgba(79, 70, 229, 0.1)'
      }}
    >
      {/* Grid background lines for visibility */}
      <div className="absolute inset-0 grid" 
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gap: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          zIndex: 0
        }}
      />
      
      {/* Game blocks */}
      {grid.map((row, y) => 
        row.map((cell, x) => (
          <motion.div
            key={`cell-${x}-${y}`}
            initial={{ opacity: cell ? 0 : 1 }}
            animate={{ 
              opacity: 1,
              backgroundColor: cell ? cell.color : 'transparent',
              borderColor: cell ? `${cell.color}40` : 'transparent'
            }}
            transition={{ duration: 0.2 }}
            className={cell ? 'border border-white/10' : ''}
            style={{
              position: 'absolute',
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize,
              zIndex: cell ? 10 : 1
            }}
          >
            {cell && (
              <div 
                className="absolute inset-1 opacity-30 rounded-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${cell.color}60, transparent)`,
                  boxShadow: `inset 0 0 5px ${cell.color}80`
                }}
              />
            )}
          </motion.div>
        ))
      )}
      
      {/* Overlay states */}
      <AnimatePresence>
        {gameState === 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6"
            >
              TETRIS
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold shadow-lg"
            >
              Start Game
            </motion.button>
          </motion.div>
        )}
        
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <div className="text-3xl font-bold text-white">PAUSED</div>
          </motion.div>
        )}
        
        {gameState === 'game-over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50"
          >
            <div className="text-4xl font-bold text-red-500 mb-4">GAME OVER</div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold shadow-lg"
            >
              Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 