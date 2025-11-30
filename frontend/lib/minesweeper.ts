export type Cell = {
  hasMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
};

export type Board = Cell[][];

export type GameStatus = "playing" | "lost" | "won";

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const inBounds = (x: number, y: number, size: number) =>
  x >= 0 && x < size && y >= 0 && y < size;

export const createBoard = (size: number, mines: number): Board => {
  const board: Board = Array.from({ length: size }, () =>
    Array.from({ length: size }, (): Cell => ({
      hasMine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0,
    })),
  );

  let placed = 0;
  while (placed < mines) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (!board[y][x].hasMine) {
      board[y][x].hasMine = true;
      placed += 1;
    }
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (board[y][x].hasMine) continue;
      const count = directions.reduce((total, [dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (inBounds(nx, ny, size) && board[ny][nx].hasMine) {
          return total + 1;
        }
        return total;
      }, 0);
      board[y][x].adjacentMines = count;
    }
  }

  return board;
};

const cloneBoard = (board: Board): Board =>
  board.map((row) => row.map((cell) => ({ ...cell })));

export const toggleFlag = (board: Board, x: number, y: number): Board => {
  const next = cloneBoard(board);
  const cell = next[y][x];
  if (!cell.revealed) {
    cell.flagged = !cell.flagged;
  }
  return next;
};

const floodReveal = (board: Board, x: number, y: number) => {
  const queue: Array<[number, number]> = [[x, y]];
  const size = board.length;

  while (queue.length) {
    const [cx, cy] = queue.shift() as [number, number];
    const cell = board[cy][cx];
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;
    if (cell.adjacentMines === 0) {
      directions.forEach(([dx, dy]) => {
        const nx = cx + dx;
        const ny = cy + dy;
        if (inBounds(nx, ny, size) && !board[ny][nx].revealed) {
          queue.push([nx, ny]);
        }
      });
    }
  }
};

const allSafeRevealed = (board: Board) =>
  board.every((row) =>
    row.every((cell) => (cell.hasMine ? true : cell.revealed)),
  );

export const revealCell = (
  board: Board,
  x: number,
  y: number,
): { board: Board; status: GameStatus } => {
  const next = cloneBoard(board);
  const cell = next[y][x];

  if (cell.revealed || cell.flagged) {
    return { board: next, status: "playing" };
  }

  if (cell.hasMine) {
    cell.revealed = true;
    return { board: next, status: "lost" };
  }

  floodReveal(next, x, y);
  const status = allSafeRevealed(next) ? "won" : "playing";
  return { board: next, status };
};

export const mineCount = (board: Board) =>
  board.reduce(
    (total, row) =>
      total + row.reduce((rowTotal, cell) => rowTotal + (cell.hasMine ? 1 : 0), 0),
    0,
  );

export const flaggedCount = (board: Board) =>
  board.reduce(
    (total, row) =>
      total + row.reduce((rowTotal, cell) => rowTotal + (cell.flagged ? 1 : 0), 0),
    0,
  );
