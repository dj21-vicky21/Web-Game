'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Position = {
  x: number;
  y: number;
};

interface GameBoardProps {
  snake: Position[];
  food: Position;
  boardSize: number;
  isGameOver: boolean;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  foodEmoji: string;
}

export function GameBoard({ snake, food, boardSize, isGameOver, direction, foodEmoji }: GameBoardProps) {
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
    
    return Math.min(Math.floor(availableSpace / boardSize), windowWidth < 768 ? 18 : 25); // Adjust cell size based on screen
  };
  
  const cellSize = calculateCellSize();
  
  // Generate grid
  const grid = Array.from({ length: boardSize }, (_, y) =>
    Array.from({ length: boardSize }, (_, x) => ({ x, y }))
  );

  // Get the grid background color
  const getGridBackground = () => {
    return isGameOver 
      ? "linear-gradient(45deg, #1f1f1f, #2c0b0e)"
      : "linear-gradient(45deg, #0f172a, #1e293b)";
  };

  // Get head rotation based on direction
  const getHeadRotation = () => {
    switch (direction) {
      case 'RIGHT': return 0;
      case 'DOWN': return 90;
      case 'LEFT': return 180; 
      case 'UP': return 270; // -90 can cause animation issues, using 270 instead
      default: return 0;
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl shadow-xl
        border-4 ${isGameOver ? 'border-red-600/70' : 'border-indigo-600/40'}
      `}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
        width: `${boardSize * cellSize + 8}px`, 
        height: `${boardSize * cellSize + 8}px`,
        background: getGridBackground(),
        boxShadow: isGameOver ? 
          '0 0 20px rgba(220, 38, 38, 0.3), inset 0 0 30px rgba(220, 38, 38, 0.2)' : 
          '0 0 20px rgba(79, 70, 229, 0.2), inset 0 0 30px rgba(79, 70, 229, 0.1)'
      }}
    >
      {/* Grid Overlay for better visualization */}
      <div className="absolute inset-0 grid" 
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          gap: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          zIndex: 0
        }}
      />
      
      {/* Food element - separated for better performance */}
      <div 
        className="absolute z-20"
        style={{
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          left: `${food.x * cellSize}px`,
          top: `${food.y * cellSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence>
          <motion.div
            key={`food-${food.x}-${food.y}`}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 10, 0, -10, 0]
            }}
            exit={{ scale: 0 }}
            transition={{ 
              duration: 0.4, 
              times: [0, 0.7, 1], 
              rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            className="flex items-center justify-center"
            style={{
              fontSize: `${cellSize * 0.8}px`,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
            }}
          >
            {foodEmoji}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Snake body segments - rendered with curved shapes for more natural look */}
      {snake.map((segment, index) => {
        // Determine if this segment is connected to others for drawing snake body
        const isHead = index === 0;
        const isTail = index === snake.length - 1;
        const prev = index > 0 ? snake[index - 1] : null;
        const next = index < snake.length - 1 ? snake[index + 1] : null;
        
        // Calculate connection directions
        let connectTop = false;
        let connectRight = false;
        let connectBottom = false;
        let connectLeft = false;
        
        if (prev) {
          if (prev.y < segment.y) connectTop = true;
          if (prev.x > segment.x) connectRight = true;
          if (prev.y > segment.y) connectBottom = true;
          if (prev.x < segment.x) connectLeft = true;
        }
        
        if (next) {
          if (next.y < segment.y) connectTop = true;
          if (next.x > segment.x) connectRight = true;
          if (next.y > segment.y) connectBottom = true;
          if (next.x < segment.x) connectLeft = true;
        }

        return (
          <motion.div
            key={`segment-${index}`}
            initial={false}
            animate={{
              x: segment.x * cellSize,
              y: segment.y * cellSize,
              rotate: isHead ? getHeadRotation() : 0,
            }}
            transition={{ 
              type: "tween", 
              duration: 0.15,
              ease: "linear"
            }}
            className="absolute"
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              zIndex: 30 - index // Head appears above body segments
            }}
          >
            <div className="flex items-center justify-center w-full h-full">
              {isHead ? (
                // Snake head - more snake-like with eyes and different shape
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: '90%',
                    height: '90%',
                    borderRadius: '40% 40% 40% 40%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.5)'
                  }}
                >
                  {/* Snake eyes */}
                  <div className="absolute" style={{ 
                    top: '25%', 
                    left: '25%', 
                    width: '15%', 
                    height: '15%',
                    borderRadius: '50%',
                    backgroundColor: 'white' 
                  }}></div>
                  <div className="absolute" style={{ 
                    top: '25%', 
                    right: '25%', 
                    width: '15%', 
                    height: '15%',
                    borderRadius: '50%',
                    backgroundColor: 'white' 
                  }}></div>
                </div>
              ) : isTail ? (
                // Snake tail
                <div
                  className="w-[70%] h-[70%]"
                  style={{ 
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, 
                      hsl(${160 - index * 2}, 80%, 45%), 
                      hsl(${160 - index * 2}, 80%, 35%)
                    )`,
                    boxShadow: `0 1px 5px rgba(16, 185, 129, 0.3)`
                  }}
                />
              ) : (
                // Snake body segment - with curved design
                <div
                  className="w-[85%] h-[85%] relative"
                  style={{ 
                    borderRadius: '25%',
                    background: `linear-gradient(135deg, 
                      hsl(${160 - index * 2}, 80%, 45%), 
                      hsl(${160 - index * 2}, 80%, 35%)
                    )`,
                    boxShadow: `0 1px 5px rgba(16, 185, 129, ${Math.max(0.1, 0.4 - index * 0.01)})`,
                    // Add subtle scale to make snake look more organic
                    transform: `scale(${0.95 + Math.sin(index * 0.8) * 0.05})`
                  }}
                >
                  {/* Connection indicators */}
                  {connectTop && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%]" 
                    style={{ 
                      background: `linear-gradient(to top, 
                        hsl(${160 - index * 2}, 80%, 45%), 
                        hsl(${160 - index * 2}, 80%, 35%)
                      )`,
                      borderRadius: '50%'
                    }} 
                  />}
                  {connectRight && <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%]" 
                    style={{ 
                      background: `linear-gradient(to right, 
                        hsl(${160 - index * 2}, 80%, 45%), 
                        hsl(${160 - index * 2}, 80%, 35%)
                      )`,
                      borderRadius: '50%'
                    }} 
                  />}
                  {connectBottom && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[50%] h-[50%]" 
                    style={{ 
                      background: `linear-gradient(to bottom, 
                        hsl(${160 - index * 2}, 80%, 45%), 
                        hsl(${160 - index * 2}, 80%, 35%)
                      )`,
                      borderRadius: '50%'
                    }} 
                  />}
                  {connectLeft && <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%]" 
                    style={{ 
                      background: `linear-gradient(to left, 
                        hsl(${160 - index * 2}, 80%, 45%), 
                        hsl(${160 - index * 2}, 80%, 35%)
                      )`,
                      borderRadius: '50%'
                    }} 
                  />}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      
      {/* Empty grid cells */}
      {grid.flat().map(({ x, y }) => (
        <div 
          key={`cell-${x}-${y}`} 
          className="relative z-0"
          style={{ 
            width: `${cellSize}px`, 
            height: `${cellSize}px`,
          }}
        />
      ))}
      
      {/* Border highlight effect */}
      <div className="absolute inset-0 border border-white/5" />
      
      {isGameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center z-40"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl text-white font-bold text-center px-6 py-3 rounded-lg"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
          >
            GAME OVER
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 