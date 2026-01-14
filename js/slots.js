/* ========================================
   SLOT MACHINE GAME
   Classic 3-reel slot machine in the terminal
   ======================================== */

class SlotMachineGame {
  constructor(terminal) {
    this.terminal = terminal;
    this.canvas = null;
    this.ctx = null;
    this.container = null;

    // Canvas settings
    this.canvasWidth = 360;
    this.canvasHeight = 240;

    // Reel settings
    this.reelWidth = 100;
    this.reelHeight = 165;
    this.reelGap = 15;
    this.reelStartX = 15;
    this.reelStartY = 50;
    this.symbolHeight = 60;

    // Symbols with their weights (lower = rarer) and payouts
    this.symbols = [
      { char: "7", color: "#ef4444", weight: 5, payout: 100 },
      { char: "$", color: "#22c55e", weight: 10, payout: 50 },
      { char: "*", color: "#ffc233", weight: 15, payout: 25 },
      { char: "#", color: "#3b82f6", weight: 20, payout: 15 },
      { char: "@", color: "#a855f7", weight: 25, payout: 10 },
      { char: "&", color: "#06b6d4", weight: 25, payout: 5 },
    ];

    // Game state
    this.balance = parseInt(localStorage.getItem("slotsBalance") || "100");
    this.totalWinnings = parseInt(
      localStorage.getItem("slotsTotalWinnings") || "0"
    );
    this.betAmount = 10;
    this.reels = [0, 0, 0];
    this.targetReels = [0, 0, 0];
    this.spinning = false;
    this.spinSpeed = [0, 0, 0];
    this.reelOffsets = [0, 0, 0];
    this.isRunning = false;
    this.animationFrame = null;
    this.lastWin = 0;
    this.jackpotAnimation = null;
    this.jackpotFrame = 0;
    this.winHighlight = null; // { reels: [0,1,2], frame: 0, color: '#fff' }
    this.winHighlightDuration = 60; // ~1 second at 60fps
    this.showPaytable = false;
    this.particles = []; // Array of { x, y, vx, vy, color, size, life, maxLife }

    // Mobile detection
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
  }

  start() {
    // Dismiss keyboard on mobile
    if (this.isMobile) {
      const input = document.getElementById("terminal-input");
      if (input) input.blur();
    }

    this.createGameArea();
    this.bindControls();
    this.isRunning = true;
    this.draw();
  }

