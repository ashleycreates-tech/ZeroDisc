import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    setRunning(true)
    setFinished(false)
  }, [])

  const pause = useCallback(() => setRunning(false), [])

  const reset = useCallback(() => {
    setRunning(false)
    setFinished(false)
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [running])

  const progress = initialSeconds > 0 ? 1 - secondsLeft / initialSeconds : 0

  return { secondsLeft, running, finished, progress, start, pause, reset }
}

export function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
