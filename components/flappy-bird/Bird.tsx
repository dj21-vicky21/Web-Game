'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface BirdProps {
  position: {
    x: number;
    y: number;
  };
  velocity: number;
  size: number;
  isGameOver: boolean;
}

// Use memo to prevent unnecessary re-renders
export const Bird = memo(function Bird({ position, velocity, size, isGameOver }: BirdProps) {
  // Calculate bird rotation based on velocity
  // Clamp rotation between -30 (pointing up) and 90 (pointing down)
  const rotation = Math.min(Math.max(velocity * 3, -30), 90);
  
  // Calculate wing animation speed based on velocity
  // Flap faster when going up, slower when falling
  const flapSpeed = velocity < 0 ? 0.1 : 0.3;
  
  // Scale body size relative to the specified size
  const bodySize = size * 0.8;
  
  return (
    <motion.div
      className={`absolute ${isGameOver ? 'grayscale opacity-60' : ''}`}
      style={{
        left: `${position.x - size/2}px`,
        top: `${position.y - size/2}px`,
        width: `${size}px`,
        height: `${size}px`,
        willChange: 'transform',
      }}
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        rotate: rotation,
        transition: { rotate: { type: 'spring', stiffness: 200, damping: 20 } }
      }}
    >
      {/* Bird body */}
      <div 
        className={`absolute rounded-full bg-yellow-400 border-2 border-yellow-600 
          ${isGameOver ? 'bg-gray-400 border-gray-600' : ''}`}
        style={{
          width: `${bodySize}px`,
          height: `${bodySize}px`,
          left: `${(size - bodySize) / 2}px`,
          top: `${(size - bodySize) / 2}px`,
        }}
      >
        {/* Eye */}
        <div 
          className="absolute bg-white rounded-full border border-black"
          style={{
            width: `${size * 0.2}px`,
            height: `${size * 0.2}px`,
            right: `${size * 0.15}px`,
            top: `${size * 0.15}px`,
          }}
        >
          <div 
            className="absolute bg-black rounded-full"
            style={{
              width: `${size * 0.08}px`,
              height: `${size * 0.08}px`,
              right: `${size * 0.01}px`,
              top: `${size * 0.04}px`,
            }}
          ></div>
        </div>
        
        {/* Beak */}
        <div 
          className={`absolute rounded-r-lg bg-orange-500 border border-orange-700
            ${isGameOver ? 'bg-gray-500 border-gray-700' : ''}`}
          style={{
            width: `${size * 0.3}px`,
            height: `${size * 0.15}px`,
            right: `${-size * 0.1}px`,
            top: `${size * 0.3}px`,
            transformOrigin: 'right center',
          }}
        ></div>
        
        {/* Wing */}
        <motion.div 
          className={`absolute rounded-full bg-yellow-300 border border-yellow-500
            ${isGameOver ? 'bg-gray-300 border-gray-500' : ''}`}
          style={{
            width: `${size * 0.35}px`,
            height: `${size * 0.25}px`,
            left: `${size * 0.05}px`,
            top: `${size * 0.3}px`,
            transformOrigin: 'top left',
          }}
          animate={{
            rotate: isGameOver ? 0 : [0, -15, 0],
            transition: {
              repeat: Infinity,
              duration: flapSpeed,
              ease: "easeInOut",
            }
          }}
        ></motion.div>
      </div>
    </motion.div>
  );
}); 