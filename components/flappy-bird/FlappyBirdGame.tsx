'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { Scoreboard } from './Scoreboard';
import { GameControls } from './GameControls';

// Types
type GameState = 'ready' | 'playing' | 'game-over';
type Position = {
  x: number;
  y: number;
};
type PipeData = {
  id: number;
  position: number;
  gap: number;
  passed: boolean;
};
type CloudData = {
  id: number;
  position: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
};

// Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const BIRD_SIZE = 40;
const PIPE_WIDTH = 80;
const PIPE_GAP = 180;
const PIPE_SPEED = 3;
const SPAWN_RATE = 1600;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const FLOOR_HEIGHT = 100;
const GAME_AREA_HEIGHT = CANVAS_HEIGHT - FLOOR_HEIGHT;

export function FlappyBirdGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [birdPosition, setBirdPosition] = useState<Position>({ x: 100, y: 300 });
  const [birdVelocity, setBirdVelocity] = useState<number>(0);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [clouds, setClouds] = useState<CloudData[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastPipeTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  
  // Initialize game and load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Focus game area
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Save high score when it changes
  useEffect(() => {
    localStorage.setItem('flappyHighScore', highScore.toString());
  }, [highScore]);
  
  // Generate a new pipe
  const generatePipe = useCallback(() => {
    // Random gap position between pipes (20% to 70% of game area height)
    const minGapPosition = Math.floor(GAME_AREA_HEIGHT * 0.2);
    const maxGapPosition = Math.floor(GAME_AREA_HEIGHT * 0.7);
    const gapPosition = Math.floor(Math.random() * (maxGapPosition - minGapPosition)) + minGapPosition;
    
    const pipe: PipeData = {
      id: Date.now(),
      position: CANVAS_WIDTH,
      gap: gapPosition,
      passed: false
    };
    
    setPipes(prevPipes => [...prevPipes, pipe]);
  }, []);

  // Generate a new cloud
  const generateCloud = useCallback(() => {
    const cloud: CloudData = {
      id: Date.now(),
      position: CANVAS_WIDTH,
      y: Math.random() * 200,
      width: Math.random() * 100 + 50,
      height: Math.random() * 60 + 30,
      opacity: Math.random() * 0.5 + 0.3
    };
    
    setClouds(prevClouds => [...prevClouds, cloud]);
  }, []);
  
  // Reset game state
  const resetGame = useCallback(() => {
    setBirdPosition({ x: 100, y: 300 });
    setBirdVelocity(0);
    setPipes([]);
    setClouds([]);
    setScore(0);
    setGameState('ready');
    lastPipeTimeRef.current = 0;
    gameTimeRef.current = 0;
    
    // Focus game area
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  }, []);
  
  // Handle jump action
  const handleJump = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing');
      // Apply initial jump on game start
      setBirdVelocity(JUMP_FORCE);
      return;
    }
    
    if (gameState === 'playing' && !isPaused) {
      // Prevent jumps when too close to the ceiling to avoid sticking
      if (birdPosition.y <= BIRD_SIZE) {
        // Apply a smaller jump force when near the ceiling
        setBirdVelocity(JUMP_FORCE * 0.5);
      } else {
        // Cap velocity to prevent excessive acceleration when spamming jump
        setBirdVelocity(Math.max(JUMP_FORCE, birdVelocity * 0.5 + JUMP_FORCE));
      }
    }
    
    if (gameState === 'game-over') {
      resetGame();
    }
  }, [gameState, isPaused, birdVelocity, resetGame, birdPosition.y]);
  
  // Toggle pause state
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setIsPaused(prev => !prev);
      
      // Focus game area
      if (gameAreaRef.current) {
        gameAreaRef.current.focus();
      }
    }
  }, [gameState]);
  
  // Check for collisions
  const checkCollisions = useCallback(() => {
    // Floor collision
    if (birdPosition.y >= GAME_AREA_HEIGHT - BIRD_SIZE/2) {
      gameOver();
      return;
    }
    
    // Ceiling collision
    if (birdPosition.y <= BIRD_SIZE/2) {
      // Add a small bounce effect instead of sticking to the ceiling
      setBirdPosition(prev => ({ ...prev, y: BIRD_SIZE/2 + 2 }));
      // Add a small positive velocity to push the bird down
      setBirdVelocity(3);
      // Continue checking for pipe collisions
    }
    
    // Pipe collisions - improved hit detection with smaller collision box
    const birdHitboxSize = BIRD_SIZE * 0.8; // 20% smaller hitbox for better gameplay
    for (const pipe of pipes) {
      if (
        birdPosition.x + birdHitboxSize/2 > pipe.position &&
        birdPosition.x - birdHitboxSize/2 < pipe.position + PIPE_WIDTH
      ) {
        // Check if bird is within the gap
        if (
          birdPosition.y - birdHitboxSize/2 < pipe.gap - PIPE_GAP/2 ||
          birdPosition.y + birdHitboxSize/2 > pipe.gap + PIPE_GAP/2
        ) {
          gameOver();
          return;
        }
      }
    }
  }, [birdPosition, pipes]);
  
  // Game over handler
  const gameOver = () => {
    setGameState('game-over');
    if (score > highScore) {
      setHighScore(score);
    }
  };
  
  // Add global keyboard listener with improved event detection
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Use keyCode as a fallback for older browsers
      const keyPressed = e.key ? e.key.toLowerCase() : '';
      const keyCode = e.keyCode || e.which;
      
      if (e.code === 'Space' || keyPressed === ' ' || keyCode === 32) {
        e.preventDefault();
        handleJump();
      } else if (
        e.code === 'KeyP' || 
        keyPressed === 'p' || 
        keyCode === 80
      ) {
        e.preventDefault();
        console.log('Pause toggled via keyboard');
        togglePause();
      } else if (
        e.code === 'KeyR' || 
        keyPressed === 'r' || 
        keyCode === 82
      ) {
        e.preventDefault();
        resetGame();
      }
    };

    // Use both keydown and keypress events for better compatibility
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keypress', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keypress', handleGlobalKeyDown);
    };
  }, [handleJump, togglePause, resetGame]);
  
  // Handle component-level keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Use keyCode as a fallback for older browsers
    const keyPressed = e.key ? e.key.toLowerCase() : '';
    const keyCode = e.keyCode || e.which;
    
    if (e.code === 'Space' || keyPressed === ' ' || keyCode === 32) {
      e.preventDefault();
      handleJump();
    } else if (
      e.code === 'KeyP' || 
      keyPressed === 'p' || 
      keyCode === 80
    ) {
      e.preventDefault();
      console.log('Pause toggled via component');
      togglePause();
    } else if (
      e.code === 'KeyR' || 
      keyPressed === 'r' || 
      keyCode === 82
    ) {
      e.preventDefault();
      resetGame();
    }
  }, [handleJump, togglePause, resetGame]);
  
  // Performance optimization: memoize state updates
  const updateBirdPosition = useCallback((prevBirdPos: Position, velocity: number) => {
    // Calculate new position
    const newY = prevBirdPos.y + velocity;
    
    // Check for ceiling boundary
    if (newY <= BIRD_SIZE/2) {
      // Return position slightly below ceiling to prevent sticking
      return {
        ...prevBirdPos,
        y: BIRD_SIZE/2 + 1
      };
    }
    
    // Check for floor boundary
    if (newY >= GAME_AREA_HEIGHT - BIRD_SIZE/2) {
      return {
        ...prevBirdPos,
        y: GAME_AREA_HEIGHT - BIRD_SIZE/2
      };
    }
    
    // Normal movement
    return {
      ...prevBirdPos,
      y: newY
    };
  }, []);
  
  // Game loop with performance optimizations
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastPipeTimeRef.current) {
      lastPipeTimeRef.current = timestamp;
      gameTimeRef.current = timestamp;
      
      // Generate initial clouds (batched for performance)
      const initialClouds: CloudData[] = [];
      for (let i = 0; i < 5; i++) {
        initialClouds.push({
          id: Date.now() + i,
          position: Math.random() * CANVAS_WIDTH,
          y: Math.random() * 200,
          width: Math.random() * 100 + 50,
          height: Math.random() * 60 + 30,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
      setClouds(initialClouds);
    }
    
    const deltaTime = timestamp - gameTimeRef.current;
    gameTimeRef.current = timestamp;
    
    if (gameState === 'playing' && !isPaused) {
      // Compute frame scale factor once (performance optimization)
      const frameScaleFactor = Math.min(deltaTime / (1000/60), 2); // Cap at 2x normal value
      const pipeMovement = PIPE_SPEED * frameScaleFactor;
      
      // Spawn pipes
      if (timestamp - lastPipeTimeRef.current > SPAWN_RATE) {
        generatePipe();
        
        // Occasionally spawn new clouds (1 in 3 chance)
        if (Math.random() > 0.7) {
          generateCloud();
        }
        lastPipeTimeRef.current = timestamp;
      }
      
      // Update bird velocity with gravity
      const newVelocity = birdVelocity + GRAVITY * frameScaleFactor;
      setBirdVelocity(newVelocity);
      
      // Update bird position
      setBirdPosition(prev => updateBirdPosition(prev, newVelocity));
      
      // Batch update pipes and clouds in single renders
      setPipes(prevPipes => 
        prevPipes
          .map(pipe => {
            // Check if bird passed a pipe
            const justPassed = 
              !pipe.passed && 
              pipe.position + PIPE_WIDTH < birdPosition.x;
            
            if (justPassed) {
              setScore(prev => prev + 1);
            }
            
            return {
              ...pipe,
              position: pipe.position - pipeMovement,
              passed: pipe.passed || justPassed
            };
          })
          .filter(pipe => pipe.position + PIPE_WIDTH > -50) // Remove off-screen pipes
      );
      
      // Update clouds with smoother movement
      setClouds(prevClouds => 
        prevClouds
          .map(cloud => ({
            ...cloud,
            position: cloud.position - pipeMovement * 0.6 // Clouds move a bit slower than pipes
          }))
          .filter(cloud => cloud.position + cloud.width > -50) // Keep clouds slightly longer
      );
      
      // Check collisions
      checkCollisions();
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, birdPosition, birdVelocity, isPaused, generatePipe, checkCollisions, generateCloud, updateBirdPosition]);
  
  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameLoop]);
  
  // Add a keyboard handler specifically for the pause key
  useEffect(() => {
    const handlePauseKey = (e: KeyboardEvent) => {
      // Specifically handle pause key with higher priority
      if (
        e.code === 'KeyP' || 
        e.key?.toLowerCase() === 'p' || 
        e.keyCode === 80
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (gameState === 'playing') {
          console.log('Direct pause toggle');
          setIsPaused(prev => !prev);
        }
      }
    };
    
    window.addEventListener('keydown', handlePauseKey, true);
    return () => window.removeEventListener('keydown', handlePauseKey, true);
  }, [gameState]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto relative px-2 select-none"
    >
      <div className="backdrop-blur-sm bg-blue-900/20 p-4 md:p-6 rounded-2xl border border-blue-700/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          {/* Game area */}
          <div className="w-full lg:w-auto">
            <Scoreboard score={score} highScore={highScore} isPaused={isPaused} />
            
            <div 
              ref={gameAreaRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onClick={handleJump}
              className="relative overflow-hidden mx-auto mt-4 rounded-lg shadow-2xl outline-none focus:outline-none"
              style={{ 
                width: `${CANVAS_WIDTH}px`, 
                height: `${CANVAS_HEIGHT}px`,
                maxWidth: '100%',
                cursor: 'pointer'
              }}
            >
              {/* Sky background */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-300"
              ></div>
              
              {/* Clouds - moving background */}
              <div className="absolute inset-0">
                {clouds.map((cloud) => (
                  <div 
                    key={`cloud-${cloud.id}`}
                    className="absolute rounded-full bg-white blur-sm"
                    style={{
                      width: `${cloud.width}px`,
                      height: `${cloud.height}px`,
                      left: `${cloud.position}px`,
                      top: `${cloud.y}px`,
                      opacity: cloud.opacity
                    }}
                  ></div>
                ))}
              </div>
              
              {/* Pipes */}
              {pipes.map((pipe) => (
                <React.Fragment key={pipe.id}>
                  {/* Top pipe */}
                  <Pipe
                    position={{
                      x: pipe.position,
                      y: pipe.gap - PIPE_GAP/2
                    }}
                    width={PIPE_WIDTH}
                    isTop={true}
                    pipeGap={PIPE_GAP}
                    gameHeight={GAME_AREA_HEIGHT}
                  />
                  {/* Bottom pipe */}
                  <Pipe
                    position={{
                      x: pipe.position,
                      y: pipe.gap + PIPE_GAP/2
                    }}
                    width={PIPE_WIDTH}
                    isTop={false}
                    pipeGap={PIPE_GAP}
                    gameHeight={GAME_AREA_HEIGHT}
                  />
                </React.Fragment>
              ))}
              
              {/* Bird */}
              <Bird 
                position={birdPosition}
                velocity={birdVelocity}
                size={BIRD_SIZE}
                isGameOver={gameState === 'game-over'}
              />
              
              {/* Ground */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-yellow-700 to-yellow-900"
                style={{ 
                  height: `${FLOOR_HEIGHT}px`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='70' height='20' viewBox='0 0 70 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L10 10 L10 15 L0 15z' fill='rgba(120, 65, 20, 0.2)'/%3E%3Cpath d='M20 10 L30 10 L30 15 L20 15z' fill='rgba(120, 65, 20, 0.2)'/%3E%3Cpath d='M40 10 L50 10 L50 15 L40 15z' fill='rgba(120, 65, 20, 0.2)'/%3E%3Cpath d='M60 10 L70 10 L70 15 L60 15z' fill='rgba(120, 65, 20, 0.2)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-x',
                  backgroundPosition: 'bottom',
                }}
              >
                <div 
                  className="absolute top-[-15px] left-0 right-0 h-[15px] bg-gradient-to-b from-green-600 to-yellow-700"
                ></div>
              </div>
              
              {/* Game state overlays */}
              {gameState === 'ready' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-3xl font-bold mb-6 text-shadow"
                  >
                    Ready?
                  </motion.div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white text-xl"
                  >
                    Tap or Press Space to Start
                  </motion.div>
                </div>
              )}
              
              {gameState === 'game-over' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-red-500 text-3xl font-bold mb-6 text-shadow"
                  >
                    Game Over!
                  </motion.div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white text-xl"
                  >
                    Score: {score}
                  </motion.div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetGame();
                    }}
                  >
                    Try Again
                  </motion.div>
                </div>
              )}
              
              {isPaused && gameState === 'playing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-3xl font-bold text-shadow"
                  >
                    Paused
                  </motion.div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls area */}
          <div className="w-full lg:w-auto">
            <GameControls 
              onJump={handleJump}
              onPauseToggle={togglePause}
              onReset={resetGame}
              isPaused={isPaused}
              isGameOver={gameState === 'game-over'}
              isReady={gameState === 'ready'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 