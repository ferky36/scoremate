"use strict";
/**
 * Tennis Score Modal - Modal Manager
 * Manages confirmation modals, game won modals, and match results modals
 */

/**
 * Modal Manager
 * Handles all modal interactions for tennis score overlay
 */
export class ModalManager {
  /**
   * Create a new ModalManager instance
   * @param {Function} t - Translation function
   */
  constructor(t = (k, f) => f) {
    this.t = t;
    this.currentPendingAction = null;
    this.pendingCloseAfterReset = false;
  }

  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   * @private
   */
  _byId(id) {
    return document.getElementById(id);
  }

  /**
   * Show confirmation modal
   * @param {string} actionType - Type of action ('reset', 'reset-clear', 'finish', 'finish21')
   * @param {Object} opts - Options (e.g., { closeAfter: true })
   */
  showConfirmationModal(actionType, opts = {}) {
    this.currentPendingAction = actionType;
    this.pendingCloseAfterReset = !!(opts && opts.closeAfter);
    
    let titleText = "";
    let buttonText = "";
    
    const confirmModalTitle = this._byId('confirm-modal-title');
    const confirmModalDesc = this._byId('confirm-modal-desc');
    const confirmActionBtn = this._byId('confirm-action-btn');
    const cancelBtn = this._byId('cancel-action-btn');
    
    // Default cancel button text
    if (cancelBtn) {
      cancelBtn.textContent = this.t('tennis.cancel', 'Batal');
    }
    
    if (actionType === 'reset') {
      if (this.pendingCloseAfterReset) {
        titleText = this.t('tennis.confirm.closeTitle', 'Tutup & Batalkan Pertandingan?');
        buttonText = this.t('tennis.confirm.closeOk', 'Ya, Batalkan & Tutup');
        if (confirmModalDesc) {
          confirmModalDesc.textContent = this.t('tennis.confirm.close', 'Menutup popup akan membatalkan pertandingan yang sedang berlangsung dan mengosongkan skor.');
        }
      } else {
        titleText = this.t('tennis.confirm.resetTitle', 'Yakin Ingin Me-Reset Pertandingan?');
        buttonText = this.t('tennis.confirm.resetOk', 'Ya, Reset Sekarang');
        if (confirmModalDesc) {
          confirmModalDesc.textContent = this.t('tennis.confirm.reset', 'Tindakan ini akan mereset skor pertandingan saat ini.');
        }
      }
    } else if (actionType === 'reset-clear') {
      titleText = this.t('tennis.confirm.resetTitle', 'Yakin Ingin Me-Reset Pertandingan?');
      buttonText = this.t('tennis.confirm.resetOk', 'Ya, Reset Sekarang');
      if (confirmModalDesc) {
        confirmModalDesc.textContent = this.t('tennis.confirm.resetZero', 'Tindakan ini akan mereset skor pertandingan saat ini menjadi kosong (0-0).');
      }
    } else if (actionType === 'finish') {
      titleText = this.t('tennis.confirm.finishTitle', 'Yakin Ingin Menyelesaikan Pertandingan?');
      buttonText = this.t('tennis.confirm.finishOk', 'Ya, Selesaikan Sekarang');
      if (confirmModalDesc) {
        confirmModalDesc.textContent = this.t('tennis.confirm.save', 'Skor saat ini akan disimpan sebagai hasil akhir pertandingan.');
      }
    } else if (actionType === 'finish21') {
      titleText = this.t('tennis.rally.reached21Title', 'Poin Telah Mencapai 21');
      buttonText = this.t('tennis.confirm.finishOk', 'Ya, Selesaikan Sekarang');
      if (confirmModalDesc) {
        confirmModalDesc.textContent = this.t('tennis.rally.reached21', 'Poin sudah mencapai 21.');
      }
      // Change cancel button for finish21
      if (cancelBtn) {
        cancelBtn.textContent = this.t('tennis.rally.continueUntilEnd', 'Lanjutkan sampai waktu habis');
      }
    } else {
      return;
    }
    
    if (confirmModalTitle) confirmModalTitle.textContent = titleText;
    if (confirmActionBtn) confirmActionBtn.textContent = buttonText;
    
    const actionConfirmModal = this._byId('action-confirm-modal');
    if (actionConfirmModal) {
      actionConfirmModal.classList.remove('hidden');
      actionConfirmModal.classList.add('flex');
    }
  }

