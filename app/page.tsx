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
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (gameMode === "cpu" && currentPlayer === "black") {
      // Add a small delay to make CPU moves feel more natural
      const timeoutId = setTimeout(makeCPUMove, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, gameMode]);

  const makeCPUMove = () => {
    // Get all possible moves for black pieces
    const allPossibleMoves: {
      from: { row: number; col: number };
      to: { row: number; col: number };
    }[] = [];

    // Collect all possible moves for each black piece
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece === piece.toLowerCase()) {
          // black piece
          const moves = calculatePossibleMoves(row, col);
          moves.forEach((move) => {
            allPossibleMoves.push({
              from: { row, col },
              to: move,
            });
          });
        }
      }
    }

    if (allPossibleMoves.length > 0) {
      // Choose a random move from all possible moves
      const randomMove =
        allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];

      // Execute the move
      const newBoard = board.map((row) => [...row]);
      const movingPiece = newBoard[randomMove.from.row][randomMove.from.col];
      newBoard[randomMove.to.row][randomMove.to.col] = movingPiece;
      newBoard[randomMove.from.row][randomMove.from.col] = "";

      const newMoves = [
        ...moves,
        `${movingPiece === "P" ? "White → " : "CPU → "}${String.fromCharCode(97 + randomMove.from.col)}${
          8 - randomMove.from.row
        } → ${String.fromCharCode(97 + randomMove.to.col)}${
          8 - randomMove.to.row
        }`,
      ];
      const newCheck = isKingInCheck(newBoard, true); // Check if white king is in check
      // Update the game state
      setBoard(newBoard);
      setCurrentPlayer("white");
      setMoves(newMoves);
      setIsCheck(newCheck);

      // Add the new state to history
      const newState = {
        board: newBoard,
        currentPlayer: "white",
        moves: newMoves,
        isCheck: newCheck,
      };

      const newHistory: GameState[] = history.slice(0, currentStep + 1);
      //@ts-expect-error type its valid 
      setHistory([...newHistory, newState]);
      setCurrentStep(currentStep + 1);
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
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];

    if (targetPiece && isSameColor(piece, targetPiece)) return false;

    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

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
          if (targetPiece && !isSameColor(piece, targetPiece)) return true;
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

          const isWhitePiece =
            board[row][col] === board[row][col].toUpperCase();
          if (!isKingInCheck(testBoard, isWhitePiece)) {
            possibleMoves.push({ row: i, col: j });
          }
        }
      }
    }

    return possibleMoves;
  };

  const isKingInCheck = (boardState: string[][], isWhiteKing: boolean) => {
    // Find king position
    let kingRow = -1,
      kingCol = -1;
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

    // Check if any opponent piece can capture the king
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

  const handleSquareClick = (row: number, col: number) => {
    if (gameMode === "cpu" && currentPlayer === "black") return; // Prevent moves during CPU turn

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
        newBoard[row][col] = movingPiece;
        newBoard[selectedPiece.row][selectedPiece.col] = "";

        const newMoves = [
          ...moves,
          `${movingPiece === "P" ? "White → " : "Black → "}${String.fromCharCode(97 + selectedPiece.col)}${
            8 - selectedPiece.row
          } → ${String.fromCharCode(97 + col)}${8 - row}`,
        ];
        const newPlayer = currentPlayer === "white" ? "black" : "white";
        const newCheck = isKingInCheck(newBoard, !isWhitePiece);
        // Update the game state
        setBoard(newBoard);
        setCurrentPlayer(newPlayer);
        setMoves(newMoves);
        setIsCheck(newCheck);

        // Add the new state to history
        const newState = {
          board: newBoard,
          currentPlayer: newPlayer,
          moves: newMoves,
          isCheck: newCheck,
        };

        // Remove any future states if we're not at the latest move
        const newHistory = history.slice(0, currentStep + 1);
        //@ts-expect-error type its valid
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
    setPossibleMoves([]);
    setHistory([
      {
        board: initialBoard,
        currentPlayer: "white",
        moves: [],
        isCheck: false,
      },
    ]);
    setCurrentStep(0);
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

  const handleSetPreview = () =>{
    console.log("first")
    setShowPreview(prev=>!prev)
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-white mb-8">
            Choose Game Mode
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setGameMode("player")}
              className="bg-[#2c2e33] hover:bg-[#3c3e43] text-white p-8 flex flex-col items-center gap-4 rounded-xl"
            >
              <Users className="w-12 h-12" />
              <span className="text-xl">Player vs Player</span>
            </Button>
            <Button
              onClick={() => setGameMode("cpu")}
              className="bg-[#2c2e33] hover:bg-[#3c3e43] text-white p-8 flex flex-col items-center gap-4 rounded-xl"
            >
              <Cpu className="w-12 h-12" />
              <span className="text-xl">Player vs CPU</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 p-9">
          <div className="flex-1">
            {/* {
              <div className="grid place-items-center font-semibold text-2xl text-white">
                {" "}
                {currentPlayer === "black" ? "Your turn" : "White turn"}{" "}
              </div>
            } */}
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
            {/* {
              <div className="grid place-items-center font-semibold text-2xl text-white">
                {" "}
                {currentPlayer === "white" ? "Your turn" : "Black turn"}{" "}
              </div>
            } */}
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
                      (gameMode === "cpu" && currentPlayer === "black")
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
                      (gameMode === "cpu" && currentPlayer === "black")
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
                    <Checkbox id="terms" className="cursor-pointer" onClick={handleSetPreview}/>
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
