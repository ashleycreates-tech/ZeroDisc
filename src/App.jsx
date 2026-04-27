import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { isTokenValid, logout } from './lib/spotify-auth'
import { SpotifyPlayerProvider } from './context/SpotifyPlayerContext'
import ConnectScreen from './components/ConnectScreen'
import SpotifyCallback from './components/SpotifyCallback'
import SearchScreen from './components/SearchScreen'
import SetupScreen from './components/SetupScreen'
import ListeningScreen from './components/ListeningScreen'
import CompleteScreen from './components/CompleteScreen'

function getInitialScreen() {
  if (window.location.pathname === '/callback') return 'callback'
  if (isTokenValid()) return 'search'
  return 'connect'
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen)
  const [album, setAlbum] = useState(null)
  const [duration, setDuration] = useState(null)

  // Keep token validity in sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'spotify_token' && !isTokenValid()) setScreen('connect')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleAlbumSelect(a) {
    setAlbum(a)
    setScreen('setup')
  }

  function handleStart(seconds) {
    setDuration(seconds)
    setScreen('listening')
  }

  function handleStop() {
    setScreen('complete')
  }

  function handleFinish() {
    setScreen('complete')
  }

  function handleRestart() {
    setScreen('listening')
  }

  function handleNewAlbum() {
    setAlbum(null)
    setDuration(null)
    setScreen('search')
  }

  function handleLogout() {
    logout()
    setAlbum(null)
    setDuration(null)
    setScreen('connect')
  }

  const isAuthenticated = screen !== 'connect' && screen !== 'callback'

  return (
    <div className="min-h-screen bg-[#080808]">
      <SpotifyPlayerProvider enabled={isAuthenticated}>
        <AnimatePresence mode="wait">
          {screen === 'connect' && (
            <ConnectScreen key="connect" />
          )}

          {screen === 'callback' && (
            <SpotifyCallback
              key="callback"
              onSuccess={() => setScreen('search')}
              onError={() => setScreen('connect')}
            />
          )}

          {screen === 'search' && (
            <SearchScreen key="search" onSelect={handleAlbumSelect} onLogout={handleLogout} />
          )}

          {screen === 'setup' && album && (
            <SetupScreen
              key="setup"
              album={album}
              onStart={handleStart}
              onBack={() => setScreen('search')}
            />
          )}

          {screen === 'listening' && album && (
            <ListeningScreen
              key="listening"
              album={album}
              durationSeconds={duration}
              onFinish={handleFinish}
              onStop={handleStop}
            />
          )}

          {screen === 'complete' && album && (
            <CompleteScreen
              key="complete"
              album={album}
              durationSeconds={duration}
              onRestart={handleRestart}
              onNewAlbum={handleNewAlbum}
            />
          )}
        </AnimatePresence>
      </SpotifyPlayerProvider>
    </div>
  )
}
