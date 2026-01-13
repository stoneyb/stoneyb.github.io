/* ========================================
   TERMINAL ENGINE
   Core terminal functionality
   ======================================== */

class Terminal {
  constructor() {
    this.bodyEl = document.getElementById('terminal-body');
    this.outputEl = document.getElementById('output');
    this.inputEl = document.getElementById('terminal-input');
    this.mirrorEl = document.getElementById('input-mirror');
    this.cursorEl = document.querySelector('.cursor');

    this.history = new CommandHistory();
    this.commands = new CommandRegistry();

    // Track start time for uptime command
    window.terminalStartTime = Date.now();

    this.init();
  }

  init() {
    this.bindEvents();
    this.focusInput();
    this.bootSequence();
  }

  bindEvents() {
    // Handle input
    this.inputEl.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Update cursor position on input
    this.inputEl.addEventListener('input', () => this.updateCursor());

    // Click anywhere to focus input
    document.addEventListener('click', (e) => {
      // Don't steal focus from links or game elements
      if (e.target.tagName === 'A' || e.target.closest('.game-container')) {
        return;
      }
      this.focusInput();
    });

    // Keep cursor synced
    this.inputEl.addEventListener('focus', () => this.updateCursor());
    this.inputEl.addEventListener('blur', () => this.updateCursor());
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.executeCommand();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.inputEl.value = this.history.navigateUp(this.inputEl.value);
        this.updateCursor();
        // Move cursor to end
        this.inputEl.setSelectionRange(this.inputEl.value.length, this.inputEl.value.length);
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.inputEl.value = this.history.navigateDown();
        this.updateCursor();
        this.inputEl.setSelectionRange(this.inputEl.value.length, this.inputEl.value.length);
        break;

      case 'Tab':
        e.preventDefault();
        this.handleTabComplete();
        break;

      case 'l':
        // Ctrl+L to clear
        if (e.ctrlKey) {
          e.preventDefault();
          this.clear();
        }
        break;

      case 'c':
        // Ctrl+C to cancel
        if (e.ctrlKey) {
          e.preventDefault();
          this.inputEl.value = '';
          this.print('^C', 'response');
          this.updateCursor();
        }
        break;
    }
  }

  handleTabComplete() {
    const input = this.inputEl.value.toLowerCase().trim();
    if (!input) return;

    // Get all command names including aliases
    const allCommands = [];
    this.commands.commands.forEach((cmd, name) => {
      allCommands.push(name);
      cmd.aliases.forEach(alias => allCommands.push(alias));
    });

    // Find matches
    const matches = allCommands.filter(cmd => cmd.startsWith(input));

    if (matches.length === 1) {
      this.inputEl.value = matches[0] + ' ';
      this.updateCursor();
    } else if (matches.length > 1) {
      this.print(`\n<span class="output-muted">${matches.join('  ')}</span>`, 'response');
    }
  }

  executeCommand() {
    const input = this.inputEl.value.trim();
    this.inputEl.value = '';
    this.updateCursor();

    if (!input) {
      this.print('', 'command');
      return;
    }

    // Add to history
    this.history.add(input);

    // Print the command
    this.print(input, 'command');

    // Parse and execute
    const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const [command, ...args] = parts.map(p => p.replace(/^"|"$/g, ''));

    if (command) {
      this.commands.execute(command.toLowerCase(), args, this);
    }

    // Scroll to bottom
    this.scrollToBottom();
  }

  print(content, type = 'response') {
    const line = document.createElement('div');
    line.className = `output-line output-${type}`;
    line.innerHTML = content;

    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  printError(message) {
    this.print(`<span class="output-error">Error:</span> ${message}`, 'response');
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  scrollToBottom() {
    // Use requestAnimationFrame for reliable mobile scrolling
    requestAnimationFrame(() => {
      this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    });
  }

  focusInput() {
    this.inputEl.focus();
  }

  updateCursor() {
    // Sync mirror text with input value
    if (this.mirrorEl) {
      this.mirrorEl.textContent = this.inputEl.value;
    }
    // Show/hide cursor based on focus
    if (this.cursorEl) {
      this.cursorEl.style.display = document.activeElement === this.inputEl ? 'inline-block' : 'none';
    }
  }

  bootSequence() {
    const bootMessages = [
      { text: '<span class="output-muted">Initializing terminal...</span>', delay: 0 },
      { text: '<span class="output-muted">Loading modules...</span>', delay: 150 },
      { text: '<span class="output-success">System ready.</span>', delay: 300 },
      { text: '', delay: 400 },
      { text: this.getWelcomeBanner(), delay: 500 },
      { text: '', delay: 600 },
      { text: '<span class="output-muted">Type</span> <span class="output-cyan">help</span> <span class="output-muted">to see available commands.</span>', delay: 700 },
      { text: '', delay: 800 }
    ];

    bootMessages.forEach(({ text, delay }) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'output-line boot-line';
        line.innerHTML = text;
        line.style.animationDelay = `${delay}ms`;
        this.outputEl.appendChild(line);
        this.scrollToBottom();
      }, delay);
    });
  }

  getWelcomeBanner() {
    return `<pre class="ascii-art">
 _____ ___  __  __   ____ _____ ___  _   _ _____ ____  _____ ____   ____
|_   _/ _ \\|  \\/  | / ___|_   _/ _ \\| \\ | | ____| __ )| ____|  _ \\ / ___|
  | || | | | |\\/| | \\___ \\ | || | | |  \\| |  _| |  _ \\|  _| | |_) | |  _
  | || |_| | |  | |  ___) || || |_| | |\\  | |___| |_) | |___|  _ <| |_| |
  |_| \\___/|_|  |_| |____/ |_| \\___/|_| \\_|_____|____/|_____|_| \\_\\\\____|
</pre>
<span class="output-accent">Welcome to my terminal.</span> <span class="output-muted">Explore, discover, and have fun!</span>`;
  }
}

// Initialize terminal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.terminal = new Terminal();
});
