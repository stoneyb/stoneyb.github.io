/* ========================================
   BREAKOUT GAME
   Classic brick-breaking paddle game
   ======================================== */

import { BaseGame } from './BaseGame.js';
import { CONFIG } from '../config/config.js';
import { getHighScore, setHighScore } from '../utils/storage.js';

export class BreakoutGame extends BaseGame {
  constructor(terminal) {
    super(terminal);

    // Get config
    const config = CONFIG.games.breakout;

    // Canvas settings
    this.canvasWidth = config.canvasWidth;
    this.canvasHeight = config.canvasHeight;

    // Paddle settings
    this.paddleWidth = config.paddleWidth;
    this.paddleHeight = config.paddleHeight;
    this.paddleX = 0;
    this.paddleSpeed = config.paddleSpeed;

    // Ball settings
    this.ballRadius = config.ballRadius;
    this.ballX = 0;
    this.ballY = 0;
    this.ballDX = config.ballSpeed;
    this.ballDY = -config.ballSpeed;

    // Brick settings
    this.brickRowCount = config.brickRowCount;
    this.brickColumnCount = config.brickColumnCount;
    this.brickWidth = config.brickWidth;
    this.brickHeight = config.brickHeight;
    this.brickPadding = config.brickPadding;
    this.brickOffsetTop = config.brickOffsetTop;
    this.brickOffsetLeft = config.brickOffsetLeft;
    this.bricks = [];

    // Game state
    this.score = 0;
    this.lives = config.lives;
    this.level = 1;
    this.highScore = getHighScore('breakoutHighScore');
    this.isPaused = false;
    this.gameLoop = null;
    this.leftPressed = false;
    this.rightPressed = false;

    // Touch state
    this.touchX = null;
  }

  start() {
    this.dismissKeyboard();

    const infoHTML = `
      Score: <span id="breakout-score">0</span> |
      Lives: <span id="breakout-lives">${this.lives}</span> |
      Level: <span id="breakout-level">1</span> |
      Best: <span id="breakout-high">${this.highScore}</span>
    `;
    this.createGameArea(
      this.canvasWidth,
      this.canvasHeight,
      'breakout-canvas',
      infoHTML,
      'breakout-info'
    );

    // Mobile controls
    if (this.isMobile) {
      this.createMobileControls();
    }

    this.initBricks();
    this.resetBall();
    this.paddleX = (this.canvasWidth - this.paddleWidth) / 2;
    this.bindControls();
    this.isRunning = true;
    this.gameLoop = setInterval(() => this.update(), CONFIG.games.breakout.updateInterval);
  }

  createMobileControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'breakout-mobile-controls';

    const leftBtn = document.createElement('button');
    leftBtn.className = 'breakout-btn breakout-btn-left';
    leftBtn.innerHTML = '◀';
    leftBtn.setAttribute('aria-label', 'Move left');

    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'breakout-btn breakout-btn-pause';
    pauseBtn.innerHTML = '⏸';
    pauseBtn.setAttribute('aria-label', 'Pause');

    const rightBtn = document.createElement('button');
    rightBtn.className = 'breakout-btn breakout-btn-right';
    rightBtn.innerHTML = '▶';
    rightBtn.setAttribute('aria-label', 'Move right');

