/* ========================================
   CORE COMMANDS
   Main user-facing commands
   ======================================== */

import { CONFIG } from '../config/config.js';
import * as fmt from '../utils/formatter.js';

export function registerCoreCommands(registry) {
  registry.register(
    'help',
    (args, terminal) => {
      const commands = registry.getVisibleCommands();

      terminal.print(`\n${fmt.accent('Available Commands')}`, 'response');
      terminal.print(fmt.separator(), 'response');

      terminal.print(fmt.commandTable(commands), 'response');

      terminal.print(
        `\n${fmt.muted('Tip: Try typing random commands... you might find easter eggs!')}\n`,
        'response'
      );
    },
    {
      description: 'Show available commands',
      aliases: ['?', 'commands'],
    }
  );

  registry.register(
    'about',
    (args, terminal) => {
      const content = fmt.box('TOM STONEBERG', [
        '',
        'I am a software engineer based in Colorado.',
        '',
        '',
        'This site is a playground for kicking the tires',
        'of various AI coding software. Claude Code was',
        'used for the initial scaffolding.',
        '',
      ]);
      terminal.print(`\n${content}\n`, 'response');
    },
    {
      description: 'Learn about me',
      aliases: ['bio', 'me'],
    }
  );

  registry.register(
    'resume',
    (args, terminal) => {
      const jobs = [
        ['Skipify', 'Apr 2022 - Present'],
        ['Zuul', 'Jun 2021 - Present'],
        ['Promontech', 'Jul 2018 - Jun 2021'],
        ['Homeadvisor', 'Feb 2016 - Jul 2018'],
        ['Lawyaw', 'Aug 2016 - Apr 2017'],
        ['Independent', 'Dec 2014 - Dec 2015'],
        ['Denver Energy Group', 'Jul 2014 - Dec 2014'],
        ['Northrop Grumman', 'May 2012 - May 2014'],
        ['Nasdaq OMX', 'May 2010 - Apr 2012'],
      ];

      let output = `\n${fmt.accent('Resume / CV')}\n`;
      output += `${fmt.separator()}\n\n`;
      output += `${fmt.cyan('Work Experience:')}\n\n`;

      jobs.forEach(([company, dates]) => {
        output += `  ${fmt.accent(company.padEnd(28))} ${fmt.muted(dates)}\n`;
      });

      output += `\n${fmt.separator()}\n`;
      output += `${fmt.success('↓')} ${fmt.link(CONFIG.assets.resume, 'View Full Resume (PDF)')}\n`;

      terminal.print(output, 'response');
    },
    {
      description: 'View my resume',
      aliases: ['cv'],
    }
  );

  registry.register(
    'contact',
    (args, terminal) => {
      const contacts = [
        ['1', 'Email', fmt.link(`mailto:${CONFIG.social.email}`, CONFIG.social.email)],
        ['2', 'GitHub', fmt.link(CONFIG.social.github, 'github.com/stoneyb')],
        ['3', 'X', fmt.link(CONFIG.social.twitter, '@tstoneb')],
        ['4', 'Reading', fmt.link(CONFIG.social.goodreads, 'Goodreads Profile')],
        ['5', 'LinkedIn', fmt.link(CONFIG.social.linkedin, 'No')],
      ];

      let output = `\n${fmt.accent('[CONTACT OPTIONS]')}\n\n`;

      contacts.forEach(([num, label, link]) => {
        output += `${fmt.cyan(`[${num}]`)} ${label.padEnd(8)} → ${link}\n`;
      });

      output += `\n${fmt.muted('Type number or name to visit')}\n`;

      terminal.print(output, 'response');
    },
    {
      description: 'Contact information',
      aliases: ['email', 'socials'],
    }
  );

  registry.register(
    'clear',
    (args, terminal) => {
      terminal.clear();
    },
    {
      description: 'Clear the terminal',
      aliases: ['cls', 'c'],
    }
  );

  registry.register(
    'ls',
    (args, terminal) => {
      const dirs = [
        ['drwxr-xr-x', 'tom', 'about/'],
        ['drwxr-xr-x', 'tom', 'resume/'],
        ['drwxr-xr-x', 'tom', 'contact/'],
        ['-rw-r--r--', 'tom', 'README.md'],
        ['-rw-r--r--', 'tom', '.secrets'],
      ];

      let output = '\n';
      dirs.forEach(([perms, owner, file]) => {
        const isDir = file.endsWith('/');
        const nameColor = isDir ? fmt.accent(file) : fmt.muted(file);
        output += `${fmt.cyan(perms)}  ${fmt.muted(owner)}  ${nameColor}\n`;
      });

      terminal.print(output, 'response');
    },
    {
      description: 'List available sections',
      aliases: ['dir', 'list'],
    }
  );
}
