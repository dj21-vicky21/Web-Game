"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

type Player = "X" | "O" | null;
type BoardState = Player[];
type GameMode = "player" | "cpu";

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// Confetti particle component
const Particle = ({ index }: { index: number }) => {
  const colors = ["#ff79c6", "#8be9fd", "#50fa7b", "#bd93f9", "#ffb86c"];
  const color = colors[index % colors.length];
  
  return (
    <motion.div
      className="absolute"
      initial={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: Math.random() * 300 - 150,
        y: Math.random() * 300 - 150,
        rotate: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.2,
        opacity: 1,
      }}
      exit={{
        y: 100,
        opacity: 0,
      }}
      transition={{
        duration: 1.5,
        ease: "easeOut",
      }}
      style={{
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        background: color,
      }}
    />
  );
};

export default function TicTacToe() {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player | "draw">(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameMode, setGameMode] = useState<GameMode>("player");
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Check for winner or draw
  const checkGameState = (board: BoardState) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningCells(combo);
        return board[a];
      }
    }
    return board.every(cell => cell !== null) ? "draw" : null;
  };

  // Handle player move
  const handleCellClick = (index: number) => {
    if (!gameStarted) return;
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameState = checkGameState(newBoard);
    
    if (gameState) {
      setWinner(gameState);
      if (gameState !== "draw") {
        setScores(prev => ({
          ...prev,
          [gameState]: prev[gameState as "X" | "O"] + 1
        }));
        
        if (gameState === "X" || (gameState === "O" && gameMode === "player")) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }
      }
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  // CPU move
  useEffect(() => {
    if (gameMode === "cpu" && currentPlayer === "O" && !winner && gameStarted) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, gameStarted]);

  // Make CPU move
  const makeComputerMove = () => {
    const emptyCells = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index): index is number => index !== null);

    if (emptyCells.length === 0) return;

    // Random chance to make a mistake based on difficulty
    const makeOptimalMove = (() => {
      switch (difficulty) {
        case "easy": return Math.random() > 0.6;
        case "medium": return Math.random() > 0.3;
        case "hard": return true;
        default: return Math.random() > 0.3;
      }
    })();

    if (!makeOptimalMove) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      handleCellClick(emptyCells[randomIndex]);
      return;
    }

    // Try to win
    for (const cell of emptyCells) {
      const newBoard = [...board];
      newBoard[cell] = "O";
      for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (newBoard[a] === "O" && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
          handleCellClick(cell);
          return;
        }
      }
    }

    // Block player from winning
    for (const cell of emptyCells) {
      const newBoard = [...board];
      newBoard[cell] = "X";
      for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (newBoard[a] === "X" && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
          handleCellClick(cell);
          return;
        }
      }
    }

    // Take center if available
    if (emptyCells.includes(4)) {
      handleCellClick(4);
      return;
    }

    // Take a corner if available
    const corners = [0, 2, 6, 8].filter(corner => emptyCells.includes(corner));
    if (corners.length > 0) {
      const randomCorner = corners[Math.floor(Math.random() * corners.length)];
      handleCellClick(randomCorner);
      return;
    }

    // Take a random move
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    handleCellClick(emptyCells[randomIndex]);
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setCurrentPlayer("X");
    setWinningCells([]);
  };

  // Reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0 });
  };

  // Start new game
  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_20%)]"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              transform: `translate(-50%, -50%)`,
              filter: 'blur(50px)',
              animation: `pulse ${Math.random() * 10 + 10}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main container with glass effect */}
      <motion.div 
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-6">
          <Link href={!gameStarted ? "/" : "#"} onClick={() => setGameStarted(false)} className="flex items-center text-white/80 hover:text-white transition">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>{!gameStarted ? "Home" : "Menu"}</span>
          </Link>
          <motion.h1 
            className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Tic Tac Toe
          </motion.h1>
          <div className="w-16"></div>
        </div>

        {!gameStarted ? (
          <motion.div 
            className="flex flex-col items-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl mb-4 text-center">Select Game Mode</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition"
              onClick={() => startGame("player")}
            >
              Player vs Player
            </motion.button>
            <motion.div className="w-full space-y-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition"
                onClick={() => startGame("cpu")}
              >
                Player vs CPU
              </motion.button>
              
              { (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm mb-2 text-center">CPU Difficulty</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDifficulty("easy")}
                      className={`flex-1 py-1 rounded-md text-sm transition ${difficulty === "easy" ? 'bg-green-500/70' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Easy
                    </button>
                    <button 
                      onClick={() => setDifficulty("medium")}
                      className={`flex-1 py-1 rounded-md text-sm transition ${difficulty === "medium" ? 'bg-yellow-500/70' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => setDifficulty("hard")}
                      className={`flex-1 py-1 rounded-md text-sm transition ${difficulty === "hard" ? 'bg-red-500/70' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Hard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="game-board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <motion.div 
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="text-center">
                    <span className="text-pink-400 font-bold">X</span>
                    <span className="text-lg mx-1">vs</span>
                    <span className="text-blue-400 font-bold">O</span>
                  </div>
                  <div className="flex justify-center gap-8 mt-1">
                    <div className="text-2xl font-bold text-pink-400">{scores.X}</div>
                    <div className="text-2xl font-bold text-blue-400">{scores.O}</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-center">
                    <span className="mr-1">Turn:</span>
                    <motion.span 
                      key={currentPlayer}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`text-xl font-bold ${currentPlayer === "X" ? "text-pink-400" : "text-blue-400"}`}
                    >
                      {currentPlayer}
                    </motion.span>
                  </div>
                  <div className="text-center text-sm">
                    {gameMode === "cpu" && (
                      currentPlayer === "X" ? "Player" : "CPU"
                    )}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="grid grid-cols-3 gap-3 mb-6 perspective-[800px]"
                initial={{ rotateX: 20 }}
                animate={{ rotateX: 0 }}
                transition={{ duration: 0.3 }}
              >
                {board.map((cell, index) => (
                  <motion.button
                    key={index}
                    whileHover={undefined}
                    whileTap={!cell && !winner ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotateY: 0,
                      backgroundColor: winningCells.includes(index) 
                        ? 'rgba(255, 255, 255, 0.25)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      borderColor: winningCells.includes(index)
                        ? cell === "X" ? 'rgba(236, 72, 153, 0.5)' : 'rgba(96, 165, 250, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 25,
                      duration: 0.2
                    }}
                    onClick={() => handleCellClick(index)}
                    className={`aspect-square flex items-center justify-center rounded-xl text-5xl font-bold border-2
                      ${!cell && !winner ? 'cursor-pointer' : ''}
                      ${winningCells.includes(index) ? 'shadow-lg' : 'shadow-sm'}
                    `}
                    style={{
                      boxShadow: winningCells.includes(index)
                        ? `0 0 20px 0 ${cell === "X" ? "rgba(236, 72, 153, 0.3)" : "rgba(96, 165, 250, 0.3)"}`
                        : undefined,
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {cell && (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 25,
                          duration: 0.2
                        }}
                        className={`
                          ${cell === "X" ? "text-pink-400" : "text-blue-400"}
                          ${winningCells.includes(index) ? "text-shadow-lg" : ""}
                        `}
                        style={{
                          textShadow: winningCells.includes(index)
                            ? `0 0 10px ${cell === "X" ? "rgba(236, 72, 153, 0.7)" : "rgba(96, 165, 250, 0.7)"}`
                            : undefined
                        }}
                      >
                        {cell}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {winner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6 p-4 rounded-lg bg-white/10 border border-white/10"
                >
                  {winner === "draw" ? (
                    <p className="text-xl font-semibold">Game ended in a draw!</p>
                  ) : (
                    <p className="text-xl font-semibold">
                      <motion.span 
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: 1, duration: 0.5 }}
                        className={winner === "X" ? "text-pink-400" : "text-blue-400"}
                      >
                        {winner}
                      </motion.span>{" "}
                      wins the game!
                    </p>
                  )}
                </motion.div>
              )}

              <div className="flex flex-col space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition"
                >
                  New Game
                </motion.button>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={resetScores}
                    className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border border-white/10"
                  >
                    Reset Scores
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setGameStarted(false);
                      resetScores();
                    }}
                    className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition border border-white/10"
                  >
                    Change Mode
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
      
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }
        .text-shadow-lg {
          text-shadow: 0 0 10px currentColor;
        }
        .perspective-[800px] {
          perspective: 800px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}