/* ========================================
   CORE COMMANDS
   Main user-facing commands
   ======================================== */

export function registerCoreCommands(registry) {
  registry.register(
    "help",
    (args, terminal) => {
      const commands = registry.getVisibleCommands();

      terminal.print(
        '\n<span class="output-accent">Available Commands</span>',
        "response"
      );
      terminal.print(
        '<span class="output-muted">─────────────────────────────────</span>',
        "response"
      );

      terminal.print('<div class="help-table">', "response");
      commands.forEach(({ name, description, aliases }) => {
        const aliasText = aliases.length
          ? ` <span class="output-muted">(${aliases.join(", ")}) </span>`
          : " ";
        terminal.print(
          `<span class="help-cmd">${name}</span>${aliasText}<span class="help-desc">${description}</span>`,
          "response"
        );
      });
      terminal.print("</div>", "response");

      terminal.print(
        '\n<span class="output-muted">Tip: Try typing random commands... you might find easter eggs!</span>\n',
        "response"
      );
    },
    {
      description: "Show available commands",
      aliases: ["?", "commands"],
    }
  );

  registry.register(
    "about",
    (args, terminal) => {
      terminal.print(
        `
<span class="ascii-box">┌─────────────────────────────────────────────────────┐</span>
<span class="ascii-box">│</span>  <span class="output-accent">TOM STONEBERG</span>                                      <span class="ascii-box">│</span>
<span class="ascii-box">├─────────────────────────────────────────────────────┤</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  I am a software engineer based in Colorado.      <span class="ascii-box">│</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  This site is a playground for kicking the tires  <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  of various AI coding software. Claude Code was   <span class="ascii-box">│</span>
<span class="ascii-box">│</span>  used for the initial scaffolding.                 <span class="ascii-box">│</span>
<span class="ascii-box">│</span>                                                     <span class="ascii-box">│</span>
<span class="ascii-box">└─────────────────────────────────────────────────────┘</span>
`,
        "response"
      );
    },
    {
      description: "Learn about me",
      aliases: ["bio", "me"],
    }
  );

  registry.register(
    "resume",
    (args, terminal) => {
      terminal.print(
        `
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
`,
        "response"
      );
    },
    {
      description: "View my resume",
      aliases: ["cv"],
    }
  );

  registry.register(
    "contact",
    (args, terminal) => {
      terminal.print(
        `
<span class="output-accent">Get In Touch</span>
<span class="output-muted">─────────────────────────────────</span>

  <span class="output-cyan">Email:</span>     <a href="mailto:hello@tomstoneberg.com">hello@tomstoneberg.com</a>

  <span class="output-cyan">GitHub:</span>    <a href="https://github.com/stoneyb" target="_blank" rel="noopener">github.com/stoneyb</a>

  <span class="output-cyan">LinkedIn:</span>  <a href="https://bishopfox.com/blog/linkedin-introduces-insecurity" target="_blank" rel="noopener">No</a>

  <span class="output-cyan">X:</span>         <a href="https://x.com/tstoneb" target="_blank" rel="noopener">@tstoneb</a>

  <span class="output-cyan">Goodreads:</span> <a href="https://www.goodreads.com/user/show/40625768" target="_blank" rel="noopener">40625768</a>

<span class="output-muted">─────────────────────────────────</span>
<span class="output-muted">Feel free to reach out!</span>
`,
        "response"
      );
    },
    {
      description: "Contact information",
      aliases: ["email", "socials"],
    }
  );

  registry.register(
    "clear",
    (args, terminal) => {
      terminal.clear();
    },
    {
      description: "Clear the terminal",
      aliases: ["cls", "c"],
    }
  );

  registry.register(
    "ls",
    (args, terminal) => {
      terminal.print(
        `
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">about/</span>
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">resume/</span>
<span class="output-cyan">drwxr-xr-x</span>  <span class="output-muted">tom</span>  <span class="output-accent">contact/</span>
<span class="output-cyan">-rw-r--r--</span>  <span class="output-muted">tom</span>  <span class="output-muted">README.md</span>
<span class="output-cyan">-rw-r--r--</span>  <span class="output-muted">tom</span>  <span class="output-muted">.secrets</span>
`,
        "response"
      );
    },
    {
      description: "List available sections",
      aliases: ["dir", "list"],
    }
  );
}
