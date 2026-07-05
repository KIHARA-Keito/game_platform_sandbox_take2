import { useCallback, useEffect, useRef, useState } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 20
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE
const INITIAL_INTERVAL = 200
const MIN_INTERVAL = 80
const INTERVAL_STEP = 8
const SCORE_PER_FOOD = 10
const QUEUE_LIMIT = 2

type Phase = 'idle' | 'playing' | 'gameover' | 'clear'
type Direction = 'up' | 'down' | 'left' | 'right'

interface Point {
  x: number
  y: number
}

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITES: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
}

interface GameState {
  /** 先頭が頭 */
  snake: Point[]
  direction: Direction
  /** 方向入力キュー（1 tick に 1 件消費、上限 2 件） */
  queue: Direction[]
  food: Point | null
  interval: number
  score: number
}

/** ヘビの体が占めていないマスから一様乱数でエサ位置を選ぶ。空きがなければ null */
function spawnFood(snake: Point[]): Point | null {
  const occupied = new Set(snake.map((p) => p.y * GRID_SIZE + p.x))
  const empty: Point[] = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(y * GRID_SIZE + x)) {
        empty.push({ x, y })
      }
    }
  }
  if (empty.length === 0) return null
  return empty[Math.floor(Math.random() * empty.length)]
}

function createInitialState(): GameState {
  const snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ]
  return {
    snake,
    direction: 'right',
    queue: [],
    food: spawnFood(snake),
    interval: INITIAL_INTERVAL,
    score: 0,
  }
}

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<GameState>(createInitialState())
  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const { snake, food } = gameRef.current

    // 背景
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // グリッド線
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)'
    ctx.lineWidth = 1
    for (let i = 1; i < GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE + 0.5, 0)
      ctx.lineTo(i * CELL_SIZE + 0.5, CANVAS_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE + 0.5)
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE + 0.5)
      ctx.stroke()
    }

    // エサ（赤の円）
    if (food) {
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }

    // ヘビ（頭: 明るい緑、体: 緑）
    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#4ade80' : '#16a34a'
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
      )
    })
  }, [])

  const tick = useCallback(() => {
    const game = gameRef.current

    // 方向キューから 1 件だけ消費
    const queued = game.queue.shift()
    if (queued) {
      game.direction = queued
    }

    const delta = DELTAS[game.direction]
    const head = game.snake[0]
    const newHead = { x: head.x + delta.x, y: head.y + delta.y }

    // 壁衝突
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setPhase('gameover')
      return
    }

    const ate =
      game.food !== null &&
      newHead.x === game.food.x &&
      newHead.y === game.food.y

    // エサを食べていなければ尻尾を削ってから衝突判定する
    const body = ate ? game.snake : game.snake.slice(0, -1)
    if (body.some((p) => p.x === newHead.x && p.y === newHead.y)) {
      setPhase('gameover')
      return
    }

    game.snake = [newHead, ...body]

    if (ate) {
      game.score += SCORE_PER_FOOD
      game.interval = Math.max(MIN_INTERVAL, game.interval - INTERVAL_STEP)
      setScore(game.score)
      setHighScore((h) => Math.max(h, game.score))
      game.food = spawnFood(game.snake)
      if (game.food === null) {
        // 全マスを埋めた場合はゲームクリア扱い
        draw()
        setPhase('clear')
        return
      }
    }

    draw()
  }, [draw])

  const start = useCallback(() => {
    gameRef.current = createInitialState()
    setScore(0)
    setPhase('playing')
    draw()
  }, [draw])

  // 方向入力をキューに積む（180 度反転・同方向は積まない）
  const enqueueDirection = useCallback((dir: Direction) => {
    const game = gameRef.current
    if (game.queue.length >= QUEUE_LIMIT) return
    const base =
      game.queue.length > 0 ? game.queue[game.queue.length - 1] : game.direction
    if (dir === base || dir === OPPOSITES[base]) return
    game.queue.push(dir)
  }, [])

  // ゲームループ
  useEffect(() => {
    if (phase !== 'playing') return
    let timerId = 0
    const step = () => {
      tick()
      if (phaseRef.current === 'playing') {
        timerId = window.setTimeout(step, gameRef.current.interval)
      }
    }
    timerId = window.setTimeout(step, gameRef.current.interval)
    return () => window.clearTimeout(timerId)
  }, [phase, tick])

  // キーボード入力
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        const current = phaseRef.current
        if (current === 'idle' || current === 'gameover' || current === 'clear') {
          start()
        }
        return
      }
      const dir = KEY_TO_DIRECTION[e.key]
      if (!dir) return
      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
      }
      if (phaseRef.current === 'playing') {
        enqueueDirection(dir)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [start, enqueueDirection])

  // 初期描画
  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xl font-bold text-slate-700">
        スコア: {score}
        <span className="ml-6">ハイスコア: {highScore}</span>
      </p>
      <div className="relative" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-lg shadow"
        />
        {phase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-slate-900/60">
            <p className="text-lg font-semibold text-white">
              Space かスタートボタンで開始
            </p>
            <button
              onClick={start}
              className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-500"
            >
              スタート
            </button>
          </div>
        )}
        {(phase === 'gameover' || phase === 'clear') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-900/60">
            <p className="text-2xl font-bold text-white">
              {phase === 'clear' ? 'クリア!' : 'ゲームオーバー'}
            </p>
            <p className="text-lg font-semibold text-white">スコア: {score}</p>
            <p className="text-sm text-slate-200">
              Space かもう一度ボタンでリスタート
            </p>
            <button
              onClick={start}
              className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-500"
            >
              もう一度
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-500">
        矢印キー / WASD で操作、Space で開始
      </p>
    </div>
  )
}
