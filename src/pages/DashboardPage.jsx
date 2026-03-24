import { useState, useEffect } from 'react'
import { CATEGORIES, PAGE_BG } from '../constants'
import {
  getCheckinCounts,
  getRatingStats,
  getRecentLogs,
  subscribeToCheckins,
  subscribeToRatings,
  removeCheckins,
  resetAllData,
} from '../db'

export default function DashboardPage() {
  const [counts, setCounts] = useState({})
  const [ratingStats, setRatingStats] = useState({ total: 0, avg: '—' })
  const [logs, setLogs] = useState([])
  const [removeAmounts, setRemoveAmounts] = useState({})
  const [confirmReset, setConfirmReset] = useState(false)
  const [busy, setBusy] = useState(null) // catId or 'reset'

  const refresh = async () => {
    const [c, r, l] = await Promise.all([
      getCheckinCounts(),
      getRatingStats(),
      getRecentLogs(50),
    ])
    setCounts(c)
    setRatingStats(r)
    setLogs(l)
  }

  useEffect(() => {
    refresh()
    const checkinSub = subscribeToCheckins(() => refresh())
    const ratingSub = subscribeToRatings(() => refresh())
    const interval = setInterval(refresh, 5000)
    return () => {
      checkinSub.then?.(ch => ch.unsubscribe?.())
      ratingSub.then?.(ch => ch.unsubscribe?.())
      clearInterval(interval)
    }
  }, [])

  const handleRemove = async (catId) => {
    const amount = parseInt(removeAmounts[catId]) || 0
    if (amount <= 0) return
    setBusy(catId)
    await removeCheckins(catId, amount)
    setRemoveAmounts(prev => ({ ...prev, [catId]: '' }))
    await refresh()
    setBusy(null)
  }

  const handleReset = async () => {
    setBusy('reset')
    await resetAllData()
    setConfirmReset(false)
    await refresh()
    setBusy(null)
  }

  const totalCheckins = Object.values(counts).reduce((a, b) => a + b, 0)

  const cardStyle = {
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: '24px 26px',
    marginBottom: 24,
  }
  const labelStyle = {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: 700,
    marginBottom: 18,
    letterSpacing: '0.5px',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG,
        padding: '32px 20px 60px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
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
          📊 Dashboard
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.25)',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          Live data &nbsp;·&nbsp;{' '}
          <a href="/settings" style={{ color: 'rgba(255,180,0,0.5)', textDecoration: 'none' }}>
            Settings →
          </a>
        </p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'CHECK-INS', value: totalCheckins, icon: '✋' },
            { label: 'RATINGS', value: ratingStats.total, icon: '⭐' },
            { label: 'AVG RATING', value: ratingStats.avg, icon: '📈' },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, textAlign: 'center', padding: '22px 16px', marginBottom: 0 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 34, fontWeight: 800, color: '#fff',
              }}>{s.value}</div>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.25)',
                fontWeight: 700, marginTop: 4, letterSpacing: '0.5px',
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Per-category with remove controls */}
        <div style={cardStyle}>
          <div style={labelStyle}>BY STATION — MANAGE COUNTS</div>
          {CATEGORIES.map(cat => {
            const count = counts[cat.id] || 0
            const max = Math.max(...CATEGORIES.map(c => counts[c.id] || 0), 1)
            const isBusy = busy === cat.id
            return (
              <div key={cat.id} style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                    {cat.emoji} {cat.name}
                  </span>
                  <span style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: 17, fontWeight: 800, color: cat.color,
                  }}>{count}</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / max) * 100}%`,
                    minWidth: count > 0 ? 8 : 0,
                    background: cat.gradient,
                    borderRadius: 5,
                    transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                </div>
                {/* Remove controls */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max={count}
                    placeholder="# to remove"
                    value={removeAmounts[cat.id] || ''}
                    onChange={e => setRemoveAmounts(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: 'none',
                      maxWidth: 120,
                    }}
                  />
                  <button
                    onClick={() => handleRemove(cat.id)}
                    disabled={isBusy || !removeAmounts[cat.id] || count === 0}
                    style={{
                      padding: '8px 16px',
                      background: isBusy ? 'rgba(255,255,255,0.05)' : 'rgba(255,80,80,0.15)',
                      border: '1px solid rgba(255,80,80,0.25)',
                      borderRadius: 10,
                      color: isBusy ? 'rgba(255,255,255,0.3)' : '#ff6666',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isBusy ? 'default' : 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isBusy ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reset All */}
        <div style={cardStyle}>
          <div style={labelStyle}>DANGER ZONE</div>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,60,60,0.08)',
                border: '1px solid rgba(255,60,60,0.2)',
                borderRadius: 14,
                color: '#ff5555',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              🗑️ Reset All Data
            </button>
          ) : (
            <div style={{
              background: 'rgba(255,40,40,0.1)',
              border: '1px solid rgba(255,60,60,0.3)',
              borderRadius: 14,
              padding: '18px 20px',
            }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: '#ff6666', marginBottom: 6,
              }}>
                Are you sure?
              </div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 14, lineHeight: 1.5,
              }}>
                This deletes all check-ins and ratings. Logs are kept.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleReset}
                  disabled={busy === 'reset'}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#cc2222',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: busy === 'reset' ? 'default' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {busy === 'reset' ? 'Resetting...' : 'Yes, reset everything'}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div style={cardStyle}>
          <div style={labelStyle}>ACTIVITY LOG</div>
          {logs.length === 0 ? (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.12)', textAlign: 'center', padding: 36 }}>
              Waiting for activity...
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background:
                        log.action === 'checkin' ? '#00A651'
                        : log.action === 'rating' ? '#FFB800'
                        : log.action === 'removed' ? '#FF5555'
                        : log.action === 'reset' ? '#FF3333'
                        : '#888',
                    }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.45)', flex: 1 }}>
                    {log.action === 'removed' && '🔻 '}
                    {log.action === 'reset' && '🗑️ '}
                    {log.detail}
                  </span>
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.15)',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  >
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
