import { useState, useCallback, useRef } from 'react'
import { getValidToken } from '../lib/spotify-auth'

export function useAlbumSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const search = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const token = await getValidToken()
        const params = new URLSearchParams({ q: query, type: 'album', limit: '10' })
        const url = `https://api.spotify.com/v1/search?${params}`
        console.log('[ZeroDisc] fetching:', url)
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          console.error('[ZeroDisc] Spotify error body:', body)
          throw new Error(`${res.status}: ${body?.error?.message ?? res.statusText}`)
        }

        const data = await res.json()
        const albums = data.albums.items.map((item) => ({
          id: item.id,
          uri: item.uri,
          title: item.name,
          artist: item.artists.map((a) => a.name).join(', '),
          year: item.release_date ? item.release_date.slice(0, 4) : null,
          artwork: item.images?.[0]?.url ?? null,
          artworkSmall: item.images?.[1]?.url ?? item.images?.[0]?.url ?? null,
          totalTracks: item.total_tracks,
        }))

        setResults(albums)
      } catch (e) {
        console.error('[ZeroDisc] Search error:', e)
        setError(e.message ?? 'Search failed. Try again.')
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [])

  return { results, loading, error, search }
}
