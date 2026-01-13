/* ========================================
   COMMAND REGISTRY
   Core registry class - commands are loaded from js/commands/
   ======================================== */

class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.registerAll();
  }

  register(name, handler, options = {}) {
    this.commands.set(name, {
      handler,
      description: options.description || "",
      hidden: options.hidden || false,
      aliases: options.aliases || [],
    });

    // Register aliases
    if (options.aliases) {
      options.aliases.forEach((alias) => {
        this.aliases.set(alias, name);
      });
    }
  }

  execute(name, args, terminal) {
    const resolved = this.aliases.get(name) || name;
    const command = this.commands.get(resolved);

    if (!command) {
      terminal.printError(`Command not found: ${name}`);
      terminal.print(
        'Type <span class="output-cyan">help</span> for available commands.',
        "response"
      );
      return;
    }

    command.handler(args, terminal);
  }

  getVisibleCommands() {
    return [...this.commands.entries()]
      .filter(([_, cmd]) => !cmd.hidden)
      .map(([name, cmd]) => ({
        name,
        description: cmd.description,
        aliases: cmd.aliases,
      }));
  }

  registerAll() {
    // Load commands from separate modules
    if (window.registerCoreCommands) {
      window.registerCoreCommands(this);
    }
    if (window.registerEasterEggCommands) {
      window.registerEasterEggCommands(this);
    }
    if (window.registerSystemCommands) {
      window.registerSystemCommands(this);
    }
    if (window.registerHiddenCommands) {
      window.registerHiddenCommands(this);
    }
  }
}

// Export for use in terminal.js
window.CommandRegistry = CommandRegistry;
