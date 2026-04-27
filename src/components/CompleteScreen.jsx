import { motion } from 'framer-motion'
import { RotateCcw, Search } from 'lucide-react'

export default function CompleteScreen({ album, durationSeconds, onRestart, onNewAlbum }) {
  const minutes = durationSeconds ? Math.round(durationSeconds / 60) : null

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="flex flex-col items-center gap-8 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {/* Album art — small, quiet */}
        {album.artwork && (
          <motion.img
            src={album.artwork}
            alt={album.title}
            className="w-24 h-24 rounded-xl object-cover shadow-lg shadow-black/60 opacity-80"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />
        )}

        <div>
          <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mb-3">You listened to</p>
          <h2 className="text-stone-200 text-xl font-light leading-snug">{album.title}</h2>
          <p className="text-stone-500 text-sm mt-1">{album.artist}</p>
          {minutes && (
            <p className="text-stone-700 text-xs mt-3 tracking-wide">
              {minutes} minutes of intentional listening
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600 text-sm transition-all duration-200"
          >
            <RotateCcw size={13} />
            Listen again
          </button>
          <button
            onClick={onNewAlbum}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-200 hover:bg-white text-stone-900 font-medium text-sm transition-colors duration-200"
          >
            <Search size={13} />
            New album
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
