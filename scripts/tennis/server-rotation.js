"use strict";
/**
 * Tennis Score Modal - Server Rotation
 * Manages server rotation and serve tracking for tennis/padel matches
 */

/**
 * Server Rotation Manager
 * Handles server rotation (1→3→2→4→1) and serve tracking
 */
export class ServerRotation {
  /**
   * Create a new ServerRotation instance
   * @param {number} initialServer - Initial server player ID (1-4)
   */
  constructor(initialServer = 1) {
    this.currentServer = initialServer;
    this.serveCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    this.serveHistory = [];
  }

  /**
   * Rotate to next server following pattern: 1→3→2→4→1
   * @returns {number} New server player ID
   */
  rotate() {
    const order = [1, 3, 2, 4];
    const currentIndex = order.indexOf(this.currentServer);
    const nextIndex = (currentIndex + 1) % order.length;
    this.currentServer = order[nextIndex];
    return this.currentServer;
  }

  /**
   * Rewind server to correct position after score correction
   * @param {number} prevTotalPoints - Previous total points
   * @param {number} currentTotalPoints - Current total points
   * @returns {number} Corrected server player ID
   */
  rewindAfterCorrection(prevTotalPoints, currentTotalPoints) {
    const prevRotations = Math.floor(Math.max(0, prevTotalPoints) / 2);
    const currentRotations = Math.floor(Math.max(0, currentTotalPoints) / 2);
    
    if (prevRotations <= currentRotations) {
      return this.currentServer;
    }
    
    const order = [1, 3, 2, 4];
    const nextIndex = ((currentRotations % order.length) + order.length) % order.length;
    this.currentServer = order[nextIndex];
    
    return this.currentServer;
  }

  /**
   * Record a serve usage
   * @param {number} playerId - Player ID who served
   */
  recordServe(playerId) {
    if (!playerId) return;
    if (!this.serveCounts[playerId]) this.serveCounts[playerId] = 0;
    this.serveCounts[playerId]++;
    this.serveHistory.push(playerId);
  }

  /**
   * Undo last serve (for score corrections)
   */
  undoServe() {
    const removed = this.serveHistory.pop();
    if (!removed) return;
    
    if (!this.serveCounts[removed]) this.serveCounts[removed] = 0;
    this.serveCounts[removed] = Math.max(0, this.serveCounts[removed] - 1);
  }

  /**
   * Apply serve tracking based on point delta
   * @param {number} pointDelta - Change in points (+1 or -1)
   * @param {number} serverBeforePoint - Server before the point
   */
  applyServeTracking(pointDelta, serverBeforePoint) {
    if (!pointDelta) return;
    
    if (pointDelta > 0) {
      this.recordServe(serverBeforePoint);
    } else if (pointDelta < 0) {
      this.undoServe();
    }
  }

  /**
   * Reset serve count for current server
   */
  resetActiveServerBadge() {
    if (!this.serveCounts) {
      this.serveCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    }
    this.serveCounts[this.currentServer] = 0;
  }

  /**
   * Reset all serve tracking
   */
  resetAll() {
    this.serveCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    this.serveHistory = [];
  }

  /**
   * Get current server
   * @returns {number} Current server player ID
   */
  getCurrentServer() {
    return this.currentServer;
  }

  /**
   * Set current server
   * @param {number} playerId - Player ID to set as server
   */
  setCurrentServer(playerId) {
    if ([1, 2, 3, 4].includes(playerId)) {
      this.currentServer = playerId;
    }
  }

  /**
   * Get serve count for a player
   * @param {number} playerId - Player ID
   * @returns {number} Number of serves
   */
  getServeCount(playerId) {
    return this.serveCounts[playerId] || 0;
  }

  /**
   * Get all serve counts
   * @returns {Object} Serve counts for all players
   */
  getAllServeCounts() {
    return { ...this.serveCounts };
  }

  /**
   * Get serve history
   * @returns {Array<number>} Array of player IDs in serve order
   */
  getServeHistory() {
    return [...this.serveHistory];
  }
}