  createGameArea() {
    this.container = document.createElement("div");
    this.container.className = "game-container";

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.canvas.className = "slots-canvas";

    const info = document.createElement("div");
    info.className = "game-info";
    info.id = "slots-info";
    info.innerHTML = `
      Balance: <span id="slots-balance">${this.balance}</span> |
      Bet: <span id="slots-bet">${this.betAmount}</span> |
      Won: <span id="slots-total">${this.totalWinnings}</span>
    `;

    // Click on canvas for paytable icon or to dismiss
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicked on paytable icon (top-right corner)
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

    this.container.appendChild(this.canvas);
    this.container.appendChild(info);
    this.createControls();

    this.terminal.outputEl.appendChild(this.container);
    this.ctx = this.canvas.getContext("2d");

    this.container.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  createControls() {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "slots-controls";

    const betDownBtn = document.createElement("button");
    betDownBtn.className = "slots-btn";
    betDownBtn.innerHTML = "BET -";
    betDownBtn.setAttribute("aria-label", "Decrease bet");
    betDownBtn.onclick = () => this.changeBet(-5);

    const spinBtn = document.createElement("button");
    spinBtn.className = "slots-btn slots-btn-spin";
    this.spinBtn = spinBtn;
    spinBtn.innerHTML = "SPIN";
    spinBtn.setAttribute("aria-label", "Spin");
    spinBtn.onclick = () => this.spin();

    const betUpBtn = document.createElement("button");
    betUpBtn.className = "slots-btn";
    betUpBtn.innerHTML = "BET +";
    betUpBtn.setAttribute("aria-label", "Increase bet");
    betUpBtn.onclick = () => this.changeBet(5);

    controlsContainer.appendChild(betDownBtn);
    controlsContainer.appendChild(spinBtn);
    controlsContainer.appendChild(betUpBtn);
    this.container.appendChild(controlsContainer);

    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById("slots-styles")) return;

    const style = document.createElement("style");
    style.id = "slots-styles";
    style.textContent = `
      .slots-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 10px;
      }

      .slots-btn {
        height: 45px;
        padding: 0 20px;
        font-size: 14px;
        font-weight: bold;
        background: rgba(212, 160, 23, 0.2);
        border: 2px solid var(--amber-dim);
        border-radius: 8px;
        color: var(--amber);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        font-family: 'IBM Plex Mono', monospace;
        transition: background 0.15s;
      }

      .slots-btn:hover {
        background: rgba(212, 160, 23, 0.35);
      }

      .slots-btn-spin {
        padding: 0 35px;
        background: rgba(212, 160, 23, 0.3);
        font-size: 16px;
      }

      .slots-btn:active {
        background: rgba(212, 160, 23, 0.5);
      }

      .slots-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  bindControls() {
    this.keyHandler = (e) => {
      if (!this.isRunning) return;

      if (e.key === "Escape") {
        this.stop();
        this.terminal.print(
          '\n<span class="output-muted">Thanks for playing! Type "slots" to play again.</span>\n',
          "response"
        );
      }
    };

    document.addEventListener("keydown", this.keyHandler);
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
          "response"
        );
      }
      return;
    }

    // Disable spin button during spin
    this.spinBtn.disabled = true;
    this.spinBtn.innerHTML = "...";

    // Deduct bet
    this.balance -= this.betAmount;
    this.lastWin = 0;
    this.updateDisplay();

    // Generate random results
    this.targetReels = this.reels.map(() => this.getRandomSymbol());

    // Start spinning
    this.spinning = true;
    this.spinSpeed = [20, 20, 20];
    this.reelOffsets = [0, 0, 0];

    // Stagger the reel stops
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

    // Check if all reels stopped
    if (this.spinSpeed.every((s) => s === 0)) {
      this.spinning = false;
      this.spinBtn.disabled = false;
      this.spinBtn.innerHTML = "SPIN";
      this.checkWin();
    }
  }

  animate() {
    if (!this.isRunning) return;

    // Update reel offsets
    for (let i = 0; i < 3; i++) {
      if (this.spinSpeed[i] > 0) {
        this.reelOffsets[i] += this.spinSpeed[i];
        if (this.reelOffsets[i] >= this.symbolHeight) {
          this.reelOffsets[i] = 0;
          this.reels[i] = (this.reels[i] + 1) % this.symbols.length;
        }
      }
    }

    // Update jackpot animation
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

    // Three of a kind
    if (r1 === r2 && r2 === r3) {
      winAmount = this.symbols[r1].payout * this.betAmount;
      winningReels = [0, 1, 2];
      winColor = this.symbols[r1].color;

      // Jackpot for triple 7s
      if (this.symbols[r1].char === "7") {
        isJackpot = true;
        winAmount *= 2;
      }
    }
    // Two of a kind (first two or last two)
    else if (r1 === r2 || r2 === r3) {
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
      localStorage.setItem("slotsBalance", this.balance.toString());
      localStorage.setItem("slotsTotalWinnings", this.totalWinnings.toString());
      this.updateDisplay();

      // Start win highlight animation
      this.winHighlight = {
        reels: winningReels,
        frame: 0,
        color: winColor,
        isJackpot: isJackpot,
      };
      this.animateWinHighlight();

      // Spawn particles based on win type (not for jackpot - it has its own effects)
      if (!isJackpot) {
        if (winningReels.length === 2) {
          // Small win (2 match)
          this.spawnParticles(6, winColor, 40);
        } else if (r1 <= 2) {
          // Big win (3 high-value symbols: 7, $, *)
          this.spawnParticles(14, winColor, 80);
        } else {
          // Medium win (3 match lower symbols)
          this.spawnParticles(10, winColor, 60);
        }
      }

      if (isJackpot) {
        this.terminal.print(
          `\n<span class="output-success">*** JACKPOT! ***</span> You won <span class="output-accent">${winAmount}</span>!`,
          "response"
        );
      } else if (r1 === r2 && r2 === r3) {
        this.terminal.print(
          `<span class="output-success">Three of a kind!</span> Won <span class="output-accent">${winAmount}</span>`,
          "response"
        );
      }
    } else {
      localStorage.setItem("slotsBalance", this.balance.toString());
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

    // For jackpot, longer highlight before jackpot animation
    const duration = this.winHighlight.isJackpot
      ? 90
      : this.winHighlightDuration;

    if (this.winHighlight.frame < duration) {
      requestAnimationFrame(() => this.animateWinHighlight());
    } else {
      // Start jackpot animation after highlight completes
      if (this.winHighlight.isJackpot) {
        this.startJackpotAnimation();
      }
      this.winHighlight = null;
      this.draw();
    }
  }

  spawnParticles(count, color, duration) {
    // Spawn particles from center of reels area
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
        vy: Math.sin(angle) * speed - 1, // slight upward bias
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

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
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
    const balanceEl = document.getElementById("slots-balance");
    const betEl = document.getElementById("slots-bet");
    const totalEl = document.getElementById("slots-total");

    if (balanceEl) balanceEl.textContent = this.balance;
    if (betEl) betEl.textContent = this.betAmount;
    if (totalEl) totalEl.textContent = this.totalWinnings;
  }

  draw() {
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Title
    ctx.fillStyle = "#ffc233";
    ctx.font = 'bold 18px "IBM Plex Mono"';
    ctx.textAlign = "center";
    ctx.fillText("LUCKY TERMINAL", this.canvasWidth / 2, 35);

    // Paytable icon (coin) in top-right
    const iconX = this.canvasWidth - 35;
    const iconY = 28;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 12, 0, Math.PI * 2);
    ctx.fillStyle = this.showPaytable ? "#ffc233" : "#d4a017";
    ctx.fill();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Dollar sign on coin
    ctx.fillStyle = "#0a0a0f";
    ctx.font = 'bold 14px "IBM Plex Mono"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", iconX, iconY);
    ctx.textBaseline = "alphabetic";

    // Draw reels
    for (let i = 0; i < 3; i++) {
      this.drawReel(i);
    }

    // Win line indicator (centered on symbols - accounting for font baseline)
    ctx.strokeStyle = "rgba(255, 194, 51, 0.5)";
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
      ctx.fillStyle = "#22c55e";
      ctx.font = 'bold 14px "IBM Plex Mono"';
      ctx.fillText(
        `WIN: ${this.lastWin}`,
        this.canvasWidth / 2,
        this.canvasHeight - 40
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

    // Semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(15, 40, this.canvasWidth - 30, this.canvasHeight - 55);

    // Border
    ctx.strokeStyle = "#ffc233";
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 40, this.canvasWidth - 30, this.canvasHeight - 55);

    // Title
    ctx.fillStyle = "#ffc233";
    ctx.font = 'bold 14px "IBM Plex Mono"';
    ctx.textAlign = "center";
    ctx.fillText("PAYTABLE", this.canvasWidth / 2, 58);

    // Symbols and payouts
    const startY = 82;
    const lineHeight = 24;

    this.symbols.forEach((symbol, i) => {
      const y = startY + i * lineHeight;

      // Symbol
      ctx.fillStyle = symbol.color;
      ctx.font = 'bold 18px "IBM Plex Mono"';
      ctx.textAlign = "center";
      ctx.fillText(symbol.char, 50, y);

      // Payout info
      ctx.fillStyle = "#e5e5e5";
      ctx.font = '13px "IBM Plex Mono"';
      ctx.textAlign = "left";
      ctx.fillText(`3x = ${symbol.payout}x`, 85, y);
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(`2x = ${Math.floor(symbol.payout * 0.2)}x`, 200, y);
    });

    // Divider line
    const dividerY = startY + this.symbols.length * lineHeight + 4;
    ctx.strokeStyle = "#ffc233";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, dividerY);
    ctx.lineTo(this.canvasWidth - 30, dividerY);
    ctx.stroke();

    // Jackpot info
    const jackpotY = dividerY + 20;
    ctx.fillStyle = "#ef4444";
    ctx.font = 'bold 18px "IBM Plex Mono"';
    ctx.textAlign = "center";
    ctx.fillText("7 7 7", 50, jackpotY);
    ctx.fillStyle = "#ffc233";
    ctx.font = 'bold 13px "IBM Plex Mono"';
    ctx.textAlign = "left";
    ctx.fillText("JACKPOT! (2x bonus)", 85, jackpotY);

    // Dismiss hint
    ctx.fillStyle = "#6b7280";
    ctx.font = '10px "IBM Plex Mono"';
    ctx.textAlign = "center";
    ctx.fillText("tap to close", this.canvasWidth / 2, this.canvasHeight - 22);
  }

  drawReel(index) {
    const ctx = this.ctx;
    const x = this.reelStartX + index * (this.reelWidth + this.reelGap);
    const y = this.reelStartY;

    // Reel background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(x, y, this.reelWidth, this.reelHeight);

    // Reel border
    ctx.strokeStyle = "#d4a017";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.reelWidth, this.reelHeight);

    // Clip to reel area
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, this.reelWidth, this.reelHeight);
    ctx.clip();

    // Draw symbols
    const currentSymbol = this.reels[index];
    const offset = this.reelOffsets[index];

    for (let i = -1; i <= 2; i++) {
      const symbolIndex =
        (currentSymbol + i + this.symbols.length) % this.symbols.length;
      const symbol = this.symbols[symbolIndex];

      const symbolY =
        y + this.reelHeight / 2 - 15 + i * this.symbolHeight - offset;

      // Glow effect for center symbol
      if (i === 0 && !this.spinning) {
        // Check if this reel is part of a win highlight
        const isWinningReel =
          this.winHighlight && this.winHighlight.reels.includes(index);

        if (isWinningReel) {
          // Pulsing glow effect - 3-4 pulses over the duration
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
      ctx.textAlign = "center";
      ctx.fillText(symbol.char, x + this.reelWidth / 2, symbolY + 15);

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawJackpotAnimation() {
    const ctx = this.ctx;

    // Flashing overlay
    const flash = Math.sin(this.jackpotFrame * 0.3) * 0.3 + 0.3;
    ctx.fillStyle = `rgba(255, 215, 0, ${flash})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Jackpot text with rainbow effect
    const hue = (this.jackpotFrame * 5) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = 'bold 36px "IBM Plex Mono"';
    ctx.textAlign = "center";

    // Bouncing effect
    const bounce = Math.sin(this.jackpotFrame * 0.2) * 10;
    ctx.strokeText(
      "JACKPOT!",
      this.canvasWidth / 2,
      this.canvasHeight / 2 + bounce
    );
    ctx.fillText(
      "JACKPOT!",
      this.canvasWidth / 2,
      this.canvasHeight / 2 + bounce
    );

    // Particle effects
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
    this.isRunning = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    document.removeEventListener("keydown", this.keyHandler);

    // Refocus terminal
    setTimeout(() => {
      const input = document.getElementById("terminal-input");
      if (input) input.focus();
    }, 100);
  }

  // Static method to reset balance
  static resetBalance() {
    localStorage.setItem("slotsBalance", "100");
    localStorage.setItem("slotsTotalWinnings", "0");
  }
}

// Export for use in commands
window.SlotMachineGame = SlotMachineGame;
