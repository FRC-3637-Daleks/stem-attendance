import React from 'react'

export default function Toast({ message, visible, color }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 24}px) scale(${visible ? 1 : 0.95})`,
        background: color || '#1a1a2e',
        color: '#fff',
        padding: '14px 32px',
        borderRadius: 16,
        fontSize: 16,
        fontWeight: 700,
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
        boxShadow: `0 12px 40px ${color || '#000'}44`,
        zIndex: 999,
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )
}
