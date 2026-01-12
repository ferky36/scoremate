"use strict";
/**
 * Tennis Score Modal - Utility Functions
 * Small, reusable utility functions extracted for better maintainability
 */

/**
 * Format time in MM:SS format
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string (e.g., "11:30")
 */
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format team names from player IDs
 * @param {number} teamId - Team ID (1 or 2)
 * @param {Object} playerDetails - Player details object
 * @param {Function} t - Translation function
 * @returns {string} Formatted team names
 */
export function formatTeamNames(teamId, playerDetails, t) {
  const ids = teamId === 1 ? [1, 2] : teamId === 2 ? [3, 4] : [];
  const names = ids
    .map(id => (playerDetails[id]?.name || '').trim())
    .filter(Boolean);
  
  if (!names.length) {
    return teamId === 1 
      ? t('tennis.teamA', 'Tim A') 
      : teamId === 2 
        ? t('tennis.teamB', 'Tim B') 
        : t('tennis.team', 'Tim');
  }
  
  return names.join(' & ');
}

/**
 * Get element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null if not found
 */
export function byId(id) {
  return document.getElementById(id);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('warning', 'error', 'success')
 */
export function showToast(message, type = 'warning') {
  const toastEl = byId("toast-notification");
  const toastMessageEl = byId("toast-message");
  
  if (!toastEl || !toastMessageEl) return;
  
  toastEl.classList.remove('bg-red-500', 'bg-yellow-500', 'bg-green-500');
  
  if (type === 'error') toastEl.classList.add('bg-red-500');
  else if (type === 'success') toastEl.classList.add('bg-green-500');
  else toastEl.classList.add('bg-yellow-500');
  
  toastMessageEl.textContent = message;
  toastEl.classList.remove('opacity-0', 'pointer-events-none');
  toastEl.classList.add('opacity-100');
  
  setTimeout(() => {
    toastEl.classList.remove('opacity-100');
    toastEl.classList.add('opacity-0', 'pointer-events-none');
  }, 3000);
}

/**
 * Compute scheduled time window for a round
 * @param {number} roundIdx - Round index
 * @param {string} startTime - Start time (HH:MM)
 * @param {number} minutesPerRound - Minutes per round
 * @param {number} breakMinutes - Break minutes between rounds
 * @returns {Object|null} Object with start and end times, or null
 */
export function computeScheduledWindow(roundIdx, startTime, minutesPerRound = 11, breakMinutes = 0) {
  try {
    if (!startTime) return null;
    
    const parts = startTime.split(':').map(v => parseInt(v, 10));
    if (parts.length < 2 || parts.some(v => Number.isNaN(v))) return null;
    
    const baseMinutes = parts[0] * 60 + parts[1];
    const index = Math.max(0, Number(roundIdx || 0));
    const offset = index * (minutesPerRound + breakMinutes);
    const startTotal = baseMinutes + offset;
    const endTotal = startTotal + minutesPerRound;
    
    const fmt = (total) => {
      const dayMinutes = 24 * 60;
      const normalized = ((total % dayMinutes) + dayMinutes) % dayMinutes;
      const h = Math.floor(normalized / 60);
      const m = normalized % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    
    return { start: fmt(startTotal), end: fmt(endTotal) };
  } catch {
    return null;
  }
}
