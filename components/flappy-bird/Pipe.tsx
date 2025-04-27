'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

interface PipeProps {
  position: number | {
    x: number;
    y: number;
  };
  gapPosition?: number;
  gapSize?: number;
  width: number;
  height?: number;
  isTop?: boolean;
  pipeGap?: number;
  gameHeight?: number;
}

// Use memo to prevent unnecessary re-renders
const Pipe = memo(function Pipe({ 
  position, 
  width, 
  height, 
  gapPosition, 
  gapSize,
  isTop = false, 
  pipeGap, 
  gameHeight 
}: PipeProps) {
  // Handle both object and number position formats
  const posX = typeof position === 'number' ? position : position.x;
  const posY = typeof position === 'number' ? (gapPosition || 0) : position.y;
  
  // Calculate pipe dimensions based on which API is used
  let topPos = 0;
  let pipeHeight = 0;
  
  if (typeof height === 'number' && typeof gapPosition === 'number' && typeof gapSize === 'number') {
    // Old API with gapPosition and gapSize
    if (isTop) {
      topPos = 0;
      pipeHeight = gapPosition - gapSize/2;
    } else {
      topPos = gapPosition + gapSize/2;
      pipeHeight = height - topPos;
    }
  } else if (gameHeight && pipeGap) {
    // New API with gameHeight and pipeGap
    if (isTop) {
      topPos = 0;
      pipeHeight = posY;
    } else {
      topPos = posY;
      pipeHeight = gameHeight - posY;
    }
  }

  // Ensure we have a minimum height to prevent visual issues
  pipeHeight = Math.max(pipeHeight, 10);
  
  return (
    <motion.div
      className="absolute bg-green-600 border-4 border-green-700"
      style={{
        left: `${posX}px`,
        top: `${topPos}px`,
        width: `${width}px`,
        height: `${pipeHeight}px`,
        willChange: 'transform', // Performance optimization
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Pipe cap */}
      <div 
        className="absolute bg-green-700 border-4 border-green-800 left-[-10px] right-[-10px]"
        style={{
          height: '30px',
          top: isTop ? `calc(100% - 30px)` : '0px',
          zIndex: 2,
        }}
      ></div>
    </motion.div>
  );
});

export { Pipe }; 