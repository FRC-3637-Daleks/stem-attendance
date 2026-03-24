import { useState, useEffect } from 'react'
import { CATEGORIES, PAGE_BG } from '../constants'
import {
  getCheckinCounts,
  getRatingStats,
  getRecentLogs,
  subscribeToCheckins,
  subscribeToRatings,
} from '../db'

export default function DashboardPage() {
  const [counts, setCounts] = useState({})
  const [ratingStats, setRatingStats] = useState({ total: 0, avg: '—' })
  const [logs, setLogs] = useState([])

  const refresh = async () => {
    const [c, r, l] = await Promise.all([
      getCheckinCounts(),
      getRatingStats(),
      getRecentLogs(),
    ])
    setCounts(c)
    setRatingStats(r)
    setLogs(l)
  }

  useEffect(() => {
    refresh()

    // Real-time: refresh when new checkins or ratings arrive
    const checkinSub = subscribeToCheckins(() => refresh())
    const ratingSub = subscribeToRatings(() => refresh())

    // Also poll every 5s as a fallback
    const interval = setInterval(refresh, 5000)

    return () => {
      checkinSub.then?.(ch => ch.unsubscribe?.())
      ratingSub.then?.(ch => ch.unsubscribe?.())
      clearInterval(interval)
    }
  }, [])

  const totalCheckins = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG,
        padding: '32px 20px',
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
          <a
            href="/settings"
            style={{ color: 'rgba(255,180,0,0.5)', textDecoration: 'none' }}
          >
            Settings →
          </a>
        </p>

        {/* Stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            { label: 'CHECK-INS', value: totalCheckins, icon: '✋' },
            { label: 'RATINGS', value: ratingStats.total, icon: '⭐' },
            { label: 'AVG RATING', value: ratingStats.avg, icon: '📈' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: '22px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 34,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.25)',
                  fontWeight: 700,
                  marginTop: 4,
                  letterSpacing: '0.5px',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Per-category bars */}
        <div
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '24px 26px',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: '0.5px',
            }}
          >
            BY STATION
          </div>
          {CATEGORIES.map(cat => {
            const count = counts[cat.id] || 0
            const max = Math.max(...CATEGORIES.map(c => counts[c.id] || 0), 1)
            return (
              <div key={cat.id} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                  }}
                >
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                    {cat.emoji} {cat.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: 17,
                      fontWeight: 800,
                      color: cat.color,
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(count / max) * 100}%`,
                      minWidth: count > 0 ? 8 : 0,
                      background: cat.gradient,
                      borderRadius: 5,
                      transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Activity log */}
        <div
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '24px 26px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: '0.5px',
            }}
          >
            ACTIVITY LOG
          </div>
          {logs.length === 0 ? (
            <div
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.12)',
                textAlign: 'center',
                padding: 36,
              }}
            >
              Waiting for activity...
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
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
                        log.action === 'checkin' ? '#00A651' : '#FFB800',
                    }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.45)', flex: 1 }}>
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
