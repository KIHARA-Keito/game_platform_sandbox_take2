import { useState } from 'react'

type Cell = 'O' | 'X' | null

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function findWinner(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [isOTurn, setIsOTurn] = useState(true)

  const winner = findWinner(board)
  const isDraw = !winner && board.every((cell) => cell !== null)

  const handleClick = (index: number) => {
    if (board[index] || winner) return
    const next = [...board]
    next[index] = isOTurn ? 'O' : 'X'
    setBoard(next)
    setIsOTurn(!isOTurn)
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setIsOTurn(true)
  }

  const status = winner
    ? `${winner} の勝ち!`
    : isDraw
      ? '引き分け'
      : `${isOTurn ? 'O' : 'X'} の番`

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-xl font-bold text-slate-700">{status}</p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="flex h-20 w-20 items-center justify-center rounded-lg bg-white text-4xl font-bold text-slate-800 shadow transition hover:bg-slate-50 disabled:cursor-default"
            disabled={!!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>
      <button
        onClick={reset}
        className="rounded-lg bg-slate-700 px-6 py-2 font-semibold text-white transition hover:bg-slate-600"
      >
        リセット
      </button>
    </div>
  )
}
