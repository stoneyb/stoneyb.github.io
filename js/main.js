/* ========================================
   MAIN ENTRY POINT
   Initializes the terminal application
   ======================================== */

import { Terminal } from './core/terminal.js';

// Initialize terminal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.terminal = new Terminal();
});
