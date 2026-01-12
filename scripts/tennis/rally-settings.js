"use strict";
/**
 * Tennis Score Modal - Rally Settings Manager
 * Manages Rally mode "Finish at 21" setting persistence
 */

/**
 * Rally Settings Manager
 * Handles Rally mode settings like "Finish at 21 points"
 */
export class RallySettings {
  /**
   * Create a new RallySettings instance
   * @param {string|number} courtIdx - Court index or 'global' for global settings
   */
  constructor(courtIdx = 'global') {
    this.courtIdx = courtIdx;
    this.storageKey = this._getStorageKey(courtIdx);
  }

  /**
   * Get storage key for court-specific or global settings
   * @param {string|number} courtIdx - Court index or 'global'
   * @returns {string} Storage key
   * @private
   */
  _getStorageKey(courtIdx) {
    try {
      const c = (typeof courtIdx !== 'undefined' && courtIdx !== null) 
        ? String(courtIdx) 
        : 'global';
      return `ts_rally_finish_${c}`;
    } catch {
      return 'ts_rally_finish_global';
    }
  }

  /**
   * Save "Finish at 21" setting
   * @param {boolean} value - True to finish at 21 points
   * @returns {boolean} True if saved successfully
   */
  saveFinishAt21(value) {
    try {
      localStorage.setItem(this.storageKey, value ? '1' : '0');
      return true;
    } catch (err) {
      console.warn('Failed to save rally finish setting', err);
      return false;
    }
  }

  /**
   * Load "Finish at 21" setting
   * @returns {boolean|null} True/false if set, null if not set
   */
  loadFinishAt21() {
    try {
      const v = localStorage.getItem(this.storageKey);
      if (v === null) return null;
      return v === '1';
    } catch (err) {
      console.warn('Failed to load rally finish setting', err);
      return null;
    }
  }

  /**
   * Clear "Finish at 21" setting
   * @returns {boolean} True if cleared successfully
   */
  clearFinishAt21() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (err) {
      console.warn('Failed to clear rally finish setting', err);
      return false;
    }
  }

  /**
   * Get default value for "Finish at 21"
   * @returns {boolean} Default value (false)
   */
  getDefault() {
    return false;
  }

  /**
   * Get current value or default
   * @returns {boolean} Current value or default
   */
  getFinishAt21OrDefault() {
    const value = this.loadFinishAt21();
    return value !== null ? value : this.getDefault();
  }
}
