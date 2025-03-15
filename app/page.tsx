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
} from "lucide-react";

import { GameMode, GameState } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { LineShadowTextComp } from "@/components/lineShadowText";

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

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [board, setBoard] = useState(initialBoard);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">(
    "white"
  );
  const [moves, setMoves] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<
    { row: number; col: number }[]
  >([]);

  // History states for undo/redo
  const [history, setHistory] = useState<GameState[]>([
    {
      board: initialBoard,
      currentPlayer: "white",
      moves: [],
      isCheck: false,
      capturedPieces: { white: [], black: [] },
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const [capturedPieces, setCapturedPieces] = useState<{
    white: string[];
    black: string[];
  }>({
    white: [],
    black: [],
  });
  const [gameStatus, setGameStatus] = useState<"ongoing" | "checkmate" | "stalemate" | null>(null);
  const [cpuTimeoutOccurred, setCpuTimeoutOccurred] = useState(false);

  // Add a state to track if a king is in check
  const [whiteKingInCheck, setWhiteKingInCheck] = useState(false);
  const [blackKingInCheck, setBlackKingInCheck] = useState(false);

  useEffect(() => {
    if (gameMode === "cpu" && currentPlayer === "black") {
      const timeoutId = setTimeout(() => {
        setCpuTimeoutOccurred(true);
        setGameStatus("checkmate");
        setCurrentPlayer("white");
      }, 5000);

      const moveTimeoutId = setTimeout(() => {
        makeCPUMove();
        clearTimeout(timeoutId);
      }, 1000);

      // Cleanup function
      return () => {
        clearTimeout(moveTimeoutId);
        clearTimeout(timeoutId);
      };
    }
  }, [currentPlayer, gameMode]);

  const makeCPUMove = () => {
    if (gameStatus === "checkmate" || cpuTimeoutOccurred) {
      return;
    }

    const allPossibleMoves: {
      from: { row: number; col: number };
      to: { row: number; col: number };
    }[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece === piece.toLowerCase()) {
          const moves = calculatePossibleMoves(row, col);
          moves.forEach((move) => {
            if (isValidMove(row, col, move.row, move.col)) {
              allPossibleMoves.push({
                from: { row, col },
                to: move,
              });
            }
          });
        }
      }
    }

    if (allPossibleMoves.length > 0) {
      const randomMove =
        allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];

      const newBoard = board.map((row) => [...row]);
      const movingPiece = newBoard[randomMove.from.row][randomMove.from.col];
      const capturedPiece = newBoard[randomMove.to.row][randomMove.to.col];

      if (capturedPiece?.toLowerCase() === 'k') {
        setGameStatus("checkmate");
        setCapturedPieces(prev => {
          const isWhiteCaptured = capturedPiece === capturedPiece.toUpperCase();
          return {
            white: isWhiteCaptured ? [...prev.white, capturedPiece] : prev.white,
            black: !isWhiteCaptured ? [...prev.black, capturedPiece] : prev.black,
          };
        });
        newBoard[randomMove.to.row][randomMove.to.col] = movingPiece;
        newBoard[randomMove.from.row][randomMove.from.col] = "";
        setBoard(newBoard);
        return;
      }

      if (capturedPiece) {
        setCapturedPieces(prev => {
          const isWhiteCaptured = capturedPiece === capturedPiece.toUpperCase();
          return {
            white: isWhiteCaptured ? [...prev.white, capturedPiece] : prev.white,
            black: !isWhiteCaptured ? [...prev.black, capturedPiece] : prev.black,
          };
        });
      }

      newBoard[randomMove.to.row][randomMove.to.col] = movingPiece;
      newBoard[randomMove.from.row][randomMove.from.col] = "";

      const newMoves = [
        ...moves,
        `${
          movingPiece === movingPiece.toUpperCase() ? "White → " : "Black → "
        }${String.fromCharCode(97 + randomMove.from.col)}${
          8 - randomMove.from.row
        } → ${String.fromCharCode(97 + randomMove.to.col)}${8 - randomMove.to.row}`,
      ];
      const newCheck = isKingInCheck(newBoard, true);

      if (newCheck) {
        const isCheckmated = isCheckmate(newBoard, true);
        if (isCheckmated) {
          setGameStatus("checkmate");
          console.log("Checkmate detected!");
          setCurrentPlayer(currentPlayer);
        }
      }

      setBoard(newBoard);
      setCurrentPlayer("white");
      setMoves(newMoves);
      setIsCheck(newCheck);

      const newState: GameState = {
        board: newBoard,
        currentPlayer: currentPlayer as "white" | "black",
        moves: newMoves,
        isCheck: newCheck,
        capturedPieces: { ...capturedPieces },
      };

      const newHistory: GameState[] = history.slice(0, currentStep + 1);
      setHistory([...newHistory, newState]);
      setCurrentStep(currentStep + 1);

      console.log("Game Status:", gameStatus);
      console.log("Current Player:", currentPlayer);
      console.log("Is Check:", newCheck);
      console.log("Is Checkmate:", isCheckmate(newBoard, true));
      console.log("White King in Check:", whiteKingInCheck);
      console.log("Black King in Check:", blackKingInCheck);

      // Check if the opponent has any legal moves
      const hasNoMoves = !newBoard.some((row, rowIndex) =>
        row.some((piece, colIndex) => {
          if (
            piece &&
            ((currentPlayer === "white" && piece === piece.toUpperCase()) ||
              (currentPlayer === "black" && piece === piece.toLowerCase()))
          ) {
            const moves = calculatePossibleMoves(rowIndex, colIndex);
            return moves.length > 0;
          }
          return false;
        })
      );

      if (hasNoMoves) {
        if (newCheck) {
          setGameStatus("checkmate");
          console.log("Checkmate! No possible moves.");
        } else {
          setGameStatus("stalemate");
          console.log("Stalemate! No possible moves.");
        }
        setCurrentPlayer(currentPlayer);
      }
    }
  };

  const getPieceSymbol = (piece: string) => {
    const symbols: { [key: string]: string } = {
      k: "♚", // black coin
      q: "♛", // black coin
      r: "♜", // black coin
      b: "♝", // black coin
      n: "♞", // black coin
      p: "♙", // black coin
      K: "♚", // white coin
      Q: "♛", // white coin
      R: "♜", // white coin
      B: "♝", // white coin
      N: "♞", // white coin
      P: "♙", // white coin
    };
    return symbols[piece] || "";
  };

  const getPieceSymbolWithColor = (piece: string) => {
    const symbol = getPieceSymbol(piece);
    const isWhite = piece === piece.toUpperCase();
    return { symbol, isWhite };
  };

  // const isInBounds = (row: number, col: number) => {
  //   return row >= 0 && row < 8 && col >= 0 && col < 8;
  // };

  const isSameColor = (piece1: string, piece2: string) => {
    return (
      (piece1.toUpperCase() === piece1) === (piece2.toUpperCase() === piece2)
    );
  };

  const isValidMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => {
    // Check if the target position is within bounds
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;

    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];

    if (targetPiece && isSameColor(piece, targetPiece)) return false;

    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    // Add logic for each piece type
    switch (pieceType) {
      case "p": // Pawn
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // Basic move
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (
            fromRow === startRow &&
            toRow === fromRow + 2 * direction &&
            !board[fromRow + direction][fromCol]
          )
            return true;
        }

        // Capture
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
          if (targetPiece && !isSameColor(piece, targetPiece)){
            return true;
          }
        }
        return false;

      case "r": // Rook
        if (fromRow !== toRow && fromCol !== toCol) return false;
        const rookDeltaRow = Math.sign(toRow - fromRow);
        const rookDeltaCol = Math.sign(toCol - fromCol);
        let rookCurRow = fromRow + rookDeltaRow;
        let rookCurCol = fromCol + rookDeltaCol;

        while (rookCurRow !== toRow || rookCurCol !== toCol) {
          if (board[rookCurRow][rookCurCol] !== "") return false;
          rookCurRow += rookDeltaRow;
          rookCurCol += rookDeltaCol;
        }
        return true;

      case "n": // Knight
        const knightMoves = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];
        return knightMoves.some(
          ([dRow, dCol]) => fromRow + dRow === toRow && fromCol + dCol === toCol
        );

      case "b": // Bishop
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol))
          return false;
        const bishopDeltaRow = Math.sign(toRow - fromRow);
        const bishopDeltaCol = Math.sign(toCol - fromCol);
        let bishopCurRow = fromRow + bishopDeltaRow;
        let bishopCurCol = fromCol + bishopDeltaCol;

        while (bishopCurRow !== toRow && bishopCurCol !== toCol) {
          if (board[bishopCurRow][bishopCurCol] !== "") return false;
          bishopCurRow += bishopDeltaRow;
          bishopCurCol += bishopDeltaCol;
        }
        return true;

      case "q": // Queen (combination of Rook and Bishop moves)
        if (fromRow === toRow || fromCol === toCol) {
          // Rook-like movement
          const deltaRow = Math.sign(toRow - fromRow);
          const deltaCol = Math.sign(toCol - fromCol);
          let curRow = fromRow + deltaRow;
          let curCol = fromCol + deltaCol;

          while (curRow !== toRow || curCol !== toCol) {
            if (board[curRow][curCol] !== "") return false;
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
            if (board[curRow][curCol] !== "") return false;
            curRow += deltaRow;
            curCol += deltaCol;
          }
          return true;
        }
        return false;

      case "k": // King
        return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
    }

    return false;
  };

  const calculatePossibleMoves = (row: number, col: number) => {
    const possibleMoves: { row: number; col: number }[] = [];

    // Check all possible squares
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isValidMove(row, col, i, j)) {
          // Create a test board to check if the move would put own king in check
          const testBoard = board.map((row) => [...row]);
          testBoard[i][j] = testBoard[row][col];
          testBoard[row][col] = "";

          // Allow moves even if the king is in check
          possibleMoves.push({ row: i, col: j });
        }
      }
    }

    return possibleMoves;
  };

  const isKingInCheck = (boardState: string[][], isWhiteKing: boolean) => {
    let kingRow = -1, kingCol = -1;
    const kingPiece = isWhiteKing ? "K" : "k";

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

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && isWhiteKing !== (piece === piece.toUpperCase())) {
          if (isValidMove(row, col, kingRow, kingCol)) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const isCheckmate = (boardState: string[][], isWhiteKing: boolean) => {
    if (!isKingInCheck(boardState, isWhiteKing)) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && (isWhiteKing === (piece === piece.toUpperCase()))) {
          const possibleMoves = calculatePossibleMoves(row, col);
          for (const move of possibleMoves) {
            const testBoard = boardState.map(row => [...row]);
            testBoard[move.row][move.col] = testBoard[row][col];
            testBoard[row][col] = "";
            if (!isKingInCheck(testBoard, isWhiteKing)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameMode === "cpu" && currentPlayer === "black") return;
    if (gameStatus === "checkmate" || gameStatus === "stalemate") return;

    const piece = board[row][col];
    const isWhitePiece = piece === piece.toUpperCase();

    if (selectedPiece === null) {
      if (
        piece &&
        ((currentPlayer === "white" && isWhitePiece) ||
          (currentPlayer === "black" && !isWhitePiece))
      ) {
        setSelectedPiece({ row, col });
        setPossibleMoves(calculatePossibleMoves(row, col));
      }
    } else {
      if (possibleMoves.some((move) => move.row === row && move.col === col)) {
        const newBoard = board.map((row) => [...row]);
        const movingPiece = newBoard[selectedPiece.row][selectedPiece.col];
        const capturedPiece = newBoard[row][col];

        // Check if the captured piece is a king
        if (capturedPiece?.toLowerCase() === 'k') {
          setGameStatus("checkmate");
          console.log(`${currentPlayer === "white" ? "White" : "Black"} wins! King captured.`);
          setCapturedPieces((prev) => {
            const isWhiteCaptured = capturedPiece === capturedPiece.toUpperCase();
            return {
              white: isWhiteCaptured ? [...prev.white, capturedPiece] : prev.white,
              black: !isWhiteCaptured ? [...prev.black, capturedPiece] : prev.black,
            };
          });
          newBoard[row][col] = movingPiece;
          newBoard[selectedPiece.row][selectedPiece.col] = "";
          setBoard(newBoard);
          return;
        }

        if (capturedPiece) {
          setCapturedPieces((prev) => {
            const isWhiteCaptured = capturedPiece === capturedPiece.toUpperCase();
            return {
              white: isWhiteCaptured ? [...prev.white, capturedPiece] : prev.white,
              black: !isWhiteCaptured ? [...prev.black, capturedPiece] : prev.black,
            };
          });
        }

        newBoard[row][col] = movingPiece;
        newBoard[selectedPiece.row][selectedPiece.col] = "";

        const newMoves = [
          ...moves,
          `${
            movingPiece === movingPiece.toUpperCase() ? "White → " : "Black → "
          }${String.fromCharCode(97 + selectedPiece.col)}${
            8 - selectedPiece.row
          } → ${String.fromCharCode(97 + col)}${8 - row}`,
        ];
        const newPlayer = currentPlayer === "white" ? "black" : "white";

        // Update the board state first
        setBoard(newBoard);

        // Check for checkmate after the move
        const opponentIsWhite = newPlayer === "white";
        const newCheck = isKingInCheck(newBoard, opponentIsWhite);

        if (newCheck) {
          const isCheckmated = isCheckmate(newBoard, opponentIsWhite);
          if (isCheckmated) {
            setGameStatus("checkmate");
            console.log("Checkmate detected!");
          } else {
            setIsCheck(true);
            console.log("Check detected! The king is in check.");
          }
        } else {
          setIsCheck(false);
        }

        // Update check states
        setWhiteKingInCheck(isKingInCheck(newBoard, true));
        setBlackKingInCheck(isKingInCheck(newBoard, false));

        // Check for legal moves
        const hasLegalMoves = newBoard.some((row, rowIndex) =>
          row.some((piece, colIndex) => {
            if (
              piece &&
              ((newPlayer === "white" && piece === piece.toUpperCase()) ||
                (newPlayer === "black" && piece === piece.toLowerCase()))
            ) {
              const moves = calculatePossibleMoves(rowIndex, colIndex);
              return moves.length > 0;
            }
            return false;
          })
        );

        if (!hasLegalMoves) {
          if (newCheck) {
            setGameStatus("checkmate");
            console.log("Checkmate! Opponent wins.");
          } else {
            setGameStatus("stalemate");
            console.log("Stalemate! No possible moves.");
          }
        } else {
          // Update the game state
          setCurrentPlayer(newPlayer);
        }

        setMoves(newMoves);

        // Add the new state to history
        const newState: GameState = {
          board: newBoard,
          currentPlayer: newPlayer as "white" | "black",
          moves: newMoves,
          isCheck: newCheck,
          capturedPieces: { ...capturedPieces },
        };

        const newHistory = history.slice(0, currentStep + 1);
        setHistory([...newHistory, newState]);
        setCurrentStep(currentStep + 1);

        // Add console logs to debug
        console.log("Board State:", newBoard);
        console.log("Game Status:", gameStatus);
        console.log("Current Player:", currentPlayer);
        console.log("Is Check:", newCheck);
        console.log("Is Checkmate:", isCheckmate(newBoard, opponentIsWhite));
        console.log("White King in Check:", whiteKingInCheck);
        console.log("Black King in Check:", blackKingInCheck);
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
    setPossibleMoves([]);
    setHistory([
      {
        board: initialBoard,
        currentPlayer: "white",
        moves: [],
        isCheck: false,
        capturedPieces: { white: [], black: [] },
      },
    ]);
    setCurrentStep(0);
    setCapturedPieces({ white: [], black: [] });
    setGameStatus(null);
    setCpuTimeoutOccurred(false); // Reset the timeout state
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      const previousState = history[currentStep - 1];
      setBoard(previousState.board);
      setCurrentPlayer(previousState.currentPlayer);
      setMoves(previousState.moves);
      setIsCheck(previousState.isCheck);
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
      setCurrentStep(currentStep + 1);
      setPossibleMoves([]);
      setSelectedPiece(null);
    }
  };

  const handleSetPreview = () => {
    setShowPreview((prev) => !prev);
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
        <div className="text-center space-y-8">
       <div className="mb-16">
          <LineShadowTextComp lineshadowText="Chess game"/>
       </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-300 mb-8">
            Choose Game Mode
          </h1>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            
            <Button
               onClick={() => setGameMode("player")}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                <Users className="size-6 mr-4 text-gray-300" />
                <span className="text-xl text-gray-300">Player vs Player</span>
              </span>
            </Button>

            <Button
              onClick={() => setGameMode("cpu")}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                <Cpu className="size-6 mr-4 text-gray-300" />
                <span className="text-xl text-gray-300">Player vs CPU</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const verifyMoves = () => {
   console.log(isCheckmate(board, false))
    console.log(isKingInCheck(board, false))
    console.log(blackKingInCheck)
    console.log(whiteKingInCheck)

  
  }

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 p-9">
          {/* Captured Pieces Display */}
          <button onClick={verifyMoves}>
            verify
          </button>
          <div className="w-20">
            <div className="space-y-4">
              <div className="bg-[#2c2e33] p-4 rounded-lg">
                <h4 className="text-[#ffd700] text-sm mb-2">Black Captures</h4>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.white.map((piece, i) => {
                    const { symbol } = getPieceSymbolWithColor(piece);
                    return (
                      <span key={i} className="text-white text-xl">
                        {symbol}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="bg-[#2c2e33] p-4 rounded-lg">
                <h4 className="text-[#ffd700] text-sm mb-2">White Captures</h4>
                <div className="flex flex-wrap gap-1">
                  {capturedPieces.black.map((piece, i) => {
                    const { symbol } = getPieceSymbolWithColor(piece);
                    return (
                      <span key={i} className="text-black text-xl">
                        {symbol}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <Card className="p-6 gap-1 bg-[#2c2e33] border-[#2c2e33]">
              <div className="grid grid-cols-8 gap-0.5 bg-[#1a1b1e] p-2 rounded-lg">
                {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isSelected =
                      selectedPiece?.row === rowIndex &&
                      selectedPiece?.col === colIndex;
                    const isPossibleMove = possibleMoves.some(
                      (move) => move.row === rowIndex && move.col === colIndex
                    );
                    const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          aspect-square flex items-center justify-center text-4xl cursor-pointer relative
                          ${
                            isWhiteSquare
                              ? "bg-[#e8d0aa] hover:bg-[#e8d0aa]/90"
                              : "bg-[#b88b4a] hover:bg-[#b88b4a]/90"
                          }
                          ${isSelected ? "" : ""}
                          ${isPossibleMove ? "" : ""}
                           transition-all
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                      >
                        {isPossibleMove && !piece && showPreview && (
                          <div className="absolute w-3 h-3 bg-[#3cb340] rounded-full opacity-50" />
                        )}
                        {isPossibleMove && piece && showPreview && (
                          <div className="absolute inset-0 bg-[#d22d2d] opacity-25" />
                        )}
                        <span
                          className={`
                          ${
                            piece === piece.toUpperCase()
                              ? "text-white"
                              : "text-black"
                          }
                          drop-shadow-lg relative z-10
                        `}
                        >
                          {getPieceSymbol(piece)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
            {whiteKingInCheck && (
              <div className="mt-4 p-2 bg-red-500/20 text-red-300 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>White King is in Check!</span>
              </div>
            )}
            {blackKingInCheck && (
              <div className="mt-4 p-2 bg-red-500/20 text-red-300 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Black King is in Check!</span>
              </div>
            )}
            {gameStatus === "checkmate" && (
              <div className="mt-4 p-2 bg-[#ffd700]/20 text-[#ffd700] rounded-md flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>
                  {capturedPieces.white.includes('K')
                    ? "Black wins! White king captured!"
                    : capturedPieces.black.includes('k')
                      ? "White wins! Black king captured!"
                      : `Checkmate! ${currentPlayer === "white" ? "White" : "Black"} wins!`}
                </span>
              </div>
            )}
          </div>

          <div className="w-full md:w-72">
            <Card className="p-6 bg-[#2c2e33] border-[#2c2e33] text-white gap-3">
              <div className="flex flex-col gap-5 justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#ffd700]" />
                  <span className="font-semibold text-2xl">
                    {currentPlayer === "white"
                      ? "White's Turn"
                      : "Black's Turn"}
                    {gameMode === "cpu" &&
                      currentPlayer === "black" &&
                      " (CPU)"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUndo}
                    disabled={
                      currentStep === 0 ||
                      (gameMode === "cpu" && currentPlayer === "black") ||
                      gameStatus === "checkmate" ||
                      gameStatus === "stalemate"
                    }
                    className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10 disabled:opacity-50"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRedo}
                    disabled={
                      currentStep === history.length - 1 ||
                      (gameMode === "cpu" && currentPlayer === "black") ||
                      gameStatus === "checkmate" ||
                      gameStatus === "stalemate"
                    }
                    className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10 disabled:opacity-50"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetGame}
                    className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isCheck && (
                <div className="mb-4 p-2 bg-red-500/20 text-red-300 rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Check!</span>
                </div>
              )}

              {gameStatus === "checkmate" && (
                <div className="mb-4 p-2 bg-[#ffd700]/20 text-[#ffd700] rounded-md flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span>
                    {capturedPieces.white.includes('K')
                      ? "Black wins! White king captured!"
                      : capturedPieces.black.includes('k')
                        ? "White wins! Black king captured!"
                        : `Checkmate! ${currentPlayer === "white" ? "White" : "Black"} wins!`}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-[#ffd700]">Move History</h3>
                <div className="h-[400px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#ffd700]/20 scrollbar-track-transparent">
                  {moves.map((move, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-[#ffd700]/60">{index + 1}.</span>
                      <ChevronRight className="w-4 h-4 text-[#ffd700]/60" />
                      <span className="text-white/80">{move}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  className="cursor-pointer"
                  onClick={handleSetPreview}
                />
                <label
                  htmlFor="terms"
                  className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show preview
                </label>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
