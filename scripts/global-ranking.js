"use strict";

(function initGlobalRanking() {
  const modal = document.getElementById('globalRankingModal');
  const overlay = document.getElementById('globalRankingOverlay');
  const closeBtn = document.getElementById('globalRankingClose');
  const container = document.getElementById('globalRankingContainer');

  if (!modal || !container) return;

  function hideModal() {
    modal.classList.add('hidden');
    container.innerHTML = '<div class="flex items-center justify-center py-12"><svg class="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg></div>';
  }

  function showModal() {
    modal.classList.remove('hidden');
    fetchAndRenderRanking();
  }

  closeBtn?.addEventListener('click', hideModal);
  overlay?.addEventListener('click', hideModal);

  // Global access to open this modal
  window.openGlobalRanking = showModal;

  async function fetchAndRenderRanking() {
    try {
      const t = (key, fallback) => window.__i18n_get ? window.__i18n_get(key, fallback) : (fallback || key);

      if (!window.sb) {
        container.innerHTML = `<div class="p-8 text-center text-red-500">${t('ranking.error.init', 'Supabase client not initialized')}</div>`;
        return;
      }

      const { data, error } = await window.sb
        .from('player_points_summary_by_uid')
        .select('*');

      if (error) throw error;
      if (!data || data.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500">${t('ranking.error.noData', 'Belum ada data pertandingan.')}</div>`;
        return;
      }

      // Calculate Win Rate and sort
      // Sorting priority: Win Rate desc, Point Diff desc, Points For desc
      const processed = data.map(p => {
        const wr = p.games_played > 0 ? (p.wins / p.games_played) * 100 : 0;
        const diff = (p.total_points_for || 0) - (p.total_points_against || 0);
        return { ...p, winRate: wr, diff: diff };
      });

      processed.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.diff !== a.diff) return b.diff - a.diff;
        return (b.total_points_for || 0) - (a.total_points_for || 0);
      });

      renderTable(processed);

    } catch (err) {
      console.error('Global Ranking fetch fail', err);
      const t = (key, fallback) => window.__i18n_get ? window.__i18n_get(key, fallback) : (fallback || key);
      const raw = t('ranking.error.fetch', 'Gagal memuat data: {message}');
      const msg = raw.replace('{message}', err.message);
      container.innerHTML = `<div class="p-8 text-center text-red-500">${msg}</div>`;
    }
  }

  function renderTable(players) {
    const t = (key, fallback) => window.__i18n_get ? window.__i18n_get(key, fallback) : (fallback || key);
    const table = document.createElement('table');
    table.className = 'w-full text-sm text-left border-collapse mt-4';
    
    table.innerHTML = `
      <thead class="sticky top-0 bg-white dark:bg-gray-900 z-10">
        <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
          <th class="px-4 py-3 text-center w-12 bg-white dark:bg-gray-900">#</th>
          <th class="px-4 py-3 bg-white dark:bg-gray-900">${t('ranking.col.player', 'Player')}</th>
          <th class="px-4 py-3 text-center bg-white dark:bg-gray-900">${t('ranking.col.gp', 'GP')}</th>
          <th class="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900">${t('ranking.col.w', 'W')}</th>
          <th class="px-4 py-3 text-center text-rose-500 bg-white dark:bg-gray-900">${t('ranking.col.l', 'L')}</th>
          <th class="px-4 py-3 text-center text-amber-500 bg-white dark:bg-gray-900">${t('ranking.col.d', 'D')}</th>
          <th class="px-4 py-3 text-right bg-white dark:bg-gray-900">${t('ranking.col.pf', 'PF')}</th>
          <th class="px-4 py-3 text-right bg-white dark:bg-gray-900">${t('ranking.col.pa', 'PA')}</th>
          <th class="px-4 py-3 text-right bg-white dark:bg-gray-900">${t('ranking.col.diff', 'Diff')}</th>
          <th class="px-4 py-3 text-right font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900">${t('ranking.col.winrate', 'WinRate')}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50 dark:divide-gray-800/50 text-gray-700 dark:text-gray-200">
      </tbody>
    `;

    const tbody = table.querySelector('tbody');

    players.forEach((p, idx) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group';
      
      const avatarUrl = p.avatar_url || 'icons/default-avatar.png';
      const initials = (p.display_name || '?').trim().charAt(0).toUpperCase();

      const diffColor = p.diff > 0 ? 'text-emerald-600' : (p.diff < 0 ? 'text-rose-500' : '');
      const wrColor = p.winRate >= 80 ? 'text-emerald-600' : (p.winRate >= 50 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500');

      row.innerHTML = `
        <td class="px-4 py-3.5 text-center font-bold text-gray-400 dark:text-gray-600">${idx + 1}</td>
        <td class="px-4 py-3.5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 dark:border-slate-700">
              <img src="${avatarUrl}" class="w-full h-full object-cover" onerror="this.src='icons/default-avatar.png'">
            </div>
            <div class="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[120px] md:max-w-none">
              ${(typeof window.isCurrentUser==='function' && window.isCurrentUser(p.display_name)) ? 
                `<svg class="w-4 h-4 text-indigo-600 inline-block mr-1.5 -mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` 
                : ''}
              ${p.display_name}
            </div>
          </div>
        </td>
        <td class="px-4 py-3.5 text-center font-medium">${p.games_played}</td>
        <td class="px-4 py-3.5 text-center font-bold text-emerald-600/80">${p.wins}</td>
        <td class="px-4 py-3.5 text-center font-bold text-rose-500/80">${p.losses}</td>
        <td class="px-4 py-3.5 text-center font-bold text-amber-500/80">${p.draws}</td>
        <td class="px-4 py-3.5 text-right tabular-nums">${p.total_points_for}</td>
        <td class="px-4 py-3.5 text-right tabular-nums text-gray-400 dark:text-gray-600">${p.total_points_against}</td>
        <td class="px-4 py-3.5 text-right tabular-nums font-bold ${diffColor}">${p.diff > 0 ? '+' : ''}${p.diff}</td>
        <td class="px-4 py-3.5 text-right font-extrabold tabular-nums ${wrColor}">${Math.round(p.winRate)}%</td>
      `;
      tbody.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(table);
  }

  // Hook into the button in event-location-public.js if it exists
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btnGlobalRanking' || e.target.closest('#btnGlobalRanking')) {
      showModal();
    }
  });

})();
