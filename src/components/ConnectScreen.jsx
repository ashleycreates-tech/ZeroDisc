import { motion } from 'framer-motion'
import { Disc3 } from 'lucide-react'
import { redirectToSpotifyAuth } from '../lib/spotify-auth'

export default function ConnectScreen() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex flex-col items-center gap-10 max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <div className="flex flex-col items-center gap-3">
          <Disc3 size={36} className="text-stone-600" strokeWidth={1} />
          <h1 className="text-2xl font-light tracking-[0.2em] text-stone-200 uppercase">ZeroDisc</h1>
          <p className="text-stone-600 text-xs tracking-widest uppercase">Intentional listening</p>
        </div>

        <p className="text-stone-500 text-sm leading-relaxed">
          Put on an album. Set a timer. Go dark.
          <br />
          Just listen.
        </p>

        <button
          onClick={redirectToSpotifyAuth}
          className="flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium text-sm px-6 py-3 rounded-xl transition-colors duration-200"
        >
          <SpotifyIcon />
          Connect with Spotify
        </button>

        <p className="text-stone-700 text-xs">Spotify Premium required for playback</p>
      </motion.div>
    </motion.div>
  )
}

function SpotifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}
