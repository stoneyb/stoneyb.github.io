/* ========================================
   SLOT MACHINE GAME
   Classic 3-reel slot machine in the terminal
   ======================================== */

import { BaseGame } from './BaseGame.js';
import { CONFIG } from '../config/config.js';
import { getStorageValue, setStorageValue } from '../utils/storage.js';

export class SlotMachineGame extends BaseGame {
  constructor(terminal) {
    super(terminal);

    // Get config
    const config = CONFIG.games.slots;

    // Canvas settings
    this.canvasWidth = config.canvasWidth;
    this.canvasHeight = config.canvasHeight;

    // Reel settings
    this.reelWidth = config.reelWidth;
    this.reelHeight = config.reelHeight;
    this.reelGap = config.reelGap;
    this.reelStartX = config.reelStartX;
    this.reelStartY = config.reelStartY;
    this.symbolHeight = config.symbolHeight;

    // Symbols
    this.symbols = config.symbols;

    // Game state
    this.balance = getStorageValue(CONFIG.storage.slotsBalance, config.defaultBalance);
    this.totalWinnings = getStorageValue(CONFIG.storage.slotsTotalWinnings, 0);
    this.betAmount = config.defaultBet;
    this.reels = [0, 0, 0];
    this.targetReels = [0, 0, 0];
    this.spinning = false;
    this.spinSpeed = [0, 0, 0];
    this.reelOffsets = [0, 0, 0];
    this.animationFrame = null;
    this.lastWin = 0;
    this.jackpotAnimation = null;
    this.jackpotFrame = 0;
    this.winHighlight = null;
    this.winHighlightDuration = 60;
    this.showPaytable = false;
    this.particles = [];
  }

  start() {
    this.dismissKeyboard();

    const infoHTML = `
      Balance: <span id="slots-balance">${this.balance}</span> |
      Bet: <span id="slots-bet">${this.betAmount}</span> |
      Won: <span id="slots-total">${this.totalWinnings}</span>
    `;
    this.createGameArea(
      this.canvasWidth,
      this.canvasHeight,
      'slots-canvas',
      infoHTML,
      'slots-info'
    );

    // Click on canvas for paytable icon or to dismiss
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const iconX = this.canvasWidth - 35;
      const iconY = 28;
      const iconRadius = 12;

      if (
        Math.abs(x - iconX) < iconRadius + 5 &&
        Math.abs(y - iconY) < iconRadius + 5
      ) {
        this.togglePaytable();
      } else if (this.showPaytable) {
        this.showPaytable = false;
        this.draw();
      }
    };

