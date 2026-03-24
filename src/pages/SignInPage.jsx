import { useState, useEffect } from 'react'
import { CATEGORIES, PAGE_BG, DEFAULT_SETTINGS } from '../constants'
import { addCheckin, addLog, getSettings } from '../db'

export default function SignInPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [cooldowns, setCooldowns] = useState({}) // catId -> 'done' | 'cooldown' | falsy
  const [doneIds, setDoneIds] = useState({})

  useEffect(() => {
    getSettings().then(s => {
      if (s) setSettings(s)
    })
  }, [])

  const handleCheckin = (catId) => {
    if (cooldowns[catId]) return

    // Phase 1: "Done!" overlay immediately
    setCooldowns(prev => ({ ...prev, [catId]: 'done' }))
    setDoneIds(prev => ({ ...prev, [catId]: Date.now() }))

    const cooldownMs = settings.checkin_cooldown || 5000
    const donePhase = Math.min(1200, cooldownMs * 0.4) // done overlay = 40% of cooldown, max 1.2s

    // Phase 2: switch to cooldown bar
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [catId]: 'cooldown' }))
    }, donePhase)

    // Phase 3: fully release
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [catId]: null }))
    }, cooldownMs)

    // Fire-and-forget: write to Supabase in background
    addCheckin(catId).catch(err => console.error('checkin failed:', err))
    addLog('checkin', catId).catch(err => console.error('log failed:', err))
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        background: PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px 24px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16, flexShrink: 0 }}>
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            margin: '0 0 4px',
          }}
        >
          🏗️ STEM Lab
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          Tap your station to sign in
        </p>
      </div>

      {/* Cards — fill remaining space equally */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        {CATEGORIES.map(cat => {
          const state = cooldowns[cat.id] // 'done' | 'cooldown' | null
          const isDone = state === 'done'
          const isCooldown = state === 'cooldown'
          const isBlocked = !!state

          return (
            <button
              key={cat.id}
              disabled={isBlocked}
              onClick={() => handleCheckin(cat.id)}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                borderRadius: 24,
                padding: 0,
                cursor: isBlocked ? 'default' : 'pointer',
                background: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isDone ? 'scale(0.96)' : 'scale(1)',
                minHeight: 160,
              }}
            >
              {/* Full background image */}
              <img
                src={cat.defaultImage}
                alt={cat.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isDone
                    ? 'brightness(0.25) grayscale(0.6)'
                    : isCooldown
                      ? 'brightness(0.4) grayscale(0.3)'
                      : 'brightness(0.65)',
                  transition: 'filter 0.4s ease',
                }}
                onError={e => { e.target.style.display = 'none' }}
              />

              {/* Color gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, transparent 10%, ${cat.color}CC 100%)`,
                  opacity: isDone ? 0.3 : 0.85,
                  transition: 'opacity 0.4s',
                }}
              />

              {/* "DONE" overlay */}
              {isDone && (
                <div
                  key={doneIds[cat.id]}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    animation: 'fadeUp 0.25s ease',
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: '#00C853',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                      animation: 'checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                      boxShadow: '0 0 40px rgba(0,200,83,0.4)',
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#fff',
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    Signed In!
                  </div>
                </div>
              )}

              {/* Text + tap icon (normal state) */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  height: '100%',
                  padding: '24px 28px',
                  opacity: isDone ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: 36,
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.1,
                        textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                      }}
                    >
                      {cat.emoji} {cat.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 15,
                        color: 'rgba(255,255,255,0.8)',
                        marginTop: 5,
                      }}
                    >
                      {cat.desc}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: isCooldown ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      color: '#fff',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {isCooldown ? '⏳' : '👆'}
                  </div>
                </div>
              </div>

              {/* Cooldown progress bar */}
              {isCooldown && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '0 0 24px 24px',
                    overflow: 'hidden',
                    zIndex: 15,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: '#fff',
                        animation: `cooldownBar ${(settings.checkin_cooldown || 5000) * 0.6}ms linear forwards`,                    }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
