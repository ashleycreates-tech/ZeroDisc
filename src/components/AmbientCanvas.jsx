import { useEffect, useRef } from 'react'

export default function AmbientCanvas({ color }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const stateRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Parse the hex color into rgb
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    // Particles
    const COUNT = 60
    if (!stateRef.current) {
      stateRef.current = Array.from({ length: COUNT }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0002,
        vy: (Math.random() - 0.5) * 0.0002,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.05,
        pulseOffset: Math.random() * Math.PI * 2,
      }))
    }
    const particles = stateRef.current

    let t = 0

    function draw() {
      const w = canvas.width
      const h = canvas.height
      t += 0.005

      // Deep dark background
      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, w, h)

      // Slow breathing orb in center
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.7)
      const orbRadius = Math.min(w, h) * 0.22 * breathe

      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, orbRadius)
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.18)`)
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.07)`)
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, orbRadius, 0, Math.PI * 2)
      ctx.fill()

      // Secondary drifting orb
      const ox = w * 0.5 + Math.sin(t * 0.4) * w * 0.12
      const oy = h * 0.5 + Math.cos(t * 0.3) * h * 0.1
      const grad2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.min(w, h) * 0.15)
      grad2.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`)
      grad2.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = grad2
      ctx.beginPath()
      ctx.arc(ox, oy, Math.min(w, h) * 0.15, 0, Math.PI * 2)
      ctx.fill()

      // Particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = 1
        if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1
        if (p.y > 1) p.y = 0

        const pulse = 0.6 + 0.4 * Math.sin(t * 1.2 + p.pulseOffset)
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * pulse})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
