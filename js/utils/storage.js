/* ========================================
   LOCAL STORAGE UTILITY
   Simplified localStorage access
   ======================================== */

import { CONFIG } from '../config/config.js';

/**
 * Get a value from localStorage
 * @param {string} key - The storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} The stored value or default
 */
export function getStorageValue(key, defaultValue = null) {
  const value = localStorage.getItem(key);

  if (value === null) {
    return defaultValue;
  }

  // Try to parse as number if it looks like one
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') {
    return num;
  }

  return value;
}

/**
 * Set a value in localStorage
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 */
export function setStorageValue(key, value) {
  localStorage.setItem(key, String(value));
}

/**
 * Get high score for a specific game
 * @param {string} gameKey - The game key from CONFIG.storage
 * @returns {number} The high score
 */
export function getHighScore(gameKey) {
  return getStorageValue(CONFIG.storage[gameKey], 0);
}

/**
 * Set high score for a specific game
 * @param {string} gameKey - The game key from CONFIG.storage
 * @param {number} score - The score to save
 */
export function setHighScore(gameKey, score) {
  setStorageValue(CONFIG.storage[gameKey], score);
}
