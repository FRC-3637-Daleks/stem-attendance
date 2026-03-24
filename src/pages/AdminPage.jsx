import { useState, useEffect } from 'react'
import { CATEGORIES, PAGE_BG } from '../constants'
import {
  getCheckinCounts,
  getRatingStats,
  removeCheckins,
  resetAllData,
} from '../db'

export default function AdminPage() {
  const [counts, setCounts] = useState({})
  const [ratingStats, setRatingStats] = useState({ total: 0, avg: '—' })
  const [removeAmounts, setRemoveAmounts] = useState({})
  const [confirmRemove, setConfirmRemove] = useState(null) // catId or null
  const [confirmReset, setConfirmReset] = useState(false)
  const [busy, setBusy] = useState(null) // catId | 'reset' | null
  const [lastAction, setLastAction] = useState(null)

  const refresh = async () => {
    const [c, r] = await Promise.all([getCheckinCounts(), getRatingStats()])
    setCounts(c)
    setRatingStats(r)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [])

  const showAction = (msg) => {
    setLastAction(msg)
    setTimeout(() => setLastAction(null), 3000)
  }

  const handleRemove = async (catId) => {
    const amount = parseInt(removeAmounts[catId]) || 0
    if (amount <= 0) return
    setBusy(catId)
    const deleted = await removeCheckins(catId, amount)
    setRemoveAmounts(prev => ({ ...prev, [catId]: '' }))
    setConfirmRemove(null)
    await refresh()
    setBusy(null)
    showAction(`Removed ${deleted} check-in${deleted !== 1 ? 's' : ''} from ${catId}`)
  }

  const handleReset = async () => {
    setBusy('reset')
    await resetAllData()
    setConfirmReset(false)
    await refresh()
    setBusy(null)
    showAction('All data has been reset')
  }

  const totalCheckins = Object.values(counts).reduce((a, b) => a + b, 0)

  const cardStyle = {
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: '24px 26px',
    marginBottom: 24,
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
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', marginBottom: 8 }}>
          <a
            href="/dashboard"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
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
          🔧 Manage Data
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.25)',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          Remove check-ins or reset all data
        </p>

        {/* Success toast */}
        {lastAction && (
          <div
            style={{
              background: 'rgba(0,200,83,0.12)',
              border: '1px solid rgba(0,200,83,0.25)',
              borderRadius: 14,
              padding: '14px 20px',
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 600,
              color: '#4caf50',
              textAlign: 'center',
              animation: 'fadeUp 0.3s ease',
            }}
          >
            ✓ {lastAction}
          </div>
        )}

        {/* Current totals summary */}
        <div style={cardStyle}>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: '0.5px',
            }}
          >
            CURRENT TOTALS
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: 4,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {totalCheckins}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                CHECK-INS
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {ratingStats.total}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                RATINGS
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {ratingStats.avg}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                AVG ⭐
              </div>
            </div>
          </div>
        </div>

        {/* Per-category remove */}
        <div style={cardStyle}>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
              fontWeight: 700,
              marginBottom: 18,
              letterSpacing: '0.5px',
            }}
          >
            REMOVE CHECK-INS BY STATION
          </div>

          {CATEGORIES.map(cat => {
            const count = counts[cat.id] || 0
            const isBusy = busy === cat.id
            const isConfirming = confirmRemove === cat.id
            const amount = parseInt(removeAmounts[cat.id]) || 0

            return (
              <div
                key={cat.id}
                style={{
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Station header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                    {cat.emoji} {cat.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: cat.color,
                    }}
                  >
                    {count}
                  </span>
                </div>

                {/* Confirm dialog */}
                {isConfirming ? (
                  <div
                    style={{
                      background: 'rgba(255,80,80,0.08)',
                      border: '1px solid rgba(255,80,80,0.2)',
                      borderRadius: 14,
                      padding: '16px 18px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#ff6666',
                        marginBottom: 6,
                      }}
                    >
                      Remove {amount} check-in{amount !== 1 ? 's' : ''} from {cat.name}?
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.3)',
                        marginBottom: 14,
                      }}
                    >
                      This removes the {amount} most recent. A log entry will be kept.
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => handleRemove(cat.id)}
                        disabled={isBusy}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#cc3333',
                          border: 'none',
                          borderRadius: 10,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: isBusy ? 'default' : 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {isBusy ? 'Removing...' : 'Yes, remove'}
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        style={{
                          padding: '10px 18px',
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
                ) : (
                  /* Input + remove button */
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      max={count}
                      placeholder="# to remove"
                      value={removeAmounts[cat.id] || ''}
                      onChange={e =>
                        setRemoveAmounts(prev => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: '#fff',
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                        outline: 'none',
                        maxWidth: 140,
                      }}
                    />
                    <button
                      onClick={() => {
                        if (amount > 0 && count > 0) setConfirmRemove(cat.id)
                      }}
                      disabled={!amount || count === 0}
                      style={{
                        padding: '10px 20px',
                        background:
                          !amount || count === 0
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(255,80,80,0.12)',
                        border: `1px solid ${!amount || count === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,80,80,0.25)'}`,
                        borderRadius: 12,
                        color: !amount || count === 0 ? 'rgba(255,255,255,0.15)' : '#ff6666',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: !amount || count === 0 ? 'default' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Reset All */}
        <div style={cardStyle}>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,80,80,0.5)',
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: '0.5px',
            }}
          >
            ⚠️ DANGER ZONE
          </div>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255,60,60,0.06)',
                border: '1px solid rgba(255,60,60,0.15)',
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
            <div
              style={{
                background: 'rgba(255,40,40,0.1)',
                border: '2px solid rgba(255,60,60,0.3)',
                borderRadius: 16,
                padding: '22px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#ff5555',
                  marginBottom: 8,
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
              >
                ⚠️ Are you absolutely sure?
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: 18,
                  lineHeight: 1.6,
                }}
              >
                This permanently deletes <strong style={{ color: '#ff8888' }}>all check-ins</strong>{' '}
                and <strong style={{ color: '#ff8888' }}>all ratings</strong>. Activity logs are
                preserved. This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleReset}
                  disabled={busy === 'reset'}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#cc2222',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: busy === 'reset' ? 'default' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {busy === 'reset' ? 'Resetting...' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  style={{
                    padding: '12px 22px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 14,
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
      </div>
    </div>
  )
}
