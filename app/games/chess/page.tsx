"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  ChevronRight,
  RefreshCcw,
  AlertCircle,
  Undo2,
  Redo2,
  Users,
  Cpu,
  Trophy,
  Flag,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  Array(8).fill(""),
  Array(8).fill(""),
  Array(8).fill(""),
  Array(8).fill(""),
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

type GameState = {
  board: string[][];
  currentPlayer: "white" | "black";
  moves: string[];
  isCheck: boolean;
  isCheckmate: boolean;
  isGameOver: boolean;
  winner: "white" | "black" | null;
  capturedPieces?: {white: string[], black: string[]};
};

type GameMode = "cpu" | "player" | null;

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<{row: number; col: number} | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const [moves, setMoves] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"white" | "black" | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<{row: number; col: number}[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{white: string[], black: string[]}>({
    white: [], // pieces captured by white player
    black: []  // pieces captured by black player
  });
  
  // History states for undo/redo
  const [history, setHistory] = useState<GameState[]>([{
    board: initialBoard,
    currentPlayer: "white",
    moves: [],
    isCheck: false,
    isCheckmate: false,
    isGameOver: false,
    winner: null,
    capturedPieces: { white: [], black: [] }
  }]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (gameMode === "cpu" && currentPlayer === "black" && !isGameOver) {
      // Add a small delay to make CPU moves feel more natural
      const timeoutId = setTimeout(makeCPUMove, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, gameMode, isGameOver]);


  // Check if there are any legal moves available
  const hasLegalMoves = (boardState: string[][], isWhitePlayer: boolean) => {
    // For each piece of the current player
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        // Check if piece exists and belongs to the current player
        if (piece && (piece === piece.toUpperCase()) === isWhitePlayer) {
          // Calculate all possible moves for this piece
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (isValidMoveForBoard(boardState, row, col, i, j)) {
                // Create a test board to check if the move would get out of check
                const testBoard = boardState.map(r => [...r]);
                testBoard[i][j] = testBoard[row][col];
                testBoard[row][col] = "";
                
                // If this move gets us out of check, we're not in checkmate
                if (!isKingInCheckForBoard(testBoard, isWhitePlayer)) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    // If we've checked all pieces and moves and found nothing, we're in checkmate
    return false;
  };

  // Modified isKingInCheck to work with any board state
  const isKingInCheckForBoard = (boardState: string[][], isWhiteKing: boolean) => {
    // Find king position
    let kingRow = -1, kingCol = -1;
    const kingPiece = isWhiteKing ? 'K' : 'k';
    
    // First, make sure the king exists
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col] === kingPiece) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    // King not found on the board
    if (kingRow === -1) {
      return false;
    }

    // Check if any opponent piece can capture the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && isWhiteKing !== (piece === piece.toUpperCase())) {
          // For direct move validation, we need to check raw piece movement
          if (canPieceCaptureKing(boardState, row, col, kingRow, kingCol)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Helper function to check if a piece can directly capture the king
  // This bypasses the normal isValidMove which might have recursive check detection
  const canPieceCaptureKing = (
    boardState: string[][], 
    fromRow: number, 
    fromCol: number, 
    kingRow: number, 
    kingCol: number
  ): boolean => {
    const piece = boardState[fromRow][fromCol];
    if (!piece) return false;
    
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    // Check based on piece type
    switch (pieceType) {
      case 'p': // Pawn
        const direction = isWhite ? -1 : 1;
        // Pawns can only capture diagonally
        return Math.abs(fromCol - kingCol) === 1 && 
               (fromRow + direction) === kingRow;

      case 'r': // Rook
        // Rooks move in straight lines
        if (fromRow !== kingRow && fromCol !== kingCol) return false;
        
        const rookDeltaRow = Math.sign(kingRow - fromRow);
        const rookDeltaCol = Math.sign(kingCol - fromCol);
        let rookCurRow = fromRow + rookDeltaRow;
        let rookCurCol = fromCol + rookDeltaCol;
        
        while (rookCurRow !== kingRow || rookCurCol !== kingCol) {
          if (boardState[rookCurRow][rookCurCol] !== '') return false;
          rookCurRow += rookDeltaRow;
          rookCurCol += rookDeltaCol;
        }
        return true;

      case 'n': // Knight
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        return knightMoves.some(([dRow, dCol]) => 
          fromRow + dRow === kingRow && fromCol + dCol === kingCol
        );

      case 'b': // Bishop
        // Bishops move diagonally
        if (Math.abs(kingRow - fromRow) !== Math.abs(kingCol - fromCol)) return false;
        
        const bishopDeltaRow = Math.sign(kingRow - fromRow);
        const bishopDeltaCol = Math.sign(kingCol - fromCol);
        let bishopCurRow = fromRow + bishopDeltaRow;
        let bishopCurCol = fromCol + bishopDeltaCol;
        
        while (bishopCurRow !== kingRow && bishopCurCol !== kingCol) {
          if (boardState[bishopCurRow][bishopCurCol] !== '') return false;
          bishopCurRow += bishopDeltaRow;
          bishopCurCol += bishopDeltaCol;
        }
        return true;

      case 'q': // Queen (combination of Rook and Bishop moves)
        if (fromRow === kingRow || fromCol === kingCol) {
          // Rook-like movement (straight lines)
          const deltaRow = Math.sign(kingRow - fromRow);
          const deltaCol = Math.sign(kingCol - fromCol);
          let curRow = fromRow + deltaRow;
          let curCol = fromCol + deltaCol;
          
          while (curRow !== kingRow || curCol !== kingCol) {
            if (boardState[curRow][curCol] !== '') return false;
            curRow += deltaRow;
            curCol += deltaCol;
          }
          return true;
        } else if (Math.abs(kingRow - fromRow) === Math.abs(kingCol - fromCol)) {
          // Bishop-like movement (diagonal)
          const deltaRow = Math.sign(kingRow - fromRow);
          const deltaCol = Math.sign(kingCol - fromCol);
          let curRow = fromRow + deltaRow;
          let curCol = fromCol + deltaCol;
          
          while (curRow !== kingRow && curCol !== kingCol) {
            if (boardState[curRow][curCol] !== '') return false;
            curRow += deltaRow;
            curCol += deltaCol;
          }
          return true;
        }
        return false;

      case 'k': // King
        // Kings can only capture adjacent squares
        return Math.abs(kingRow - fromRow) <= 1 && Math.abs(kingCol - fromCol) <= 1;
    }
    
    return false;
  };

  const makeCPUMove = () => {
    // Get all possible moves for black pieces
    const allPossibleMoves: { from: { row: number; col: number }; to: { row: number; col: number } }[] = [];
    
    // Collect all possible moves for each black piece
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece === piece.toLowerCase()) { // black piece
          const moves = calculatePossibleMoves(row, col);
          moves.forEach((move: {row: number; col: number}) => {
            allPossibleMoves.push({
              from: { row, col },
              to: move
            });
          });
        }
      }
    }

    if (allPossibleMoves.length > 0) {
      // Choose a random move from all possible moves
      const randomMove = allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
      
      // Execute the move
      const newBoard = board.map(row => [...row]);
      const movingPiece = newBoard[randomMove.from.row][randomMove.from.col];
      const targetPiece = newBoard[randomMove.to.row][randomMove.to.col];
      const isCapturingKing = targetPiece === 'K';
      
      newBoard[randomMove.to.row][randomMove.to.col] = movingPiece;
      newBoard[randomMove.from.row][randomMove.from.col] = "";
      
      const newMoves = [...moves, `${movingPiece}${String.fromCharCode(97 + randomMove.from.col)}${8 - randomMove.from.row} → ${String.fromCharCode(97 + randomMove.to.col)}${8 - randomMove.to.row}`];
      
      // Update captured pieces
      const newCapturedPieces = {...capturedPieces};
      if (targetPiece) {
        newCapturedPieces.black.push(targetPiece);
      }
      
      // By default, switch to white player
      let newPlayer: "white" | "black" = "white";
      
      // Check game ending conditions
      let newCheck = false;
      let newCheckmate = false;
      let newGameOver = false;
      let newWinner: "white" | "black" | null = null;
      
      if (isCapturingKing) {
        // King captured, game over
        newGameOver = true;
        newWinner = "black";
        newMoves.push("Black captured the king!");
        // Don't switch player on game over
        newPlayer = "black";
      } else {
        // Check if White king is in check or checkmate
        newCheck = isKingInCheckForBoard(newBoard, true);
        
        if (newCheck) {
          // Check if it's checkmate (no legal moves available)
          newCheckmate = !hasLegalMoves(newBoard, true);
          if (newCheckmate) {
            // If checkmate, game is over immediately
            newGameOver = true;
            newWinner = "black";
            newMoves.push("Black wins by checkmate!");
            // Don't switch player on checkmate
            newPlayer = "black";
          } else {
            newMoves.push("White is in check!");
          }
        }
      }
      
      // Update the game state
      setBoard(newBoard);
      setCurrentPlayer(newPlayer);
      setMoves(newMoves);
      setIsCheck(newCheck);
      setIsCheckmate(newCheckmate);
      setIsGameOver(newGameOver);
      setWinner(newWinner);
      setCapturedPieces(newCapturedPieces);
      
      // Add the new state to history
      const newState: GameState = {
        board: newBoard,
        currentPlayer: newPlayer,
        moves: newMoves,
        isCheck: newCheck,
        isCheckmate: newCheckmate,
        isGameOver: newGameOver,
        winner: newWinner,
        capturedPieces: newCapturedPieces
      };
      
      const newHistory = history.slice(0, currentStep + 1);
      setHistory([...newHistory, newState]);
      setCurrentStep(currentStep + 1);
    }
  };

  const getPieceSymbol = (piece: string) => {
    // Use the same icon style for both white and black pieces
    const symbols: { [key: string]: { symbol: string, scale?: string } } = {
      // Black pieces (lowercase)
      'k': { symbol: '♚' },
      'q': { symbol: '♛' },
      'r': { symbol: '♜' },
      'b': { symbol: '♝' },
      'n': { symbol: '♞' },
      'p': { symbol: '♟', scale: 'scale-75' },
      
      // White pieces (uppercase) using the same symbols
      'K': { symbol: '♚' },
      'Q': { symbol: '♛' },
      'R': { symbol: '♜' },
      'B': { symbol: '♝' },
      'N': { symbol: '♞' },
      'P': { symbol: '♟', scale: 'scale-75' }
    };
    return symbols[piece] || { symbol: '' };
  };


  const isSameColor = (piece1: string, piece2: string) => {
    return (piece1.toUpperCase() === piece1) === (piece2.toUpperCase() === piece2);
  };

  // Calculate possible moves for a given board state
  const calculatePossibleMovesForBoard = (boardState: string[][], row: number, col: number) => {
    const possibleMoves: {row: number; col: number}[] = [];
    const piece = boardState[row][col];
    if (!piece) return possibleMoves;
    
    const isWhitePiece = piece === piece.toUpperCase();
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isValidMoveForBoard(boardState, row, col, i, j)) {
          // Create a test board to check if the move would put own king in check
          const testBoard = boardState.map(r => [...r]);
          testBoard[i][j] = testBoard[row][col];
          testBoard[row][col] = "";
          
          // Make sure this move doesn't leave our own king in check
          if (!isKingInCheckForBoard(testBoard, isWhitePiece)) {
            possibleMoves.push({row: i, col: j});
          }
        }
      }
    }
    
    return possibleMoves;
  };

  // Modified isValidMove to work with any board state
  const isValidMoveForBoard = (boardState: string[][], fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const piece = boardState[fromRow][fromCol];
    const targetPiece = boardState[toRow][toCol];
    
    if (!piece) return false;
    if (targetPiece && isSameColor(piece, targetPiece)) return false;
    
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    switch (pieceType) {
      case 'p': // Pawn
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // Basic move
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && 
              toRow === fromRow + 2 * direction && 
              !boardState[fromRow + direction][fromCol]) return true;
        }
        
        // Capture
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
          if (targetPiece && !isSameColor(piece, targetPiece)) return true;
        }
        return false;

      case 'r': // Rook
        if (fromRow !== toRow && fromCol !== toCol) return false;
        const rookDeltaRow = Math.sign(toRow - fromRow);
        const rookDeltaCol = Math.sign(toCol - fromCol);
        let rookCurRow = fromRow + rookDeltaRow;
        let rookCurCol = fromCol + rookDeltaCol;
        
        while (rookCurRow !== toRow || rookCurCol !== toCol) {
          if (boardState[rookCurRow][rookCurCol] !== '') return false;
          rookCurRow += rookDeltaRow;
          rookCurCol += rookDeltaCol;
        }
        return true;

      case 'n': // Knight
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        return knightMoves.some(([dRow, dCol]) => 
          fromRow + dRow === toRow && fromCol + dCol === toCol
        );

      case 'b': // Bishop
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        const bishopDeltaRow = Math.sign(toRow - fromRow);
        const bishopDeltaCol = Math.sign(toCol - fromCol);
        let bishopCurRow = fromRow + bishopDeltaRow;
        let bishopCurCol = fromCol + bishopDeltaCol;
        
        while (bishopCurRow !== toRow && bishopCurCol !== toCol) {
          if (boardState[bishopCurRow][bishopCurCol] !== '') return false;
          bishopCurRow += bishopDeltaRow;
          bishopCurCol += bishopDeltaCol;
        }
        return true;

      case 'q': // Queen (combination of Rook and Bishop moves)
        if (fromRow === toRow || fromCol === toCol) {
          // Rook-like movement
          const deltaRow = Math.sign(toRow - fromRow);
          const deltaCol = Math.sign(toCol - fromCol);
          let curRow = fromRow + deltaRow;
          let curCol = fromCol + deltaCol;
          
          while (curRow !== toRow || curCol !== toCol) {
            if (boardState[curRow][curCol] !== '') return false;
            curRow += deltaRow;
            curCol += deltaCol;
          }
          return true;
        } else if (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) {
          // Bishop-like movement
          const deltaRow = Math.sign(toRow - fromRow);
          const deltaCol = Math.sign(toCol - fromCol);
          let curRow = fromRow + deltaRow;
          let curCol = fromCol + deltaCol;
          
          while (curRow !== toRow && curCol !== toCol) {
            if (boardState[curRow][curCol] !== '') return false;
            curRow += deltaRow;
            curCol += deltaCol;
          }
          return true;
        }
        return false;

      case 'k': // King
        return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
    }
    
    return false;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (isGameOver || (gameMode === "cpu" && currentPlayer === "black")) return; // Prevent moves if game over or during CPU turn
    
    const piece = board[row][col];
    const isWhitePiece = piece === piece.toUpperCase();
    
    if (selectedPiece === null) {
      if (piece && ((currentPlayer === "white" && isWhitePiece) || (currentPlayer === "black" && !isWhitePiece))) {
        setSelectedPiece({ row, col });
        setPossibleMoves(calculatePossibleMoves(row, col));
      }
    } else {
      if (possibleMoves.some(move => move.row === row && move.col === col)) {
        const newBoard = board.map(row => [...row]);
        const movingPiece = newBoard[selectedPiece.row][selectedPiece.col];
        const targetPiece = newBoard[row][col];
        const isCapturingKing = targetPiece === 'k' || targetPiece === 'K';
        
        newBoard[row][col] = movingPiece;
        newBoard[selectedPiece.row][selectedPiece.col] = "";
        
        const newMoves = [...moves, `${movingPiece}${String.fromCharCode(97 + selectedPiece.col)}${8 - selectedPiece.row} → ${String.fromCharCode(97 + col)}${8 - row}`];
        
        // Update captured pieces
        const newCapturedPieces = {...capturedPieces};
        if (targetPiece) {
          if (currentPlayer === "white") {
            newCapturedPieces.white.push(targetPiece);
          } else {
            newCapturedPieces.black.push(targetPiece);
          }
        }
        
        // By default, switch to the next player
        let newPlayer: "white" | "black" = currentPlayer === "white" ? "black" : "white";
        
        // Check game ending conditions
        let newCheck = false;
        let newCheckmate = false;
        let newGameOver = false;
        let newWinner: "white" | "black" | null = null;
        
        if (isCapturingKing) {
          // King captured, game over
          newGameOver = true;
          newWinner = currentPlayer;
          newMoves.push(`${currentPlayer === "white" ? "White" : "Black"} captured the king!`);
          // Don't switch player on game over
          newPlayer = currentPlayer;
        } else {
          // Check if opponent's king is in check or checkmate
          // If white moved, check black king; if black moved, check white king
          const opponentIsWhite = currentPlayer === "black"; // Check the opponent's king
          
          newCheck = isKingInCheckForBoard(newBoard, opponentIsWhite);
          
          if (newCheck) {
            // Check if it's checkmate (no legal moves available)
            newCheckmate = !hasLegalMoves(newBoard, opponentIsWhite);
            if (newCheckmate) {
              // If checkmate, game is over immediately
              newGameOver = true;
              newWinner = currentPlayer;
              newMoves.push(`${currentPlayer === "white" ? "White" : "Black"} wins by checkmate!`);
              // Don't switch player on checkmate
              newPlayer = currentPlayer;
            } else {
              newMoves.push(`${opponentIsWhite ? "White" : "Black"} is in check!`);
            }
          }
        }
        
        // Update the game state
        setBoard(newBoard);
        setCurrentPlayer(newPlayer);
        setMoves(newMoves);
        setIsCheck(newCheck);
        setIsCheckmate(newCheckmate);
        setIsGameOver(newGameOver);
        setWinner(newWinner);
        setCapturedPieces(newCapturedPieces);
        
        // Add the new state to history
        const newState: GameState = {
          board: newBoard,
          currentPlayer: newPlayer,
          moves: newMoves,
          isCheck: newCheck,
          isCheckmate: newCheckmate,
          isGameOver: newGameOver,
          winner: newWinner,
          capturedPieces: newCapturedPieces
        };
        
        // Remove any future states if we're not at the latest move
        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, newState]);
        setCurrentStep(currentStep + 1);
      }
      setSelectedPiece(null);
      setPossibleMoves([]);
    }
  };

  const resetGame = () => {
    setGameMode(null);
    setBoard(initialBoard);
    setSelectedPiece(null);
    setCurrentPlayer("white");
    setMoves([]);
    setIsCheck(false);
    setIsCheckmate(false);
    setIsGameOver(false);
    setWinner(null);
    setPossibleMoves([]);
    setCapturedPieces({ white: [], black: [] });
    setHistory([{
      board: initialBoard,
      currentPlayer: "white",
      moves: [],
      isCheck: false,
      isCheckmate: false,
      isGameOver: false,
      winner: null,
      capturedPieces: { white: [], black: [] }
    }]);
    setCurrentStep(0);
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      const previousState = history[currentStep - 1];
      setBoard(previousState.board);
      setCurrentPlayer(previousState.currentPlayer);
      setMoves(previousState.moves);
      setIsCheck(previousState.isCheck);
      setIsCheckmate(previousState.isCheckmate);
      setIsGameOver(previousState.isGameOver);
      setWinner(previousState.winner);
      setCapturedPieces(previousState.capturedPieces || { white: [], black: [] });
      setCurrentStep(currentStep - 1);
      setPossibleMoves([]);
      setSelectedPiece(null);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      const nextState = history[currentStep + 1];
      setBoard(nextState.board);
      setCurrentPlayer(nextState.currentPlayer);
      setMoves(nextState.moves);
      setIsCheck(nextState.isCheck);
      setIsCheckmate(nextState.isCheckmate);
      setIsGameOver(nextState.isGameOver);
      setWinner(nextState.winner);
      setCapturedPieces(nextState.capturedPieces || { white: [], black: [] });
      setCurrentStep(currentStep + 1);
      setPossibleMoves([]);
      setSelectedPiece(null);
    }
  };

  // Add a surrender function
  const handleSurrender = () => {
    if (isGameOver) return;
    
    // The player who surrenders loses
    const surrenderingPlayer = currentPlayer;
    const newWinner = surrenderingPlayer === "white" ? "black" : "white";
    
    // Record the surrender in the move history
    const newMoves = [...moves, `${surrenderingPlayer === "white" ? "White" : "Black"} surrendered`];
    
    // Update game state
    setIsGameOver(true);
    setWinner(newWinner);
    setMoves(newMoves);
    
    // Update history
    const newState: GameState = {
      board,
      currentPlayer,
      moves: newMoves,
      isCheck,
      isCheckmate,
      isGameOver: true,
      winner: newWinner,
      capturedPieces
    };
    
    const newHistory = history.slice(0, currentStep + 1);
    setHistory([...newHistory, newState]);
    setCurrentStep(currentStep + 1);
  };


  // Original calculated possible moves that uses the current board state
  const calculatePossibleMoves = (row: number, col: number) => {
    return calculatePossibleMovesForBoard(board, row, col);
  };

  // Add captured pieces display in the UI
  const renderCapturedPieces = (pieces: string[], title: string, isWhitePlayer: boolean) => (
    <div className={`flex flex-col ${isWhitePlayer ? 'items-start' : 'items-end'}`}>
      <h4 className="text-sm font-medium text-gray-400 mb-1 sm:mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-1 sm:gap-2">
        {pieces.length === 0 ? (
          <span className="text-gray-500 text-xs col-span-2">None</span>
        ) : (
          pieces.map((piece, index) => (
            <span key={index} className={`
              text-xl sm:text-2xl md:text-3xl flex justify-center 
              ${piece === piece.toUpperCase() && piece !== 'P' 
                ? 'text-white' 
                : 'text-black'
              }
              ${getPieceSymbol(piece).scale || ''}
              ${piece === 'k' || piece === 'K' ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : ''}
              ${piece === piece.toUpperCase() ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]' : 'drop-shadow-[0_2px_2px_rgba(255,255,255,0.1)]'}
              ${piece === 'P' ? 'filter invert brightness-0' : ''}
            `}>
              {getPieceSymbol(piece).symbol}
            </span>
          ))
        )}
      </div>
    </div>
  );

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1b1e] to-[#2d2e35] flex items-center justify-center p-4">
        <div className="text-center space-y-10 max-w-full">
          <div className="absolute left-20 top-12">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#3a3d45]/30">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Home
              </Button>
            </Link>
          </div>
        
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            <span className="text-[#ffd700]">Chess</span> Game
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-6">
            Choose a game mode to start playing. Challenge a friend or test your skills against the CPU.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => setGameMode("player")}
              className="bg-gradient-to-r from-[#3a3d45] to-[#2c2e33] hover:from-[#42454e] hover:to-[#36383e] text-white p-6 md:p-8 flex gap-3 items-center rounded-xl shadow-lg border border-[#3a3d45]/30 relative overflow-hidden group w-64 sm:w-56 md:w-64 mx-auto sm:mx-0"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="text-[120px] text-white">♞</span>
              </div>
              <div className="bg-[#ffd700]/10 p-3 rounded-full flex items-center justify-center z-10">
                <Users className="w-6 h-6 text-[#ffd700]" />
              </div>
              <span className="text-lg font-medium z-10 whitespace-nowrap">Player vs Player</span>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffd700]/70 to-[#ffd700]/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Button>
            
            <Button
              onClick={() => setGameMode("cpu")}
              className="bg-gradient-to-r from-[#3a3d45] to-[#2c2e33] hover:from-[#42454e] hover:to-[#36383e] text-white p-6 md:p-8 flex gap-3 items-center rounded-xl shadow-lg border border-[#3a3d45]/30 relative overflow-hidden group w-64 sm:w-56 md:w-64 mx-auto sm:mx-0"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="text-[120px] text-white top-[-10px] relative">♚</span>
              </div>
              <div className="bg-[#ffd700]/10 p-3 rounded-full flex items-center justify-center z-10">
                <Cpu className="w-6 h-6 text-[#ffd700]" />
              </div>
              <span className="text-lg font-medium z-10 whitespace-nowrap">Player vs CPU</span>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffd700]/70 to-[#ffd700]/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b1e] to-[#2d2e35] p-1 sm:p-2 md:p-4 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center mb-3 sm:mb-6 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Link href="#" onClick={() => setGameMode(null)}>
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#3a3d45]/30 p-2 sm:p-3">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white">
            <span className="text-[#ffd700]">Chess</span> Game
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
            {gameMode === "player" ? "Player vs Player" : "Player vs CPU"} Mode
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
          <div className="w-full lg:flex-1">
            <Card className="p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-b from-[#2c2e33] to-[#232529] border-[#3a3d45]/40 rounded-xl shadow-xl">
              <div className="flex items-start justify-center gap-2 sm:gap-4">
                {/* Black captures (left side) */}
                <div className="hidden md:block w-16 lg:w-20 xl:w-24">
                  {renderCapturedPieces(capturedPieces.black, "Black Captures", false)}
                </div>
                
                {/* Chess board */}
                <div className="grid grid-cols-8 gap-[1px] sm:gap-1 bg-[#1a1b1e] p-1 sm:p-2 md:p-3 rounded-lg aspect-square w-full max-w-[min(90vh,100%)] mx-auto overflow-hidden shadow-inner">
                  {board.map((row, rowIndex) => (
                    row.map((piece, colIndex) => {
                      const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                      const isPossibleMove = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);
                      const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            aspect-square flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl cursor-pointer relative
                            ${isWhiteSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}
                            ${isSelected ? 'ring-1 sm:ring-2 ring-[#ffd700]' : ''}
                            ${isPossibleMove ? 'ring-1 sm:ring-2 ring-[#4CAF50]' : ''}
                            ${isGameOver ? 'opacity-90' : 'hover:ring-1 hover:ring-[#ffd700]/70 transition-all'}
                            shadow-sm
                          `}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                        >
                          {isPossibleMove && !piece && (
                            <div className="absolute w-1 h-1 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-[#4CAF50] rounded-full opacity-60" />
                          )}
                          {isPossibleMove && piece && (
                            <div className="absolute inset-0 bg-[#4CAF50] opacity-20 rounded-sm" />
                          )}
                          <span className={`
                            ${piece === piece.toUpperCase() && piece !== 'P' 
                              ? 'text-white' 
                              : 'text-black'
                            }
                            ${getPieceSymbol(piece).scale || ''}
                            text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl relative z-10
                            ${piece === 'k' || piece === 'K' ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : ''}
                            ${piece === piece.toUpperCase() ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]' : 'drop-shadow-[0_2px_2px_rgba(255,255,255,0.1)]'}
                            ${piece === 'P' ? 'filter invert brightness-0' : ''}
                          `}>
                            {getPieceSymbol(piece).symbol}
                          </span>
                        </div>
                      );
                    })
                  ))}
                </div>
                
                {/* White captures (right side) */}
                <div className="hidden md:block w-16 lg:w-20 xl:w-24">
                  {renderCapturedPieces(capturedPieces.white, "White Captures", true)}
                </div>
              </div>
              
              {/* Mobile view for captured pieces */}
              <div className="flex justify-between md:hidden mt-4">
                <div className="w-1/2 pr-2">
                  <h4 className="text-sm font-medium text-gray-400 mb-1 sm:mb-2">Black Captures</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {capturedPieces.black.length === 0 ? (
                      <span className="text-gray-500 text-xs col-span-2">None</span>
                    ) : (
                      capturedPieces.black.map((piece, index) => (
                        <span key={index} className={`
                          text-xl sm:text-2xl flex justify-center 
                          ${piece === piece.toUpperCase() && piece !== 'P' 
                            ? 'text-white' 
                            : 'text-black'
                          }
                          ${getPieceSymbol(piece).scale || ''}
                          ${piece === 'k' || piece === 'K' ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : ''}
                          ${piece === piece.toUpperCase() ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]' : 'drop-shadow-[0_2px_2px_rgba(255,255,255,0.1)]'}
                          ${piece === 'P' ? 'filter invert brightness-0' : ''}
                        `}>
                          {getPieceSymbol(piece).symbol}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="w-1/2 pl-2 text-right">
                  <h4 className="text-sm font-medium text-gray-400 mb-1 sm:mb-2">White Captures</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {capturedPieces.white.length === 0 ? (
                      <span className="text-gray-500 text-xs col-span-2 text-center">None</span>
                    ) : (
                      capturedPieces.white.map((piece, index) => (
                        <span key={index} className={`
                          text-xl sm:text-2xl flex justify-center
                          ${piece === piece.toUpperCase() && piece !== 'P' 
                            ? 'text-white' 
                            : 'text-black'
                          }
                          ${getPieceSymbol(piece).scale || ''}
                          ${piece === 'k' || piece === 'K' ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : ''}
                          ${piece === piece.toUpperCase() ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]' : 'drop-shadow-[0_2px_2px_rgba(255,255,255,0.1)]'}
                          ${piece === 'P' ? 'filter invert brightness-0' : ''}
                        `}>
                          {getPieceSymbol(piece).symbol}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="w-full lg:w-64 xl:w-72 mt-2 lg:mt-0">
            <Card className="p-3 sm:p-4 md:p-5 bg-gradient-to-b from-[#2c2e33] to-[#232529] border-[#3a3d45]/40 text-white rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-5">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffd700]" />
                  {isGameOver ? (
                    <span className="font-semibold text-[#ffd700] text-base sm:text-lg">
                      {winner === "white" ? "White" : "Black"} wins!
                    </span>
                  ) : (
                    <span className="font-medium text-white/90 text-sm sm:text-base md:text-lg">
                      {currentPlayer === "white" ? "White's Turn" : "Black's Turn"}
                      {gameMode === "cpu" && currentPlayer === "black" && " (CPU)"}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleUndo}
                    disabled={currentStep === 0 || (gameMode === "cpu" && currentPlayer === "black")}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-[#ffd700]/60 text-[#ffd700] hover:bg-[#ffd700]/10 disabled:opacity-50"
                  >
                    <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleRedo}
                    disabled={currentStep === history.length - 1 || (gameMode === "cpu" && currentPlayer === "black")}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-[#ffd700]/60 text-[#ffd700] hover:bg-[#ffd700]/10 disabled:opacity-50"
                  >
                    <Redo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={resetGame}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-[#ffd700]/60 text-[#ffd700] hover:bg-[#ffd700]/10"
                  >
                    <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
              
              {isGameOver ? (
                <div className="mb-3 sm:mb-5 p-2 sm:p-3 bg-gradient-to-r from-[#ffd700]/20 to-[#ffd700]/10 text-[#ffd700] rounded-lg flex items-center gap-1 sm:gap-2 shadow-inner">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">{isCheckmate ? "Checkmate!" : "Game Over!"}</span>
                </div>
              ) : isCheck && (
                <div className="mb-3 sm:mb-5 p-2 sm:p-3 bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-300 rounded-lg flex items-center gap-1 sm:gap-2 shadow-inner">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Check!</span>
                </div>
              )}
              
              {/* Add surrender button */}
              {!isGameOver && gameMode && (
                <Button
                  variant="outline"
                  onClick={handleSurrender}
                  disabled={(gameMode === "cpu" && currentPlayer === "black")}
                  className="w-full mb-3 sm:mb-5 py-1 sm:py-2 border-red-500/60 text-red-400 hover:bg-red-500/10 disabled:opacity-50 font-medium rounded-lg text-sm sm:text-base"
                >
                  <Flag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Surrender
                </Button>
              )}
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#ffd700] text-base sm:text-lg">Move History</h3>
                  <span className="text-xs text-gray-400">Total: {moves.length}</span>
                </div>
                <div className="h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] overflow-y-auto space-y-1 sm:space-y-1.5 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-[#ffd700]/20 scrollbar-track-transparent rounded-lg p-2 sm:p-3 bg-[#1a1b1e]/80 shadow-inner">
                  {moves.length === 0 ? (
                    <p className="text-center text-gray-500 text-xs sm:text-sm pt-4">No moves yet</p>
                  ) : (
                    moves.map((move, index) => (
                      <div key={index} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 border-b border-gray-800/60 last:border-0">
                        <span className="text-[#ffd700]/60 font-mono">{index + 1}.</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffd700]/60" />
                        <span className="text-white/90">{move}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}