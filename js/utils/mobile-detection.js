/* ========================================
   MOBILE DETECTION UTILITY
   Centralized mobile device detection
   ======================================== */

/**
 * Detects if the current device is a mobile/touch device
 * @returns {boolean} True if mobile device detected
 */
export function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}
