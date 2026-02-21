import { useState, useEffect, useRef } from 'react'
import logoImg from './assets/logo_dark.png'
import TypewriterTitle from './TypewriterTitle.jsx'
import './LandingPage.css'

const FEATURES = [
  { icon: '\u{1F4AC}', name: 'Playground', desc: 'Chat with AI and tune parameters in real time' },
  { icon: '\u{1F524}', name: 'Tokenizer', desc: 'See how AI reads your text as tokens' },
  { icon: '\u26A1', name: 'Generation', desc: 'Watch AI predict the next word live' },
  { icon: '\u{1F9E0}', name: 'How LLMs Work', desc: 'An interactive journey inside AI' },
  { icon: '\u{1F3D7}\uFE0F', name: 'Model Training', desc: 'Discover how AI models are built from scratch' },
]

const PARTICLE_COUNT = 50
const CONNECTION_DIST = 120

function LandingPage({ fadingOut, onGetStarted, darkMode, setDarkMode }) {
  const canvasRef = useRef(null)
  const [typingDone, setTypingDone] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function initParticles() {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const baseOpacity = isDark ? 0.12 : 0.12
            const opacity = (1 - dist / CONNECTION_DIST) * baseOpacity
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = isDark ? `rgba(168, 162, 158, ${opacity})` : `rgba(0, 113, 227, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? 'rgba(168, 162, 158, 0.1)' : 'rgba(0, 113, 227, 0.15)'
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
      update()
      draw()
      animId = requestAnimationFrame(loop)
    }

    function handleResize() {
      resize()
      initParticles()
    }

    resize()
    initParticles()
    loop()

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={`landing ${fadingOut ? 'landing-fade-out' : ''}`}>
      <canvas ref={canvasRef} className="landing-canvas" />
      <button
        className="theme-toggle landing-theme-toggle"
        onClick={() => setDarkMode((d) => !d)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className={`theme-toggle-track ${darkMode ? 'theme-toggle-dark' : ''}`}>
          <span className="theme-toggle-icon theme-toggle-sun">☀️</span>
          <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
          <span className="theme-toggle-thumb" />
        </span>
      </button>
      <div className={`landing-content ${typingDone ? 'landing-typed' : ''}`}>
        <img src={logoImg} alt="AI Decoded" className="landing-logo" />
        <TypewriterTitle
          delay={300}
          onComplete={() => setTypingDone(true)}
          className="landing-title"
        />
        <p className="landing-tagline">Your interactive journey into AI</p>
        <div className="landing-cards">
          {FEATURES.map((f) => (
            <div key={f.name} className="landing-card">
              <span className="landing-card-icon">{f.icon}</span>
              <span className="landing-card-name">{f.name}</span>
              <span className="landing-card-desc">{f.desc}</span>
            </div>
          ))}
        </div>
        <button className="landing-cta" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  )
}

export default LandingPage
