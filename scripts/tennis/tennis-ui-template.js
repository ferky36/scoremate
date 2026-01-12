"use strict";
/**
 * Tennis Score Modal - UI Templates
 * Contains HTML templates and CSS styling for the tennis score overlay
 */

// Translation helper
const __tsT = (k, f) => (window.__i18n_get ? __i18n_get(k, f) : f);

// Maximum serve balls to display in badge
export const MAX_SERVE_BADGE_BALLS = 2;

/**
 * Generate serve ball SVG icon
 * @param {boolean} isGhost - Whether to render as ghost (inactive) ball
 * @returns {string} SVG markup
 */
export const renderServeBallSvg = (isGhost = false) => `
  <svg viewBox="0 0 24 24" class="serve-ball-icon${isGhost ? ' serve-ball-icon-ghost' : ''}" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5"></circle>
    <path d="M4.5 7c3 0 5 2.5 5 5s-2 5-5 5"></path>
    <path d="M19.5 7c-3 0-5 2.5-5 5s2 5 5 5"></path>
  </svg>
`;

/**
 * Main overlay HTML template
 * @returns {string} Complete overlay HTML markup
 */
export const overlayTemplate = () => `
  <div id="tsOverlay" class="fixed inset-0 z-50 hidden items-center justify-center p-3">
    <div class="absolute inset-0 bg-black/50" data-ts-close></div>
    <div class="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl p-4 md:p-8 border border-gray-100 overflow-auto max-h-[95vh]">
      <div class="flex items-start justify-between mb-2">
        <h1 id="tsTitle" class="text-2xl md:text-3xl font-extrabold text-gray-800">${__tsT('tennis.overlay.title','Penghitung Skor')}</h1>
        <button id="tsCloseBtn" class="px-3 py-1.5 rounded-lg border text-sm">${__tsT('tennis.close','Tutup')}</button>
      </div>
      <p id="tsSchedule" class="text-sm text-gray-500 mb-3 hidden">${__tsT('tennis.schedule','Waktu Main Terjadwal: -')}</p>

      <div id="next-match-summary" class="text-sm text-gray-700 mb-3 hidden">
        <p id="next-match-summary-players" class="font-semibold"></p>
        <p id="next-match-summary-time" class="text-xs text-gray-500 hidden"></p>
      </div>

      <div class="mb-4 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-3 p-3 rounded-xl border border-indigo-200">
        <label for="mode-selector" class="text-sm font-semibold text-indigo-700">${__tsT('tennis.modeLabel','Pilih Metode Skor:')}</label>
        <select id="mode-selector" class="py-1 px-3 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full md:w-auto transition duration-150">
          <option value="TENNIS">${__tsT('tennis.mode.tennis','Tennis/Padel Score (0, 15, 30, 40)')}</option>
          <option value="RALLY">${__tsT('tennis.mode.rally','Rally Score (Poin Berlanjut)')}</option>
        </select>
        <div id="rally-finish-wrap" class="hidden ml-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <input id="rally-finish-21" type="checkbox" class="h-4 w-4" />
            <span id="rally-finish-label" class="text-sm text-gray-700 ts-rally-label">${__tsT('tennis.rally.finishAt21Label','Finish at 21 points')}</span>
          </label>
        </div>
      </div>

      <div id="timer-display" class="text-3xl font-extrabold text-center text-gray-700 mb-4 p-2 bg-yellow-100 rounded-lg shadow-inner transition duration-300 ease-in-out">11:00</div>
      <button id="start-match-btn" class="w-full py-3 mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 transition duration-150 ease-in-out">
        ${__tsT('tennis.startWithMinutes','Mulai Pertandingan ({minutes} Menit)').replace('{minutes}','11')}
      </button>

      <div id="game-score-display" class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-4 p-3 bg-gray-100 rounded-xl border">
        <p id="set-score-label" class="text-base font-bold text-gray-700 text-center w-full sm:w-auto">${__tsT('tennis.set.gamesLabel','Games Dimenangkan (Set):')}</p>
        <div class="flex justify-center space-x-4 md:space-x-6">
          <div class="text-lg font-bold text-blue-700">${__tsT('tennis.teamA','Tim A')}: <span id="games-t1" class="text-2xl font-extrabold">0</span></div>
          <div class="text-lg font-bold text-red-700">${__tsT('tennis.teamB','Tim B')}: <span id="games-t2" class="text-2xl font-extrabold">0</span></div>
        </div>
      </div>

      <div id="status-message" class="text-center text-gray-500 mt-2 text-sm h-6 mb-4 transition duration-300 ease-in-out">${__tsT('tennis.status.chooseMode','Pilih mode skor dan tekan Mulai Pertandingan.')}</div>

      <div class="flex flex-col md:flex-row justify-between items-stretch gap-4">
        <div class="flex-1 p-4 bg-blue-50/70 border border-blue-100 rounded-lg flex flex-col items-center">
          <h2 class="text-lg md:text-xl font-extrabold text-blue-800 tracking-wider mb-2">${__tsT('tennis.teamA','Tim A')}</h2>
          <div class="text-xs text-gray-600 mb-2 flex justify-center gap-3 w-full md:text-sm md:gap-4">
            <div class="player-name-wrap">
              <span class="serve-badge" data-serve-player="1"></span>
              <p id="player-1-name" data-player-id="1" class="player-name transition duration-150 text-gray-600">P1</p>
            </div>
            <div class="player-name-wrap">
              <span class="serve-badge" data-serve-player="2"></span>
              <p id="player-2-name" data-player-id="2" class="player-name transition duration-150 text-gray-600">P2</p>
            </div>
          </div>
          <div class="text-5xl md:text-7xl font-black text-blue-700 tracking-wider" id="score-t1">0</div>
          <div class="mt-4 w-full flex gap-3">
            <button class="score-btn flex-1 py-3 md:py-3.5 bg-white border border-blue-600 text-blue-600 font-semibold rounded-2xl shadow" data-team="1" data-delta="-1">-</button>
            <button class="score-btn flex-1 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30" data-team="1" data-delta="1">+</button>
          </div>
        </div>
        <div class="flex-1 p-4 bg-red-50/70 border border-red-100 rounded-lg flex flex-col items-center">
          <h2 class="text-lg md:text-xl font-extrabold text-red-800 tracking-wider mb-2">${__tsT('tennis.teamB','Tim B')}</h2>
          <div class="text-xs text-gray-600 mb-2 flex justify-center gap-3 w-full md:text-sm md:gap-4">
            <div class="player-name-wrap">
              <span class="serve-badge" data-serve-player="3"></span>
              <p id="player-3-name" data-player-id="3" class="player-name transition duration-150 text-gray-600">P3</p>
            </div>
            <div class="player-name-wrap">
              <span class="serve-badge" data-serve-player="4"></span>
              <p id="player-4-name" data-player-id="4" class="player-name transition duration-150 text-gray-600">P4</p>
            </div>
          </div>
          <div class="text-5xl md:text-7xl font-black text-red-700 tracking-wider" id="score-t2">0</div>
          <div class="mt-4 w-full flex gap-3">
            <button class="score-btn flex-1 py-3 md:py-3.5 bg-white border border-red-600 text-red-600 font-semibold rounded-2xl shadow" data-team="2" data-delta="-1">-</button>
            <button class="score-btn flex-1 py-3 md:py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl shadow-lg shadow-red-500/30" data-team="2" data-delta="1">+</button>
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <button id="finish-match-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg">${__tsT('tennis.finishMatch','Selesai & Lihat Hasil Pertandingan')}</button>
        <button id="force-reset-btn" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">${__tsT('tennis.resetZero','Reset Skor (0-0)')}</button>
      </div>

      <!-- Modal Game Won -->
      <div id="game-won-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center p-4">
        <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-all duration-300">
          <svg class="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <h3 class="text-2xl font-bold text-gray-900 mt-3">${__tsT('tennis.gameWonTitle','GAME DIMENANGKAN!')}</h3>
          <p class="text-lg text-gray-700 mt-2">${__tsT('tennis.winnerLabel','Pemenang:')} <span id="winner-text" class="font-extrabold text-green-600"></span></p>
          <p class="text-sm text-gray-500 mt-1">${__tsT('tennis.gameResetNote','Skor game saat ini akan direset. Server berikutnya adalah ')}<span id="next-server-text" class="font-bold text-indigo-600"></span>.</p>
          <button id="start-new-game-btn" class="mt-5 w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">${__tsT('tennis.startNextGame','Mulai Game Berikutnya')}</button>
        </div>
      </div>

      <!-- Modal Match Results -->
      <div id="match-results-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center p-4">
        <div class="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
          <h3 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">${__tsT('tennis.matchResultTitle','HASIL AKHIR PERTANDINGAN')}</h3>
          <div class="border-t border-b py-4 mb-4">
            <p class="text-xl text-gray-600 font-medium"><span id="final-score-label">${__tsT('tennis.finalScoreLabel','Total Games')}</span>:</p>
            <p id="final-score-text" class="text-5xl font-black text-indigo-600 mt-2">0 - 0</p>
          </div>
          <p class="text-xl text-gray-700 font-semibold mt-4">${__tsT('tennis.matchWinnerLabel','Pemenang Pertandingan:')}</p>
          <p id="match-winner-text" class="text-2xl font-extrabold text-green-700 mt-1"></p>
          <p id="match-winner-names" class="text-lg text-gray-600 mt-1 hidden"></p>
          <div id="next-match-info" class="mt-6 hidden">
            <div class="mx-auto max-w-sm rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-center">
              <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">${__tsT('tennis.nextMatchTitle','Pertandingan Selanjutnya')}</p>
              <p id="next-match-players" class="mt-2 text-base font-semibold text-gray-700"></p>
              <p id="next-match-time" class="mt-1 text-xs text-gray-500"></p>
            </div>
          </div>
          <p id="event-finished-note" class="mt-4 text-sm text-gray-500 hidden">${__tsT('tennis.eventFinished','Permainan di event ini sudah selesai.')}</p>
          <button id="new-match-btn" class="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">${__tsT('tennis.newMatch','Mulai Pertandingan Baru')}</button>
        </div>
      </div>

      <!-- Modal Confirmation -->
      <div id="action-confirm-modal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 items-center justify-center p-4">
        <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
          <svg class="mx-auto h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <h3 id="confirm-modal-title" class="text-xl font-bold text-gray-900 mt-3"></h3>
          <p id="confirm-modal-desc" class="text-sm text-gray-500 mt-2">${__tsT('tennis.confirm.desc','Tindakan ini akan mengakhiri atau mereset skor pertandingan saat ini.')}</p>
          <div class="mt-5 flex justify-between gap-3">
            <button id="cancel-action-btn" class="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-150">${__tsT('tennis.cancel','Batal')}</button>
            <button id="confirm-action-btn" class="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition duration-150">${__tsT('tennis.confirm.ok','Ya, Lanjutkan')}</button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div id="toast-notification" class="fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white font-semibold transition-opacity duration-300 opacity-0 pointer-events-none z-50"><p id="toast-message"></p></div>
    </div>
  </div>`;

