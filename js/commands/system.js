/* ========================================
   SYSTEM COMMANDS
   Unix-like utility commands
   ======================================== */

function registerSystemCommands(registry) {
  registry.register(
    "date",
    (args, terminal) => {
      const now = new Date();
      terminal.print(now.toString(), "response");
    },
    {
      description: "Show current date",
      hidden: true,
    }
  );

  registry.register(
    "pwd",
    (args, terminal) => {
      terminal.print("/home/guest/tomstoneberg.com", "response");
    },
    {
      description: "Print working directory",
      hidden: true,
    }
  );

  registry.register(
    "cat",
    (args, terminal) => {
      if (args[0] === ".secrets") {
        terminal.print(
          `
<span class="output-accent">SECRETS FILE</span>
<span class="output-muted">─────────────────────────────────</span>

  Favorite editor: VS Code (don't tell the vim users)
  Tabs vs Spaces: Spaces. Fight me.
  Favorite language: TypeScript
  Coffee order: Black, like my terminal
  Hidden talent: Can debug CSS on the first try (sometimes)
  Guilty pleasure: console.log debugging

<span class="output-muted">─────────────────────────────────</span>
<span class="output-muted">Now you know too much...</span>
`,
          "response"
        );
      } else if (args[0] === "README.md") {
        terminal.print(
          `
<span class="output-accent"># Welcome to my Terminal</span>

Thanks for visiting! This is my personal website,
built as an interactive terminal experience.

<span class="output-cyan">## Quick Start</span>

- Type <span class="output-cyan">help</span> to see available commands
- Type <span class="output-cyan">about</span> to learn about me
- Type <span class="output-cyan">contact</span> to get in touch

<span class="output-cyan">## Easter Eggs</span>

There are hidden commands scattered throughout.
Try typing random things and see what happens!

<span class="output-muted">Made with vanilla HTML/CSS/JS</span>
`,
          "response"
        );
      } else {
        terminal.print(
          `cat: ${args[0] || ""}: No such file or directory`,
          "response"
        );
      }
    },
    {
      description: "Read files",
      hidden: true,
    }
  );

  registry.register(
    "echo",
    (args, terminal) => {
      terminal.print(args.join(" ") || "", "response");
    },
    {
      description: "Echo text",
      hidden: true,
    }
  );

  registry.register(
    "ping",
    (args, terminal) => {
      const host = args[0] || "localhost";
      terminal.print(`PING ${host}: 64 bytes, time=<1ms`, "response");
      terminal.print(
        '<span class="output-success">Host is alive!</span>',
        "response"
      );
    },
    {
      description: "Ping host",
      hidden: true,
    }
  );

  registry.register(
    "neofetch",
    (args, terminal) => {
      terminal.print(
        `
<span class="ascii-art">        _____</span>        <span class="output-cyan">guest</span>@<span class="output-accent">tomstoneberg.com</span>
<span class="ascii-art">       /     \\</span>       <span class="output-muted">─────────────────────</span>
<span class="ascii-art">      | () () |</span>      <span class="output-cyan">OS:</span> WebOS 1.0
<span class="ascii-art">       \\  ^  /</span>       <span class="output-cyan">Host:</span> Your Browser
<span class="ascii-art">        |||||</span>        <span class="output-cyan">Kernel:</span> JavaScript
<span class="ascii-art">        |||||</span>        <span class="output-cyan">Shell:</span> tom-terminal 1.0
                      <span class="output-cyan">Terminal:</span> Phosphor CRT
                      <span class="output-cyan">CPU:</span> Your Device
                      <span class="output-cyan">Memory:</span> Enough
`,
        "response"
      );
    },
    {
      description: "System info",
      hidden: true,
    }
  );

  registry.register(
    "history",
    (args, terminal) => {
      const history = terminal.history.getAll();
      if (history.length === 0) {
        terminal.print("No commands in history yet.", "response");
        return;
      }
      history.forEach((cmd, i) => {
        terminal.print(
          `  ${(i + 1).toString().padStart(3)}  ${cmd}`,
          "response"
        );
      });
    },
    {
      description: "Show command history",
      hidden: true,
    }
  );

  registry.register(
    "theme",
    (args, terminal) => {
      terminal.print(
        '<span class="output-muted">Available themes: phosphor (current)</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">More themes coming soon...</span>',
        "response"
      );
    },
    {
      description: "Change theme",
      hidden: true,
    }
  );

  registry.register(
    "uptime",
    (args, terminal) => {
      const start = window.terminalStartTime || Date.now();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      terminal.print(
        `Terminal has been running for ${mins}m ${secs}s`,
        "response"
      );
    },
    {
      description: "Show uptime",
      hidden: true,
    }
  );

  registry.register(
    "whoami",
    (args, terminal) => {
      terminal.print("guest", "response");
      terminal.print(
        '<span class="output-muted">You\'re a visitor exploring this terminal. Welcome!</span>',
        "response"
      );
    },
    {
      description: "Who are you?",
      hidden: true,
    }
  );
}

window.registerSystemCommands = registerSystemCommands;
