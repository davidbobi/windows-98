"use client";

import { useMemo, useState } from "react";
import {
  Board,
  GameStatus,
  createBoard,
  flaggedCount,
  mineCount,
  revealCell,
  toggleFlag,
} from "@/lib/minesweeper";

const BOARD_SIZE = 8;
const MINE_TOTAL = 10;

export default function MinesweeperApp() {
  const [board, setBoard] = useState<Board>(() =>
    createBoard(BOARD_SIZE, MINE_TOTAL),
  );
  const [status, setStatus] = useState<GameStatus>("playing");

  const minesLeft = useMemo(
    () => mineCount(board) - flaggedCount(board),
    [board],
  );

  const reset = () => {
    setBoard(createBoard(BOARD_SIZE, MINE_TOTAL));
    setStatus("playing");
  };

  const reveal = (x: number, y: number) => {
    if (status !== "playing") return;
    const result = revealCell(board, x, y);
    setBoard(result.board);
    setStatus(result.status);
  };

  const flag = (x: number, y: number) => {
    if (status !== "playing") return;
    setBoard(toggleFlag(board, x, y));
  };

  return (
    <div className="minesweeper app-fill">
      <div className="mine-header">
        <div className="mine-counter">Mines: {minesLeft}</div>
        <div className="mine-counter">
          {status === "lost"
            ? "Game Over"
            : status === "won"
              ? "You Win!"
              : "Ready"}
        </div>
        <button className="menu-button" onClick={reset} type="button">
          New Game
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          className="mine-grid"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
        >
          {board.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                className={`mine-cell ${cell.revealed ? "revealed" : ""} ${
                  cell.flagged ? "flagged" : ""
                }`}
                onClick={() => reveal(x, y)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  flag(x, y);
                }}
                type="button"
              >
                {cell.flagged
                  ? "F"
                  : cell.revealed && cell.hasMine
                    ? "*"
                    : cell.revealed && cell.adjacentMines > 0
                      ? cell.adjacentMines
                      : ""}
              </button>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
