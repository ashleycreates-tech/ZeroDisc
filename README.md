# ZeroDisc

A distraction-free, intentional listening experience. Search for an album, set a timer, and let the screen go dark with ambient visuals that breathe with the music.

**Live:** [zero-disc.vercel.app](https://zero-disc.vercel.app)

## Stack

- React + Vite
- Spotify Web Playback SDK with PKCE OAuth (no backend required)
- Framer Motion
- Canvas API with real-time album color extraction via Color Thief
- Tailwind CSS v4
- Deployed on Vercel

## Running locally

**1. Create a Spotify Developer app**

Go to [developer.spotify.com](https://developer.spotify.com/dashboard), create an app, and add `http://127.0.0.1:5173/callback` as a redirect URI. Spotify Premium is required for playback.

**2. Add environment variables**

Create a `.env` file in the project root:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

**3. Install and run**

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser. This address is local to your machine only — use the explicit IP rather than `localhost` to match Spotify's redirect URI requirement.

## Notes

Spotify's February 2026 API changes restrict Extended Quota Mode to verified organisations. Development Mode apps are limited to 5 users. The app is fully functional within that constraint.
