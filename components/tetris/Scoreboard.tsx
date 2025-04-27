'use client';

import { motion } from 'framer-motion';
import { TetrominoType, TETROMINOS } from './TetrisGame';

interface ScoreboardProps {
  score: number;
  highScore: number;
  level: number;
  linesCleared: number;
  isPaused: boolean;
  nextTetromino: TetrominoType | null;
}

export function Scoreboard({ score, highScore, level, linesCleared, isPaused, nextTetromino }: ScoreboardProps) {
  // Function to render the next tetromino preview
  const renderNextTetrominoPreview = () => {
    if (!nextTetromino) return null;
    
    const tetrominoData = TETROMINOS[nextTetromino];
    const shape = tetrominoData.shape[0]; // Always use the first rotation for preview
    const color = tetrominoData.color;
    
    // Calculate the size of the preview grid
    const rows = shape.length;
    const cols = shape[0].length;
    const cellSize = 15; // Size of each cell in the preview
    
    return (
      <div className="flex items-center justify-center w-24 h-24 bg-indigo-950/30 rounded-lg">
        <div style={{ 
          display: 'grid', 
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: '1px'
        }}>
          {shape.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`next-${x}-${y}`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: cell ? color : 'transparent',
                  border: cell ? `1px solid ${color}40` : 'none',
                  boxShadow: cell ? `inset 0 0 3px ${color}80` : 'none'
                }}
              >
                {cell ? (
                  <div 
                    className="w-full h-full opacity-30"
                    style={{ 
                      background: `linear-gradient(135deg, ${color}60, transparent)`
                    }}
                  />
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="flex justify-between items-center bg-indigo-900/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-indigo-700/30 shadow-lg"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col items-start">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl text-white font-bold">
            {score}
          </div>
          <div className="text-xs text-gray-300">
            PTS
          </div>
        </div>
        <div className="text-xs text-gray-400">
          HIGH: {highScore}
        </div>
      </div>
      
      {isPaused && (
        <div className="absolute left-1/2 transform -translate-x-1/2 text-white font-bold px-3 py-1 bg-orange-500/80 rounded-full text-xs">
          PAUSED
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-300 mb-1">
          NEXT
        </div>
        {renderNextTetrominoPreview()}
      </div>
      
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-300">
          LEVEL
        </div>
        <div className="text-xl text-cyan-400 font-bold">
          {level}
        </div>
        <div className="text-xs text-gray-400">
          LINES: {linesCleared}
        </div>
      </div>
    </motion.div>
  );
} 