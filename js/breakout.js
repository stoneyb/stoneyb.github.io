/* ========================================
   BREAKOUT GAME
   Classic brick-breaking paddle game
   ======================================== */

class BreakoutGame {
  constructor(terminal) {
    this.terminal = terminal;
    this.canvas = null;
    this.ctx = null;
    this.container = null;

    // Canvas settings
    this.canvasWidth = 400;
    this.canvasHeight = 300;

    // Paddle settings
    this.paddleWidth = 70;
    this.paddleHeight = 10;
    this.paddleX = 0;
    this.paddleSpeed = 8;

    // Ball settings
    this.ballRadius = 6;
    this.ballX = 0;
    this.ballY = 0;
    this.ballDX = 4;
    this.ballDY = -4;

    // Brick settings
    this.brickRowCount = 5;
    this.brickColumnCount = 8;
    this.brickWidth = 45;
    this.brickHeight = 15;
    this.brickPadding = 2;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 13;
    this.bricks = [];

    // Game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.highScore = parseInt(localStorage.getItem("breakoutHighScore") || "0");
    this.isRunning = false;
    this.isPaused = false;
    this.gameLoop = null;
    this.leftPressed = false;
    this.rightPressed = false;

    // Touch state
    this.touchX = null;
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
    this.initBricks();
    this.resetBall();
    this.paddleX = (this.canvasWidth - this.paddleWidth) / 2;
    this.bindControls();
    this.isRunning = true;
    this.gameLoop = setInterval(() => this.update(), 16);
  }

  createGameArea() {
    this.container = document.createElement("div");
    this.container.className = "game-container";

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.canvas.className = "breakout-canvas";

    const info = document.createElement("div");
    info.className = "game-info";
    info.id = "breakout-info";
    info.innerHTML = `
      Score: <span id="breakout-score">0</span> |
      Lives: <span id="breakout-lives">3</span> |
      Level: <span id="breakout-level">1</span> |
      Best: <span id="breakout-high">${this.highScore}</span>
    `;

    this.container.appendChild(this.canvas);
    this.container.appendChild(info);

    // Mobile controls
    if (this.isMobile) {
      this.createMobileControls();
    }

    this.terminal.outputEl.appendChild(this.container);
    this.ctx = this.canvas.getContext("2d");

    this.container.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  createMobileControls() {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "breakout-mobile-controls";

    const leftBtn = document.createElement("button");
    leftBtn.className = "breakout-btn breakout-btn-left";
    leftBtn.innerHTML = "◀";
    leftBtn.setAttribute("aria-label", "Move left");

    const pauseBtn = document.createElement("button");
    pauseBtn.className = "breakout-btn breakout-btn-pause";
    pauseBtn.innerHTML = "⏸";
    pauseBtn.setAttribute("aria-label", "Pause");

    const rightBtn = document.createElement("button");
    rightBtn.className = "breakout-btn breakout-btn-right";
    rightBtn.innerHTML = "▶";
    rightBtn.setAttribute("aria-label", "Move right");

    // Touch events for continuous movement
    leftBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.leftPressed = true;
    });
    leftBtn.addEventListener("touchend", () => (this.leftPressed = false));
    leftBtn.addEventListener("mousedown", () => (this.leftPressed = true));
    leftBtn.addEventListener("mouseup", () => (this.leftPressed = false));
    leftBtn.addEventListener("mouseleave", () => (this.leftPressed = false));

    rightBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.rightPressed = true;
    });
    rightBtn.addEventListener("touchend", () => (this.rightPressed = false));
    rightBtn.addEventListener("mousedown", () => (this.rightPressed = true));
    rightBtn.addEventListener("mouseup", () => (this.rightPressed = false));
    rightBtn.addEventListener("mouseleave", () => (this.rightPressed = false));

    pauseBtn.addEventListener("click", () => {
      this.isPaused = !this.isPaused;
    });

    controlsContainer.appendChild(leftBtn);
    controlsContainer.appendChild(pauseBtn);
    controlsContainer.appendChild(rightBtn);
    this.container.appendChild(controlsContainer);

    this.injectMobileStyles();
  }

  injectMobileStyles() {
    if (document.getElementById("breakout-mobile-styles")) return;

    const style = document.createElement("style");
    style.id = "breakout-mobile-styles";
    style.textContent = `
      .breakout-mobile-controls {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 10px;
      }

      .breakout-btn {
        width: 60px;
        height: 50px;
        font-size: 24px;
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
      }

      .breakout-btn:active {
        background: rgba(212, 160, 23, 0.4);
      }
    `;
    document.head.appendChild(style);
  }

  initBricks() {
    this.bricks = [];
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  resetBall() {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight - 40;
    // Random angle between -45 and 45 degrees, going up
    const angle = ((Math.random() - 0.5) * Math.PI) / 2;
    const speed = 4 + this.level * 0.5;
    this.ballDX = Math.sin(angle) * speed;
    this.ballDY = -Math.abs(Math.cos(angle) * speed);
  }

  bindControls() {
    this.keyDownHandler = (e) => {
      if (!this.isRunning) return;

      if (e.key === "Escape") {
        this.stop();
        this.terminal.print(
          '\n<span class="output-muted">Game ended. Type "breakout" to play again!</span>\n',
          "response"
        );
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        this.isPaused = !this.isPaused;
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.leftPressed = true;
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.rightPressed = true;
        e.preventDefault();
      }
    };

    this.keyUpHandler = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.leftPressed = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.rightPressed = false;
      }
    };

    // Touch/mouse on canvas for paddle control
    this.mouseMoveHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < this.canvasWidth) {
        this.paddleX = relativeX - this.paddleWidth / 2;
        this.clampPaddle();
      }
    };

    this.touchMoveHandler = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeX = touch.clientX - rect.left;
      if (relativeX > 0 && relativeX < this.canvasWidth) {
        this.paddleX = relativeX - this.paddleWidth / 2;
        this.clampPaddle();
      }
    };

    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("touchmove", this.touchMoveHandler, {
      passive: false,
    });
  }

  clampPaddle() {
    if (this.paddleX < 0) this.paddleX = 0;
    if (this.paddleX + this.paddleWidth > this.canvasWidth) {
      this.paddleX = this.canvasWidth - this.paddleWidth;
    }
  }

  update() {
    if (this.isPaused) {
      this.draw();
      return;
    }

    // Paddle movement
    if (this.leftPressed) {
      this.paddleX -= this.paddleSpeed;
    }
    if (this.rightPressed) {
      this.paddleX += this.paddleSpeed;
    }
    this.clampPaddle();

    // Ball movement
    this.ballX += this.ballDX;
    this.ballY += this.ballDY;

    // Wall collision
    if (
      this.ballX + this.ballRadius > this.canvasWidth ||
      this.ballX - this.ballRadius < 0
    ) {
      this.ballDX = -this.ballDX;
    }
    if (this.ballY - this.ballRadius < 0) {
      this.ballDY = -this.ballDY;
    }

    // Paddle collision
    if (
      this.ballY + this.ballRadius >
        this.canvasHeight - this.paddleHeight - 5 &&
      this.ballY + this.ballRadius < this.canvasHeight &&
      this.ballX > this.paddleX &&
      this.ballX < this.paddleX + this.paddleWidth
    ) {
      // Angle based on where ball hits paddle
      const hitPoint = (this.ballX - this.paddleX) / this.paddleWidth - 0.5;
      const angle = hitPoint * (Math.PI / 3); // -60 to 60 degrees
      const speed = Math.sqrt(
        this.ballDX * this.ballDX + this.ballDY * this.ballDY
      );
      this.ballDX = Math.sin(angle) * speed;
      this.ballDY = -Math.abs(Math.cos(angle) * speed);
    }

    // Ball out of bounds
    if (this.ballY + this.ballRadius > this.canvasHeight) {
      this.lives--;
      this.updateDisplay();

      if (this.lives <= 0) {
        this.gameOver();
        return;
      }

      this.resetBall();
    }

    // Brick collision
    this.checkBrickCollision();

    // Check for level complete
    if (this.allBricksCleared()) {
      this.nextLevel();
    }

    this.draw();
  }

  checkBrickCollision() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        const brick = this.bricks[c][r];
        if (brick.status === 1) {
          const brickX =
            c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
          const brickY =
            r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
          brick.x = brickX;
          brick.y = brickY;

          if (
            this.ballX > brickX &&
            this.ballX < brickX + this.brickWidth &&
            this.ballY > brickY &&
            this.ballY < brickY + this.brickHeight
          ) {
            this.ballDY = -this.ballDY;
            brick.status = 0;
            this.score += 10 * this.level;
            this.updateDisplay();
          }
        }
      }
    }
  }

  allBricksCleared() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        if (this.bricks[c][r].status === 1) {
          return false;
        }
      }
    }
    return true;
  }

  nextLevel() {
    this.level++;
    this.initBricks();
    this.resetBall();
    this.updateDisplay();

    // Brief pause
    this.isPaused = true;
    setTimeout(() => {
      this.isPaused = false;
    }, 1000);
  }

  updateDisplay() {
    const scoreEl = document.getElementById("breakout-score");
    const livesEl = document.getElementById("breakout-lives");
    const levelEl = document.getElementById("breakout-level");
    const highEl = document.getElementById("breakout-high");

    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = this.lives;
    if (levelEl) levelEl.textContent = this.level;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("breakoutHighScore", this.highScore.toString());
      if (highEl) highEl.textContent = this.highScore;
    }
  }

  draw() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw bricks
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        if (this.bricks[c][r].status === 1) {
          const brickX =
            c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
          const brickY =
            r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;

          // Color gradient based on row
          const hue = 35 + r * 5;
          const lightness = 55 - r * 5;
          ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
          ctx.shadowColor = `hsl(${hue}, 80%, ${lightness}%)`;
          ctx.shadowBlur = 5;

          this.roundRect(brickX, brickY, this.brickWidth, this.brickHeight, 3);
        }
      }
    }
    ctx.shadowBlur = 0;

    // Draw paddle
    ctx.fillStyle = "#ffc233";
    ctx.shadowColor = "#ffc233";
    ctx.shadowBlur = 8;
    this.roundRect(
      this.paddleX,
      this.canvasHeight - this.paddleHeight - 5,
      this.paddleWidth,
      this.paddleHeight,
      4
    );
    ctx.shadowBlur = 0;

    // Draw ball
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#ffc233";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pause overlay
    if (this.isPaused) {
      ctx.fillStyle = "rgba(5, 5, 10, 0.7)";
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.fillStyle = "#ffc233";
      ctx.font = 'bold 24px "IBM Plex Mono"';
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", this.canvasWidth / 2, this.canvasHeight / 2);

      ctx.font = '14px "IBM Plex Mono"';
      ctx.fillStyle = "#9ca3af";
      const text = this.isMobile
        ? "Tap pause to resume"
        : "Press SPACE to resume";
      ctx.fillText(text, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
    }
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  gameOver() {
    this.stop();

    // Flash effect
    this.ctx.fillStyle = "rgba(248, 113, 113, 0.3)";
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    setTimeout(() => {
      this.ctx.fillStyle = "rgba(5, 5, 10, 0.85)";
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.ctx.textAlign = "center";

      this.ctx.fillStyle = "#f87171";
      this.ctx.font = 'bold 24px "IBM Plex Mono"';
      this.ctx.fillText(
        "GAME OVER",
        this.canvasWidth / 2,
        this.canvasHeight / 2 - 30
      );

      this.ctx.fillStyle = "#ffc233";
      this.ctx.font = '18px "IBM Plex Mono"';
      this.ctx.fillText(
        `Score: ${this.score}`,
        this.canvasWidth / 2,
        this.canvasHeight / 2 + 5
      );

      this.ctx.font = '14px "IBM Plex Mono"';
      this.ctx.fillStyle = "#9ca3af";
      this.ctx.fillText(
        `Level: ${this.level}`,
        this.canvasWidth / 2,
        this.canvasHeight / 2 + 30
      );

      if (this.score >= this.highScore && this.score > 0) {
        this.ctx.fillStyle = "#34d399";
        this.ctx.font = '12px "IBM Plex Mono"';
        this.ctx.fillText(
          "NEW HIGH SCORE!",
          this.canvasWidth / 2,
          this.canvasHeight / 2 + 55
        );
      }
    }, 200);

    this.terminal.print(
      `\n<span class="output-error">Game Over!</span> Score: <span class="output-accent">${this.score}</span> | Level: <span class="output-accent">${this.level}</span>`,
      "response"
    );

    if (this.score >= this.highScore && this.score > 0) {
      this.terminal.print(
        '<span class="output-success">New High Score!</span>',
        "response"
      );
    }

    this.terminal.print(
      '<span class="output-muted">Type "breakout" to play again</span>\n',
      "response"
    );
  }

  stop() {
    this.isRunning = false;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("keyup", this.keyUpHandler);

    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
      this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
    }

    // Refocus terminal
    setTimeout(() => {
      const input = document.getElementById("terminal-input");
      if (input) input.focus();
    }, 100);
  }
}

// Export for use in commands
window.BreakoutGame = BreakoutGame;
