"use strict";
/**
 * Tennis Score Modal - Wake Lock Manager
 * Manages screen wake lock to keep screen awake during matches
 */

/**
 * Wake Lock Manager
 * Keeps screen awake while match is running (if supported by browser)
 */
export class WakeLockManager {
  constructor() {
    this.wakeLockSentinel = null;
    this.isSupported = 'wakeLock' in navigator;
    
    // Reacquire wake lock on visibility change if match still running
    this._setupVisibilityListener();
  }

  /**
   * Check if Wake Lock API is supported
   * @returns {boolean} True if supported
   */
  isWakeLockSupported() {
    return this.isSupported;
  }

  /**
   * Request wake lock to keep screen awake
   * @returns {Promise<boolean>} True if acquired successfully
   */
  async request() {
    try {
      if (!this.isSupported) {
        console.warn('Wake Lock API not supported');
        return false;
      }
      
      if (this.wakeLockSentinel) {
        // Already acquired
        return true;
      }
      
      this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      
      // Listen for release event
      try {
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
      } catch (err) {
        console.warn('Wake Lock release listener failed', err);
      }
      
      return true;
    } catch (err) {
      console.warn('Wake Lock request failed', err);
      return false;
    }
  }

  /**
   * Release wake lock
   * @returns {Promise<boolean>} True if released successfully
   */
  async release() {
    try {
      if (this.wakeLockSentinel) {
        await this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Wake Lock release failed', err);
      return false;
    }
  }

  /**
   * Check if wake lock is currently active
   * @returns {boolean} True if active
   */
  isActive() {
    return this.wakeLockSentinel !== null;
  }

  /**
   * Setup visibility change listener to reacquire wake lock
   * @private
   */
  _setupVisibilityListener() {
    if (!this.isSupported) return;
    
    try {
      document.addEventListener('visibilitychange', async () => {
        try {
          if (document.visibilityState === 'visible') {
            // Reacquire if lost (will be handled by caller checking isActive)
            // Don't auto-request here to avoid unwanted wake locks
          }
        } catch (err) {
          console.warn('Visibility change handler error', err);
        }
      });
    } catch (err) {
      console.warn('Failed to setup visibility listener', err);
    }
  }

  /**
   * Reacquire wake lock if it was lost (e.g., after tab switch)
   * Call this when match is still running and visibility changes
   * @returns {Promise<boolean>} True if reacquired successfully
   */
  async reacquireIfNeeded() {
    if (!this.isActive() && this.isSupported) {
      return await this.request();
    }
    return this.isActive();
  }
}
