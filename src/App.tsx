import { useState } from 'react'
import './App.css'

function Square({ value, onSquareClick, isWinning }: { value: string | null, onSquareClick: () => void, isWinning: boolean }) {
  return (
    <button 
      className={`square ${isWinning ? 'winning' : ''}`} 
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}

function Board({ xIsNext, squares, onPlay, winningLine }: { 
  xIsNext: boolean, 
  squares: (string | null)[], 
  onPlay: (nextSquares: (string | null)[]) => void,
  winningLine: number[] | null
}) {

  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares).winner) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const { winner } = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(square => square !== null)) {
    status = "Draw! No one wins.";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const squaresInRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const isWinning = winningLine ? winningLine.includes(index) : false;
      squaresInRow.push(
        <Square 
          key={index}
          value={squares[index]} 
          onSquareClick={() => handleClick(index)}
          isWinning={isWinning}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {squaresInRow}
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="status">{status}</div>
      <div className="board-container">
        {boardRows}
      </div>
    </div>
  );
}

export default function Game() {
  const [history, setHistory] = useState<{squares: (string | null)[], location: [number, number] | null}[]>([
    { squares: Array(9).fill(null), location: null }
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares: (string | null)[]) {
    let location: [number, number] = [0, 0];
    for (let i = 0; i < 9; i++) {
      if (currentSquares[i] !== nextSquares[i]) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        location = [row, col];
        break;
      }
    }
    
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((step, move) => {
    let description;
    if (move === currentMove) {
      description = move === 0 ? "You are at game start" : `You are at move #${move}`;
    } else if (move > 0) {
      const [row, col] = step.location!;
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = "Go to game start";
    }
    
    return (
      <li key={move}>
        {move === currentMove ? (
          <span className="current-move">{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : moves.slice().reverse();
  const { winningLine } = calculateWinner(currentSquares);

  return (
    <>
      <div className="app-container">
        <header className="game-header">
          <h1>Tic Tac Toe</h1>
          <p className="subtitle">Challenge a friend and have fun!</p>
        </header>
        
        <div className="game-content">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winningLine={winningLine} />
          
          <div className="game-info">
            <div className="info-header">Move History</div>
            <button className="sort-button" onClick={() => setIsAscending(!isAscending)}>
              <span className="sort-icon">{isAscending ? '↓' : '↑'}</span>
              Sort {isAscending ? 'Descending' : 'Ascending'}
            </button>
            <ol className="move-list">{sortedMoves}</ol>
          </div>
        </div>
      </div>
    </>
  )
}

function calculateWinner(squares: (string | null)[]): { winner: string | null, winningLine: number[] | null } {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningLine: lines[i] };
    }
  }

  return { winner: null, winningLine: null };
}