const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ')

function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function generateCodeVerifier() {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return base64urlEncode(array)
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64urlEncode(digest)
}

export async function redirectToSpotifyAuth() {
  const verifier = await generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = base64urlEncode(crypto.getRandomValues(new Uint8Array(16)))

  sessionStorage.setItem('spotify_code_verifier', verifier)
  sessionStorage.setItem('spotify_auth_state', state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForToken(code, returnedState) {
  const verifier = sessionStorage.getItem('spotify_code_verifier')
  const expectedState = sessionStorage.getItem('spotify_auth_state')

  if (!verifier || returnedState !== expectedState) {
    throw new Error('Invalid OAuth state')
  }

  sessionStorage.removeItem('spotify_code_verifier')
  sessionStorage.removeItem('spotify_auth_state')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error('Token exchange failed')

  const token = await res.json()
  saveToken(token)
  return token
}

export async function refreshAccessToken() {
  const stored = getStoredToken()
  if (!stored?.refresh_token) throw new Error('No refresh token')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: stored.refresh_token,
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const token = await res.json()
  // Spotify may not return a new refresh_token — keep the old one if so
  if (!token.refresh_token) token.refresh_token = stored.refresh_token
  saveToken(token)
  return token
}

function saveToken(token) {
  localStorage.setItem('spotify_token', JSON.stringify({
    ...token,
    expires_at: Date.now() + token.expires_in * 1000,
  }))
}

export function getStoredToken() {
  try {
    return JSON.parse(localStorage.getItem('spotify_token'))
  } catch {
    return null
  }
}

export function isTokenValid() {
  const token = getStoredToken()
  if (!token) return false
  return Date.now() < token.expires_at - 60_000
}

export async function getValidToken() {
  if (isTokenValid()) return getStoredToken().access_token
  const token = await refreshAccessToken()
  return token.access_token
}

export function logout() {
  localStorage.removeItem('spotify_token')
}
