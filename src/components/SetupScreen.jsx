import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Timer, Infinity } from 'lucide-react'

const PRESETS = [
  { label: '20 min', seconds: 20 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
]

export default function SetupScreen({ album, onStart, onBack }) {
  const [selected, setSelected] = useState(PRESETS[1].seconds)
  const [openEnded, setOpenEnded] = useState(false)

  function handleStart() {
    onStart(openEnded ? null : selected)
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-stone-600 hover:text-stone-400 transition-colors text-sm"
      >
        <ArrowLeft size={15} />
        <span>Back</span>
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-10">

        {/* Album preview */}
        <motion.div
          className="flex items-center gap-4 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {album.artwork ? (
            <img
              src={album.artwork}
              alt={album.title}
              className="w-20 h-20 rounded-lg object-cover shadow-lg shadow-black/50 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-stone-800 rounded-lg flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-stone-200 font-medium text-base leading-snug line-clamp-2">{album.title}</p>
            <p className="text-stone-500 text-sm mt-0.5">{album.artist}</p>
            {album.year && <p className="text-stone-700 text-xs mt-1">{album.year}</p>}
          </div>
        </motion.div>

        {/* Timer section */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 text-stone-500 text-xs uppercase tracking-widest">
            <Timer size={12} />
            <span>Set a listening window</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => { setSelected(p.seconds); setOpenEnded(false) }}
                className={`py-2.5 rounded-lg text-sm transition-all duration-200 border ${
                  !openEnded && selected === p.seconds
                    ? 'bg-stone-200 text-stone-900 border-stone-200 font-medium'
                    : 'bg-stone-900/40 text-stone-400 border-stone-800 hover:border-stone-600'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setOpenEnded(true)}
              className={`py-2.5 rounded-lg text-sm transition-all duration-200 border flex items-center justify-center gap-1.5 ${
                openEnded
                  ? 'bg-stone-200 text-stone-900 border-stone-200 font-medium'
                  : 'bg-stone-900/40 text-stone-400 border-stone-800 hover:border-stone-600'
              }`}
            >
              <Infinity size={14} />
              <span>Open</span>
            </button>
          </div>

          <p className="text-stone-700 text-xs text-center">
            {openEnded
              ? 'No timer — listen as long as you like'
              : `Screen will go dark for ${PRESETS.find(p => p.seconds === selected)?.label}`}
          </p>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2.5 bg-stone-200 hover:bg-white text-stone-900 font-medium py-3.5 rounded-xl transition-colors duration-200 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play size={15} fill="currentColor" />
          Begin listening
        </motion.button>
      </div>
    </motion.div>
  )
}
