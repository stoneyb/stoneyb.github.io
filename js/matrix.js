/* ========================================
   MATRIX RAIN EFFECT
   Canvas-based falling code animation
   ======================================== */

class MatrixRain {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.columns = 0;
    this.drops = [];
    this.fontSize = 14;
    this.isRunning = false;

    // Mix of characters: Latin, numbers, katakana-style
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  }

  start(duration = 10000) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.createCanvas();
    this.initDrops();
    this.animate();

    // Auto-stop after duration
    this.timeout = setTimeout(() => this.stop(), duration);

    // Allow escape to stop
    this.escHandler = (e) => {
      if (e.key === 'Escape') this.stop();
    };
    document.addEventListener('keydown', this.escHandler);

    // Handle resize
    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.initDrops();
  }

  initDrops() {
    // Initialize drops at random heights for a more organic start
    this.drops = Array(this.columns).fill(0).map(() =>
      Math.random() * -100
    );
  }

  animate() {
    if (!this.isRunning) return;

    // Semi-transparent black for trail effect
    this.ctx.fillStyle = 'rgba(5, 5, 10, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Set up text style
    this.ctx.font = `${this.fontSize}px "IBM Plex Mono", monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      // Random character
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];

      // Calculate position
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Gradient effect: brighter at the head
      const brightness = Math.random() * 0.5 + 0.5;

      // Use amber color to match terminal theme
      if (Math.random() > 0.98) {
        // Occasional bright flash
        this.ctx.fillStyle = '#ffc233';
        this.ctx.shadowColor = '#ffc233';
        this.ctx.shadowBlur = 10;
      } else {
        this.ctx.fillStyle = `rgba(212, 160, 23, ${brightness})`;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fillText(char, x, y);

      // Reset drop when it goes off screen
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }

      this.drops[i]++;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stop() {
    this.isRunning = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.canvas) {
      // Fade out animation
      this.canvas.style.transition = 'opacity 0.5s ease';
      this.canvas.style.opacity = '0';

      setTimeout(() => {
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
      }, 500);
    }

    document.removeEventListener('keydown', this.escHandler);
    window.removeEventListener('resize', this.resizeHandler);

    // Refocus terminal input
    const input = document.getElementById('terminal-input');
    if (input) input.focus();
  }
}

// Export for use in commands.js
window.MatrixRain = MatrixRain;
