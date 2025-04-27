'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { GameBoard } from './GameBoard';
import { Scoreboard } from './Scoreboard';
import { GameControls } from './GameControls';
import { useInterval } from '@/hooks/useInterval';
import { motion } from 'framer-motion';

// Types
export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type Position = { x: number; y: number };
export type RotationState = 0 | 1 | 2 | 3;
export type GameState = 'ready' | 'playing' | 'paused' | 'game-over';
export type GridCell = null | { color: string; type: TetrominoType };

// The available tetrominos with their shapes and colors
export const TETROMINOS: Record<TetrominoType, { shape: number[][][], color: string }> = {
  'I': {
    shape: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
    ],
    color: '#00FFFF' // Cyan
  },
  'J': {
    shape: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
    ],
    color: '#0000FF' // Blue
  },
  'L': {
    shape: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
    ],
    color: '#FFA500' // Orange
  },
  'O': {
    shape: [
      [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]
    ],
    color: '#FFFF00' // Yellow
  },
  'S': {
    shape: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
      [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
      [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
    ],
    color: '#00FF00' // Green
  },
  'T': {
    shape: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ],
    color: '#800080' // Purple
  },
  'Z': {
    shape: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
      [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
    ],
    color: '#FF0000' // Red
  }
};

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_FALL_SPEED = 800; // in ms
const SPEED_INCREASE_FACTOR = 0.9; // Speed multiplier for each level

