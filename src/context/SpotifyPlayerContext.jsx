import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getValidToken } from '../lib/spotify-auth'

const SpotifyPlayerContext = createContext(null)

export function SpotifyPlayerProvider({ children, enabled }) {
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(null)
  const playerRef = useRef(null)
  const deviceIdRef = useRef(null)
  const initStarted = useRef(false)
  const currentUriRef = useRef(null)
  const isPlayingRef = useRef(false)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    if (!enabled || initStarted.current) return
    initStarted.current = true

    const sdkStyle = 'position:fixed!important;top:-9999px!important;left:-9999px!important;width:0!important;height:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;'
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.id !== 'root') {
            node.style.cssText = sdkStyle
          }
        }
      }
    })
    observer.observe(document.body, { childList: true })

    if (window.Spotify) {
      initPlayer()
      return
    }

    window.onSpotifyWebPlaybackSDKReady = initPlayer

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      observer.disconnect()
      clearTimeout(reconnectTimer.current)
    }
  }, [enabled])

  async function initPlayer() {
    const player = new window.Spotify.Player({
      name: 'ZeroDisc',
      getOAuthToken: async (cb) => cb(await getValidToken()),
      volume: 1.0,
    })

    player.addListener('ready', ({ device_id }) => {
      deviceIdRef.current = device_id
      setReady(true)

      // If we were playing when the device dropped, resume automatically
      if (isPlayingRef.current && currentUriRef.current) {
        reconnectTimer.current = setTimeout(() => {
          playUri(currentUriRef.current)
        }, 1500)
      }
    })

    player.addListener('not_ready', () => {
      setReady(false)
      // Reconnect after a short delay
      reconnectTimer.current = setTimeout(() => {
        playerRef.current?.connect()
      }, 2000)
    })

    player.addListener('player_state_changed', (state) => {
      if (!state) return
      const nowPlaying = !state.paused
      setPlaying(nowPlaying)
      isPlayingRef.current = nowPlaying
      if (state.context?.uri) currentUriRef.current = state.context.uri
    })

    player.addListener('initialization_error', ({ message }) => setError(message))
    player.addListener('authentication_error', ({ message }) => setError(message))
    player.addListener('account_error', () => setError('Spotify Premium is required for playback.'))

    await player.connect()
    playerRef.current = player
  }

  async function playUri(albumUri, retries = 3) {
    if (!deviceIdRef.current) return
    try {
      const token = await getValidToken()
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ context_uri: albumUri }),
        }
      )
      if (res.status === 404 && retries > 0) {
        await new Promise(r => setTimeout(r, 1000))
        return playUri(albumUri, retries - 1)
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(`Playback error ${res.status}: ${body?.error?.message ?? res.statusText}`)
      }
    } catch (e) {
      if (e.message === 'AUTH_EXPIRED') setError('Session expired. Please reconnect Spotify.')
      else setError('Playback failed. Try again.')
    }
  }

  const play = useCallback(async (albumUri) => {
    currentUriRef.current = albumUri
    isPlayingRef.current = true
    await playUri(albumUri)
  }, [])

  const pause = useCallback(() => {
    isPlayingRef.current = false
    playerRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    playerRef.current?.togglePlay()
  }, [])

  return (
    <SpotifyPlayerContext.Provider value={{ ready, playing, error, play, pause, togglePlay }}>
      {children}
    </SpotifyPlayerContext.Provider>
  )
}

export function useSpotifyPlayer() {
  return useContext(SpotifyPlayerContext)
}
