import { useEffect, useRef } from 'react'

const DEFAULTS = {
  particleCount: 18,
  connectionDist: 180,
  particleOpacity: 0.06,
  connectionOpacity: 0.04,
  speed: 0.3,
  radiusMin: 2,
  radiusMax: 3,
}

const LANDING = {
  particleCount: 25,
  particleOpacity: 0.08,
  connectionOpacity: 0.06,
}

function NeuronBackground({ landing = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    let visible = true

    const config = landing
      ? { ...DEFAULTS, ...LANDING }
      : DEFAULTS

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function initParticles() {
      particles = []
      for (let i = 0; i < config.particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * config.speed * 2,
          vy: (Math.random() - 0.5) * config.speed * 2,
          radius: Math.random() * (config.radiusMax - config.radiusMin) + config.radiusMin,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

      const particleColor = isDark ? '168, 162, 158' : '0, 113, 227'
      const connColor = isDark ? '168, 162, 158' : '0, 113, 227'
      const pOpacity = isDark ? 0.08 : config.particleOpacity
      const cBaseOpacity = isDark ? 0.05 : config.connectionOpacity

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < config.connectionDist) {
            const opacity = (1 - dist / config.connectionDist) * cBaseOpacity
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${connColor}, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleColor}, ${pOpacity})`
        ctx.fill()
      }
    }

    function update() {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }
    }

    function loop() {
      if (visible) {
        update()
        draw()
      }
      animId = requestAnimationFrame(loop)
    }

    function handleResize() {
      resize()
      initParticles()
    }

    function handleVisibility() {
      visible = !document.hidden
    }

    resize()
    initParticles()
    loop()

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [landing])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default NeuronBackground
