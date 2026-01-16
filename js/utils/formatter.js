/* ========================================
   TERMINAL FORMATTER UTILITY
   Helper functions for formatted terminal output
   ======================================== */

/**
 * Wrap text in a colored span
 * @param {string} text - The text to format
 * @param {string} className - The CSS class name
 * @returns {string} HTML string
 */
function span(text, className) {
  return `<span class="${className}">${text}</span>`;
}

/**
 * Format text with accent color
 */
export function accent(text) {
  return span(text, 'output-accent');
}

/**
 * Format text with muted color
 */
export function muted(text) {
  return span(text, 'output-muted');
}

/**
 * Format text with cyan color
 */
export function cyan(text) {
  return span(text, 'output-cyan');
}

/**
 * Format text with error color
 */
export function error(text) {
  return span(text, 'output-error');
}

/**
 * Format text with success color
 */
export function success(text) {
  return span(text, 'output-success');
}

/**
 * Format text as ASCII box border
 */
export function boxBorder(text) {
  return span(text, 'ascii-box');
}

/**
 * Create a horizontal separator line
 */
export function separator(char = '─', length = 47) {
  return muted(char.repeat(length));
}

/**
 * Create a link
 */
export function link(url, text, attributes = 'target="_blank" rel="noopener"') {
  return `<a href="${url}" ${attributes}>${text || url}</a>`;
}

/**
 * Create an ASCII box with content
 * @param {string} title - Box title
 * @param {string[]} lines - Array of content lines
 * @returns {string} Formatted box
 */
export function box(title, lines) {
  const width = 53;
  const output = [];

  output.push(boxBorder('┌─────────────────────────────────────────────────────┐'));
  output.push(`${boxBorder('│')}  ${accent(title.padEnd(width - 4))}${boxBorder('│')}`);
  output.push(boxBorder('├─────────────────────────────────────────────────────┤'));

  lines.forEach(line => {
    output.push(`${boxBorder('│')}  ${line.padEnd(width - 4)}${boxBorder('│')}`);
  });

  output.push(boxBorder('└─────────────────────────────────────────────────────┘'));

  return output.join('\n');
}

/**
 * Create a table of commands
 * @param {Array} commands - Array of {name, description, aliases}
 * @returns {string} Formatted table
 */
export function commandTable(commands) {
  const rows = commands.map(({ name, description, aliases }) => {
    const aliasText = aliases?.length
      ? ` ${muted(`(${aliases.join(', ')})`)}`
      : ' ';
    return `<span class="help-cmd">${name}</span>${aliasText}<span class="help-desc">${description}</span>`;
  });

  return `<div class="help-table">${rows.join('\n')}</div>`;
}
