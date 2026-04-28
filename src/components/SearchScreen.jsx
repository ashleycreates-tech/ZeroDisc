import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Disc3, LogOut } from 'lucide-react'
import { useAlbumSearch } from '../hooks/useAlbumSearch'

export default function SearchScreen({ onSelect, onLogout }) {
  const [query, setQuery] = useState('')
  const { results, loading, error, search } = useAlbumSearch()

  function handleInput(e) {
    setQuery(e.target.value)
    search(e.target.value)
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logout */}
      <button
        onClick={onLogout}
        className="absolute top-5 right-5 text-stone-700 hover:text-stone-500 transition-colors"
        title="Disconnect Spotify"
      >
        <LogOut size={15} />
      </button>

      {/* Logo */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Disc3 size={28} className="text-stone-400" strokeWidth={1.5} />
          <h1 className="text-2xl font-light tracking-[0.2em] text-stone-200 uppercase">
            ZeroDisc
          </h1>
        </div>
        <p className="text-stone-500 text-sm tracking-widest uppercase font-light">
          Intentional listening
        </p>
      </motion.div>

      {/* Search input */}
      <motion.div
        className="w-full max-w-md mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <Search size={16} />
            }
          </div>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search for an album…"
            className="w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 placeholder-stone-600 text-base outline-none focus:border-stone-600 transition-colors duration-200"
          />
        </div>
        {error && <p className="text-red-400/70 text-xs mt-2 text-center">{error}</p>}
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            key="results"
            className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {results.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} onSelect={onSelect} />
            ))}
          </motion.div>
        )}

        {!loading && query.length > 2 && results.length === 0 && (
          <motion.p
            key="empty"
            className="text-stone-600 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No albums found
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AlbumCard({ album, index, onSelect }) {
  return (
    <motion.button
      onClick={() => onSelect(album)}
      className="group text-left bg-stone-900/40 border border-stone-800/60 rounded-xl overflow-hidden hover:border-stone-600 transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {album.artwork ? (
        <div className="aspect-square overflow-hidden">
          <img
            src={album.artwork}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-square bg-stone-800 flex items-center justify-center">
          <Disc3 size={32} className="text-stone-600" strokeWidth={1} />
        </div>
      )}
      <div className="p-3">
        <p className="text-stone-200 text-xs font-medium leading-snug line-clamp-2">{album.title}</p>
        <p className="text-stone-500 text-xs mt-0.5 truncate">{album.artist}</p>
        {album.year && <p className="text-stone-700 text-xs mt-0.5">{album.year}</p>}
      </div>
    </motion.button>
  )
}