    this.createControls();
    this.bindControls();
    this.isRunning = true;
    this.draw();
  }

  createControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'slots-controls';

    const betDownBtn = document.createElement('button');
    betDownBtn.className = 'slots-btn';
    betDownBtn.innerHTML = 'BET -';
    betDownBtn.setAttribute('aria-label', 'Decrease bet');
    betDownBtn.onclick = () => this.changeBet(-5);

    const spinBtn = document.createElement('button');
    spinBtn.className = 'slots-btn slots-btn-spin';
    this.spinBtn = spinBtn;
    spinBtn.innerHTML = 'SPIN';
    spinBtn.setAttribute('aria-label', 'Spin');
    spinBtn.onclick = () => this.spin();

    const betUpBtn = document.createElement('button');
    betUpBtn.className = 'slots-btn';
    betUpBtn.innerHTML = 'BET +';
    betUpBtn.setAttribute('aria-label', 'Increase bet');
    betUpBtn.onclick = () => this.changeBet(5);

    controlsContainer.appendChild(betDownBtn);
    controlsContainer.appendChild(spinBtn);
    controlsContainer.appendChild(betUpBtn);
    this.container.appendChild(controlsContainer);
  }

  bindControls() {
    this.keyHandler = (e) => {
      if (!this.isRunning) return;

      if (e.key === 'Escape') {
        this.stop();
        this.terminal.print(
          '\n<span class="output-muted">Thanks for playing! Type "slots" to play again.</span>\n',
          'response'
        );
      }
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  changeBet(amount) {
    const newBet = this.betAmount + amount;
    if (newBet >= 5 && newBet <= Math.min(100, this.balance)) {
      this.betAmount = newBet;
      this.updateDisplay();
      this.draw();
    }
  }

  togglePaytable() {
    this.showPaytable = !this.showPaytable;
    this.draw();
  }

  spin() {
    if (this.spinning || this.balance < this.betAmount) {
      if (this.balance < this.betAmount) {
        this.terminal.print(
          '<span class="output-error">Not enough balance! Reset with "slots reset"</span>',
          'response'
        );
      }
      return;
    }

    this.spinBtn.disabled = true;
    this.spinBtn.innerHTML = '...';

    this.balance -= this.betAmount;
    this.lastWin = 0;
    this.updateDisplay();

    this.targetReels = this.reels.map(() => this.getRandomSymbol());

    this.spinning = true;
    this.spinSpeed = [20, 20, 20];
    this.reelOffsets = [0, 0, 0];

    const stopDelays = [1000, 1500, 2000];
    stopDelays.forEach((delay, i) => {
      setTimeout(() => {
        this.stopReel(i);
      }, delay);
    });

    this.animate();
  }

  getRandomSymbol() {
    const totalWeight = this.symbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < this.symbols.length; i++) {
      random -= this.symbols[i].weight;
      if (random <= 0) {
        return i;
      }
    }
    return this.symbols.length - 1;
  }

  stopReel(index) {
    this.spinSpeed[index] = 0;
    this.reels[index] = this.targetReels[index];
    this.reelOffsets[index] = 0;

    if (this.spinSpeed.every((s) => s === 0)) {
      this.spinning = false;
      this.spinBtn.disabled = false;
      this.spinBtn.innerHTML = 'SPIN';
      this.checkWin();
    }
  }

  animate() {
    if (!this.isRunning) return;

    for (let i = 0; i < 3; i++) {
      if (this.spinSpeed[i] > 0) {
        this.reelOffsets[i] += this.spinSpeed[i];
        if (this.reelOffsets[i] >= this.symbolHeight) {
          this.reelOffsets[i] = 0;
          this.reels[i] = (this.reels[i] + 1) % this.symbols.length;
        }
      }
    }

    if (this.jackpotAnimation) {
      this.jackpotFrame++;
      if (this.jackpotFrame > 120) {
        this.jackpotAnimation = null;
        this.jackpotFrame = 0;
      }
    }

    this.draw();

    if (this.spinning || this.jackpotAnimation) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }
  }

  checkWin() {
    const [r1, r2, r3] = this.reels;
    let winAmount = 0;
    let isJackpot = false;
    let winningReels = [];
    let winColor = null;

    if (r1 === r2 && r2 === r3) {
      winAmount = this.symbols[r1].payout * this.betAmount;
      winningReels = [0, 1, 2];
      winColor = this.symbols[r1].color;

      if (this.symbols[r1].char === '7') {
        isJackpot = true;
        winAmount *= 2;
      }
    } else if (r1 === r2 || r2 === r3) {
      const matchIndex = r1 === r2 ? r1 : r2;
      winAmount = Math.floor(
        this.symbols[matchIndex].payout * this.betAmount * 0.2
      );
      winningReels = r1 === r2 ? [0, 1] : [1, 2];
      winColor = this.symbols[matchIndex].color;
    }

    if (winAmount > 0) {
      this.balance += winAmount;
      this.totalWinnings += winAmount;
      this.lastWin = winAmount;
      setStorageValue(CONFIG.storage.slotsBalance, this.balance);
      setStorageValue(CONFIG.storage.slotsTotalWinnings, this.totalWinnings);
      this.updateDisplay();

      this.winHighlight = {
        reels: winningReels,
        frame: 0,
        color: winColor,
        isJackpot: isJackpot,
      };
      this.animateWinHighlight();

      if (!isJackpot) {
        if (winningReels.length === 2) {
          this.spawnParticles(6, winColor, 60);
        } else if (r1 <= 2) {
          this.spawnParticles(14, winColor, 100);
        } else {
          this.spawnParticles(10, winColor, 80);
        }
      }

      if (isJackpot) {
        this.terminal.print(
          `\n<span class="output-success">*** JACKPOT! ***</span> You won <span class="output-accent">${winAmount}</span>!`,
          'response'
        );
      } else if (r1 === r2 && r2 === r3) {
        this.terminal.print(
          `<span class="output-success">Three of a kind!</span> Won <span class="output-accent">${winAmount}</span>`,
          'response'
        );
      }
    } else {
      setStorageValue(CONFIG.storage.slotsBalance, this.balance);
    }

    this.draw();
  }

  startJackpotAnimation() {
    this.jackpotAnimation = true;
    this.jackpotFrame = 0;
    this.animate();
  }

  animateWinHighlight() {
    if (!this.winHighlight || !this.isRunning) return;

    this.winHighlight.frame++;
    this.draw();

    const duration = this.winHighlight.isJackpot
      ? 90
      : this.winHighlightDuration;

    if (this.winHighlight.frame < duration) {
      requestAnimationFrame(() => this.animateWinHighlight());
    } else {
      if (this.winHighlight.isJackpot) {
        this.startJackpotAnimation();
      }
      this.winHighlight = null;
      this.draw();
    }
  }

  spawnParticles(count, color, duration) {
    const centerX =
      this.reelStartX + (3 * this.reelWidth + 2 * this.reelGap) / 2;
    const centerY = this.reelStartY + this.reelHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: color,
        size: 4 + Math.random() * 4,
        life: duration,
        maxLife: duration,
      });
    }
    this.animateParticles();
  }

  animateParticles() {
    if (this.particles.length === 0 || !this.isRunning) return;

    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      return p.life > 0;
    });

    this.draw();

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animateParticles());
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    this.particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  updateDisplay() {
    const balanceEl = document.getElementById('slots-balance');
    const betEl = document.getElementById('slots-bet');
    const totalEl = document.getElementById('slots-total');

    if (balanceEl) balanceEl.textContent = this.balance;
    if (betEl) betEl.textContent = this.betAmount;
    if (totalEl) totalEl.textContent = this.totalWinnings;
  }

  draw() {
    const ctx = this.ctx;

    // Background
    this.clearCanvas('#0a0a0f');

    // Title
    ctx.fillStyle = '#ffc233';
    ctx.font = 'bold 18px "IBM Plex Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('LUCKY TERMINAL', this.canvasWidth / 2, 35);

    // Paytable icon
    const iconX = this.canvasWidth - 35;
    const iconY = 28;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 12, 0, Math.PI * 2);
    ctx.fillStyle = this.showPaytable ? '#ffc233' : '#d4a017';
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#0a0a0f';
    ctx.font = 'bold 14px "IBM Plex Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', iconX, iconY);
    ctx.textBaseline = 'alphabetic';

    // Draw reels
    for (let i = 0; i < 3; i++) {
      this.drawReel(i);
    }

    // Win line indicator
    ctx.strokeStyle = 'rgba(255, 194, 51, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const lineY = this.reelStartY + this.reelHeight / 2 - 12;
    ctx.beginPath();
    ctx.moveTo(this.reelStartX, lineY);
    ctx.lineTo(this.reelStartX + 3 * this.reelWidth + 2 * this.reelGap, lineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw particles
    if (this.particles.length > 0) {
      this.drawParticles();
    }

    // Last win display
    if (this.lastWin > 0 && !this.spinning) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px "IBM Plex Mono"';
      ctx.fillText(
        `WIN: ${this.lastWin}`,
        this.canvasWidth / 2,
        this.canvasHeight - 8
      );
    }

    // Jackpot animation overlay
    if (this.jackpotAnimation) {
      this.drawJackpotAnimation();
    }

    // Paytable overlay
    if (this.showPaytable) {
      this.drawPaytable();
    }
  }

  drawPaytable() {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(15, 40, this.canvasWidth - 30, this.canvasHeight - 55);

    ctx.strokeStyle = '#ffc233';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 40, this.canvasWidth - 30, this.canvasHeight - 55);

    ctx.fillStyle = '#ffc233';
    ctx.font = 'bold 14px "IBM Plex Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('PAYTABLE', this.canvasWidth / 2, 58);

    const startY = 82;
    const lineHeight = 24;

    this.symbols.forEach((symbol, i) => {
      const y = startY + i * lineHeight;

      ctx.fillStyle = symbol.color;
      ctx.font = 'bold 18px "IBM Plex Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(symbol.char, 50, y);

      ctx.fillStyle = '#e5e5e5';
      ctx.font = '13px "IBM Plex Mono"';
      ctx.textAlign = 'left';
      ctx.fillText(`3x = ${symbol.payout}x`, 85, y);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`2x = ${Math.floor(symbol.payout * 0.2)}x`, 200, y);
    });

    const dividerY = startY + this.symbols.length * lineHeight + 4;
    ctx.strokeStyle = '#ffc233';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, dividerY);
    ctx.lineTo(this.canvasWidth - 30, dividerY);
    ctx.stroke();

    const jackpotY = dividerY + 20;
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px "IBM Plex Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('7 7 7', 50, jackpotY);
    ctx.fillStyle = '#ffc233';
    ctx.font = 'bold 13px "IBM Plex Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('JACKPOT! (2x bonus)', 85, jackpotY);

    ctx.fillStyle = '#6b7280';
    ctx.font = '10px "IBM Plex Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('tap to close', this.canvasWidth / 2, this.canvasHeight - 22);
  }

  drawReel(index) {
    const ctx = this.ctx;
    const x = this.reelStartX + index * (this.reelWidth + this.reelGap);
    const y = this.reelStartY;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, this.reelWidth, this.reelHeight);

    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.reelWidth, this.reelHeight);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, this.reelWidth, this.reelHeight);
    ctx.clip();

    const currentSymbol = this.reels[index];
    const offset = this.reelOffsets[index];

    for (let i = -1; i <= 2; i++) {
      const symbolIndex =
        (currentSymbol + i + this.symbols.length) % this.symbols.length;
      const symbol = this.symbols[symbolIndex];

      const symbolY =
        y + this.reelHeight / 2 - 15 + i * this.symbolHeight - offset;

      if (i === 0 && !this.spinning) {
        const isWinningReel =
          this.winHighlight && this.winHighlight.reels.includes(index);

        if (isWinningReel) {
          const pulseSpeed = this.winHighlight.isJackpot ? 0.25 : 0.35;
          const pulse =
            Math.sin(this.winHighlight.frame * pulseSpeed) * 0.5 + 0.5;
          const baseBlur = this.winHighlight.isJackpot ? 25 : 20;
          ctx.shadowColor = this.winHighlight.color;
          ctx.shadowBlur = baseBlur * pulse + 5;
        } else {
          ctx.shadowColor = symbol.color;
          ctx.shadowBlur = 10;
        }
      }

      ctx.fillStyle = symbol.color;
      ctx.font = 'bold 48px "IBM Plex Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(symbol.char, x + this.reelWidth / 2, symbolY + 15);

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawJackpotAnimation() {
    const ctx = this.ctx;

    const flash = Math.sin(this.jackpotFrame * 0.3) * 0.3 + 0.3;
    ctx.fillStyle = `rgba(255, 215, 0, ${flash})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const hue = (this.jackpotFrame * 5) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 36px "IBM Plex Mono"';
    ctx.textAlign = 'center';

    const bounce = Math.sin(this.jackpotFrame * 0.2) * 10;
    ctx.strokeText(
      'JACKPOT!',
      this.canvasWidth / 2,
      this.canvasHeight / 2 + bounce
    );
    ctx.fillText(
      'JACKPOT!',
      this.canvasWidth / 2,
      this.canvasHeight / 2 + bounce
    );

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + this.jackpotFrame * 0.05;
      const radius = 80 + Math.sin(this.jackpotFrame * 0.1 + i) * 20;
      const px = this.canvasWidth / 2 + Math.cos(angle) * radius;
      const py = this.canvasHeight / 2 + Math.sin(angle) * radius;

      ctx.fillStyle = `hsl(${(hue + i * 45) % 360}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    document.removeEventListener('keydown', this.keyHandler);

    this.cleanup();
  }

  // Static method to reset balance
  static resetBalance() {
    setStorageValue(CONFIG.storage.slotsBalance, CONFIG.games.slots.defaultBalance);
    setStorageValue(CONFIG.storage.slotsTotalWinnings, 0);
  }
}
