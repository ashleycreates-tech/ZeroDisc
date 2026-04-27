import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { exchangeCodeForToken } from '../lib/spotify-auth'
import { Disc3 } from 'lucide-react'

export default function SpotifyCallback({ onSuccess, onError }) {
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (error || !code) {
      onError(error ?? 'No code returned')
      return
    }

    exchangeCodeForToken(code, state)
      .then(() => {
        // Clean the URL before handing back control
        window.history.replaceState({}, '', '/')
        onSuccess()
      })
      .catch((e) => onError(e.message))
  }, [])

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Disc3 size={32} className="text-stone-600" strokeWidth={1} />
      </motion.div>
      <p className="text-stone-600 text-sm tracking-widest uppercase">Connecting…</p>
    </motion.div>
  )
}
