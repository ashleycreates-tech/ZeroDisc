import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, X, Loader2 } from 'lucide-react'
import { useTimer, formatTime } from '../hooks/useTimer'
import { useSpotifyPlayer } from '../context/SpotifyPlayerContext'
import AmbientCanvas from './AmbientCanvas'
import ColorThief from 'color-thief-browser'

const DEFAULT_COLOR = '#4a3f6b'

function toHex([r, g, b]) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function darkenHex(hex, factor = 0.55) {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor)
  return toHex([r, g, b])
}

export default function ListeningScreen({ album, durationSeconds, onFinish, onStop }) {
  const [ambientColor, setAmbientColor] = useState(DEFAULT_COLOR)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [confirmStop, setConfirmStop] = useState(false)
  const hideTimer = useRef(null)
  const imgRef = useRef(null)
  const playStarted = useRef(false)

  const timer = useTimer(durationSeconds ?? 0)
  const { ready, playing, error: playerError, play, pause, togglePlay } = useSpotifyPlayer()

  // Auto-play once player is ready
  useEffect(() => {
    if (ready && !playStarted.current) {
      playStarted.current = true
      play(album.uri)
      if (durationSeconds) timer.start()
    }
  }, [ready])

  // Finish when timer ends
  useEffect(() => {
    if (timer.finished) {
      pause()
      onFinish()
    }
  }, [timer.finished])

  // Extract dominant color from album art
  useEffect(() => {
    if (!album.artwork || !imgLoaded || !imgRef.current) return
    try {
      const ct = new ColorThief()
      const palette = ct.getPalette(imgRef.current, 3)
      let best = palette[0]
      let bestSat = 0
      for (const c of palette) {
        const max = Math.max(...c), min = Math.min(...c)
        const sat = max === 0 ? 0 : (max - min) / max
        if (sat > bestSat) { bestSat = sat; best = c }
      }
      setAmbientColor(darkenHex(toHex(best)))
    } catch {
      setAmbientColor(DEFAULT_COLOR)
    }
  }, [imgLoaded, album.artwork])

  // Auto-hide controls after 3s inactivity
  useEffect(() => {
    function resetHide() {
      setControlsVisible(true)
      clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000)
    }
    resetHide()
    window.addEventListener('mousemove', resetHide)
    window.addEventListener('touchstart', resetHide)
    return () => {
      clearTimeout(hideTimer.current)
      window.removeEventListener('mousemove', resetHide)
      window.removeEventListener('touchstart', resetHide)
    }
  }, [])

  function handleStopRequest() {
    timer.pause()
    setConfirmStop(true)
  }

  function handleConfirmStop() {
    pause()
    onStop()
  }

  function handleCancelStop() {
    setConfirmStop(false)
    if (playing) timer.start()
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ cursor: controlsVisible ? 'default' : 'none' }}>
      <AmbientCanvas color={ambientColor} />

      {/* Hidden image for color extraction */}
      {album.artwork && (
        <img
          ref={imgRef}
          src={album.artworkSmall ?? album.artwork}
          crossOrigin="anonymous"
          onLoad={() => setImgLoaded(true)}
          className="hidden"
          alt=""
        />
      )}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8 px-4">

        {!ready && !playerError && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 size={24} className="text-stone-700 animate-spin" />
          </motion.div>
        )}

        {playerError && (
          <motion.p
            className="text-red-400/60 text-xs text-center max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {playerError}
          </motion.p>
        )}

        {album.artwork && (
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.07, 1], opacity: [0.88, 1, 0.88] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Glow — more prominent */}
            <motion.div
              className="absolute -inset-4 rounded-3xl blur-3xl"
              style={{ background: ambientColor }}
              animate={{ opacity: [0.35, 0.65, 0.35] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <img
              src={album.artwork}
              alt={album.title}
              className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-2xl object-cover shadow-2xl shadow-black/70"
            />
          </motion.div>
        )}

        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="text-stone-300 text-sm font-light tracking-wide">{album.title}</p>
          <p className="text-stone-600 text-xs mt-1 tracking-widest uppercase">{album.artist}</p>
        </motion.div>

        {durationSeconds && (
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-stone-600 text-xs tracking-[0.3em] font-mono uppercase">
              {formatTime(timer.secondsLeft)}
            </p>
          </motion.div>
        )}
      </div>

      {/* Controls overlay */}
      <AnimatePresence>
        {controlsVisible && !confirmStop && (
          <motion.div
            className="fixed inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute top-5 right-5 pointer-events-auto">
              <ControlButton onClick={handleStopRequest} title="End session">
                <X size={14} />
              </ControlButton>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
              <ControlButton onClick={togglePlay} title={playing ? 'Pause' : 'Resume'}>
                {playing
                  ? <Pause size={14} fill="currentColor" />
                  : <Play size={14} fill="currentColor" />
                }
              </ControlButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stop confirmation */}
      <AnimatePresence>
        {confirmStop && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              className="relative z-10 w-full max-w-xs bg-stone-950/95 border border-stone-800 rounded-2xl p-6 flex flex-col items-center gap-5 text-center shadow-2xl shadow-black"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <p className="text-stone-100 text-base font-light">End your session?</p>
                <p className="text-stone-500 text-xs mt-2 leading-relaxed">
                  The music will stop and your listening session will close.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancelStop}
                  className="flex-1 py-3 rounded-xl border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 text-sm transition-all duration-200"
                >
                  Keep listening
                </button>
                <button
                  onClick={handleConfirmStop}
                  className="flex-1 py-3 rounded-xl bg-stone-200 hover:bg-white text-stone-900 font-medium text-sm transition-colors duration-200"
                >
                  End session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ControlButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-stone-700/50 text-stone-400 hover:text-stone-200 hover:bg-black/60 flex items-center justify-center transition-all duration-200"
    >
      {children}
    </button>
  )
}
