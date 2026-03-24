import { useState, useEffect } from 'react'
import { PAGE_BG, DEFAULT_SETTINGS } from '../constants'
import { addRating, addLog, getSettings } from '../db'

const STAR_COUNT = 5
const LABELS = ['', 'Needs work', 'Okay', 'Good', 'Great!', 'Amazing!']

export default function CheckoutPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [selected, setSelected] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hover, setHover] = useState(0)

  useEffect(() => {
    getSettings().then(s => {
      if (s) setSettings(s)
    })
  }, [])

  const handleRate = async (val) => {
    if (submitting || submitted) return
    setSelected(val)
    setSubmitting(true)

    // Show spinner for the configured duration, then save
    setTimeout(async () => {
      await addRating(val)
      await addLog('rating', `${val} stars`)
      setSubmitting(false)
      setSubmitted(true)

      // Reset for the next person
      setTimeout(() => {
        setSelected(0)
        setSubmitted(false)
      }, 2400)
    }, settings.rating_cooldown)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
      }}
    >
      {submitted ? (
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
          <div
            style={{
              fontSize: 88,
              marginBottom: 20,
              animation: 'starPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            🎉
          </div>
          <div
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 8,
            }}
          >
            Thanks!
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            Rating recorded
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 34,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}
          >
            How was your experience?
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 52,
            }}
          >
            Tap a star — it saves automatically
          </p>

          {/* Stars */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 14,
              marginBottom: 44,
            }}
          >
            {Array.from({ length: STAR_COUNT }, (_, i) => {
              const idx = i + 1
              const active = idx <= (submitting ? selected : hover || selected)
              return (
                <button
                  key={i}
                  disabled={submitting}
                  onMouseEnter={() => !submitting && setHover(idx)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => handleRate(idx)}
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 22,
                    border: `2px solid ${active ? 'rgba(255,200,0,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    background: active
                      ? 'linear-gradient(135deg, rgba(255,200,0,0.18), rgba(255,150,0,0.08))'
                      : 'rgba(255,255,255,0.02)',
                    cursor: submitting ? 'default' : 'pointer',
                    fontSize: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    transform: active ? 'scale(1.12)' : 'scale(1)',
                    animation:
                      idx === selected && submitting ? 'starPop 0.4s ease' : 'none',
                    boxShadow: active ? '0 6px 28px rgba(255,180,0,0.2)' : 'none',
                  }}
                >
                  {active ? '⭐' : '☆'}
                </button>
              )
            })}
          </div>

          {/* Saving spinner */}
          {submitting && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                animation: 'fadeUp 0.3s ease',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  border: '3px solid rgba(255,255,255,0.12)',
                  borderTopColor: '#FFB800',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                Saving...
              </span>
            </div>
          )}

          {/* Hover label */}
          {!submitting && !selected && hover > 0 && (
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 20,
                fontWeight: 600,
                color: 'rgba(255,200,0,0.8)',
                animation: 'fadeUp 0.2s ease',
              }}
            >
              {LABELS[hover]}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