    // Touch events for continuous movement
    leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.leftPressed = true;
    });
    leftBtn.addEventListener('touchend', () => (this.leftPressed = false));
    leftBtn.addEventListener('mousedown', () => (this.leftPressed = true));
    leftBtn.addEventListener('mouseup', () => (this.leftPressed = false));
    leftBtn.addEventListener('mouseleave', () => (this.leftPressed = false));

    rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.rightPressed = true;
    });
    rightBtn.addEventListener('touchend', () => (this.rightPressed = false));
    rightBtn.addEventListener('mousedown', () => (this.rightPressed = true));
    rightBtn.addEventListener('mouseup', () => (this.rightPressed = false));
    rightBtn.addEventListener('mouseleave', () => (this.rightPressed = false));

    pauseBtn.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
    });

    controlsContainer.appendChild(leftBtn);
    controlsContainer.appendChild(pauseBtn);
    controlsContainer.appendChild(rightBtn);
    this.container.appendChild(controlsContainer);
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

      if (e.key === 'Escape') {
        this.stop();
        this.terminal.print(
          '\n<span class="output-muted">Game ended. Type "breakout" to play again!</span>\n',
          'response'
        );
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        this.isPaused = !this.isPaused;
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.leftPressed = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.rightPressed = true;
        e.preventDefault();
      }
    };

    this.keyUpHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.leftPressed = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
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

    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    this.canvas.addEventListener('touchmove', this.touchMoveHandler, {
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
    const scoreEl = document.getElementById('breakout-score');
    const livesEl = document.getElementById('breakout-lives');
    const levelEl = document.getElementById('breakout-level');
    const highEl = document.getElementById('breakout-high');

    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = this.lives;
    if (levelEl) levelEl.textContent = this.level;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      setHighScore('breakoutHighScore', this.highScore);
      if (highEl) highEl.textContent = this.highScore;
    }
  }

  draw() {
    // Clear canvas
    this.clearCanvas('#0a0a0f');

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
          this.ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
          this.ctx.shadowColor = `hsl(${hue}, 80%, ${lightness}%)`;
          this.ctx.shadowBlur = 5;

          this.roundRect(brickX, brickY, this.brickWidth, this.brickHeight, 3);
        }
      }
    }
    this.ctx.shadowBlur = 0;

    // Draw paddle
    this.ctx.fillStyle = '#ffc233';
    this.ctx.shadowColor = '#ffc233';
    this.ctx.shadowBlur = 8;
    this.roundRect(
      this.paddleX,
      this.canvasHeight - this.paddleHeight - 5,
      this.paddleWidth,
      this.paddleHeight,
      4
    );
    this.ctx.shadowBlur = 0;

    // Draw ball
    this.ctx.fillStyle = '#fff';
    this.ctx.shadowColor = '#ffc233';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Pause overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(5, 5, 10, 0.7)';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.ctx.fillStyle = '#ffc233';
      this.ctx.font = 'bold 24px "IBM Plex Mono"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvasWidth / 2, this.canvasHeight / 2);

      this.ctx.font = '14px "IBM Plex Mono"';
      this.ctx.fillStyle = '#9ca3af';
      const text = this.isMobile
        ? 'Tap pause to resume'
        : 'Press SPACE to resume';
      this.ctx.fillText(text, this.canvasWidth / 2, this.canvasHeight / 2 + 30);
    }
  }

  gameOver() {
    this.stop();

    // Flash effect
    this.ctx.fillStyle = 'rgba(248, 113, 113, 0.3)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    setTimeout(() => {
      this.ctx.fillStyle = 'rgba(5, 5, 10, 0.85)';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.ctx.textAlign = 'center';

      this.ctx.fillStyle = '#f87171';
      this.ctx.font = 'bold 24px "IBM Plex Mono"';
      this.ctx.fillText(
        'GAME OVER',
        this.canvasWidth / 2,
        this.canvasHeight / 2 - 30
      );

      this.ctx.fillStyle = '#ffc233';
      this.ctx.font = '18px "IBM Plex Mono"';
      this.ctx.fillText(
        `Score: ${this.score}`,
        this.canvasWidth / 2,
        this.canvasHeight / 2 + 5
      );

      this.ctx.font = '14px "IBM Plex Mono"';
      this.ctx.fillStyle = '#9ca3af';
      this.ctx.fillText(
        `Level: ${this.level}`,
        this.canvasWidth / 2,
        this.canvasHeight / 2 + 30
      );

      if (this.score >= this.highScore && this.score > 0) {
        this.ctx.fillStyle = '#34d399';
        this.ctx.font = '12px "IBM Plex Mono"';
        this.ctx.fillText(
          'NEW HIGH SCORE!',
          this.canvasWidth / 2,
          this.canvasHeight / 2 + 55
        );
      }
    }, 200);

    this.terminal.print(
      `\n<span class="output-error">Game Over!</span> Score: <span class="output-accent">${this.score}</span> | Level: <span class="output-accent">${this.level}</span>`,
      'response'
    );

    if (this.score >= this.highScore && this.score > 0) {
      this.terminal.print(
        '<span class="output-success">New High Score!</span>',
        'response'
      );
    }

    this.terminal.print(
      '<span class="output-muted">Type "breakout" to play again</span>\n',
      'response'
    );
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);

    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
      this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
    }

    this.cleanup();
  }
}
