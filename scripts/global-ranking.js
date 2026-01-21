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
      
      // Fix: Ensure currentUser is populated before rendering (race condition fix)
      if (!window.currentUser && window.getAuthUserCached) {
         try {
           const authData = await window.getAuthUserCached();
           if (authData && authData.user) window.currentUser = authData.user;
         } catch(e) { console.warn('Ranking: Failed to ensure auth user', e); }
      }
      
      // Fix: Metadata might be missing full_name (e.g. magic link login). Fetch from public.profiles.
      if (window.currentUser && !window.currentUser.profile_name) {
        try {
           const { data: prof } = await window.sb.from('profiles').select('full_name').eq('id', window.currentUser.id).maybeSingle();
           if (prof && prof.full_name) window.currentUser.profile_name = prof.full_name;
        } catch(e) { console.warn('Ranking: Failed to fetch profile name', e); }
      }

      // Calculate Win Rate and sort
      // Sorting priority: Win Rate desc, Point Diff desc, Points For desc
      // Calculate Win Rate and sort
      // Default: Win Rate desc
      const processed = data.map(p => {
        const wr = p.games_played > 0 ? (p.wins / p.games_played) * 100 : 0;
        const diff = (p.total_points_for || 0) - (p.total_points_against || 0);
        return { ...p, winRate: wr, diff: diff };
      });

      // State for sorting
      let currentSort = 'winRate'; 
      let currentData = [...processed];

      const sortOptions = [
        { key: 'winRate', label: 'Win Rate' },
        { key: 'games_played', label: 'Games Played' },
        { key: 'wins', label: 'Wins' },
        { key: 'losses', label: 'Losses' },
        { key: 'draws', label: 'Draws' },
        { key: 'total_points_for', label: 'Points For' },
        { key: 'total_points_against', label: 'Points Against' },
        { key: 'diff', label: 'Point Difference' }
      ];

      function doSort(key) {
        currentSort = key;
        currentData.sort((a, b) => {
          // General desc sort for all stats
          if (b[key] !== a[key]) return b[key] - a[key];
          // Tie-breakers
          if (key !== 'winRate' && b.winRate !== a.winRate) return b.winRate - a.winRate;
          if (key !== 'diff' && b.diff !== a.diff) return b.diff - a.diff;
          return (b.total_points_for || 0) - (a.total_points_for || 0);
        });
        renderTable(currentData, null, currentSort);
      }

      // Initial Sort
      doSort('winRate');

      // Create Controls UI
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'flex items-center justify-end mb-2 gap-2';
      
      const label = document.createElement('label');
      label.className = 'text-xs font-semibold text-gray-500 dark:text-gray-400';
      label.textContent = 'Sort by:';

      const select = document.createElement('select');
      select.className = 'text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500';
      
      sortOptions.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.key;
        o.textContent = opt.label;
        if (opt.key === currentSort) o.selected = true;
        select.appendChild(o);
      });

      select.addEventListener('change', (e) => {
        doSort(e.target.value);
      });

      controlsDiv.appendChild(label);
      controlsDiv.appendChild(select);
      
      // Clear and Append
      container.innerHTML = '';
      container.appendChild(controlsDiv);
      // renderTable appends to container but we want to append TABLE to container. 
      // Existing renderTable creates new table and wipes container??
      // Let's modify renderTable to NOT wipe container, or handle appending.
      // Wait, original renderTable: "container.innerHTML = ''; container.appendChild(table);"
      // I need to change renderTable to be smarter/simpler.
      
      // Actually, define a local render helper that appends to a wrapper?
      // Or modify renderTable lines 134-135 (in original) to not clear, but replacing 'globalRankingTable' if exists.
      
      // Let's just create a table wrapper in container
      const tableWrap = document.createElement('div');
      tableWrap.id = 'grTableWrap';
      container.appendChild(tableWrap);
      
      // Pass the wrapper to renderTable or modify renderTable
      renderTable(currentData, tableWrap, 'winRate');

    } catch (err) {
      console.error('Global Ranking fetch fail', err);
      const t = (key, fallback) => window.__i18n_get ? window.__i18n_get(key, fallback) : (fallback || key);
      const raw = t('ranking.error.fetch', 'Gagal memuat data: {message}');
      const msg = raw.replace('{message}', err.message);
      container.innerHTML = `<div class="p-8 text-center text-red-500">${msg}</div>`;
    }
  }

  function renderTable(players, targetWrapper, activeSortKey) {
    const wrapper = targetWrapper || document.getElementById('grTableWrap') || container;
    
    // Clean wrapper only
    wrapper.innerHTML = '';

    const t = (key, fallback) => window.__i18n_get ? window.__i18n_get(key, fallback) : (fallback || key);
    const table = document.createElement('table');
    table.className = 'w-full text-sm text-left border-collapse'; // removed mt-4 as controls have mb-2
    // ... rest of table gen ...
    // Helper to highlight active column
    // Soft highlight, removing harsh rings ("less stiff")
    const hlHeader = (key) => (key === activeSortKey) ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-900';
    
    // Cell highlight: transparent background for visual column guide
    const hlCell = (key) => (key === activeSortKey) ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : '';
    
    // Base Header Style
    const thBase = "px-4 py-3 text-center transition-colors duration-200";

    table.innerHTML = `
      <thead class="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
        <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
          <th class="px-4 py-3 text-center w-12 bg-white dark:bg-gray-900">#</th>
          <th class="px-4 py-3 bg-white dark:bg-gray-900 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-none min-w-[140px]">${t('ranking.col.player', 'Player')}</th>
          <th class="${thBase} ${hlHeader('games_played')}">${t('ranking.col.gp', 'GP')}</th>
          <th class="${thBase} ${hlHeader('wins')} ${activeSortKey!=='wins'?'text-emerald-600 dark:text-emerald-400':''}">${t('ranking.col.w', 'W')}</th>
          <th class="${thBase} ${hlHeader('losses')} ${activeSortKey!=='losses'?'text-rose-500':''}">${t('ranking.col.l', 'L')}</th>
          <th class="${thBase} ${hlHeader('draws')} ${activeSortKey!=='draws'?'text-amber-500':''}">${t('ranking.col.d', 'D')}</th>
          <th class="${thBase} ${hlHeader('total_points_for')} text-right">${t('ranking.col.pf', 'PF')}</th>
          <th class="${thBase} ${hlHeader('total_points_against')} text-right">${t('ranking.col.pa', 'PA')}</th>
          <th class="${thBase} ${hlHeader('diff')} text-right">${t('ranking.col.diff', 'Diff')}</th>
          <th class="${thBase} ${hlHeader('winRate')} text-right font-bold text-gray-900 dark:text-white">${t('ranking.col.winrate', 'WinRate')}</th>
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
      
      const diffColor = p.diff > 0 ? 'text-emerald-600' : (p.diff < 0 ? 'text-rose-500' : '');
      const wrColor = p.winRate >= 80 ? 'text-emerald-600' : (p.winRate >= 50 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500');

      row.innerHTML = `
        <td class="px-4 py-3.5 text-center font-bold text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900">${idx + 1}</td>
        <td class="px-4 py-3.5 sticky left-0 z-10 bg-white dark:bg-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-none">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 dark:border-slate-700">
              <img src="${avatarUrl}" class="w-full h-full object-cover" onerror="this.src='icons/default-avatar.png'">
            </div>
            <div class="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[120px] md:max-w-none">
              ${(() => {
                const u = window.currentUser;
                let isMe = false;
                
                // Debugging
                const n = p.display_name;
                const uid_p = p.player_uid || p.uid; 
                
                // console.log(`[Ranking] Render row: ${n}, User detected:`, !!u); 

                if (u) {
                  const myName = u.profile_name || u.user_metadata?.full_name; // Use fetched profile name first
                  const myEmailName = u.email ? u.email.split('@')[0] : '';
                  
                  if (uid_p && uid_p === u.id) isMe = true;
                  else if (myName && n === myName) isMe = true;
                  else if (myEmailName && n === myEmailName) isMe = true;
                }
                return isMe ? 
                `<svg class="w-4 h-4 text-indigo-600 inline-block mr-1.5 -mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` 
                : '';
              })()}
              ${p.display_name}
            </div>
          </div>
        </td>
        <td class="px-4 py-3.5 text-center font-medium ${hlCell('games_played')}">${p.games_played}</td>
        <td class="px-4 py-3.5 text-center font-bold text-emerald-600/80 ${hlCell('wins')}">${p.wins}</td>
        <td class="px-4 py-3.5 text-center font-bold text-rose-500/80 ${hlCell('losses')}">${p.losses}</td>
        <td class="px-4 py-3.5 text-center font-bold text-amber-500/80 ${hlCell('draws')}">${p.draws}</td>
        <td class="px-4 py-3.5 text-right tabular-nums ${hlCell('total_points_for')}">${p.total_points_for}</td>
        <td class="px-4 py-3.5 text-right tabular-nums text-gray-400 dark:text-gray-600 ${hlCell('total_points_against')}">${p.total_points_against}</td>
        <td class="px-4 py-3.5 text-right tabular-nums font-bold ${diffColor} ${hlCell('diff')}">${p.diff > 0 ? '+' : ''}${p.diff}</td>
        <td class="px-4 py-3.5 text-right font-extrabold tabular-nums ${wrColor} ${hlCell('winRate')}">${Math.round(p.winRate)}%</td>
      `;
      tbody.appendChild(row);
    });

    // ... table rows generation ...
    
    // Instead of wiping container directly (which removes controls), allow flexible target
    // If no targetWrapper passed, we assume container but we must be careful not to wipe controls.
    // The fetchAndRenderRanking now handles container structure (Controls + Wrapper).
    
    wrapper.appendChild(table);
  }

  // Hook into the button in event-location-public.js if it exists
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btnGlobalRanking' || e.target.closest('#btnGlobalRanking')) {
      showModal();
    }
  });

})();
