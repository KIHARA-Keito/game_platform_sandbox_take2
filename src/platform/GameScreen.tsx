import type { GameDefinition } from '../games/types'

interface Props {
  game: GameDefinition
  onBack: () => void
}

export default function GameScreen({ game, onBack }: Props) {
  const Game = game.component
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow transition hover:bg-slate-50"
        >
          ← 一覧へ戻る
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {game.icon} {game.title}
        </h2>
      </div>
      <div className="rounded-xl bg-slate-100 p-8">
        <Game />
      </div>
    </div>
  )
}
