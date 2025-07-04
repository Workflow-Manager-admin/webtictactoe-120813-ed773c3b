import React, { useState } from "react";
import "./App.css";

/*
  --- TIC TAC TOE - BAMBOO THEME ---
  Features:
    - Interactive 3x3 game board
    - Single-player (vs. local AI) or Two-player (local)
    - Win/loss/draw messaging
    - Score tracking (current session)
    - Restart/reset functionality
    - Bamboo/parchment design, responsive and accessible
*/

const SYMBOLS = { X: "X", O: "O" };
const PLAYER_NAMES = { X: "Player 1", O: "Player 2" };

// PUBLIC_INTERFACE
function App() {
  // Mode: "single" (local AI) or "multi" (2-player)
  const [mode, setMode] = useState("single");
  // "X" always goes first per classic rules
  const [board, setBoard] = useState(Array(9).fill(null));
  const [current, setCurrent] = useState(SYMBOLS.X);
  const [winner, setWinner] = useState(null); // "X", "O", or "draw"
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  // Used to trigger board shake or animation
  const [gameKey, setGameKey] = useState(0);

  // --- Game Logic Functions ---
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] !== null || winner) return;
    const newBoard = board.slice();
    newBoard[idx] = current;
    const result = calcWinner(newBoard);
    setBoard(newBoard);
    if (result) {
      finishGame(result);
    } else {
      if (mode === "single" && current === SYMBOLS.X) {
        setCurrent(SYMBOLS.O);
        // Async AI move for 'O'
        setTimeout(() => {
          const aiMove = getAIMove(newBoard);
          if (aiMove !== -1) {
            newBoard[aiMove] = SYMBOLS.O;
            const afterAi = calcWinner(newBoard);
            setBoard([...newBoard]);
            if (afterAi) {
              finishGame(afterAi);
            } else {
              setCurrent(SYMBOLS.X);
            }
          } else {
            setCurrent(SYMBOLS.X);
          }
        }, 400);
      } else {
        setCurrent(current === SYMBOLS.X ? SYMBOLS.O : SYMBOLS.X);
      }
    }
  }

  // PUBLIC_INTERFACE
  function finishGame(result) {
    setWinner(result);
    setScores((prev) => ({
      ...prev,
      [result]: prev[result] + 1,
    }));
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setCurrent(SYMBOLS.X);
    setGameKey((k) => k + 1); // re-render for animation reset
  }

  // PUBLIC_INTERFACE
  function handleModeSwitch(e) {
    const newMode = e.target.value;
    if (mode !== newMode) {
      setMode(newMode);
      // Reset everything for a "fresh" start
      setBoard(Array(9).fill(null));
      setWinner(null);
      setCurrent(SYMBOLS.X);
      setScores({ X: 0, O: 0, draw: 0 });
      setGameKey((k) => k + 1);
    }
  }

  // --- GAME STATUS MESSAGES ---
  function statusMessage() {
    if (winner === "draw") {
      return "It's a draw! 🌿";
    }
    if (winner) {
      return (mode === "single" && winner === SYMBOLS.O)
        ? "AI wins! Better luck next time."
        : `${PLAYER_NAMES[winner]} wins! 🎉`;
    }
    if (mode === "single" && current === SYMBOLS.O) {
      return "AI is thinking...";
    }
    return `Turn: ${(mode === "single" && current === SYMBOLS.O) ? "AI" : PLAYER_NAMES[current]}`;
  }

  // --- RENDER ---
  return (
    <div className="bamboo-app-bg">
      <div className="container-center">
        <h1 className="bamboo-title">Tic Tac Toe</h1>
        <div className="bamboo-ui-panel">
          <label className="mode-select-label" htmlFor="mode-choice">
            Mode:
          </label>
          <select
            id="mode-choice"
            className="mode-select"
            value={mode}
            onChange={handleModeSwitch}
            aria-label="Choose game mode"
          >
            <option value="single">Single-player (vs. AI)</option>
            <option value="multi">Two-player (local)</option>
          </select>
          <button
            className="bamboo-btn"
            onClick={handleRestart}
            aria-label="Restart game"
          >
            Restart
          </button>
        </div>

        <div key={gameKey} className="bamboo-board-container" role="region" aria-label="Tic Tac Toe board">
          <TicTacToeBoard
            board={board}
            onCellClick={handleCellClick}
            current={current}
            winner={winner}
            disabled={mode === "single" && current === SYMBOLS.O && !winner}
          />
        </div>
        <div className="bamboo-status-message" aria-live="polite">
          {statusMessage()}
        </div>
        <ScorePanel scores={scores} />
        <footer className="bamboo-footer">© Kavia | Bamboo Tic Tac Toe</footer>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function TicTacToeBoard({ board, onCellClick, current, winner, disabled }) {
  // Helper for focus highlighting
  const [focused, setFocused] = useState(-1);

  const getTabIndex = (idx) => (board[idx] === null && !winner && !disabled ? 0 : -1);

  return (
    <div className={`board-inner`} tabIndex={-1}>
      <div className="bamboo-outer-frame" aria-hidden="true"></div>
      <div className="bamboo-grid">
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={`cell${cell ? ' cell-filled' : ''}${focused === idx ? ' cell-focus' : ''}`}
            onClick={() => !disabled && onCellClick(idx)}
            disabled={board[idx] !== null || !!winner || disabled}
            tabIndex={getTabIndex(idx)}
            aria-label={cell
              ? (cell === "X" ? "X" : "O")
              : `Play ${current} in row ${Math.floor(idx/3)+1} column ${(idx%3)+1}`
            }
            onFocus={() => setFocused(idx)}
            onBlur={() => setFocused(-1)}
          >
            <span className="symbol">
              {cell && <SymbolMark mark={cell} />}
            </span>
          </button>
        ))}
        {/* Bamboo rods as div overlays */}
        <div className="bamboo-v bamboo-v1" />
        <div className="bamboo-v bamboo-v2" />
        <div className="bamboo-h bamboo-h1" />
        <div className="bamboo-h bamboo-h2" />
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function ScorePanel({ scores }) {
  return (
    <section className="bamboo-score-panel">
      <div>
        <span className="score-title">Score</span>
        <span className="score-x">X: {scores.X}</span>
        <span className="score-o">O: {scores.O}</span>
        <span className="score-draw">Draws: {scores.draw}</span>
      </div>
    </section>
  );
}

