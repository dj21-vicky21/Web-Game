'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Scoreboard } from './Scoreboard';
import { GameControls } from './GameControls';
import { GameBoard } from './GameBoard';
import { useInterval } from '@/hooks/useInterval';
import { motion } from 'framer-motion';

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = {
  x: number;
  y: number;
};

// Constants
const BOARD_SIZE = 20;
const INITIAL_SPEED = 180;
const SPEED_INCREMENT = 5;
const FRUITS = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍏', '🥑', '🍆', '🥕', '🌽', '🌶️', '🫑'];

export function SnakeGame() {
  // Game state
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [foodEmoji, setFoodEmoji] = useState<string>(FRUITS[0]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Game initialization
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Set focus to the game board
    if (boardRef.current) {
      boardRef.current.focus();
    }
    
    // Generate random food position
    generateFood();
  }, []);

  // Save high score when it changes
  useEffect(() => {
    localStorage.setItem('snakeHighScore', highScore.toString());
  }, [highScore]);

  // Generate random food position
  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      // Ensure food doesn't spawn on the snake
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    setFood(newFood);
    setFoodEmoji(FRUITS[Math.floor(Math.random() * FRUITS.length)]);
  }, [snake]);

  // Handle game tick
  const gameLoop = useCallback(() => {
    if (isPaused || isGameOver) return;
    
    // Update direction from nextDirection
    setDirection(nextDirection);
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch (nextDirection) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collisions
    if (
      head.x < 0 || 
      head.x >= BOARD_SIZE || 
      head.y < 0 || 
      head.y >= BOARD_SIZE ||
      snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      // Game over
      setIsGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }
    
    // Create new snake
    const newSnake = [head, ...snake];
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
      // Increase score
      const newScore = score + 1;
      setScore(newScore);
      
      // Increase speed
      if (newScore % 5 === 0) {
        setSpeed(prevSpeed => Math.max(prevSpeed - SPEED_INCREMENT, 50));
      }
      
      // Generate new food
      generateFood();
    } else {
      // Remove tail if no food eaten
      newSnake.pop();
    }
    
    setSnake(newSnake);
  }, [snake, nextDirection, food, score, isPaused, isGameOver, highScore, generateFood]);

  // Game loop interval
  useInterval(gameLoop, speed);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isGameOver) return;
    
    // Prevent default behavior (scrolling) for arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setNextDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setNextDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setNextDirection('LEFT');
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') setNextDirection('RIGHT');
        break;
      case ' ':
        // Space bar toggles pause
        setIsPaused(prev => !prev);
        break;
      case 'r':
      case 'R':
        // 'r' key resets the game
        resetGame();
        break;
    }
  }, [direction, isGameOver]);

  // Reset game state
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setSpeed(INITIAL_SPEED);
    generateFood();
    
    // Set focus to the game board after reset
    if (boardRef.current) {
      boardRef.current.focus();
    }
  };

  // Handle direction button clicks
  const handleDirectionChange = (newDirection: Direction) => {
    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(newDirection);
    }
  };

  // Toggle pause state
  const togglePause = () => {
    if (!isGameOver) {
      setIsPaused(prev => !prev);
      
      // Refocus on the game board when toggling pause
      if (boardRef.current) {
        boardRef.current.focus();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto relative px-2"
    >
      {/* Game Container with Glass Effect */}
      <div className="backdrop-blur-sm bg-black/20 p-4 md:p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          {/* Game area */}
          <div className="w-full lg:w-auto">
            <Scoreboard score={score} highScore={highScore} isPaused={isPaused} />
            
            <div 
              ref={boardRef}
              className="outline-none mx-auto mt-4"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              style={{ width: 'fit-content' }}
            >
              <motion.div
                animate={{ 
                  boxShadow: isPaused 
                    ? '0 0 0 rgba(0, 0, 0, 0)' 
                    : '0 0 30px rgba(79, 70, 229, 0.2)'
                }}
                transition={{ duration: 0.5 }}
              >
                <GameBoard 
                  snake={snake} 
                  food={food} 
                  boardSize={BOARD_SIZE} 
                  isGameOver={isGameOver}
                  direction={direction}
                  foodEmoji={foodEmoji}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Controls area */}
          <div className="w-full lg:w-auto lg:ml-auto">
            <GameControls 
              onDirectionChange={handleDirectionChange}
              onPauseToggle={togglePause}
              onReset={resetGame}
              isPaused={isPaused}
              isGameOver={isGameOver}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 