import { useState, useEffect } from 'react'
import { PAGE_BG, DEFAULT_SETTINGS } from '../constants'
import { getSettings, updateSettings } from '../db'

const PRESETS = [
  { label: '1s', value: 1000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(s => {
      if (s) setSettings(s)
    })
  }, [])

  const handleChange = async (key, value) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    setSaving(true)
    await updateSettings(updated.checkin_cooldown, updated.rating_cooldown)
    setSaving(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG,
        padding: '32px 20px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', marginBottom: 8 }}>
          <a
            href="/dashboard"
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </a>
        </p>
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          ⚙️ Settings
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.25)',
            marginBottom: 36,
            textAlign: 'center',
          }}
        >
          Rate limits & cooldowns
          {saving && (
            <span style={{ marginLeft: 8, color: '#FFB800' }}>· Saving...</span>
          )}
        </p>

        <div
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '32px 28px',
          }}
        >
          {[
            {
              key: 'checkin_cooldown',
              label: 'Check-in Cooldown',
              desc: 'Delay between taps on the sign-in kiosk',
            },
            {
              key: 'rating_cooldown',
              label: 'Rating Spinner Duration',
              desc: 'How long the saving animation plays on checkout',
            },
          ].map((item, idx) => (
            <div key={item.key} style={{ marginBottom: idx === 0 ? 36 : 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#FFB800',
                    background: 'rgba(255,180,0,0.1)',
                    padding: '4px 14px',
                    borderRadius: 8,
                  }}
                >
                  {settings[item.key] / 1000}s
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 12,
                }}
              >
                {item.desc}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => handleChange(item.key, p.value)}
                    style={{
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: 12,
                      border: `2px solid ${
                        settings[item.key] === p.value
                          ? '#FFB800'
                          : 'rgba(255,255,255,0.06)'
                      }`,
                      background:
                        settings[item.key] === p.value
                          ? 'rgba(255,180,0,0.1)'
                          : 'transparent',
                      color:
                        settings[item.key] === p.value
                          ? '#FFB800'
                          : 'rgba(255,255,255,0.25)',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.2s',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Route cheat-sheet */}
        <div
          style={{
            marginTop: 28,
            background: 'rgba(255,255,255,0.025)',
            borderRadius: 18,
            padding: '22px 24px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.2)',
              fontWeight: 700,
              marginBottom: 14,
              letterSpacing: '0.5px',
            }}
          >
            ROUTE REFERENCE
          </div>
          {[
            { path: '/signin', label: 'Sign-in kiosk', note: 'Tablet 1' },
            { path: '/checkout', label: 'Rating kiosk', note: 'Tablet 2' },
            { path: '/dashboard', label: 'Live stats', note: 'Admin' },
            { path: '/settings', label: 'Config', note: 'Admin' },
          ].map(r => (
            <div
              key={r.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                fontSize: 13,
              }}
            >
              <code
                style={{
                  color: '#FFB800',
                  fontFamily: 'monospace',
                  fontSize: 13,
                }}
              >
                {r.path}
              </code>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{r.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {r.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
