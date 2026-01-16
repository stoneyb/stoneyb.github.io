/* ========================================
   BASE GAME CLASS
   Common functionality for all canvas games
   ======================================== */

import { isMobileDevice } from '../utils/mobile-detection.js';
import { CONFIG } from '../config/config.js';

/**
 * Base class for canvas-based games
 * Handles common setup, lifecycle, and utilities
 */
export class BaseGame {
  constructor(terminal) {
    this.terminal = terminal;
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.isRunning = false;
    this.isMobile = isMobileDevice();
  }

  /**
   * Create the game container, canvas, and info display
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {string} canvasClass - CSS class for canvas
   * @param {string} infoHTML - HTML for game info display
   * @param {string} infoId - ID for info element
   * @returns {Object} Object with canvas and info element
   */
  createGameArea(width, height, canvasClass, infoHTML = '', infoId = '') {
    this.container = document.createElement('div');
    this.container.className = 'game-container';

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.className = canvasClass;

    this.container.appendChild(this.canvas);

    // Add info display if provided
    let infoElement = null;
    if (infoHTML) {
      infoElement = document.createElement('div');
      infoElement.className = 'game-info';
      if (infoId) {
        infoElement.id = infoId;
      }
      infoElement.innerHTML = infoHTML;
      this.container.appendChild(infoElement);
    }

    this.terminal.outputEl.appendChild(this.container);
    this.ctx = this.canvas.getContext('2d');

    // Scroll to game
    this.container.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return { canvas: this.canvas, info: infoElement };
  }

  /**
   * Dismiss mobile keyboard
   */
  dismissKeyboard() {
    if (this.isMobile) {
      const input = document.getElementById(CONFIG.terminal.inputId);
      if (input) input.blur();
    }
  }

  /**
   * Refocus terminal input (typically after game ends)
   */
  focusTerminal() {
    setTimeout(() => {
      const input = document.getElementById(CONFIG.terminal.inputId);
      if (input) input.focus();
    }, 100);
  }

  /**
   * Clear canvas with background color
   * @param {string} color - Background color
   */
  clearCanvas(color = '#0a0a0f') {
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw rounded rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   */
  roundRect(x, y, width, height, radius) {
    if (!this.ctx) return;
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

  /**
   * Cleanup method to be called when game stops
   * Subclasses should override and call super.cleanup()
   */
  cleanup() {
    this.isRunning = false;
    this.focusTerminal();
  }

  /**
   * Start method - must be implemented by subclasses
   */
  start() {
    throw new Error('start() must be implemented by subclass');
  }

  /**
   * Stop method - must be implemented by subclasses
   */
  stop() {
    throw new Error('stop() must be implemented by subclass');
  }
}
