"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Timer, RotateCcw, Award } from "lucide-react";

// Types
type CardType = {
  id: string | number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: 1 | 2;
};

type DifficultyLevel = 'easy' | 'medium' | 'hard';
type PlayerMode = 'single' | 'two';



// Theme options
const cardThemes = {
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
  ],
  fruits: [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
    '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
    '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑',
  ],
  vehicles: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
    '🚒', '🚐', '🚚', '🚛', '🚜', '🚲', '🛵', '🏍️',
    '✈️', '🚀', '🛸', '🚁', '⛵', '🚤', '🛥️', '🚂',
  ],
  space: [
    '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑',
    '🌒', '🌓', '🌔', '☀️', '⭐', '🌟', '✨', '☄️',
    '🪐', '🚀', '🛸', '👽', '👾', '🌠', '🌌', '🔭',
  ]
};

// Component
export default function MemoryGame() {
  // Game state
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<(string | number)[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [timer, setTimer] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('single');
  const [currentPlayer, setCurrentPlayer] = useState<1|2>(1);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof cardThemes>('animals');

  // Difficulty settings
  const difficultyConfig = {
    easy: { pairs: 6, timeBonus: 200 },
    medium: { pairs: 8, timeBonus: 300 },
    hard: { pairs: 12, timeBonus: 500 }
  };
  
  // Start the game
  const startGame = useCallback((newDifficultyOrEvent: DifficultyLevel | React.MouseEvent<HTMLButtonElement>) => {
    // If it's an event, don't need the difficulty as it will come from the button's context
    const newDifficulty = typeof newDifficultyOrEvent === 'string' ? newDifficultyOrEvent : difficulty;
    
    setDifficulty(newDifficulty);
    const pairs = difficultyConfig[newDifficulty].pairs;
    
    // Generate cards
    const symbols = [
      "🍎", "🍌", "🍒", "🍓", "🍊", "🍇", "🍉", "🍋", 
      "🍍", "🥭", "🍐", "🥝", "🍅", "🥥", "🥑", "🍆",
      "🥔", "🥕", "🌽", "🌶️", "🥦", "🥬", "🧄", "🧅"
    ];
    
    const selectedSymbols = symbols.slice(0, pairs);
    const cardPairs = selectedSymbols.flatMap((symbol, index) => [
      { 
        id: `a${index}`, 
        content: symbol, 
        isFlipped: false, 
        isMatched: false 
      },
      { 
        id: `b${index}`, 
        content: symbol, 
        isFlipped: false, 
        isMatched: false 
      }
    ]);
    
    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setGameStarted(true);
    setGameOver(false);
    setCurrentPlayer(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
  }, [difficulty, difficultyConfig]);

  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
  };

  // Handle card click
  const handleCardClick = (id: string | number) => {
    if (
      !gameStarted ||
      gameOver ||
      flippedCards.length === 2 ||
      cards.find((card) => card.id === id)?.isFlipped ||
      cards.find((card) => card.id === id)?.isMatched
    ) {
      return;
    }
    
    const clickedCard = cards.find(card => card.id === id);
    if (!clickedCard) return;
    
    // Flip the card
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // Update cards state
    setCards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    
    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      // If cards match
      if (firstCard?.content === secondCard?.content) {
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        
        // Update player score in two-player mode
        if (playerMode === 'two') {
          if (currentPlayer === 1) {
            setPlayer1Score(prev => prev + 1);
          } else {
            setPlayer2Score(prev => prev + 1);
          }
        }
        
        setCards(prev => 
          prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true, matchedBy: currentPlayer } 
              : card
          )
        );
        
        setFlippedCards([]); // Reset flipped cards immediately for matched pairs
        
        // Check if game is over
        if (newMatchedPairs === difficultyConfig[difficulty].pairs) {
          // We need to delay the game over call slightly to ensure the state updates
          setTimeout(() => {
            endGame();
          }, 300);
        }
      } else {
        // If not matched, reset after delay
        setTimeout(() => {
          setCards(prev => 
            prev.map(card => 
              card.id === firstId || card.id === secondId 
                ? { ...card, isFlipped: false } 
                : card
            )
          );
          setFlippedCards([]);
          
          // Switch player in two-player mode when cards don't match
          if (playerMode === 'two') {
            setCurrentPlayer(current => current === 1 ? 2 : 1);
          }
        }, 1000);
      }
    }
  };

  // End the game and calculate score
  const endGame = useCallback(() => {
    // Save current score state
    let p1Score = player1Score;
    let p2Score = player2Score;
    
    // If we just matched the final pair, add one more to the current player's score
    if (playerMode === 'two' && matchedPairs + 1 === difficultyConfig[difficulty].pairs) {
      if (currentPlayer === 1) {
        p1Score += 1;
        setPlayer1Score(p1Score);
      } else {
        p2Score += 1;
        setPlayer2Score(p2Score);
      }
    }
    
    setGameOver(true);
    
    // Calculate score based on moves, time, and difficulty (for single-player)
    if (playerMode === 'single') {
      const timeBonus = difficultyConfig[difficulty].timeBonus;
      const movesMultiplier = difficultyConfig[difficulty].pairs * 2;
      const finalScore = Math.max(
        timeBonus - timer + (movesMultiplier - moves) * 10, 
        100
      );
      
      setScore(finalScore);
    }
    
    // Make sure the matched card color reflects the player who matched it
    if (playerMode === 'two') {
      // This ensures that when the last pair is matched, we show the correct player color
      const lastMatchingPlayer = currentPlayer;
      setCards(prev => 
        prev.map(card => 
          card.isMatched ? { ...card, matchedBy: lastMatchingPlayer } : card
        )
      );
    }
  }, [difficulty, difficultyConfig, timer, moves, playerMode, currentPlayer, player1Score, player2Score, matchedPairs, setScore, setCards, setGameOver, setCurrentPlayer, setPlayer1Score, setPlayer2Score, timer]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameOver]);

  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start screen UI (difficulty selection)
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center text-white/80 hover:text-white transition">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Memory Game
            </h1>
            <div className="w-16"></div>
          </div>

          <div className="flex flex-col items-center space-y-8">
            <p className="text-white/90 text-center max-w-sm">
              Flip cards and find matching pairs. Challenge your memory and aim for the highest score!
            </p>

            {/* Player Mode Selection */}
            <div className="w-full">
              <h2 className="text-xl font-semibold text-white mb-3 text-center">Player Mode</h2>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => setPlayerMode('single')}
                  className={`py-3 px-4 rounded-lg font-medium transition text-white
                    ${playerMode === 'single' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-indigo-300/30' 
                      : 'bg-white/10 border border-white/10 hover:bg-white/20'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Single Player
                </motion.button>
                <motion.button
                  onClick={() => setPlayerMode('two')}
                  className={`py-3 px-4 rounded-lg font-medium transition text-white
                    ${playerMode === 'two' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-indigo-300/30' 
                      : 'bg-white/10 border border-white/10 hover:bg-white/20'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Two Players
                </motion.button>
              </div>
            </div>

            {/* Card Theme Selection */}
            <div className="w-full">
              <h2 className="text-xl font-semibold text-white mb-3 text-center">Card Theme</h2>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(cardThemes) as Array<keyof typeof cardThemes>).map(theme => (
                  <motion.button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`py-3 px-4 rounded-lg font-medium transition text-white flex flex-col items-center
                      ${selectedTheme === theme 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-indigo-300/30' 
                        : 'bg-white/10 border border-white/10 hover:bg-white/20'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="capitalize mb-1">{theme}</span>
                    <div className="flex gap-1 text-lg">
                      {cardThemes[theme].slice(0, 3).map((emoji, i) => (
                        <span key={i}>{emoji}</span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Difficulty Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg ${
                  difficulty === "easy"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => startGame("easy")}
                type="button"
              >
                Easy
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  difficulty === "medium"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => startGame("medium")}
                type="button"
              >
                Medium
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  difficulty === "hard"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => startGame("hard")}
                type="button"
              >
                Hard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Game completed screen
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-2 sm:p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            {playerMode === 'single' 
              ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Congratulations! 🎉</span>
              : <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Game Complete! 🏆</span>
            }
          </h2>
          
          {/* Two-player winner announcement */}
          {playerMode === 'two' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`mb-4 py-2 px-3 sm:px-4 rounded-lg text-xl sm:text-2xl font-bold ${
                player1Score === player2Score
                  ? 'bg-yellow-500/30 text-yellow-300'
                  : player1Score > player2Score
                    ? 'bg-blue-600/30 text-blue-300'
                    : 'bg-pink-600/30 text-pink-300'
              }`}
            >
              {player1Score === player2Score 
                ? "It's a Tie! 🤝" 
                : player1Score > player2Score
                  ? "Player 1 Wins! 🎮"
                  : "Player 2 Wins! 🎮"}
            </motion.div>
          )}
          
          <p className="text-base sm:text-xl mb-4 sm:mb-6 text-white/90">
            {playerMode === 'single' 
              ? 'You completed the game!' 
              : player1Score === player2Score
                ? "Both players matched the same number of pairs."
                : `${player1Score > player2Score ? 'Player 1' : 'Player 2'} found more matching pairs!`
            }
          </p>
          
          {playerMode === 'single' ? (
            <div className="bg-white/5 rounded-xl p-3 sm:p-5 border border-white/10 mb-4 sm:mb-6">
              <div className="flex justify-center mb-3 sm:mb-5">
                <Award className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div>
                  <p className="text-white/60 text-xs sm:text-sm">Time</p>
                  <p className="text-lg sm:text-xl font-medium text-white">{formatTime(timer)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs sm:text-sm">Moves</p>
                  <p className="text-lg sm:text-xl font-medium text-white">{moves}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/60 text-xs sm:text-sm">Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                    {score}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className={`bg-white/10 p-3 sm:p-4 rounded-lg ${player1Score > player2Score ? 'ring-2 ring-blue-400' : player1Score === player2Score ? 'ring-2 ring-yellow-400/50' : ''}`}>
                <div className="text-xs sm:text-sm font-medium text-white/70 mb-1">Player 1</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-300">{player1Score}</div>
                <div className="text-xs text-white/60">pairs matched</div>
                {player1Score > player2Score && (
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-yellow-300">Winner! 🏆</div>
                )}
                {player1Score === player2Score && (
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-yellow-300">Tie! 🤝</div>
                )}
              </div>
              <div className={`bg-white/10 p-3 sm:p-4 rounded-lg ${player2Score > player1Score ? 'ring-2 ring-pink-400' : player1Score === player2Score ? 'ring-2 ring-yellow-400/50' : ''}`}>
                <div className="text-xs sm:text-sm font-medium text-white/70 mb-1">Player 2</div>
                <div className="text-2xl sm:text-3xl font-bold text-pink-300">{player2Score}</div>
                <div className="text-xs text-white/60">pairs matched</div>
                {player2Score > player1Score && (
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-yellow-300">Winner! 🏆</div>
                )}
                {player1Score === player2Score && (
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-yellow-300">Tie! 🤝</div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2 sm:space-y-3">
            <motion.button
              onClick={startGame}
              className="w-full py-2 sm:py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Play Again
            </motion.button>
            <motion.button
              onClick={resetGame}
              className="w-full py-2 sm:py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 transition border border-white/10 text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Main Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main game UI
  const { pairs } = difficultyConfig[difficulty];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col items-center p-2 sm:p-4 py-4 sm:py-8 overflow-y-auto">
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        {/* Game header with debug info */}
        <div className="bg-black/20 rounded p-2 mb-4 text-xs text-white/70 hidden">
          <div>Difficulty: {difficulty} ({difficultyConfig[difficulty].pairs} pairs)</div>
          <div>Cards in game: {cards.length}</div>
          <div>Matched pairs: {matchedPairs}</div>
          <div>Game over threshold: {difficultyConfig[difficulty].pairs}</div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-6">
          <Link href="#" onClick={() => setGameStarted(false)} className="flex items-center text-white/80 hover:text-white transition">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Menu</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Memory Game
          </h1>
          <button 
            onClick={resetGame}
            className="flex items-center text-white/80 hover:text-white transition"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Reset</span>
          </button>
        </div>

        {/* Game info */}
        <div className="flex justify-between items-center mb-3 sm:mb-6 bg-white/10 backdrop-blur-md rounded-lg p-2 sm:p-3 border border-white/10">
          <div className="flex items-center">
            <Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-white/80" />
            <span className="text-base sm:text-lg font-medium text-white">{formatTime(timer)}</span>
          </div>
          <div className="px-2 sm:px-4 py-1 rounded-full bg-white/10 border border-white/10">
            <span className="text-xs sm:text-sm font-medium text-white">Moves: {moves}</span>
          </div>
          <div className="px-2 sm:px-4 py-1 rounded-full bg-white/10 border border-white/10">
            <span className="text-xs sm:text-sm font-medium text-white">
              {matchedPairs} / {difficultyConfig[difficulty].pairs}
            </span>
          </div>
        </div>

        {/* Two-player mode score and turn indicator */}
        {playerMode === 'two' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div 
              className={`rounded-lg p-3 text-center transition-all duration-200 ${
                currentPlayer === 1 
                  ? 'bg-gradient-to-r from-blue-600/80 to-blue-700/80 border-2 border-blue-300/50 shadow-lg shadow-blue-700/30' 
                  : 'bg-white/10 border border-white/10'
              }`}
            >
              <div className="text-sm text-white/80 mb-1">Player 1</div>
              <div className="text-xl font-bold">
                <span className="text-blue-300">{player1Score}</span> <span className="text-white/50">pairs</span>
              </div>
              {currentPlayer === 1 && (
                <div className="mt-1 text-sm font-medium text-blue-300">Your Turn</div>
              )}
            </div>
            
            <div 
              className={`rounded-lg p-3 text-center transition-all duration-200 ${
                currentPlayer === 2 
                  ? 'bg-gradient-to-r from-pink-600/80 to-pink-700/80 border-2 border-pink-300/50 shadow-lg shadow-pink-700/30' 
                  : 'bg-white/10 border border-white/10'
              }`}
            >
              <div className="text-sm text-white/80 mb-1">Player 2</div>
              <div className="text-xl font-bold">
                <span className="text-pink-300">{player2Score}</span> <span className="text-white/50">pairs</span>
              </div>
              {currentPlayer === 2 && (
                <div className="mt-1 text-sm font-medium text-pink-300">Your Turn</div>
              )}
            </div>
          </div>
        )}

        {/* Game container - Responsive Layout */}
        <div className="flex flex-col md:flex-row md:gap-4 justify-center">
          {/* Game board */}
          <div 
            className="grid gap-1 w-full mx-auto md:flex-1"
            style={{ 
              gridTemplateColumns: 
                difficulty === 'hard' 
                  ? 'repeat(4, 1fr)' // 12 pairs = 24 cards = 6x4 grid
                  : difficulty === 'medium'
                    ? 'repeat(4, 1fr)' // 8 pairs = 16 cards = 4x4 grid
                    : 'repeat(4, 1fr)', // 6 pairs = 12 cards = 3x4 grid
              gridAutoRows: '1fr',
              maxWidth: 
                difficulty === 'hard'
                  ? '600px'
                  : difficulty === 'medium'
                    ? '600px'
                    : '600px'
            }}
          >
            {cards.map(card => (
              <div 
                key={card.id}
                className="relative"
                style={{
                  aspectRatio: '1/1'
                }}
              >
                <motion.div
                  onClick={() => handleCardClick(card.id)}
                  className="absolute inset-0 w-full h-full cursor-pointer"
                >
                  <motion.div
                    className="w-full h-full relative"
                    initial={false}
                    animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Card back */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-white/10"
                      style={{ 
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden"
                      }}
                    >
                      <div className="w-1/3 h-1/3 border-2 sm:border-3 border-white/20 rounded-full flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white/20 rounded-full"></div>
                      </div>
                    </motion.div>

                    {/* Card front */}
                    <motion.div
                      className={`absolute inset-0 rounded-lg flex items-center justify-center shadow-lg text-xl sm:text-2xl md:text-3xl
                        ${card.isMatched 
                          ? playerMode === 'two'
                            ? card.matchedBy === 1
                              ? 'bg-blue-600/40 border-2 border-blue-400'
                              : 'bg-pink-600/40 border-2 border-pink-400'
                            : 'bg-emerald-600/40 border-2 border-emerald-400'
                          : 'bg-indigo-500/40 border border-white/20'}`}
                      style={{ 
                        backfaceVisibility: "hidden", 
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)" 
                      }}
                    >
                      {card.content}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Game stats for medium-large screens (horizontal layout) */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-64 md:mt-0">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Game Stats</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Time</p>
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 mr-2 text-white/80" />
                    <span className="text-xl font-medium text-white">{formatTime(timer)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-white/60 text-sm mb-1">Moves</p>
                  <p className="text-xl font-medium text-white">{moves}</p>
                </div>
                
                <div>
                  <p className="text-white/60 text-sm mb-1">Progress</p>
                  <div className="flex items-center">
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" 
                        style={{ width: `${(matchedPairs / pairs) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-white text-sm">
                      {matchedPairs} / {pairs}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Difficulty</h3>
              <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block
                ${difficulty === 'easy' 
                  ? 'bg-green-500/20 text-green-400' 
                  : difficulty === 'medium' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </p>
            </div>
            
            <button 
              onClick={resetGame}
              className="w-full py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 transition border border-white/10 text-white"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 