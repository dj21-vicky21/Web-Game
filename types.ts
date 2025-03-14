export type GameState = {
    board: string[][];
    currentPlayer: "white" | "black";
    moves: string[];
    isCheck: boolean;
  };
  
export type GameMode = "cpu" | "player" | null;