// PUBLIC_INTERFACE
function SymbolMark({ mark }) {
  // (X/O) styled per bamboo engraving/engraved shadow/highlight
  return (
    <span
      className={`symbol-mark symbol-${mark}`}
      aria-hidden="true"
    >
      {mark}
    </span>
  );
}

// --- Helper Functions ---

// PUBLIC_INTERFACE
function calcWinner(b) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6] // diags
  ];
  for (const [a, b1, c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return b[a]; // "X" or "O"
    }
  }
  if (b.every(cell => cell !== null)) return "draw";
  return null;
}

// PUBLIC_INTERFACE
function getAIMove(b) {
  // Simple AI: Win, Block, Else random
  // Try to win
  for (let i=0; i<9; ++i) {
    if (b[i] === null) {
      const test = b.slice();
      test[i] = SYMBOLS.O;
      if (calcWinner(test) === SYMBOLS.O) return i;
    }
  }
  // Block X's win
  for (let i=0; i<9; ++i) {
    if (b[i] === null) {
      const test = b.slice();
      test[i] = SYMBOLS.X;
      if (calcWinner(test) === SYMBOLS.X) return i;
    }
  }
  // Otherwise, pick center, corners, then sides
  const pref = [4,0,2,6,8,1,3,5,7];
  for (const i of pref) {
    if (b[i] === null) return i;
  }
  return -1;
}

export default App;
