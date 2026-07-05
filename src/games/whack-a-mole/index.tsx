import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'playing' | 'finished'

const HOLE_COUNT = 9
const GAME_SECONDS = 30
const MOLE_LIFETIME_MS = 900
const SMASH_FEEDBACK_MS = 150

const emptyHoles = () => Array<boolean>(HOLE_COUNT).fill(false)

/** 残り時間に応じたスポーン間隔 (ms) */
function spawnIntervalFor(timeLeft: number): number {
  if (timeLeft >= 21) return 1000
  if (timeLeft >= 11) return 800
  return 600
}

export default function WhackAMole() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [moles, setMoles] = useState<boolean[]>(emptyHoles)
  const [smashed, setSmashed] = useState<boolean[]>(emptyHoles)

  // 最新の穴状態を参照するためのミラー（スポーン処理用）
  const molesRef = useRef(moles)
  molesRef.current = moles

  // 穴ごとの自動引っ込みタイマー / 💥表示タイマー
  const hideTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const smashTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const clearHideTimer = (index: number) => {
    const timer = hideTimersRef.current[index]
    if (timer !== undefined) {
      clearTimeout(timer)
      delete hideTimersRef.current[index]
    }
  }

  const clearAllTimers = () => {
    Object.values(hideTimersRef.current).forEach(clearTimeout)
    hideTimersRef.current = {}
    Object.values(smashTimersRef.current).forEach(clearTimeout)
    smashTimersRef.current = {}
  }

  // アンマウント時にすべての timeout を解除
  useEffect(() => clearAllTimers, [])

  // 1 秒刻みのカウントダウン
  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // 残り時間 0 で終了
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) {
      clearAllTimers()
      setMoles(emptyHoles())
      setSmashed(emptyHoles())
      setPhase('finished')
    }
  }, [phase, timeLeft])

  // モグラのスポーン（間隔は残り時間の段階で変わる）
  const spawnInterval = spawnIntervalFor(timeLeft)
  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      const empty = molesRef.current.flatMap((mole, i) => (mole ? [] : [i]))
      if (empty.length === 0) return
      const index = empty[Math.floor(Math.random() * empty.length)]
      setMoles((prev) => {
        const next = [...prev]
        next[index] = true
        return next
      })
      clearHideTimer(index)
      hideTimersRef.current[index] = setTimeout(() => {
        delete hideTimersRef.current[index]
        setMoles((prev) => {
          if (!prev[index]) return prev
          const next = [...prev]
          next[index] = false
          return next
        })
      }, MOLE_LIFETIME_MS)
    }, spawnInterval)
    return () => clearInterval(id)
  }, [phase, spawnInterval])

  const handleHoleClick = (index: number) => {
    if (phase !== 'playing') return
    if (moles[index]) {
      // 叩いた: +1 点、即座に引っ込めて自動タイマーを無効化
      clearHideTimer(index)
      setMoles((prev) => {
        const next = [...prev]
        next[index] = false
        return next
      })
      setScore((s) => s + 1)
      // 💥 フィードバックを 150ms 表示
      const prevSmashTimer = smashTimersRef.current[index]
      if (prevSmashTimer !== undefined) clearTimeout(prevSmashTimer)
      setSmashed((prev) => {
        const next = [...prev]
        next[index] = true
        return next
      })
      smashTimersRef.current[index] = setTimeout(() => {
        delete smashTimersRef.current[index]
        setSmashed((prev) => {
          if (!prev[index]) return prev
          const next = [...prev]
          next[index] = false
          return next
        })
      }, SMASH_FEEDBACK_MS)
    } else {
      // お手つき: −1 点（下限 0）
      setScore((s) => Math.max(0, s - 1))
    }
  }

  const start = () => {
    clearAllTimers()
    setScore(0)
    setTimeLeft(GAME_SECONDS)
    setMoles(emptyHoles())
    setSmashed(emptyHoles())
    setPhase('playing')
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-8 text-xl font-bold text-slate-700">
        <p>スコア: {score}</p>
        <p>残り時間: {Math.max(0, timeLeft)} 秒</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {moles.map((mole, i) => (
          <button
            key={i}
            onClick={() => handleHoleClick(i)}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-inner transition ${
              smashed[i] ? 'bg-amber-400' : 'bg-amber-950'
            } ${phase === 'playing' ? 'cursor-pointer hover:bg-amber-900' : 'cursor-default'}`}
            aria-label={mole ? `モグラ (穴 ${i + 1})` : `空の穴 ${i + 1}`}
          >
            {smashed[i] ? '💥' : mole ? '🐹' : ''}
          </button>
        ))}
      </div>
      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-600">モグラをクリックして叩こう！ 空振りは −1 点</p>
          <button
            onClick={start}
            className="rounded-lg bg-slate-700 px-6 py-2 font-semibold text-white transition hover:bg-slate-600"
          >
            スタート
          </button>
        </div>
      )}
      {phase === 'finished' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl font-bold text-slate-700">終了！ スコア: {score}</p>
          <button
            onClick={start}
            className="rounded-lg bg-slate-700 px-6 py-2 font-semibold text-white transition hover:bg-slate-600"
          >
            もう一度
          </button>
        </div>
      )}
    </div>
  )
}
