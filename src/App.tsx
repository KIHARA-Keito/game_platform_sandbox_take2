import { useState } from 'react'
import { games } from './games/registry'
import GameList from './platform/GameList'
import GameScreen from './platform/GameScreen'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedGame = games.find((g) => g.id === selectedId)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <h1
            className="cursor-pointer text-2xl font-bold text-slate-800"
            onClick={() => setSelectedId(null)}
          >
            🎮 ミニゲームプラットフォーム
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        {selectedGame ? (
          <GameScreen game={selectedGame} onBack={() => setSelectedId(null)} />
        ) : (
          <GameList games={games} onSelect={setSelectedId} />
        )}
      </main>
    </div>
  )
}
