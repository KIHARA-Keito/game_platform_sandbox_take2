import type { GameDefinition } from './types'
import TicTacToe from './tic-tac-toe'
import WhackAMole from './whack-a-mole'

export const games: GameDefinition[] = [
  {
    id: 'tic-tac-toe',
    title: 'マルバツゲーム',
    description: '3つ並べたら勝ち。2人で遊ぶ定番ゲーム。',
    icon: '⭕',
    component: TicTacToe,
  },
  {
    id: 'whack-a-mole',
    title: 'モグラ叩き',
    description: '30秒間で穴から顔を出すモグラをクリックして叩く反射神経ゲーム。',
    icon: '🔨',
    component: WhackAMole,
  },
]
