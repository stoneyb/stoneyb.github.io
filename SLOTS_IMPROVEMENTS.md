# Slot Machine Improvements Plan

## High Impact

### 1. Paytable Display
- Add "PAYS" button next to controls
- On click, overlay semi-transparent panel showing all symbols with their payout multipliers
- Format: `7 = 100x | $ = 50x | * = 25x | # = 15x | @ = 10x | & = 5x`
- Click anywhere or button again to dismiss

### 2. Winning Symbol Highlight
- On win, flash winning reels with glow effect
- Pulse animation 3-4 times over ~1 second
- Use symbol's color for the glow
- For jackpot, more intense/longer glow before jackpot animation starts

### 3. Spin Button State
- Store reference to spin button (already done: `this.spinBtn`)
- On spin start: `spinBtn.disabled = true`, `spinBtn.innerHTML = "..."`
- On spin end: `spinBtn.disabled = false`, `spinBtn.innerHTML = "SPIN"`
- Add CSS for disabled state (already exists)

### 4. Balance Animation
- On win, don't set balance instantly
- Animate from old balance to new balance over ~500ms
- Use requestAnimationFrame, increment by small amounts
- Optional: accelerate counting for large wins

### 5. Near-Miss Feedback
- Detect when exactly 2 symbols match (already paying out small amount)
- Add brief screen shake or flash effect
- Different from win - more subtle, builds anticipation
- Could highlight the 2 matching briefly

## Medium Impact

### 6. Reel Easing
- Replace abrupt stop with easing function
- When reel should stop, don't instantly set speed to 0
- Gradually decrease: `speed *= 0.85` each frame until < threshold
- Add slight overshoot and bounce back (elastic ease)
- Each reel stops ~300ms after triggered

### 7. Auto-Spin Toggle
- Add "AUTO" button to controls
- When active, automatically trigger spin() after each result (with ~500ms delay)
- Stop conditions: balance < bet, jackpot hit, button clicked again
- Visual indicator when auto is active (button stays highlighted)
- Store `this.autoSpin = false` state

### 8. Max Bet Button
- Add "MAX" button to controls
- On click: `this.betAmount = Math.min(100, this.balance)`
- Update display immediately
- Disable if already at max or balance <= minimum bet

### 9. Statistics Panel
- Track in localStorage: `slotsStats = { totalSpins, totalWagered, totalWon, biggestWin }`
- Add small "STATS" button
- Overlay panel showing:
  - Total spins
  - Total wagered
  - Total won
  - Biggest single win
  - Win rate % (wins / spins)
- Update stats after each spin

## Polish

### 11. Motion Blur on Reels
- While spinning fast, apply blur effect to symbols
- Options:
  - Draw multiple offset copies with decreasing opacity
  - Use CSS filter blur on canvas (performance concern)
  - Draw symbols with vertical stretch/smear
- As speed decreases, reduce blur intensity
- Sharp/clear when stopped

### 12. Responsive Canvas
- Detect container/viewport width
- Scale canvas dimensions proportionally for screens < 400px wide
- Adjust font sizes, reel dimensions, button sizes
- Use `window.matchMedia` or check on create
- Consider touch target sizes (min 44px)

### 13. Particle Effects on All Wins
- Extend particle system from jackpot animation
- Scale particle count/size/duration based on win amount:
  - Small win (2 match): 4 particles, quick fade
  - Medium win (3 match): 8 particles, moderate
  - Big win (3 high-value): 12 particles, longer
  - Jackpot: current full animation
- Use winning symbol's color for particles

### 14. Decorative Lever
- Draw lever graphic on left side of machine frame
- Animated pull-down and spring-back when spin triggered
- Clickable as alternative spin trigger
- States: idle (up), pulling (animating down), releasing (spring back)
- Gold/brass color to match theme

### 15. Wild Symbol
- Add new symbol: `{ char: "W", color: "#ff00ff", weight: 3, payout: 0, wild: true }`
- Wild matches any other symbol
- Modify win detection logic:
  - If any reel has wild, check if other two match OR if two wilds
  - 3 wilds = special bonus (50x?)
- Wild should be rarer than 7s
- Distinct visual treatment (rainbow/shimmer effect)

---

## Implementation Order (suggested)
1. Spin button state (easiest, immediate UX win)
2. Winning symbol highlight
3. Paytable display
4. Near-miss feedback
5. Balance animation
6. Reel easing
7. Max bet button
8. Auto-spin
9. Statistics panel
10. Responsive canvas
11. Particle effects on all wins
12. Motion blur
13. Lever graphic
14. Wild symbol

## Files to Modify
- `js/slots.js` - all game logic changes
- `js/commands/easter-eggs.js` - update help text if controls change
