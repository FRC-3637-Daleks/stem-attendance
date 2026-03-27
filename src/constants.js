export const CATEGORIES = [
  {
    id: 'hello',
    name: 'Welcome!',
    emoji: '👋',
    color: '#FF9500',
    gradient: 'linear-gradient(135deg, #FF9500 0%, #FFCC00 100%)',
    defaultImage: '/images/hello.jpg',
    desc: 'Tap here first to check in',
    isWelcome: true,
  },
  {
    id: 'lego',
    name: 'Lego',
    emoji: '🧱',
    color: '#E3350D',
    gradient: 'linear-gradient(135deg, #E3350D 0%, #FF6B4A 100%)',
    defaultImage: '/images/lego.jpg',
    desc: 'Classic brick building',
  },
  {
    id: 'snap',
    name: 'Snap Circuits',
    emoji: '🔌',
    color: '#0066FF',
    gradient: 'linear-gradient(135deg, #0055DD 0%, #3399FF 100%)',
    defaultImage: '/images/snap.jpg',
    desc: 'Snap & connect circuits',
  },
  {
    id: 'squishy',
    name: 'Squishy Circuits',
    emoji: '🔋',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #7B1FA2 0%, #CE93D8 100%)',
    defaultImage: '/images/circ.png',
    desc: 'Sculpt & power up',
  },
  {
    id: 'vex',
    name: 'Vex Robot',
    emoji: '🤖',
    color: '#00A651',
    gradient: 'linear-gradient(135deg, #008844 0%, #33CC77 100%)',
    defaultImage: '/images/vex.jpg',
    desc: 'Drive & program robots',
  },
]

export const DEFAULT_SETTINGS = {
  checkin_cooldown: 5000,
  rating_cooldown: 2000,
}

export const PAGE_BG = 'linear-gradient(170deg, #0d0d1a 0%, #1a1a2e 40%, #16163a 100%)'
