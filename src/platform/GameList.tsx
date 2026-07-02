import type { GameDefinition } from '../games/types'

interface Props {
  games: GameDefinition[]
  onSelect: (id: string) => void
}

export default function GameList({ games, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelect(game.id)}
          className="flex flex-col items-start gap-2 rounded-xl bg-white p-6 text-left shadow transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-4xl">{game.icon}</span>
          <span className="text-lg font-bold text-slate-800">{game.title}</span>
          <span className="text-sm text-slate-500">{game.description}</span>
        </button>
      ))}
    </div>
  )
}
