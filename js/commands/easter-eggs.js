/* ========================================
   EASTER EGG COMMANDS
   Fun hidden commands
   ======================================== */

import { MatrixRain } from '../games/matrix.js';
import { SnakeGame } from '../games/SnakeGame.js';
import { BreakoutGame } from '../games/BreakoutGame.js';
import { SlotMachineGame } from '../games/SlotMachineGame.js';
import { CONFIG } from '../config/config.js';

export function registerEasterEggCommands(registry) {
  registry.register(
    "sudo",
    (args, terminal) => {
      const responses = [
        "Permission denied. This incident will be reported to Santa.",
        "Nice try, but you're not root here. I'm root. This is my house.",
        "sudo: user 'guest' is not in the sudoers file.",
        "<span class='output-error'>Access Denied.</span> Did you try saying 'please'?",
        "sudo make me a sandwich? <span class='output-muted'>...okay.</span>",
        "With great power comes great responsibility. You're not ready.",
        "<span class='output-error'>Error:</span> Nice try, hackerman.",
        "I'm sorry Dave, I'm afraid I can't do that.",
      ];
      const response =
        responses[Math.floor(Math.random() * responses.length)];
      terminal.print(response, "response");
    },
    {
      description: "Try to gain root access",
      aliases: [],
    }
  );

  registry.register(
    "hack",
    (args, terminal) => {
      terminal.print(
        '<span class="output-success">Initiating hack sequence...</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Press ESC or wait to exit</span>\n',
        "response"
      );

      const matrix = new MatrixRain();
      matrix.start(CONFIG.games.matrix.defaultDuration);
    },
    {
      description: "Enter the Matrix",
      aliases: ["matrix"],
    }
  );

  registry.register(
    "snake",
    (args, terminal) => {
      terminal.print(
        '\n<span class="output-accent">SNAKE</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Use arrow keys or WASD to move</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Press ESC to quit</span>\n',
        "response"
      );

      const game = new SnakeGame(terminal);
      game.start();
    },
    {
      description: "Play Snake",
      aliases: [],
    }
  );

  registry.register(
    "breakout",
    (args, terminal) => {
      terminal.print(
        '\n<span class="output-accent">BREAKOUT</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Use arrow keys, A/D, or mouse to move paddle</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Press SPACE to pause, ESC to quit</span>\n',
        "response"
      );

      const game = new BreakoutGame(terminal);
      game.start();
    },
    {
      description: "Play Breakout",
      aliases: [],
    }
  );

  registry.register(
    "slots",
    (args, terminal) => {
      // Handle reset command
      if (args[0] === "reset") {
        SlotMachineGame.resetBalance();
        terminal.print(
          '<span class="output-success">Balance reset to 100!</span>',
          "response"
        );
        return;
      }

      terminal.print(
        '\n<span class="output-accent">LUCKY TERMINAL SLOTS</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Use buttons to play | ESC to quit</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">Type "slots reset" to reset balance</span>\n',
        "response"
      );

      const game = new SlotMachineGame(terminal);
      game.start();
    },
    {
      description: "Play Slots",
      aliases: ["slot"],
    }
  );

  registry.register(
    "coffee",
    (args, terminal) => {
      terminal.print(
        `
<span class="ascii-art">
        ( (
         ) )
      .─────.
      |     |]
      \`─────'
       \`───'
</span>
<span class="output-muted">Here's your mass-produced caffeinated joy! Take a sip and return to normal functionality.</span>
`,
        "response"
      );
    },
    {
      description: "Get coffee",
      hidden: true,
    }
  );

  registry.register(
    "cowsay",
    (args, terminal) => {
      const text = args.join(" ") || "Moo!";
      const padding = text.length + 2;
      const top = " " + "_".repeat(padding);
      const bottom = " " + "-".repeat(padding);

      terminal.print(
        `
<span class="ascii-art">${top}
< ${text} >
${bottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||</span>
`,
        "response"
      );
    },
    {
      description: "Cow says what?",
      hidden: true,
    }
  );

  registry.register(
    "fortune",
    (args, terminal) => {
      const fortunes = [
        "There are only two hard things in Computer Science: cache invalidation and naming things. - Phil Karlton",
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
        "First, solve the problem. Then, write the code. - John Johnson",
        "Code is like humor. When you have to explain it, it's bad. - Cory House",
        "Fix the cause, not the symptom. - Steve Maguire",
        "Simplicity is the soul of efficiency. - Austin Freeman",
        "Before software can be reusable it first has to be usable. - Ralph Johnson",
        "Make it work, make it right, make it fast. - Kent Beck",
        "The best error message is the one that never shows up. - Thomas Fuchs",
        "It's not a bug – it's an undocumented feature.",
        "In order to understand recursion, one must first understand recursion.",
        "There's no place like 127.0.0.1",
        "A SQL query walks into a bar, walks up to two tables and asks 'Can I join you?'",
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "// Magic. Do not touch.",
      ];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      terminal.print(
        `\n<span class="output-accent">"${fortune}"</span>\n`,
        "response"
      );
    },
    {
      description: "Get a fortune",
      hidden: true,
    }
  );

  registry.register(
    "rm",
    (args, terminal) => {
      const argStr = args.join(" ");
      if (argStr.includes("-rf") && argStr.includes("/")) {
        terminal.print(
          '<span class="output-error">Deleting system files...</span>',
          "response"
        );

        const messages = [
          "Removing /usr/bin...",
          "Removing /etc/passwd...",
          "Removing /home/*...",
          "Removing existential dread... wait, that one stays.",
          "",
          '<span class="output-success">Just kidding!</span> This is a website, not your actual system.',
          '<span class="output-muted">But maybe don\'t run that command on real machines?</span>',
        ];

        messages.forEach((msg, i) => {
          setTimeout(() => {
            terminal.print(msg, "response");
          }, i * 400);
        });
      } else {
        terminal.print("rm: missing operand", "response");
      }
    },
    {
      description: "Remove files",
      hidden: true,
    }
  );

  registry.register(
    "exit",
    (args, terminal) => {
      const responses = [
        "Nice try! But there's no escape from this terminal.",
        "You can check out any time you like, but you can never leave...",
        "Exit? In this economy?",
        "<span class='output-error'>Error:</span> Cannot exit. You're stuck with me forever.",
        "Have you tried turning it off and on again?",
        "*pretends not to hear you*",
      ];
      const response =
        responses[Math.floor(Math.random() * responses.length)];
      terminal.print(response, "response");
    },
    {
      description: "Try to exit",
      hidden: true,
    }
  );
}
