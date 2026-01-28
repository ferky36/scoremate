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
  <div id="tsOverlay" class="fixed inset-0 z-50 hidden items-center justify-center p-3 md:p-6 transition-colors duration-300">
    <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-md" data-ts-close></div>
    
    <div class="relative w-full max-w-xl bg-white dark:bg-[#0f172a] shadow-2xl rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[98vh] text-gray-900 dark:text-white transition-colors duration-300">
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5">
        <div>
          <h1 id="tsTitle" class="text-lg md:text-xl font-black tracking-tight">Lapangan 1 - Match 1</h1>
          <p id="tsSchedule" class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-bold leading-none"></p>
        </div>
        <button id="tsCloseBtn" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-400 hover:text-gray-600 dark:hover:text-white" title="${__tsT('tennis.close','Tutup')}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-3">
        <!-- Settings Bar -->
        <div class="p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <label for="mode-selector" class="text-xs font-black text-gray-500 dark:text-gray-400 whitespace-nowrap uppercase tracking-wider">${__tsT('tennis.modeLabel','Pilih Metode Skor:')}</label>
              <select id="mode-selector" class="w-full sm:flex-1 py-1.5 px-3 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100">
                <option value="TENNIS">${__tsT('tennis.mode.tennis','Tennis/Padel')}</option>
                <option value="RALLY">${__tsT('tennis.mode.rally','Rally Score')}</option>
              </select>
            </div>
            <div id="rally-finish-wrap" class="hidden">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input id="rally-finish-21" type="checkbox" class="h-3.5 w-3.5 rounded border-gray-300 dark:border-white/20 bg-white/10 text-indigo-600 focus:ring-indigo-500" />
                <span id="rally-finish-label" class="text-[11px] text-gray-600 dark:text-gray-300 font-black uppercase tracking-tight">${__tsT('tennis.rally.finishAt21Label','Finish at 21 points')}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Timer & Start Action (Side-by-Side) -->
        <div class="grid grid-cols-2 gap-3">
          <div id="timer-display" class="py-2 px-4 bg-amber-50 dark:bg-[#1e293b] text-[#d97706] dark:text-[#f59e0b] text-xl font-mono font-black text-center rounded-xl border-2 border-amber-500/40 dark:border-[#f59e0b]/40 shadow-sm flex items-center justify-center">11:00</div>
          <button id="start-match-btn" class="h-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-500/30 transition active:scale-[0.98] uppercase tracking-wider">
            ${__tsT('tennis.start','Mulai')}
          </button>
        </div>

        <div id="status-message" class="text-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 empty:hidden py-1 px-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg uppercase tracking-tight">${__tsT('tennis.status.chooseMode','Pilih mode skor dan tekan Mulai.')}</div>

        <!-- Sets Tracker Slab (Moved to Top) -->
        <div id="game-score-display" class="flex items-center justify-between px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
          <span id="set-score-label" class="text-[9px] font-black tracking-widest uppercase opacity-80">${__tsT('tennis.set.gamesLabel','Sets')}</span>
          <div class="flex items-center gap-4 font-black">
            <div class="flex items-baseline gap-1.5">
              <span class="text-[9px] font-medium opacity-70">TIM A</span>
              <span id="games-t1" class="text-xl">0</span>
            </div>
            <div class="h-3 w-[2px] bg-white/20 rounded-full"></div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-[9px] font-medium opacity-70">TIM B</span>
              <span id="games-t2" class="text-xl">0</span>
            </div>
          </div>
        </div>

        <!-- Team Scoring Cards -->
        <div class="grid grid-cols-1 gap-3">
          <!-- Team A -->
          <div class="p-2.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-500/10 dark:border-blue-500/30 rounded-2xl flex flex-col items-center transition-all">
            <h2 class="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2">${__tsT('tennis.teamA','TIM A')}</h2>
            
            <div class="flex justify-center gap-6 mb-3 w-full py-1.5 bg-white/40 dark:bg-blue-800/20 rounded-xl border border-blue-100/30 dark:border-transparent">
              <div class="player-col flex flex-col items-center gap-1 flex-1 max-w-[60px]">
                <div class="relative">
                  <img id="player-1-avatar" src="icons/default-avatar.png" class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover" />
                  <span class="serve-badge absolute bottom-0 right-0" data-serve-player="1"></span>
                </div>
                <p id="player-1-name" class="text-[9px] font-black text-gray-500 dark:text-gray-400 truncate w-full text-center tracking-tight">P1</p>
              </div>
              <div class="player-col flex flex-col items-center gap-1 flex-1 max-w-[60px]">
                <div class="relative">
                  <img id="player-2-avatar" src="icons/default-avatar.png" class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover" />
                  <span class="serve-badge absolute bottom-0 right-0" data-serve-player="2"></span>
                </div>
                <p id="player-2-name" class="text-[9px] font-black text-gray-500 dark:text-gray-400 truncate w-full text-center tracking-tight">P2</p>
              </div>
            </div>

            <div class="text-5xl sm:text-6xl font-black text-blue-600 dark:text-blue-500 leading-none tabular-nums mb-4 drop-shadow-sm" id="score-t1">0</div>
            
            <div class="flex gap-2 w-full px-0.5">
              <button class="score-btn flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 text-gray-400 dark:text-white/60 font-black rounded-xl shadow-sm" data-team="1" data-delta="-1">−</button>
              <button class="score-btn flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/30" data-team="1" data-delta="1">+</button>
            </div>
          </div>

          <!-- Team B -->
          <div class="p-2.5 bg-red-50/50 dark:bg-red-900/10 border border-red-500/10 dark:border-red-500/30 rounded-2xl flex flex-col items-center transition-all">
            <h2 class="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] mb-2">${__tsT('tennis.teamB','TIM B')}</h2>
            
            <div class="flex justify-center gap-6 mb-3 w-full py-1.5 bg-white/40 dark:bg-red-800/20 rounded-xl border border-red-100/30 dark:border-transparent">
              <div class="player-col flex flex-col items-center gap-1 flex-1 max-w-[60px]">
                <div class="relative">
                  <img id="player-3-avatar" src="icons/default-avatar.png" class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover" />
                  <span class="serve-badge absolute bottom-0 right-0" data-serve-player="3"></span>
                </div>
                <p id="player-3-name" class="text-[9px] font-black text-gray-500 dark:text-gray-400 truncate w-full text-center tracking-tight">P3</p>
              </div>
              <div class="player-col flex flex-col items-center gap-1 flex-1 max-w-[60px]">
                <div class="relative">
                  <img id="player-4-avatar" src="icons/default-avatar.png" class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover" />
                  <span class="serve-badge absolute bottom-0 right-0" data-serve-player="4"></span>
                </div>
                <p id="player-4-name" class="text-[9px] font-black text-gray-500 dark:text-gray-400 truncate w-full text-center tracking-tight">P4</p>
              </div>
            </div>

            <div class="text-5xl sm:text-6xl font-black text-red-600 dark:text-red-500 leading-none tabular-nums mb-4 drop-shadow-sm" id="score-t2">0</div>
            
            <div class="flex gap-2 w-full px-0.5">
              <button class="score-btn flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 text-gray-400 dark:text-white/60 font-black rounded-xl shadow-sm" data-team="2" data-delta="-1">−</button>
              <button class="score-btn flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-500/30" data-team="2" data-delta="1">+</button>
            </div>
          </div>
        </div>

        <!-- Next Match Information -->
        <div id="next-match-summary" class="hidden overflow-hidden rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
          <div class="px-4 py-3 bg-indigo-100/50 dark:bg-indigo-900/40 flex items-center justify-between">
            <h3 class="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.2em]">${__tsT('tennis.nextMatch','Next Match')}</h3>
            <span id="next-match-summary-time" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-500 hidden px-2 py-0.5 bg-white dark:bg-[#1a2333] rounded-full shadow-sm"></span>
          </div>
          <div class="p-4">
             <div id="next-match-summary-players" class="text-sm font-black text-gray-700 dark:text-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0f172a] flex flex-col gap-2 relative z-10">
        <button id="finish-match-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xl shadow-emerald-500/30 transition active:scale-[0.98] uppercase tracking-wider">${__tsT('tennis.finishMatch','Selesai & Simpan')}</button>
        <button id="force-reset-btn" class="hidden w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-xl shadow-rose-500/30 transition active:scale-[0.98] uppercase tracking-wider">Reset</button>
      </div>
    </div>

    <!-- Nested Modals -->
    <div id="game-won-modal" class="hidden fixed inset-0 bg-slate-900/40 dark:bg-[#0f172a]/90 backdrop-blur-xl z-[60] items-center justify-center p-4">
      <div class="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center border border-gray-200 dark:border-white/10 transition-all text-gray-900 dark:text-white">
        <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <svg class="h-10 w-10 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 class="text-2xl font-black uppercase tracking-tight mb-2">${__tsT('tennis.gameWonTitle','GAME DIMENANGKAN!')}</h3>
        <p class="text-lg text-gray-600 dark:text-gray-400">${__tsT('tennis.winnerLabel','Pemenang:')} <span id="winner-text" class="font-black text-emerald-600 dark:text-emerald-500"></span></p>
        <p class="text-sm text-gray-500 mt-4">${__tsT('tennis.gameResetNote','Skor direset. Next Server:')} <br><span id="next-server-text" class="text-lg font-bold text-indigo-500 dark:text-indigo-400"></span></p>
        <button id="start-new-game-btn" class="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xl shadow-emerald-500/30 transition active:scale-[0.98] uppercase tracking-wider">${__tsT('tennis.startNextGame','Lanjut Game Baru')}</button>
      </div>
    </div>

    <div id="match-results-modal" class="hidden fixed inset-0 bg-slate-900/40 dark:bg-[#0f172a]/95 backdrop-blur-2xl z-[60] items-center justify-center p-4">
      <div class="bg-white dark:bg-[#1e293b] rounded-[3rem] p-8 md:p-10 max-w-md w-full shadow-2xl text-center border border-gray-200 dark:border-white/10 relative text-gray-900 dark:text-white">
        <h3 class="text-2xl md:text-3xl font-black mb-8 uppercase tracking-tighter">${__tsT('tennis.matchResultTitle','HASIL PERTANDINGAN')}</h3>
        <div class="bg-gray-50 dark:bg-white/5 rounded-3xl py-8 px-4 mb-8 border border-gray-100 dark:border-white/5">
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-2"><span id="final-score-label">${__tsT('tennis.finalScoreLabel','Skor Akhir')}</span></p>
          <p id="final-score-text" class="text-7xl font-black text-indigo-600 dark:text-indigo-500 tracking-tighter">0 - 0</p>
        </div>
        <div class="mb-10 text-center">
          <p class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">${__tsT('tennis.matchWinnerLabel','Pemenang')}</p>
          <p id="match-winner-text" class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1"></p>
          <p id="match-winner-names" class="text-sm text-gray-500 dark:text-gray-400 font-medium"></p>
        </div>
        
        <div id="next-match-info" class="hidden mb-8 overflow-hidden rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/20">
           <div class="px-4 py-2 bg-indigo-100/50 dark:bg-indigo-900/40">
             <h3 class="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.2em] text-center">${__tsT('tennis.nextMatch','Next Match')}</h3>
           </div>
           <div class="p-3">
             <p id="next-match-players" class="text-sm font-bold text-gray-700 dark:text-gray-300"></p>
             <p id="next-match-time" class="mt-1 text-[10px] text-gray-400 font-bold hidden"></p>
           </div>
        </div>

        <button id="new-match-btn" class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-[#0f172a] font-black rounded-xl transition hover:opacity-90 active:scale-[0.98] uppercase tracking-widest text-xs">${__tsT('tennis.newMatch','Main Lagi')}</button>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div id="action-confirm-modal" class="hidden fixed inset-0 bg-slate-900/20 dark:bg-black/70 backdrop-blur-sm z-[70] items-center justify-center p-4">
      <div class="bg-white dark:bg-[#1e293b] rounded-3xl p-8 max-w-sm w-full border border-gray-100 dark:border-white/10 text-center shadow-2xl text-gray-900 dark:text-white">
        <div class="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 id="confirm-modal-title" class="text-xl font-bold mb-2"></h3>
        <p id="confirm-modal-desc" class="text-sm text-gray-500 dark:text-gray-400">${__tsT('tennis.confirm.desc','Konfirmasi tindakan.')}</p>
        <div class="mt-8 flex gap-3">
          <button id="cancel-action-btn" class="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold rounded-xl hover:text-gray-900 dark:hover:text-white transition">${__tsT('tennis.cancel','Batal')}</button>
          <button id="confirm-action-btn" class="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-[0.98]">${__tsT('tennis.confirm.ok','Ya')}</button>
        </div>
      </div>
    </div>

    <div id="toast-notification" class="fixed bottom-8 inset-x-8 md:inset-x-auto md:right-8 md:w-80 p-5 rounded-[1.5rem] bg-indigo-600 shadow-2xl text-white text-sm font-bold transition-all duration-300 opacity-0 scale-90 translate-y-4 pointer-events-none z-[100]"><p id="toast-message" class="text-center"></p></div>
  </div>
`;

/**
 * CSS styles for tennis score overlay
 * @returns {string} CSS stylesheet
 */
export const styleCss = `
  #tsOverlay { user-select: none; -webkit-tap-highlight-color: transparent;}
  .score-btn { transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1); touch-action: manipulation; }
  .score-btn:active { transform: scale(0.92); filter: brightness(1.2); }
  .disabled-select { cursor: not-allowed; opacity: 0.4; }
  
  .serve-badge {
    display: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    z-index: 5;
    padding: 3px;
    border: 1px solid rgba(0,0,0,0.02);
  }
  .dark .serve-badge {
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }
  .serve-badge-active { display: flex; animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }

  .serve-ball-icon {
    width: 100%;
    height: 100%;
    fill: #facc15;
    stroke: #b45309;
    stroke-width: 1.5;
  }
  .serve-ball-icon-ghost {
    fill: #e5e7eb;
    stroke: #9ca3af;
    opacity: 0.5;
  }
  
  /* Scrollbar */
  .overflow-y-auto::-webkit-scrollbar { width: 5px; }
  .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
  .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
  .dark .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

  /* Animation */
  #tsOverlay.flex .relative { animation: modalZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes modalZoomIn {
    from { transform: scale(0.9) translateY(30px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }

  .toast-active { opacity: 1 !important; scale: 1 !important; transform: translateY(0) !important; }

  /* Score styling */
  #score-t1, #score-t2 {
    letter-spacing: -0.05em;
    font-variant-numeric: tabular-nums;
  }
`;
