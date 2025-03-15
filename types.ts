export interface GameState {
    board: string[][];
    currentPlayer: "white" | "black";
    moves: string[];
    isCheck: boolean;
    capturedPieces: {
      white: string[];
      black: string[];
    };
  }
  
export type GameMode = "cpu" | "player" | null;