  /**
   * Hide confirmation modal
   */
  hideConfirmationModal() {
    const actionConfirmModal = this._byId('action-confirm-modal');
    if (actionConfirmModal) {
      actionConfirmModal.classList.add('hidden');
      actionConfirmModal.classList.remove('flex');
    }
  }

  /**
   * Show game won modal
   * @param {string} winnerName - Winner team name
   * @param {string} nextServerName - Next server player name
   */
  showGameWonModal(winnerName, nextServerName) {
    const winnerText = this._byId('winner-text');
    const nextServerText = this._byId('next-server-text');
    
    if (winnerText) winnerText.textContent = winnerName;
    if (nextServerText) nextServerText.textContent = nextServerName;
    
    const gameWonModal = this._byId('game-won-modal');
    if (gameWonModal) {
      gameWonModal.classList.remove('hidden');
      gameWonModal.classList.add('flex');
    }
  }

  /**
   * Hide game won modal
   */
  hideGameWonModal() {
    const gameWonModal = this._byId('game-won-modal');
    if (gameWonModal) {
      gameWonModal.classList.add('hidden');
      gameWonModal.classList.remove('flex');
    }
  }

  /**
   * Show match results modal
   * @param {Object} results - Match results
   * @param {number} results.gamesT1 - Team 1 games won
   * @param {number} results.gamesT2 - Team 2 games won
   * @param {string} results.winner - Winner text
   * @param {string} results.scoreLabel - Score label (e.g., "Total Games")
   * @param {string} results.winnerNames - Winner player names (optional)
   */
  showMatchResultsModal(results) {
    const finalScoreText = this._byId('final-score-text');
    const matchWinnerText = this._byId('match-winner-text');
    const finalScoreLabel = this._byId('final-score-label');
    const matchWinnerNames = this._byId('match-winner-names');
    
    if (finalScoreText) {
      finalScoreText.textContent = `${results.gamesT1} - ${results.gamesT2}`;
    }
    if (matchWinnerText) {
      matchWinnerText.textContent = results.winner;
    }
    if (finalScoreLabel) {
      finalScoreLabel.textContent = results.scoreLabel;
    }
    if (matchWinnerNames && results.winnerNames) {
      matchWinnerNames.textContent = results.winnerNames;
      matchWinnerNames.classList.remove('hidden');
    } else if (matchWinnerNames) {
      matchWinnerNames.textContent = '';
      matchWinnerNames.classList.add('hidden');
    }
    
    const matchResultsModal = this._byId('match-results-modal');
    if (matchResultsModal) {
      matchResultsModal.classList.remove('hidden');
      matchResultsModal.classList.add('flex');
    }
  }

  /**
   * Hide match results modal
   */
  hideMatchResultsModal() {
    const matchResultsModal = this._byId('match-results-modal');
    if (matchResultsModal) {
      matchResultsModal.classList.add('hidden');
      matchResultsModal.classList.remove('flex');
    }
  }

  /**
   * Get current pending action
   * @returns {string|null} Current pending action type
   */
  getCurrentPendingAction() {
    return this.currentPendingAction;
  }

  /**
   * Clear current pending action
   */
  clearPendingAction() {
    this.currentPendingAction = null;
  }

  /**
   * Check if should close after reset
   * @returns {boolean}
   */
  shouldCloseAfterReset() {
    return this.pendingCloseAfterReset;
  }

  /**
   * Reset close after reset flag
   */
  resetCloseAfterResetFlag() {
    this.pendingCloseAfterReset = false;
  }
}
