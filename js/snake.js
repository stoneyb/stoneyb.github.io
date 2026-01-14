/* ========================================
   SNAKE GAME
   Classic snake game in the terminal
   ======================================== */

export class SnakeGame {
  constructor(terminal) {
    this.terminal = terminal;
    this.canvas = null;
    this.ctx = null;
    this.container = null;

    // Game settings
    this.gridSize = 20;
    this.tileCount = 15;
    this.canvasSize = this.gridSize * this.tileCount;

    // Game state
    this.snake = [];
    this.food = { x: 0, y: 0 };
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("snakeHighScore") || "0");
    this.gameLoop = null;
    this.isRunning = false;
    this.isPaused = false;
    this.speed = 100;

    // Touch/swipe state
    this.touchStartX = null;
    this.touchStartY = null;
    this.minSwipeDistance = 30;
    // Detect mobile/touch device
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
    this.resetGame();
    this.bindControls();
    this.isRunning = true;
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  createGameArea() {
    this.container = document.createElement("div");
    this.container.className = "game-container";

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
    this.canvas.className = "snake-canvas";

    const info = document.createElement("div");
    info.className = "game-info";
    info.id = "snake-info";
    info.innerHTML = `Score: <span id="snake-score">0</span> | High Score: <span id="snake-high">${this.highScore}</span>`;

    this.container.appendChild(this.canvas);
    this.container.appendChild(info);

    // Add mobile controls if on mobile
    if (this.isMobile) {
      this.createMobileControls();
    }

    this.terminal.outputEl.appendChild(this.container);
    this.ctx = this.canvas.getContext("2d");

    // Scroll to game
    this.container.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  createMobileControls() {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "snake-mobile-controls";

    // Create D-pad style controls
    const dpad = document.createElement("div");
    dpad.className = "snake-dpad";

    // Up button
    const upBtn = document.createElement("button");
    upBtn.className = "snake-btn snake-btn-up";
    upBtn.setAttribute("aria-label", "Move up");
    upBtn.innerHTML = "↑";
    upBtn.onclick = () => this.handleDirection({ x: 0, y: -1 });

    // Left button
    const leftBtn = document.createElement("button");
    leftBtn.className = "snake-btn snake-btn-left";
    leftBtn.setAttribute("aria-label", "Move left");
    leftBtn.innerHTML = "←";
    leftBtn.onclick = () => this.handleDirection({ x: -1, y: 0 });

    // Center (pause) button
    const centerBtn = document.createElement("button");
    centerBtn.className = "snake-btn snake-btn-center";
    centerBtn.setAttribute("aria-label", "Pause");
    centerBtn.innerHTML = "⏸";
    centerBtn.onclick = () => {
      if (this.isRunning) {
        this.isPaused = !this.isPaused;
        this.draw();
      }
    };

    // Right button
    const rightBtn = document.createElement("button");
    rightBtn.className = "snake-btn snake-btn-right";
    rightBtn.setAttribute("aria-label", "Move right");
    rightBtn.innerHTML = "→";
    rightBtn.onclick = () => this.handleDirection({ x: 1, y: 0 });

    // Down button
    const downBtn = document.createElement("button");
    downBtn.className = "snake-btn snake-btn-down";
    downBtn.setAttribute("aria-label", "Move down");
    downBtn.innerHTML = "↓";
    downBtn.onclick = () => this.handleDirection({ x: 0, y: 1 });

    dpad.appendChild(upBtn);
    dpad.appendChild(leftBtn);
    dpad.appendChild(centerBtn);
    dpad.appendChild(rightBtn);
    dpad.appendChild(downBtn);

    controlsContainer.appendChild(dpad);
    this.container.appendChild(controlsContainer);
  }

  resetGame() {
    // Initialize snake in center
    const center = Math.floor(this.tileCount / 2);
    this.snake = [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ];

    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.score = 0;
    this.updateScore();
    this.placeFood();
    this.draw();
  }

  handleDirection(newDir) {
    if (!this.isRunning) return;

    // Prevent 180-degree turns (can't go back on yourself)
    if (this.direction.x !== 0 || this.direction.y !== 0) {
      if (newDir.x === -this.direction.x && newDir.y === -this.direction.y) {
        return;
      }
    }

    this.nextDirection = newDir;
  }

  bindControls() {
    this.keyHandler = (e) => {
      if (!this.isRunning) return;

      // Direction mappings
      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        W: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        S: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        A: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
        D: { x: 1, y: 0 },
      };

      // Escape to quit
      if (e.key === "Escape") {
        this.stop();
        this.terminal.print(
          '\n<span class="output-muted">Game ended. Type "snake" to play again!</span>\n',
          "response"
        );
        return;
      }

      // Space to pause
      if (e.key === " ") {
        this.isPaused = !this.isPaused;
        e.preventDefault();
        return;
      }

      const newDir = keyMap[e.key];
      if (newDir) {
        this.handleDirection(newDir);
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", this.keyHandler);

    // Add touch/swipe handlers for mobile
    if (this.isMobile && this.canvas) {
      this.touchStartHandler = (e) => {
        if (!this.isRunning) return;
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
      };

      this.touchEndHandler = (e) => {
        if (
          !this.isRunning ||
          this.touchStartX === null ||
          this.touchStartY === null
        )
          return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Check if it's a swipe (not just a tap)
        if (
          absDeltaX < this.minSwipeDistance &&
          absDeltaY < this.minSwipeDistance
        ) {
          this.touchStartX = null;
          this.touchStartY = null;
          return;
        }

        // Determine swipe direction
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.handleDirection({ x: 1, y: 0 }); // Right
          } else {
            this.handleDirection({ x: -1, y: 0 }); // Left
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            this.handleDirection({ x: 0, y: 1 }); // Down
          } else {
            this.handleDirection({ x: 0, y: -1 }); // Up
          }
        }

        this.touchStartX = null;
        this.touchStartY = null;
        e.preventDefault();
      };

      this.canvas.addEventListener("touchstart", this.touchStartHandler, {
        passive: true,
      });
      this.canvas.addEventListener("touchend", this.touchEndHandler, {
        passive: false,
      });
    }
  }

