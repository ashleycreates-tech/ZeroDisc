import { useState, useEffect, useRef, useCallback } from 'react'
import { getValidToken } from '../lib/spotify-auth'

export function useSpotifyPlayer() {
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(null)
  const playerRef = useRef(null)
  const deviceIdRef = useRef(null)
  const initStarted = useRef(false)

  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true

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
      playerRef.current?.disconnect()
    }
  }, [])

  async function initPlayer() {
    console.log('[ZeroDisc] Initializing Spotify player')

    const player = new window.Spotify.Player({
      name: 'ZeroDisc',
      getOAuthToken: async (cb) => {
        const t = await getValidToken()
        cb(t)
      },
      volume: 1.0,
    })

    player.addListener('ready', ({ device_id }) => {
      console.log('[ZeroDisc] Player ready, device_id:', device_id)
      deviceIdRef.current = device_id
      setReady(true)
    })

    player.addListener('not_ready', ({ device_id }) => {
      console.warn('[ZeroDisc] Player not ready:', device_id)
      setReady(false)
    })

    player.addListener('player_state_changed', (state) => {
      if (!state) return
      setPlaying(!state.paused)
    })

    player.addListener('initialization_error', ({ message }) => {
      console.error('[ZeroDisc] Init error:', message)
      setError(message)
    })
    player.addListener('authentication_error', ({ message }) => {
      console.error('[ZeroDisc] Auth error:', message)
      setError(message)
    })
    player.addListener('account_error', ({ message }) => {
      console.error('[ZeroDisc] Account error:', message)
      setError('Spotify Premium is required for playback.')
    })

    const connected = await player.connect()
    console.log('[ZeroDisc] Player connected:', connected)
    playerRef.current = player
  }

  const play = useCallback(async (albumUri) => {
    console.log('[ZeroDisc] play() called, device:', deviceIdRef.current, 'uri:', albumUri)
    if (!deviceIdRef.current) {
      console.warn('[ZeroDisc] play() called before device ready')
      return
    }
    try {
      const token = await getValidToken()
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ context_uri: albumUri }),
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('[ZeroDisc] Play failed:', res.status, body)
        setError(`Playback error ${res.status}: ${body?.error?.message ?? res.statusText}`)
        return
      }
      console.log('[ZeroDisc] Playback started')
      setPlaying(true)
    } catch (e) {
      console.error('[ZeroDisc] Play exception:', e)
      setError('Playback failed. Try again.')
    }
  }, [])

  const togglePlay = useCallback(() => {
    playerRef.current?.togglePlay()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pause()
  }, [])

  const disconnect = useCallback(() => {
    playerRef.current?.pause()
    playerRef.current?.disconnect()
  }, [])

  return { ready, playing, error, play, togglePlay, pause, disconnect }
}