export function TetrisGame() {
  // Game state
  const [grid, setGrid] = useState<GridCell[][]>(createEmptyGrid());
  const [tetromino, setTetromino] = useState<TetrominoType | null>(null);
  const [rotation, setRotation] = useState<RotationState>(0);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [speed, setSpeed] = useState<number>(INITIAL_FALL_SPEED);
  const [nextTetromino, setNextTetromino] = useState<TetrominoType | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Initialize the game
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('tetrisHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Set focus to the game board
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, []);
  
  // Save high score when it changes
  useEffect(() => {
    localStorage.setItem('tetrisHighScore', highScore.toString());
  }, [highScore]);
  
  // Create an empty grid
  function createEmptyGrid() {
    return Array.from({ length: BOARD_HEIGHT }, () => 
      Array.from({ length: BOARD_WIDTH }, () => null)
    );
  }
  
  // Generate a random tetromino
  const getRandomTetromino = useCallback((): TetrominoType => {
    const tetrominos: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return tetrominos[Math.floor(Math.random() * tetrominos.length)];
  }, []);
  
  // Check if a position is valid for the current tetromino
  const isValidPosition = useCallback((pos: Position, rot: RotationState, tet: TetrominoType): boolean => {
    const shape = TETROMINOS[tet].shape[rot];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          // Check if off the grid or collides with existing blocks
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY < 0 || 
            newY >= BOARD_HEIGHT || 
            (grid[newY] && grid[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [grid]);
  
  // Start the game
  const startGame = useCallback(() => {
    // Reset game state
    setGrid(createEmptyGrid());
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setSpeed(INITIAL_FALL_SPEED);
    setGameState('playing');
    
    // Generate first tetromino
    const firstTetromino = getRandomTetromino();
    const nextTet = getRandomTetromino();
    
    setTetromino(firstTetromino);
    setNextTetromino(nextTet);
    setRotation(0);
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    
    // Focus the game board
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, [getRandomTetromino]);
  
  // Draw the active tetromino on the grid
  const drawTetromino = useCallback((grid: GridCell[][]): GridCell[][] => {
    if (!tetromino) return grid;
    
    const shape = TETROMINOS[tetromino].shape[rotation];
    const color = TETROMINOS[tetromino].color;
    const newGrid = JSON.parse(JSON.stringify(grid)) as GridCell[][];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = position.y + y;
          const gridX = position.x + x;
          
          if (gridY >= 0 && gridY < BOARD_HEIGHT && gridX >= 0 && gridX < BOARD_WIDTH) {
            newGrid[gridY][gridX] = { color, type: tetromino };
          }
        }
      }
    }
    
    return newGrid;
  }, [tetromino, rotation, position]);
  
  // Move the tetromino left/right
  const moveTetromino = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing' || !tetromino) return;
    
    const offset = direction === 'left' ? -1 : 1;
    const newPosition = { ...position, x: position.x + offset };
    
    if (isValidPosition(newPosition, rotation, tetromino)) {
      setPosition(newPosition);
    }
  }, [gameState, tetromino, position, rotation, isValidPosition]);
  
  // Rotate the tetromino
  const rotateTetromino = useCallback(() => {
    if (gameState !== 'playing' || !tetromino) return;
    
    const newRotation = ((rotation + 1) % 4) as RotationState;
    
    // Try to rotate, but if it's not valid, try wall kicks
    if (isValidPosition(position, newRotation, tetromino)) {
      setRotation(newRotation);
    } else {
      // Try wall kicks (offset the position to make the rotation valid)
      const offsets = [
        { x: 1, y: 0 },  // Try right
        { x: -1, y: 0 }, // Try left
        { x: 0, y: -1 }, // Try up
        { x: -2, y: 0 }, // Try far left (for I piece)
        { x: 2, y: 0 },  // Try far right (for I piece)
      ];
      
      for (const offset of offsets) {
        const newPosition = { x: position.x + offset.x, y: position.y + offset.y };
        if (isValidPosition(newPosition, newRotation, tetromino)) {
          setPosition(newPosition);
          setRotation(newRotation);
          break;
        }
      }
    }
  }, [gameState, tetromino, position, rotation, isValidPosition]);
  
  // Move the tetromino down (soft drop)
  const moveTetrominoDown = useCallback(() => {
    if (gameState !== 'playing' || !tetromino) return;
    
    const newPosition = { ...position, y: position.y + 1 };
    
    if (isValidPosition(newPosition, rotation, tetromino)) {
      setPosition(newPosition);
      return true;
    } else {
      // Lock the tetromino and generate a new one
      lockTetromino();
      return false;
    }
  }, [gameState, tetromino, position, rotation, isValidPosition]);
  
  // Hard drop - move tetromino all the way down instantly
  const hardDrop = useCallback(() => {
    if (gameState !== 'playing' || !tetromino) return;
    
    let dropPos = position.y;
    const tempPos = { ...position };
    
    while (isValidPosition(tempPos, rotation, tetromino)) {
      dropPos = tempPos.y;
      tempPos.y += 1;
    }
    
    if (dropPos !== position.y) {
      setPosition({ ...position, y: dropPos });
      lockTetromino();
    }
  }, [gameState, tetromino, position, rotation, isValidPosition]);
  
  // Lock the current tetromino in place
  const lockTetromino = useCallback(() => {
    if (!tetromino) return;
    
    // Create a new grid with the tetromino locked in place
    const newGrid = drawTetromino(grid);
    
    // Check for completed lines
    let completedLines = 0;
    const filteredGrid = newGrid.filter(row => {
      if (row.every(cell => cell !== null)) {
        completedLines++;
        return false;
      }
      return true;
    });
    
    // Add empty rows at the top
    while (filteredGrid.length < BOARD_HEIGHT) {
      filteredGrid.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    // Update the grid
    setGrid(filteredGrid);
    
    // Update score and level
    if (completedLines > 0) {
      const additionalScore = calculateScore(completedLines, level);
      const newLinesCleared = linesCleared + completedLines;
      const newLevel = Math.floor(newLinesCleared / 10) + 1;
      
      setScore(prev => prev + additionalScore);
      setLinesCleared(newLinesCleared);
      
      if (newLevel > level) {
        setLevel(newLevel);
        setSpeed(prev => Math.max(prev * SPEED_INCREASE_FACTOR, 100));
      }
    }
    
    // Spawn the next tetromino
    const newTetromino = nextTetromino || getRandomTetromino();
    const spawnPosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    
    // Check for game over
    if (!isValidPosition(spawnPosition, 0, newTetromino)) {
      setGameState('game-over');
      if (score > highScore) {
        setHighScore(score);
      }
    } else {
      setTetromino(newTetromino);
      setNextTetromino(getRandomTetromino());
      setRotation(0);
      setPosition(spawnPosition);
    }
  }, [tetromino, grid, drawTetromino, nextTetromino, getRandomTetromino, level, linesCleared, score, highScore, isValidPosition]);
  
  // Calculate score based on lines cleared and level
  function calculateScore(lines: number, level: number): number {
    const basePoints = [0, 40, 100, 300, 1200];
    return basePoints[lines] * level;
  }
  
  // Game tick - move tetromino down every interval
  const gameTick = useCallback(() => {
    if (gameState === 'playing') {
      moveTetrominoDown();
    }
  }, [gameState, moveTetrominoDown]);
  
  // Set up the game loop
  useInterval(gameTick, gameState === 'playing' ? speed : null);
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameState === 'game-over') return;
    
    // Prevent default behavior for game keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'p', 'P'].includes(e.key)) {
      e.preventDefault();
    }
    
    if (gameState === 'ready' && (e.key === ' ' || e.key === 'Enter')) {
      startGame();
      return;
    }
    
    if (gameState === 'playing') {
      switch (e.key) {
        case 'ArrowLeft':
          moveTetromino('left');
          break;
        case 'ArrowRight':
          moveTetromino('right');
          break;
        case 'ArrowUp':
          rotateTetromino();
          break;
        case 'ArrowDown':
          moveTetrominoDown();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    } else if (gameState === 'paused' && (e.key === 'p' || e.key === 'P')) {
      togglePause();
    }
  }, [gameState, startGame, moveTetromino, rotateTetromino, moveTetrominoDown, hardDrop]);
  
  // Toggle pause state
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);
  
  // Reset game
  const resetGame = useCallback(() => {
    setGameState('ready');
    setGrid(createEmptyGrid());
    setTetromino(null);
    setNextTetromino(null);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setSpeed(INITIAL_FALL_SPEED);
    
    // Focus the game board
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }, []);

  // Render the final grid with the active tetromino
  const displayGrid = gameState === 'playing' || gameState === 'paused' 
    ? drawTetromino(grid) 
    : grid;
  
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
            <Scoreboard 
              score={score}
              highScore={highScore}
              level={level}
              linesCleared={linesCleared}
              isPaused={gameState === 'paused'}
              nextTetromino={nextTetromino}
            />
            
            <div 
              ref={boardRef}
              className="outline-none mx-auto mt-4"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              style={{ width: 'fit-content' }}
            >
              <motion.div
                animate={{ 
                  boxShadow: gameState === 'paused' 
                    ? '0 0 0 rgba(0, 0, 0, 0)' 
                    : '0 0 30px rgba(99, 102, 241, 0.2)'
                }}
                transition={{ duration: 0.5 }}
              >
                <GameBoard 
                  grid={displayGrid} 
                  gameState={gameState}
                  onStartGame={startGame}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Controls area */}
          <div className="w-full lg:w-auto lg:ml-auto">
            <GameControls 
              onMoveLeft={() => moveTetromino('left')}
              onMoveRight={() => moveTetromino('right')}
              onRotate={rotateTetromino}
              onMoveDown={moveTetrominoDown}
              onHardDrop={hardDrop}
              onPauseToggle={togglePause}
              onReset={resetGame}
              onStart={startGame}
              isPaused={gameState === 'paused'}
              isGameOver={gameState === 'game-over'}
              isReady={gameState === 'ready'}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 