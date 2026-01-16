/* ========================================
   COMMAND REGISTRY
   Core registry class - commands are loaded from js/commands/
   ======================================== */

import { registerCoreCommands } from '../commands/core.js';
import { registerEasterEggCommands } from '../commands/easter-eggs.js';
import { registerSystemCommands } from '../commands/system.js';
import { registerHiddenCommands } from '../commands/hidden.js';

export class CommandRegistry {
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
    registerCoreCommands(this);
    registerEasterEggCommands(this);
    registerSystemCommands(this);
    registerHiddenCommands(this);
  }
}
