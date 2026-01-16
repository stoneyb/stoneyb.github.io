/* ========================================
   CONFIGURATION
   Centralized app configuration
   ======================================== */

export const CONFIG = {
  // Social and contact URLs
  social: {
    email: 'hello@tomstoneberg.com',
    github: 'https://github.com/stoneyb',
    twitter: 'https://x.com/tstoneb',
    goodreads: 'https://www.goodreads.com/user/show/40625768',
    linkedin: 'https://bishopfox.com/blog/linkedin-introduces-insecurity',
  },

  // Hidden easter egg URLs
  hidden: {
    dn: 'https://dn-clicker2.vercel.app',
    chumley: 'https://op.gg/lol/summoners/na/chumley420-NA1',
    empatheticrock: 'https://op.gg/lol/summoners/na/EmpatheticRock-NA1',
    masedawg: 'https://op.gg/lol/summoners/na/masedawg69-NA1',
  },

  // Asset paths
  assets: {
    resume: '/assets/TomStonebergResumeJan2026.pdf',
  },

  // LocalStorage keys
  storage: {
    snakeHighScore: 'snakeHighScore',
    breakoutHighScore: 'breakoutHighScore',
    slotsBalance: 'slotsBalance',
    slotsTotalWinnings: 'slotsTotalWinnings',
  },

  // Game settings
  games: {
    snake: {
      gridSize: 20,
      tileCount: 15,
      speed: 100,
      speedIncrement: 2,
      minSpeed: 50,
      pointsPerFood: 10,
    },
    breakout: {
      canvasWidth: 400,
      canvasHeight: 300,
      paddleWidth: 70,
      paddleHeight: 10,
      paddleSpeed: 8,
      ballRadius: 6,
      ballSpeed: 4,
      brickRowCount: 5,
      brickColumnCount: 8,
      brickWidth: 45,
      brickHeight: 15,
      brickPadding: 2,
      brickOffsetTop: 30,
      brickOffsetLeft: 13,
      lives: 3,
      updateInterval: 16, // ~60fps
    },
    slots: {
      canvasWidth: 360,
      canvasHeight: 240,
      reelWidth: 100,
      reelHeight: 165,
      reelGap: 15,
      reelStartX: 15,
      reelStartY: 50,
      symbolHeight: 60,
      defaultBalance: 100,
      defaultBet: 10,
      symbols: [
        { char: '7', color: '#ef4444', weight: 5, payout: 100 },
        { char: '$', color: '#22c55e', weight: 10, payout: 50 },
        { char: '*', color: '#ffc233', weight: 15, payout: 25 },
        { char: '#', color: '#3b82f6', weight: 20, payout: 15 },
        { char: '@', color: '#a855f7', weight: 25, payout: 10 },
        { char: '&', color: '#06b6d4', weight: 25, payout: 5 },
      ],
    },
    matrix: {
      defaultDuration: 15000,
    },
  },

  // Terminal settings
  terminal: {
    inputId: 'terminal-input',
  },
};
