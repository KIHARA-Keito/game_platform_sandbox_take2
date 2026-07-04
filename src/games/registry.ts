import type { GameDefinition } from './types'
import TicTacToe from './tic-tac-toe'
import Snake from './snake'

export const games: GameDefinition[] = [
  {
    id: 'tic-tac-toe',
    title: 'マルバツゲーム',
    description: '3つ並べたら勝ち。2人で遊ぶ定番ゲーム。',
    icon: '⭕',
    component: TicTacToe,
  },
  {
    id: 'snake',
    title: 'スネーク',
    description: 'エサを食べてヘビを伸ばす定番アクション。壁と自分にぶつかったら終わり。',
    icon: '🐍',
    component: Snake,
  },
]
