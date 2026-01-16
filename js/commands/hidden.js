/* ========================================
   HIDDEN COMMANDS
   Secret link commands
   ======================================== */

import { CONFIG } from '../config/config.js';

export function registerHiddenCommands(registry) {
  // Create a helper to register hidden link commands
  const registerLink = (command, url) => {
    registry.register(
      command,
      (args, terminal) => {
        window.open(url, '_blank');
      },
      {
        description: '',
        hidden: true,
      }
    );
  };

  // Register all hidden commands from config
  registerLink('dn', CONFIG.hidden.dn);
  registerLink('chumley', CONFIG.hidden.chumley);
  registerLink('empatheticrock', CONFIG.hidden.empatheticrock);
  registerLink('masedawg', CONFIG.hidden.masedawg);
}
