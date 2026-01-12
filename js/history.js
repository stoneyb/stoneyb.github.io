/* ========================================
   COMMAND HISTORY
   Handles up/down arrow navigation
   ======================================== */

class CommandHistory {
  constructor(maxSize = 50) {
    this.history = [];
    this.index = -1;
    this.maxSize = maxSize;
    this.tempInput = '';
  }

  add(command) {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Don't add duplicates of the last command
    if (trimmed === this.history[this.history.length - 1]) {
      this.reset();
      return;
    }

    this.history.push(trimmed);

    // Trim history if it exceeds max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }

    this.reset();
  }

  navigateUp(currentInput) {
    // Save current input when starting to navigate
    if (this.index === -1) {
      this.tempInput = currentInput;
    }

    if (this.history.length === 0) {
      return currentInput;
    }

    if (this.index < this.history.length - 1) {
      this.index++;
    }

    return this.history[this.history.length - 1 - this.index] || currentInput;
  }

  navigateDown() {
    if (this.index > 0) {
      this.index--;
      return this.history[this.history.length - 1 - this.index];
    } else if (this.index === 0) {
      this.index = -1;
      return this.tempInput;
    }

    return this.tempInput;
  }

  reset() {
    this.index = -1;
    this.tempInput = '';
  }

  getAll() {
    return [...this.history];
  }
}

// Export for use in terminal.js
window.CommandHistory = CommandHistory;
