/* ========================================
   COMMAND REGISTRY
   All terminal commands and handlers
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
      description: options.description || '',
      hidden: options.hidden || false,
      aliases: options.aliases || []
    });

    // Register aliases
    if (options.aliases) {
      options.aliases.forEach(alias => {
        this.aliases.set(alias, name);
      });
    }
  }

  execute(name, args, terminal) {
    const resolved = this.aliases.get(name) || name;
    const command = this.commands.get(resolved);

    if (!command) {
      terminal.printError(`Command not found: ${name}`);
      terminal.print('Type <span class="output-cyan">help</span> for available commands.', 'response');
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
        aliases: cmd.aliases
      }));
  }

  registerAll() {
    // ============ CORE COMMANDS ============

    this.register('help', (args, terminal) => {
      const commands = this.getVisibleCommands();

      terminal.print('\n<span class="output-accent">Available Commands</span>', 'response');
      terminal.print('<span class="output-muted">─────────────────────────────────</span>', 'response');

      terminal.print('<div class="help-table">', 'response');
      commands.forEach(({ name, description, aliases }) => {
        const aliasText = aliases.length ? ` <span class="output-muted">(${aliases.join(', ')})</span>` : '';
        terminal.print(`<span class="help-cmd">${name}</span>${aliasText}<span class="help-desc">${description}</span>`, 'response');
      });
      terminal.print('</div>', 'response');

      terminal.print('\n<span class="output-muted">Tip: Try typing random commands... you might find easter eggs!</span>\n', 'response');
    }, {
      description: 'Show available commands',
      aliases: ['?', 'commands']
    });

    this.register('about', (args, terminal) => {
      terminal.print(`
<span class="ascii-box">┌─────────────────────────────────────────────────────┐</span>
<span class="ascii-box">│</span>  <span class="output-accent">TOM STONEBERG</span>                                      <span class="ascii-box">│</span>
<span class="ascii-box">├─────────────────────────────────────────────────────┤</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  <span class="output-cyan">Software Engineer</span> with a passion for building     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  elegant solutions to complex problems.             <span class="ascii-box">│</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  I love working with modern web technologies,      <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  building developer tools, and creating delightful <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  user experiences.                                  <span class="ascii-box">│</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  <span class="output-muted">Type</span> <span class="output-cyan">resume</span> <span class="output-muted">for my experience</span>                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  <span class="output-muted">Type</span> <span class="output-cyan">contact</span> <span class="output-muted">to get in touch</span>                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">└─────────────────────────────────────────────────────┘</span>
`, 'response');
    }, {
      description: 'Learn about me',
      aliases: ['bio', 'me', 'whoami']
    });

    this.register('resume', (args, terminal) => {
      terminal.print(`
<span class="output-accent">Resume / CV</span>
<span class="output-muted">───────────────────────────────────────────────</span>

<span class="output-cyan">Work Experience:</span>

  <span class="output-accent">Skipify</span>                      <span class="output-muted">Apr 2022 - Present</span>
  <span class="output-accent">Zuul</span>                         <span class="output-muted">Jun 2021 - Present</span>
  <span class="output-accent">Promontech</span>                   <span class="output-muted">Jul 2018 - Jun 2021</span>
  <span class="output-accent">Homeadvisor</span>                  <span class="output-muted">Feb 2016 - Jul 2018</span>
  <span class="output-accent">Lawyaw</span>                       <span class="output-muted">Aug 2016 - Apr 2017</span>
  <span class="output-accent">Independent</span>                  <span class="output-muted">Dec 2014 - Dec 2015</span>
  <span class="output-accent">Denver Energy Group</span>          <span class="output-muted">Jul 2014 - Dec 2014</span>
  <span class="output-accent">Northrop Grumman</span>             <span class="output-muted">May 2012 - May 2014</span>
  <span class="output-accent">Nasdaq OMX</span>                   <span class="output-muted">May 2010 - Apr 2012</span>

<span class="output-muted">───────────────────────────────────────────────</span>
<span class="output-success">↓</span> <a href="assets/TomStonebergResumeJan2026.pdf" target="_blank" rel="noopener">View Full Resume (PDF)</a>
`, 'response');
    }, {
      description: 'View my resume',
      aliases: ['cv']
    });

    this.register('contact', (args, terminal) => {
      terminal.print(`
<span class="output-accent">Get In Touch</span>
<span class="output-muted">─────────────────────────────────</span>

  <span class="output-cyan">Email:</span>     <a href="mailto:tom@stoneberg.dev">tom@stoneberg.dev</a>

  <span class="output-cyan">GitHub:</span>    <a href="https://github.com/tomstoneberg" target="_blank" rel="noopener">github.com/tomstoneberg</a>

  <span class="output-cyan">LinkedIn:</span>  <a href="https://linkedin.com/in/tomstoneberg" target="_blank" rel="noopener">linkedin.com/in/tomstoneberg</a>

  <span class="output-cyan">Twitter:</span>   <a href="https://twitter.com/tomstoneberg" target="_blank" rel="noopener">@tomstoneberg</a>

<span class="output-muted">─────────────────────────────────</span>
<span class="output-muted">Feel free to reach out!</span>
`, 'response');
    }, {
      description: 'Contact information',
      aliases: ['email', 'socials']
    });

    this.register('clear', (args, terminal) => {
      terminal.clear();
    }, {
      description: 'Clear the terminal',
      aliases: ['cls', 'c']
    });

    this.register('ls', (args, terminal) => {
      terminal.print(`
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">about/</span>
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">resume/</span>
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">contact/</span>
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">projects/</span>
<span class="output-cyan">-rw-r--r--</span>  <span class="output-muted">tom</span>  <span class="output-muted">README.md</span>
<span class="output-cyan">-rw-r--r--</span>  <span class="output-muted">tom</span>  <span class="output-muted">.secrets</span>
`, 'response');
    }, {
      description: 'List available sections',
      aliases: ['dir', 'list']
    });

    this.register('projects', (args, terminal) => {
      terminal.print(`
<span class="output-accent">Featured Projects</span>
<span class="output-muted">─────────────────────────────────</span>

  <span class="output-cyan">1. Terminal Portfolio</span> <span class="output-muted">(You're looking at it!)</span>
     A retro-futuristic terminal interface
     <span class="output-muted">Tech: Vanilla JS, CSS animations</span>

  <span class="output-cyan">2. Project Two</span>
     Description of your project
     <span class="output-muted">Tech: React, Node.js, PostgreSQL</span>

  <span class="output-cyan">3. Project Three</span>
     Another cool project description
     <span class="output-muted">Tech: TypeScript, AWS Lambda</span>

<span class="output-muted">─────────────────────────────────</span>
<span class="output-muted">Visit my GitHub for more projects!</span>
`, 'response');
    }, {
      description: 'View my projects',
      aliases: ['work', 'portfolio']
    });

    // ============ EASTER EGGS ============

    this.register('sudo', (args, terminal) => {
      const responses = [
        "Permission denied. This incident will be reported to Santa.",
        "Nice try, but you're not root here. I'm root. This is my house.",
        "sudo: user 'guest' is not in the sudoers file.",
        "<span class='output-error'>Access Denied.</span> Did you try saying 'please'?",
        "sudo make me a sandwich? <span class='output-muted'>...okay.</span> 🥪",
        "With great power comes great responsibility. You're not ready.",
        "<span class='output-error'>Error:</span> Nice try, hackerman.",
        "I'm sorry Dave, I'm afraid I can't do that."
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      terminal.print(response, 'response');
    }, {
      description: 'Try to gain root access',
      aliases: []
    });

    this.register('hack', (args, terminal) => {
      terminal.print('<span class="output-success">Initiating hack sequence...</span>', 'response');
      terminal.print('<span class="output-muted">Press ESC or wait to exit</span>\n', 'response');

      if (window.MatrixRain) {
        const matrix = new MatrixRain();
        matrix.start(15000);
      }
    }, {
      description: 'Enter the Matrix',
      aliases: ['matrix']
    });

    this.register('snake', (args, terminal) => {
      terminal.print('\n<span class="output-accent">🐍 SNAKE</span>', 'response');
      terminal.print('<span class="output-muted">Use arrow keys or WASD to move</span>', 'response');
      terminal.print('<span class="output-muted">Press ESC to quit</span>\n', 'response');

      if (window.SnakeGame) {
        const game = new SnakeGame(terminal);
        game.start();
      }
    }, {
      description: 'Play Snake',
      aliases: []
    });

    this.register('coffee', (args, terminal) => {
      terminal.print(`
<span class="ascii-art">
        ( (
         ) )
      .─────.
      |     |]
      \`─────'
       \`───'
</span>
<span class="output-muted">Here's your mass-produced caffeinated joy! Take a sip and return to normal functionality.</span>
`, 'response');
    }, {
      description: 'Get coffee',
      hidden: true
    });

    this.register('cowsay', (args, terminal) => {
      const text = args.join(' ') || 'Moo!';
      const padding = text.length + 2;
      const top = ' ' + '_'.repeat(padding);
      const bottom = ' ' + '-'.repeat(padding);

      terminal.print(`
<span class="ascii-art">${top}
< ${text} >
${bottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||</span>
`, 'response');
    }, {
      description: 'Cow says what?',
      hidden: true
    });

    this.register('fortune', (args, terminal) => {
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
        "// Magic. Do not touch."
      ];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      terminal.print(`\n<span class="output-accent">"${fortune}"</span>\n`, 'response');
    }, {
      description: 'Get a fortune',
      hidden: true
    });

    this.register('rm', (args, terminal) => {
      const argStr = args.join(' ');
      if (argStr.includes('-rf') && argStr.includes('/')) {
        terminal.print('<span class="output-error">Deleting system files...</span>', 'response');

        const messages = [
          'Removing /usr/bin...',
          'Removing /etc/passwd...',
          'Removing /home/*...',
          'Removing childhood memories...',
          'Removing sense of purpose...',
          'Removing will to live...',
          'Removing existential dread... wait, that one stays.',
          '',
          '<span class="output-success">Just kidding!</span> This is a website, not your actual system.',
          '<span class="output-muted">But maybe don\'t run that command on real machines? 😅</span>'
        ];

        messages.forEach((msg, i) => {
          setTimeout(() => {
            terminal.print(msg, 'response');
          }, i * 400);
        });
      } else {
        terminal.print('rm: missing operand', 'response');
      }
    }, {
      description: 'Remove files',
      hidden: true
    });

    this.register('exit', (args, terminal) => {
      const responses = [
        "Nice try! But there's no escape from this terminal.",
        "You can check out any time you like, but you can never leave...",
        "Exit? In this economy?",
        "<span class='output-error'>Error:</span> Cannot exit. You're stuck with me forever.",
        "Have you tried turning it off and on again?",
        "*pretends not to hear you*"
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      terminal.print(response, 'response');
    }, {
      description: 'Try to exit',
      hidden: true
    });

    this.register('date', (args, terminal) => {
      const now = new Date();
      terminal.print(now.toString(), 'response');
    }, {
      description: 'Show current date',
      hidden: true
    });

    this.register('pwd', (args, terminal) => {
      terminal.print('/home/guest/tomstoneberg.com', 'response');
    }, {
      description: 'Print working directory',
      hidden: true
    });

    this.register('cat', (args, terminal) => {
      if (args[0] === '.secrets') {
        terminal.print(`
<span class="output-accent">🔐 SECRETS FILE</span>
<span class="output-muted">─────────────────────────────────</span>

  • Favorite editor: VS Code (don't tell the vim users)
  • Tabs vs Spaces: Spaces. Fight me.
  • Favorite language: TypeScript
  • Coffee order: Black, like my terminal
  • Hidden talent: Can debug CSS on the first try (sometimes)
  • Guilty pleasure: console.log debugging

<span class="output-muted">─────────────────────────────────</span>
<span class="output-muted">Now you know too much...</span>
`, 'response');
      } else if (args[0] === 'README.md') {
        terminal.print(`
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
`, 'response');
      } else {
        terminal.print(`cat: ${args[0] || ''}: No such file or directory`, 'response');
      }
    }, {
      description: 'Read files',
      hidden: true
    });

    this.register('echo', (args, terminal) => {
      terminal.print(args.join(' ') || '', 'response');
    }, {
      description: 'Echo text',
      hidden: true
    });

    this.register('ping', (args, terminal) => {
      const host = args[0] || 'localhost';
      terminal.print(`PING ${host}: 64 bytes, time=<1ms`, 'response');
      terminal.print('<span class="output-success">Host is alive!</span>', 'response');
    }, {
      description: 'Ping host',
      hidden: true
    });

    this.register('neofetch', (args, terminal) => {
      terminal.print(`
<span class="ascii-art">        _____</span>        <span class="output-cyan">guest</span>@<span class="output-accent">tomstoneberg.com</span>
<span class="ascii-art">       /     \\</span>       <span class="output-muted">─────────────────────</span>
<span class="ascii-art">      | () () |</span>      <span class="output-cyan">OS:</span> WebOS 1.0
<span class="ascii-art">       \\  ^  /</span>       <span class="output-cyan">Host:</span> Your Browser
<span class="ascii-art">        |||||</span>        <span class="output-cyan">Kernel:</span> JavaScript
<span class="ascii-art">        |||||</span>        <span class="output-cyan">Shell:</span> tom-terminal 1.0
                      <span class="output-cyan">Terminal:</span> Phosphor CRT
                      <span class="output-cyan">CPU:</span> Your Device
                      <span class="output-cyan">Memory:</span> Enough
`, 'response');
    }, {
      description: 'System info',
      hidden: true
    });

    this.register('history', (args, terminal) => {
      const history = terminal.history.getAll();
      if (history.length === 0) {
        terminal.print('No commands in history yet.', 'response');
        return;
      }
      history.forEach((cmd, i) => {
        terminal.print(`  ${(i + 1).toString().padStart(3)}  ${cmd}`, 'response');
      });
    }, {
      description: 'Show command history',
      hidden: true
    });

    this.register('theme', (args, terminal) => {
      terminal.print('<span class="output-muted">Available themes: phosphor (current)</span>', 'response');
      terminal.print('<span class="output-muted">More themes coming soon...</span>', 'response');
    }, {
      description: 'Change theme',
      hidden: true
    });

    this.register('uptime', (args, terminal) => {
      const start = window.terminalStartTime || Date.now();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      terminal.print(`Terminal has been running for ${mins}m ${secs}s`, 'response');
    }, {
      description: 'Show uptime',
      hidden: true
    });

    this.register('whoami', (args, terminal) => {
      terminal.print('guest', 'response');
      terminal.print('<span class="output-muted">You\'re a visitor exploring this terminal. Welcome!</span>', 'response');
    }, {
      description: 'Who are you?',
      hidden: true
    });
  }
}

// Export for use in terminal.js
window.CommandRegistry = CommandRegistry;
