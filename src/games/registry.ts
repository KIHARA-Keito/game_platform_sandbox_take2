import type { GameDefinition } from './types'
import TicTacToe from './tic-tac-toe'

export const games: GameDefinition[] = [
  {
    id: 'tic-tac-toe',
    title: 'マルバツゲーム',
    description: '3つ並べたら勝ち。2人で遊ぶ定番ゲーム。',
    icon: '⭕',
    component: TicTacToe,
  },
]