  update() {
    if (this.isPaused || !this.isRunning) {
      this.draw();
      return;
    }

    // Apply next direction
    if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
      this.direction = { ...this.nextDirection };
    }

    // Don't move if no direction set
    if (this.direction.x === 0 && this.direction.y === 0) {
      this.draw();
      return;
    }

    // Calculate new head position
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y,
    };

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (this.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      this.gameOver();
      return;
    }

    // Add new head
    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.updateScore();
      this.placeFood();

      // Speed up slightly
      if (this.speed > 50) {
        this.speed -= 2;
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.speed);
      }
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
    }

    this.draw();
  }

  placeFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      };
    } while (
      this.snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y)
    );

    this.food = newFood;
  }

  draw() {
    // Clear canvas with background
    this.ctx.fillStyle = "#0a0a0f";
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Draw grid (subtle)
    this.ctx.strokeStyle = "rgba(212, 160, 23, 0.05)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.tileCount; i++) {
      const pos = i * this.gridSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.canvasSize);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.canvasSize, pos);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      const x = segment.x * this.gridSize;
      const y = segment.y * this.gridSize;

      if (index === 0) {
        // Head - brighter
        this.ctx.fillStyle = "#ffc233";
        this.ctx.shadowColor = "#ffc233";
        this.ctx.shadowBlur = 8;
      } else {
        // Body - gradient fade
        const alpha = 1 - (index / this.snake.length) * 0.5;
        this.ctx.fillStyle = `rgba(212, 160, 23, ${alpha})`;
        this.ctx.shadowBlur = 0;
      }

      // Draw rounded rectangle
      this.roundRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 3);
    });

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Draw food
    this.ctx.fillStyle = "#f87171";
    this.ctx.shadowColor = "#f87171";
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Draw pause overlay
    if (this.isPaused) {
      this.ctx.fillStyle = "rgba(5, 5, 10, 0.7)";
      this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

      this.ctx.fillStyle = "#ffc233";
      this.ctx.font = 'bold 24px "IBM Plex Mono"';
      this.ctx.textAlign = "center";
      this.ctx.fillText("PAUSED", this.canvasSize / 2, this.canvasSize / 2);

      this.ctx.font = '14px "IBM Plex Mono"';
      this.ctx.fillStyle = "#9ca3af";
      const resumeText = this.isMobile
        ? "Tap pause button to resume"
        : "Press SPACE to resume";
      this.ctx.fillText(
        resumeText,
        this.canvasSize / 2,
        this.canvasSize / 2 + 30
      );
    }

    // Draw start prompt if not moving
    if (this.direction.x === 0 && this.direction.y === 0 && !this.isPaused) {
      this.ctx.fillStyle = "rgba(5, 5, 10, 0.5)";
      this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

      this.ctx.fillStyle = "#ffc233";
      this.ctx.font = '14px "IBM Plex Mono"';
      this.ctx.textAlign = "center";
      const startText = this.isMobile
        ? "Swipe or use buttons to start"
        : "Press arrow keys to start";
      this.ctx.fillText(startText, this.canvasSize / 2, this.canvasSize / 2);
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

  updateScore() {
    const scoreEl = document.getElementById("snake-score");
    const highEl = document.getElementById("snake-high");

    if (scoreEl) scoreEl.textContent = this.score;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("snakeHighScore", this.highScore.toString());
      if (highEl) highEl.textContent = this.highScore;
    }
  }

  gameOver() {
    this.stop();

    // Flash effect
    this.ctx.fillStyle = "rgba(248, 113, 113, 0.3)";
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Game over text
    setTimeout(() => {
      this.ctx.fillStyle = "rgba(5, 5, 10, 0.8)";
      this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

      this.ctx.fillStyle = "#f87171";
      this.ctx.font = 'bold 20px "IBM Plex Mono"';
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "GAME OVER",
        this.canvasSize / 2,
        this.canvasSize / 2 - 20
      );

      this.ctx.fillStyle = "#ffc233";
      this.ctx.font = '16px "IBM Plex Mono"';
      this.ctx.fillText(
        `Score: ${this.score}`,
        this.canvasSize / 2,
        this.canvasSize / 2 + 10
      );

      if (this.score >= this.highScore && this.score > 0) {
        this.ctx.fillStyle = "#34d399";
        this.ctx.font = '12px "IBM Plex Mono"';
        this.ctx.fillText(
          "NEW HIGH SCORE!",
          this.canvasSize / 2,
          this.canvasSize / 2 + 35
        );
      }
    }, 200);

    this.terminal.print(
      `\n<span class="output-error">Game Over!</span> Final Score: <span class="output-accent">${this.score}</span>`,
      "response"
    );

    if (this.score >= this.highScore && this.score > 0) {
      this.terminal.print(
        '<span class="output-success">New High Score!</span>',
        "response"
      );
    }

    this.terminal.print(
      '<span class="output-muted">Type "snake" to play again</span>\n',
      "response"
    );
  }

  stop() {
    this.isRunning = false;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    document.removeEventListener("keydown", this.keyHandler);

    // Remove touch handlers
    if (this.canvas && this.touchStartHandler && this.touchEndHandler) {
      this.canvas.removeEventListener("touchstart", this.touchStartHandler);
      this.canvas.removeEventListener("touchend", this.touchEndHandler);
    }

    // Refocus terminal input
    setTimeout(() => {
      const input = document.getElementById("terminal-input");
      if (input) input.focus();
    }, 100);
  }
}
