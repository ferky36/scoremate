"use strict";
/**
 * Tennis Score Modal - Game State Helpers
 * Helper functions for game state management and calculations
 */

/**
 * Get round minutes from input or default
 * @param {Function} byId - Function to get element by ID
 * @returns {number} Minutes per round (minimum 1)
 */
export function getRoundMinutes(byId) {
  try {
    const input = byId('minutesPerRound');
    return Math.max(1, parseInt(input?.value || '11', 10));
  } catch {
    return 11;
  }
}

/**
 * Get court scoring mode (persisted from Match 1)
 * @param {number} courtIdx - Court index
 * @param {Array} roundsByCourt - Rounds by court array
 * @returns {string|null} Scoring mode ('TENNIS' or 'RALLY') or null
 */
export function getCourtScoringMode(courtIdx, roundsByCourt) {
  try {
    const court = roundsByCourt?.[courtIdx];
    if (!court) return null;
    return court.__scoringMode || (court[0] && court[0].__scoringMode) || null;
  } catch {
    return null;
  }
}

/**
 * Set court scoring mode (persist for all rounds in court)
 * @param {number} courtIdx - Court index
 * @param {string} mode - Scoring mode ('TENNIS' or 'RALLY')
 * @param {Array} roundsByCourt - Rounds by court array
 */
export function setCourtScoringMode(courtIdx, mode, roundsByCourt) {
  try {
    if (!roundsByCourt[courtIdx]) {
      roundsByCourt[courtIdx] = [];
    }
    roundsByCourt[courtIdx].__scoringMode = mode;
    
    if (!roundsByCourt[courtIdx][0]) {
      roundsByCourt[courtIdx][0] = {
        a1: '', a2: '', b1: '', b2: '',
        scoreA: '', scoreB: '', server_offset: 0
      };
    }
    roundsByCourt[courtIdx][0].__scoringMode = mode;
  } catch (err) {
    console.warn('Failed to set court scoring mode', err);
  }
}

/**
 * Check if match is in Tennis mode (vs Rally mode)
 * @param {string} scoringMode - Current scoring mode
 * @returns {boolean} True if Tennis mode
 */
export function isTennisMode(scoringMode) {
  return scoringMode === 'TENNIS';
}

/**
 * Check if match is in Rally mode
 * @param {string} scoringMode - Current scoring mode
 * @returns {boolean} True if Rally mode
 */
export function isRallyMode(scoringMode) {
  return scoringMode === 'RALLY';
}

/**
 * Calculate if game is won in Tennis mode
 * @param {number} scoreT1 - Team 1 score
 * @param {number} scoreT2 - Team 2 score
 * @returns {number} Winning team (1, 2, or 0 if no winner)
 */
export function checkTennisGameWin(scoreT1, scoreT2) {
  if (scoreT1 >= 4 && scoreT1 >= scoreT2 + 2) return 1;
  if (scoreT2 >= 4 && scoreT2 >= scoreT1 + 2) return 2;
  return 0;
}

/**
 * Check if scores are in deuce (40-40)
 * @param {number} scoreT1 - Team 1 score
 * @param {number} scoreT2 - Team 2 score
 * @returns {boolean} True if deuce
 */
export function isDeuce(scoreT1, scoreT2) {
  return scoreT1 >= 3 && scoreT2 >= 3 && scoreT1 === scoreT2;
}

/**
 * Check if team has advantage
 * @param {number} scoreT1 - Team 1 score
 * @param {number} scoreT2 - Team 2 score
 * @param {number} team - Team to check (1 or 2)
 * @returns {boolean} True if team has advantage
 */
export function hasAdvantage(scoreT1, scoreT2, team) {
  if (scoreT1 < 3 || scoreT2 < 3) return false;
  if (team === 1) return scoreT1 > scoreT2;
  if (team === 2) return scoreT2 > scoreT1;
  return false;
}

/**
 * Get display score for Tennis mode
 * @param {number} score - Raw score (0-4+)
 * @param {Array<string>} displayScores - Display scores array ["0", "15", "30", "40"]
 * @returns {string} Display score
 */
export function getTennisDisplayScore(score, displayScores = ["0", "15", "30", "40"]) {
  return displayScores[Math.min(score, 3)];
}

/**
 * Calculate match winner
 * @param {number} gamesT1 - Team 1 games won
 * @param {number} gamesT2 - Team 2 games won
 * @returns {number} Winning team (1, 2, or 0 for tie)
 */
export function getMatchWinner(gamesT1, gamesT2) {
  if (gamesT1 > gamesT2) return 1;
  if (gamesT2 > gamesT1) return 2;
  return 0;
}

/**
 * Check if Rally mode should finish at 21 points
 * @param {number} gamesT1 - Team 1 points
 * @param {number} gamesT2 - Team 2 points
 * @param {boolean} finishAt21 - Finish at 21 setting
 * @param {boolean} finishAt21Prompted - Already prompted flag
 * @returns {boolean} True if should prompt to finish
 */
export function shouldPromptFinishAt21(gamesT1, gamesT2, finishAt21, finishAt21Prompted) {
  if (!finishAt21 || finishAt21Prompted) return false;
  const maxPoints = Math.max(gamesT1, gamesT2);
  return maxPoints >= 21;
}

/**
 * Validate score input
 * @param {number} score - Score to validate
 * @returns {boolean} True if valid
 */
export function isValidScore(score) {
  return Number.isFinite(score) && score >= 0;
}

/**
 * Clamp score to valid range
 * @param {number} score - Score to clamp
 * @param {number} min - Minimum value (default 0)
 * @param {number} max - Maximum value (default Infinity)
 * @returns {number} Clamped score
 */
export function clampScore(score, min = 0, max = Infinity) {
  return Math.max(min, Math.min(max, score));
}
