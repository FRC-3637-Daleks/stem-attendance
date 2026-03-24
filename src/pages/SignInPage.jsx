import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, PAGE_BG, DEFAULT_SETTINGS } from '../constants'
import { addCheckin, addLog, getSettings } from '../db'
import Toast from '../components/Toast'

export default function SignInPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [cooldowns, setCooldowns] = useState({})
  const [toast, setToast] = useState({ msg: '', show: false, color: '' })
  const [customImages, setCustomImages] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [tapCounts, setTapCounts] = useState({})
  const fileRefs = useRef({})

  // Load settings from Supabase on mount
  useEffect(() => {
    getSettings().then(s => {
      if (s) setSettings(s)
    })
  }, [])

  const showToast = (msg, color) => {
    setToast({ msg, show: true, color })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 1800)
  }

  const handleCheckin = async (catId) => {
    if (cooldowns[catId]) return

    // Immediately set cooldown (optimistic)
    setCooldowns(prev => ({ ...prev, [catId]: true }))
    setTapCounts(prev => ({ ...prev, [catId]: (prev[catId] || 0) + 1 }))

    const cat = CATEGORIES.find(c => c.id === catId)
    showToast(`${cat.emoji}  Checked in to ${cat.name}!`, cat.color)

    // Write to Supabase
    await addCheckin(catId)
    await addLog('checkin', catId)

    // Release cooldown after duration
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [catId]: false }))
    }, settings.checkin_cooldown)
  }

  const handleUpload = (catId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) =>
      setCustomImages(prev => ({ ...prev, [catId]: ev.target.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, padding: '24px 16px 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            margin: '0 0 6px',
          }}
        >
          🏗️ STEM Lab
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          Tap your station to check in
        </p>
      </div>

      {/* Edit toggle (small, unobtrusive) */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            background: editMode ? 'rgba(255,180,0,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${editMode ? 'rgba(255,180,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: editMode ? '#FFB800' : 'rgba(255,255,255,0.25)',
            padding: '5px 14px',
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {editMode ? '✓ Done editing' : '✎ Edit images'}
        </button>
      </div>

      {/* Category cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        {CATEGORIES.map(cat => {
          const onCooldown = cooldowns[cat.id]
          const imgSrc = customImages[cat.id] || cat.defaultImage
          const count = tapCounts[cat.id] || 0

          return (
            <div key={cat.id} style={{ position: 'relative' }}>
              <button
                disabled={onCooldown || editMode}
                onClick={() => handleCheckin(cat.id)}
                style={{
                  width: '100%',
                  border: 'none',
                  borderRadius: 28,
                  padding: 0,
                  cursor: onCooldown || editMode ? 'default' : 'pointer',
                  background: 'transparent',
                  position: 'relative',
                  transform: onCooldown ? 'scale(0.97)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  animation:
                    !onCooldown && !editMode
                      ? 'pulseGlow 3s ease-in-out infinite'
                      : 'none',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 240,
                    borderRadius: 28,
                    overflow: 'hidden',
                    position: 'relative',
                    background: cat.color + '33',
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: onCooldown
                        ? 'brightness(0.35) grayscale(0.5)'
                        : 'brightness(0.7)',
                      transition: 'filter 0.4s',
                    }}
                    onError={e => {
                      e.target.style.display = 'none'
                    }}
                  />

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(180deg, transparent 20%, ${cat.color}DD 100%)`,
                      opacity: onCooldown ? 0.25 : 0.9,
                      transition: 'opacity 0.4s',
                    }}
                  />

                  {/* Text + tap icon */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '28px 30px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            fontSize: 38,
                            fontWeight: 800,
                            color: '#fff',
                            lineHeight: 1.1,
                            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                          }}
                        >
                          {cat.emoji} {cat.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 16,
                            color: 'rgba(255,255,255,0.8)',
                            marginTop: 6,
                          }}
                        >
                          {cat.desc}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 18,
                          background: onCooldown
                            ? 'rgba(255,255,255,0.12)'
                            : 'rgba(255,255,255,0.22)',
                          backdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 30,
                          color: '#fff',
                          flexShrink: 0,
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {onCooldown ? '⏳' : '👆'}
                      </div>
                    </div>
                  </div>

                  {/* Counter badge */}
                  {count > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(6px)',
                        color: '#fff',
                        padding: '6px 16px',
                        borderRadius: 12,
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span
                        key={count}
                        style={{
                          display: 'inline-block',
                          animation: 'countPop 0.3s ease',
                        }}
                      >
                        {count}
                      </span>{' '}
                      today
                    </div>
                  )}

                  {/* Cooldown progress bar */}
                  {onCooldown && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 5,
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '0 0 28px 28px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: '#fff',
                          animation: `cooldownBar ${settings.checkin_cooldown}ms linear forwards`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </button>

              {/* Image upload overlay */}
              {editMode && (
                <div
                  onClick={() => fileRefs.current[cat.id]?.click()}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 28,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '3px dashed rgba(255,255,255,0.35)',
                    zIndex: 5,
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    Tap to upload image
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      marginTop: 4,
                    }}
                  >
                    for {cat.name}
                  </div>
                  <input
                    ref={el => (fileRefs.current[cat.id] = el)}
                    type="file"
                    accept="image/*"
                    onChange={e => handleUpload(cat.id, e)}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Toast message={toast.msg} visible={toast.show} color={toast.color} />
    </div>
  )
}