/**
 * CSS styles for tennis score overlay
 * @returns {string} CSS stylesheet
 */
export const styleCss = `
  .score-btn { transition: all 0.1s; touch-action: manipulation; user-select: none; }
  .score-btn:active { transform: scale(0.98); }
  .serving-player { border-bottom: 2px solid #f97316; padding-bottom: 1px; }
  .disabled-select { cursor: not-allowed; opacity: 0.7; }
  .player-name-wrap { display: flex; align-items: center; gap: 0.4rem; }
  .serve-badge {
    display: none;
    align-items: center;
    gap: 0.2rem;
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid rgba(34,197,94,0.35);
    background: rgba(187,247,208,0.4);
    box-shadow: 0 2px 6px rgba(34,197,94,0.2);
  }
  .serve-badge-active { display: inline-flex; }
  .serve-ball-icon {
    width: 0.9rem;
    height: 0.9rem;
    fill: #facc15;
    stroke: #fde047;
    stroke-width: 0.8;
  }
  .serve-ball-icon path { stroke: #fef9c3; stroke-width: 0.8; fill: none; }
  .serve-ball-icon-ghost {
    fill: #d1d5db;
    stroke: #e5e7eb;
    opacity: 0.7;
  }
  /* Rally label default color (light mode) and dark-mode overrides */
  #rally-finish-label.ts-rally-label { color: #374151; }
  .dark #rally-finish-label.ts-rally-label { color: #ffffff !important; }
`;
