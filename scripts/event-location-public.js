"use strict";
const __pubT = (k, f)=> (window.__i18n_get ? __i18n_get(k, f) : f);
// ===== Event Location (simple) =====
function ensureEventLocationHeader(){
  try{
    const holder = document.getElementById('eventLocationView');
    // Do not create fallback anymore; chips are primary UI
    return holder || null;
  }catch{ return null; }
}

function renderEventLocation(text, url){
  const el = ensureEventLocationHeader();
  const t = (text||'').trim();
  const u = (url||'').trim();
  if (el){
    if (!t && !u){ el.textContent = ''; el.classList.add('hidden'); }
    else {
      el.classList.remove('hidden');
      const icon = '<svg class="pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
      if (t && u){
        el.innerHTML = `<div class="event-loc">${icon}<a href="${u}" target="_blank" rel="noopener noreferrer">${escapeHtml(t)}</a></div>`;
      } else if (t){
        el.innerHTML = `<div class="event-loc">${icon}<span>${escapeHtml(t)}</span></div>`;
      } else {
        el.innerHTML = `<div class="event-loc">${icon}<a href="${u}" target="_blank" rel="noopener noreferrer">${__pubT('event.viewLocation','Lihat lokasi')}</a></div>`;
      }
    }
  }

  // Also update chipLoc (primary UI)
  try{
    const chip = byId('chipLoc');
    const link = byId('chipLocLink');
    const txt  = byId('chipLocText');
    if (chip){
      const has = !!(t || u);
      chip.classList.toggle('hidden', !has);
      if (u && link){
        link.href = u;
        link.textContent = t || __pubT('event.viewLocation','Lihat lokasi');
        link.classList.remove('hidden');
        if (txt) txt.textContent = '';
      } else {
        if (link){
          link.removeAttribute('href');
          link.classList.add('hidden');
          link.textContent = '';
        }
        if (txt) txt.textContent = t || '';
      }
    }
  }catch{}
}

function renderHeaderChips(){
  try{
    // Date chip: lengkap + jam, contoh: "Jum, 07 Okt 2025 19.00"
    const rawDate = byId('sessionDate')?.value || '';
    const rawTime = byId('startTime')?.value || '';
    let label = __pubT('render.chip.noDate','-');
    if (rawDate){
      let d = new Date(rawDate + (rawTime ? 'T' + rawTime : 'T00:00'));
      if (!isNaN(d)){
        const dt = d.toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
        const tm = d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', hour12:false });
        label = `${dt} ${tm}`;
      }
    }
    const cd = byId('chipDateText'); if (cd) cd.textContent = label;
  }catch{}
  try{
    // Players count chip
    const n = Array.isArray(players) ? players.length : 0;
    const cc = byId('chipCountText'); if (cc) { const m = (Number.isInteger(currentMaxPlayers) && currentMaxPlayers > 0) ? currentMaxPlayers : null; cc.textContent = m ? __pubT('render.chip.playersWithMax','{count}/{max} pemain').replace('{count}', n).replace('{max}', m) : __pubT('render.chip.players','{count} pemain').replace('{count}', n); }
  }catch{}
}

// Role chip in header chips row
function renderRoleChip(){
  try{
    const chip = byId('chipRole'); const txt = byId('chipRoleText'); if (!chip || !txt) return;
    const role = String(window._memberRole||'').toLowerCase();
    const owner = (typeof isOwnerNow==='function') ? isOwnerNow() : !!window._isOwnerUser;
    const viewer = (typeof isViewer==='function') ? isViewer() : true;
    const isAdmin = !!window._isCashAdmin;
    // Decide label priority
    let labelKey = 'viewer';
    if (owner) labelKey = 'owner';
    else if (role==='editor') labelKey = 'editor';
    else if (role==='wasit') labelKey = 'wasit';
    else if (isAdmin) labelKey = 'admin';
    else labelKey = viewer ? 'viewer' : 'editor';

    const labelTextMap = {
      owner: __pubT('role.owner','Owner'),
      admin: __pubT('role.admin','Admin'),
      editor: __pubT('role.editor','Editor'),
      wasit: __pubT('role.referee','Wasit'),
      viewer: __pubT('role.viewer','Viewer')
    };

    const label = labelTextMap[labelKey] || labelTextMap.viewer;
    txt.textContent = label;
    chip.classList.remove('hidden');
    // color cue: owner/admin -> green; editor -> indigo; wasit -> amber; viewer -> gray
    const map = {
      owner:   'bg-emerald-100/60 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200',
      admin:   'bg-emerald-100/60 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200',
      editor:  'bg-indigo-100/60 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200',
      wasit:   'bg-amber-100/60 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
      viewer:  'bg-gray-100/60 text-gray-900 dark:bg-gray-800/60 dark:text-gray-200'
    };
    // base chip already styled; add hint color by toggling inline class
    chip.dataset.role = label;
    chip.className = 'chip ' + (map[labelKey]||'');
  }catch{}
}

function openSchedulePanelAndScroll(){
  try{
    const panel = byId('filterPanel');
    if (panel){
      panel.classList.add('open');
      try{ localStorage.setItem('ui.filter.expanded','1'); }catch{}
      setTimeout(()=>{ try{ panel.scrollIntoView({ behavior:'smooth', block:'start' }); }catch{} }, 20);
    }
  }catch{}
}

async function fetchEventMetaFromDB(eventId){
  try{
    // Memoize to avoid duplicate SELECTs on reload
    const cached = (window.getEventMetaCache ? getEventMetaCache(eventId) : null);
    if (cached){
      try{
        const nd = (typeof normalizeDateKey === 'function')
          ? normalizeDateKey(cached?.event_date || '')
          : String(cached?.event_date||'').slice(0,10);
        if (nd) window.__lockedEventDateKey = nd;
      }catch{}
      return cached;
    }
    showLoading(__pubT('loading.eventInfo','Memuat info event...'));
    const { data, error } = await sb
      .from('events')
      .select('title, location_text, location_url, htm, max_players, join_open_at, owner_id, event_date')
      .eq('id', eventId)
      .maybeSingle();
    if (error) return null;
    try{ window.setEventMetaCache?.(eventId, data||null); }catch{}
    // Lock event date so sessionDate input cannot be moved to a different day for the same event_id
    try{
      const nd = (typeof normalizeDateKey === 'function')
        ? normalizeDateKey(data?.event_date || '')
        : String(data?.event_date||'').slice(0,10);
      if (nd) window.__lockedEventDateKey = nd;
    }catch{}
    // Early owner promotion to reduce viewer→owner flicker
    try{
      const u = await (window.getAuthUserCached ? getAuthUserCached() : sb.auth.getUser().then(r=>r.data));
      const uid = u?.user?.id || null;
      if (uid && data?.owner_id === uid){
        window._isOwnerUser = true;
        if (typeof setAccessRole==='function') setAccessRole('editor');
        try{ renderRoleChip?.(); }catch{}
      }
    }catch{}
    return data || null;
  }catch{ return null; }
  finally { hideLoading(); }
}

// Show/Hide admin-only buttons based on URL flags and event context
async function updateAdminButtonsVisibility() {
  let isOwner = false;

  // Ambil user dengan fallback aman
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (e) {
    console.warn('getCurrentUser() failed:', e);
  }

  // Deklarasikan role dgn const/let, dan pakai optional chaining di user
  const role = String(
    user?.app_metadata?.role ?? user?.user_metadata?.role ?? ''
  ).toLowerCase();

  // Global owner hanya jika is_owner true atau role === 'owner'
  isOwner = Boolean(
    user?.app_metadata?.is_owner || user?.user_metadata?.is_owner || role === 'owner'
  );

  try {
    const p = (typeof getUrlParams === 'function' ? getUrlParams() : {}) || {};
    const forceViewer = String(p.view || '') === '1';
    const hasEvent = Boolean(typeof currentEventId !== 'undefined' && currentEventId);
    const viewerNow = (typeof isViewer === 'function') ? isViewer() : false;

    const isAdmin = isOwner && !forceViewer && !viewerNow;

    const btnCreate = byId?.('btnMakeEventLink');
    const btnSave = byId?.('btnSave');

    console.log('Updating admin buttons visibility:', { forceViewer, hasEvent, viewerNow, isAdmin });

    if (btnCreate) btnCreate.classList.toggle('hidden', !isAdmin);
    if (btnSave) btnSave.classList.toggle('hidden', viewerNow || !(isAdmin || hasEvent));
  } catch (e) {
    console.warn('updateAdminButtonsVisibility UI toggle failed:', e);
  }
}


function leaveEventMode(clearLS = true) {
  // 1. Hapus parameter event & date dari URL
  const u = new URL(location.href);
  u.searchParams.delete('event');
  u.searchParams.delete('date');
  history.replaceState({}, '', u);

  // 2. Reset context cloud
  try{ unsubscribeRealtimeForState?.(); }catch{}
  currentEventId = null;
  _serverVersion = 0;

  // 3. Clear localStorage kalau diminta
  if (clearLS) {
    localStorage.removeItem(STORAGE_KEY);
    store = { sessions:{}, lastTs:null };
  }

  // 4. Seed default (pemain & ronde baru)
  seedDefaultIfEmpty();
  renderPlayersList?.();
  renderAll?.();
  validateNames?.();
  setAppTitle(__pubT('app.name','Mix Americano'));   // judul default
  startAutoSave();
  // default back to editor when leaving cloud
  setAccessRole('editor');
  // hide Share/Undang & Keluar when no event
  try{ updateEventActionButtons?.(); }catch{}
  try{ refreshJoinUI?.(); }catch{}
}



function setAppTitle(title) {
  const h = byId('appTitle');
  if (h && title) h.textContent = title;
  if (title) document.title = title + ' – ' + __pubT('app.name','Mix Americano');
  try{ ensureTitleEditor(); }catch{}
}

// Ensure document.title uses clean separator regardless of prior encoding
try {
  if (typeof setAppTitle === 'function') {
    const __origSetTitle = setAppTitle;
    setAppTitle = function(title){
      __origSetTitle(title);
      if (title) document.title = title + ' – ' + __pubT('app.name','Mix Americano');
    };
  }
} catch {}

// Wire header "View my stats" button to open modal popup and render stats in-place
try{
  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      const btn = (typeof byId === 'function') ? byId('btnViewStats') : document.getElementById('btnViewStats');
      const modal = document.getElementById('playerStatsModal');
      const overlay = document.getElementById('playerStatsOverlay');
      const closeBtn = document.getElementById('playerStatsClose');
      const container = document.getElementById('playerStatsContainer');
      if (!btn || !modal || !container) return;

      // Show/hide the stats button only when user is authenticated
      async function updateViewStatsVisibility(){
        try{
          const b = (typeof byId === 'function') ? byId('btnViewStats') : document.getElementById('btnViewStats');
          if (!b) return;
          let user = null;
          if (typeof getCurrentUser === 'function'){
            try{ user = await getCurrentUser(); }catch{ user = null; }
          } else if (sb && sb.auth){
            try{ const r = await sb.auth.getUser(); user = r?.data?.user || null; }catch{ user = null; }
          }
          b.classList.toggle('hidden', !user);
        }catch(e){ console.warn('updateViewStatsVisibility failed', e); }
      }
      updateViewStatsVisibility();
      try{ if (sb && sb.auth && typeof sb.auth.onAuthStateChange === 'function') sb.auth.onAuthStateChange(()=>{ updateViewStatsVisibility().catch(()=>{}); }); }catch{}

      function hideModal(){ modal.classList.add('hidden'); container.innerHTML = '<div class="p-6 muted">Loading...</div>'; }
      function showModal(){ modal.classList.remove('hidden'); }

      closeBtn?.addEventListener('click', ()=> hideModal());
      overlay?.addEventListener('click', ()=> hideModal());

        btn.addEventListener('click', async (ev)=>{
        ev.preventDefault();
        showModal();
        // Render redesigned UI: profile header + last-5 badges, filters under avatar, overview cards and history
        container.innerHTML = `
          <div class="mb-4">
            <div class="rounded-lg p-4 md:p-6 bg-white dark:bg-slate-900">
              <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div class="flex items-center gap-4">
                  <div class="w-20 h-20 md:w-24 md:h-24 rounded-full ring-4 ring-emerald-400 overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center"> <img id="ps_avatar" src="" alt="avatar" class="w-full h-full object-cover" onerror="this.style.display='none'"/></div>
                </div>
                <div class="flex-1 w-full">
                  <div class="text-center md:text-left">
                    <div id="ps_name" class="text-2xl font-bold text-gray-900 dark:text-white">Player</div>
                    <div id="ps_location" class="text-sm text-gray-500 dark:text-slate-300">Padel Pro</div>
                    <div class="mt-4">
                      <div data-i18n="stats.last5" class="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Last 5 Matches</div>
                      <div id="ps_last5" class="flex items-center justify-center md:justify-start gap-2"></div>
                    </div>
                  </div>

                  <div id="ps_filters" class="mt-4 flex flex-col md:flex-row items-center gap-3 relative z-20">
                    <div class="relative w-full md:w-auto">
                      <input id="psPlayerFilter" type="search" placeholder="Cari pemain..." data-i18n-placeholder="stats.searchPlaceholder" autocomplete="off" class="border rounded px-3 py-2 w-full md:w-52 bg-white dark:bg-gray-800" style="display:none;" />
                      <div id="psPlayerSuggestions" class="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg hidden max-h-60 overflow-y-auto z-50"></div>
                    </div>
                    <div class="flex items-center gap-2 w-full md:w-auto justify-center">
                      <label data-i18n="stats.from" class="text-sm text-gray-600 dark:text-slate-300 whitespace-nowrap">Dari</label>
                      <input id="psFrom" type="date" class="border rounded px-3 py-2 bg-white dark:bg-gray-800 w-full md:w-auto" />
                    </div>
                    <div class="flex items-center gap-2 w-full md:w-auto justify-center">
                      <label data-i18n="stats.to" class="text-sm text-gray-600 dark:text-slate-300 whitespace-nowrap">Sampai</label>
                      <input id="psTo" type="date" class="border rounded px-3 py-2 bg-white dark:bg-gray-800 w-full md:w-auto" />
                    </div>
                    <button id="psFilterBtn" data-i18n="stats.apply" class="w-full md:w-auto px-3 py-2 rounded bg-emerald-500 text-white">Terapkan</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div class="p-3 md:p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg shadow-md text-center">
                <div data-i18n="stats.matches" class="text-xs md:text-sm text-gray-500 dark:text-slate-300 uppercase">Matches</div>
                <div id="ps_card_matches" class="text-xl md:text-2xl font-bold mt-1 md:mt-2">0</div>
                <div data-i18n="stats.totalPlayed" class="text-[10px] md:text-xs text-gray-400 dark:text-slate-400">Total Played</div>
              </div>
              <div class="p-3 md:p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg shadow-md text-center">
                <div data-i18n="stats.winRate" class="text-xs md:text-sm text-gray-500 dark:text-slate-300 uppercase">Win Rate</div>
                <div id="ps_card_winrate" class="text-xl md:text-2xl font-bold mt-1 md:mt-2">0%</div>
                <div data-i18n="stats.range" class="text-[10px] md:text-xs text-gray-400 dark:text-slate-400">Last Range</div>
              </div>
              <div class="p-3 md:p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg shadow-md text-center">
                <div data-i18n="stats.wins" class="text-xs md:text-sm text-gray-500 dark:text-slate-300 uppercase">Wins</div>
                <div id="ps_card_wins" class="text-xl md:text-2xl font-bold mt-1 md:mt-2">0</div>
              </div>
              <div class="p-3 md:p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg shadow-md text-center">
                <div data-i18n="stats.losses" class="text-xs md:text-sm text-gray-500 dark:text-slate-300 uppercase">Losses</div>
                <div id="ps_card_losses" class="text-xl md:text-2xl font-bold mt-1 md:mt-2">0</div>
              </div>
              <div class="col-span-2 md:col-span-1 p-3 md:p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg shadow-md text-center">
                <div data-i18n="stats.draws" class="text-xs md:text-sm text-gray-500 dark:text-slate-300 uppercase">Draws</div>
                <div id="ps_card_draws" class="text-xl md:text-2xl font-bold mt-1 md:mt-2">0</div>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div id="psHistoryPane" class="mt-4"></div>
          </div>
        `;

        // date defaults - set to current month (1st to last day of current month)
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of current month
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of current month
        const toIso = to.toISOString().slice(0,10); const fromIso = from.toISOString().slice(0,10);
        document.getElementById('psFrom').value = fromIso; document.getElementById('psTo').value = toIso;
        const playerFilterEl = document.getElementById('psPlayerFilter');
        const filterBtn = document.getElementById('psFilterBtn');
        const paneHistory = document.getElementById('psHistoryPane');
        const suggestionsEl = document.getElementById('psPlayerSuggestions');

        // Apply translations to dynamic content
        try{ window.__i18n_apply?.(); }catch(e){}

        // Autocomplete Logic
        let autoCompleteTimeout;
        if (playerFilterEl && suggestionsEl) {
          // Hide suggestions on click outside
          document.addEventListener('click', (e)=> {
            if (suggestionsEl && !suggestionsEl.contains(e.target) && e.target !== playerFilterEl) {
              suggestionsEl.classList.add('hidden');
            }
          });

          playerFilterEl.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            clearTimeout(autoCompleteTimeout);
            if (val.length < 3) { suggestionsEl.classList.add('hidden'); return; }
            
            autoCompleteTimeout = setTimeout(async () => {
              try {
                // Determine if we should only search if owner? 
                // Currently input is hidden for non-owners, but good to be safe.
                const { data, error } = await sb.from('profiles')
                  .select('full_name')
                  .ilike('full_name', `%${val}%`)
                  .limit(10); // Matches case-insensitive
                  
                if (data && data.length > 0) {
                  suggestionsEl.innerHTML = '';
                  data.forEach(p => {
                    const div = document.createElement('div');
                    div.className = 'px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-gray-700 last:border-0';
                    div.textContent = p.full_name;
                    div.addEventListener('click', () => {
                      playerFilterEl.value = p.full_name;
                      suggestionsEl.classList.add('hidden');
                      if (filterBtn) filterBtn.click();
                    });
                    suggestionsEl.appendChild(div);
                  });
                  suggestionsEl.classList.remove('hidden');
                } else {
                  suggestionsEl.classList.add('hidden');
                }
              } catch (err) { console.error('Autocomplete error', err); }
            }, 300);
          });
          
          // Focus handler to reshow suggestions if value exists? 
          // Optional, maybe annoying. Let's stick to input event.
        }

        // fetch user
        let user = null;
        try{ const r = await sb.auth.getUser(); user = r?.data?.user || null; }catch(e){ user = null; }
        if (!user){ if (paneHistory) paneHistory.innerHTML = '<div class="p-4">Please login to view your stats.</div>'; return; }
        const uid = user.id;
        
        // Fetch user name once for use in history and default filter
        let userName = 'You';
        try{
          const { data: prof } = await sb.from('profiles').select('full_name').eq('id', uid).maybeSingle();
          userName = prof?.full_name || user?.user_metadata?.full_name || 'You';
        }catch{}
        
        // Set default filter to logged-in user's name
        if (playerFilterEl) playerFilterEl.value = userName;

        async function renderLast5Badges(lastMatches){
          const wrap = document.getElementById('ps_last5'); if (!wrap) return;
          wrap.innerHTML = '';
          for (const m of lastMatches.slice(0,5)){
            const badge = document.createElement('div'); badge.className = 'px-2 py-1 rounded-md text-white text-sm';
            if (m.result === 'win') { badge.classList.add('bg-emerald-600'); badge.textContent = 'W'; }
            else if (m.result === 'loss') { badge.classList.add('bg-red-600'); badge.textContent = 'L'; }
            else if (m.result === 'draw') { badge.classList.add('bg-amber-600'); badge.textContent = 'D'; }
            else { badge.classList.add('bg-gray-400'); badge.textContent = '-'; }
            wrap.appendChild(badge);
          }
        }

        async function loadSummary(fromDate, toDate, playerFilter){
          // write directly into the stat cards created in the modal
          const elMatches = document.getElementById('ps_card_matches');
          const elWinRate = document.getElementById('ps_card_winrate');
          const elWins = document.getElementById('ps_card_wins');
          const elLosses = document.getElementById('ps_card_losses');
          const elDraws = document.getElementById('ps_card_draws');
          if (!elMatches && !elWinRate && !elWins && !elLosses && !elDraws) return;
          try{
            // fetch match rows in date range and compute summary from them
            const { data: rowsData, error: rowsErr } = await sb.from('player_match_rows_for_current_user_matches')
              .select('event_state_id,session_date,event_title,court_index,round_index,player_label,display_name,team,score_for,score_against,result,player_id')
              .gte('session_date', fromDate).lte('session_date', toDate)
              .order('session_date', { ascending: false });
            if (rowsErr) throw rowsErr;
            const rows = rowsData || [];
            let matches = buildMatchesFromRows(rows);
            // Save unfiltered matches for "Last 5 Badges" (so they always reflect user's history regardless of filter)
            const allMatchesUnfiltered = [...matches];
            
            // Apply player filter if provided - exact match only (not substring)
            if (playerFilter){ 
              const f0 = playerFilter.toLowerCase().trim(); 
              matches = matches.filter(m => m.players.some(p => {
                const pName = String(p.display_name||p.player_label||'').toLowerCase().trim();
                return pName === f0; // exact match only
              })); 
            }
            const matchesCount = matches.length;
            // Calculate stats based on searched player (not logged-in user)
            let wins = 0, losses = 0, draws = 0;
            if (playerFilter) {
              const filterLower = playerFilter.toLowerCase().trim();
              wins = matches.filter(m=> {
                const matchedPlayer = m.players.find(p => String(p.display_name||p.player_label||'').toLowerCase().trim() === filterLower);
                return matchedPlayer?.result === 'win';
              }).length;
              losses = matches.filter(m=> {
                const matchedPlayer = m.players.find(p => String(p.display_name||p.player_label||'').toLowerCase().trim() === filterLower);
                return matchedPlayer?.result === 'loss';
              }).length;
              draws = matches.filter(m=> {
                const matchedPlayer = m.players.find(p => String(p.display_name||p.player_label||'').toLowerCase().trim() === filterLower);
                return matchedPlayer?.result === 'draw';
              }).length;
            } else {
              // Fallback to logged-in user if no filter
              wins = matches.filter(m=> (m.players.find(p=>p.player_id===uid)?.result === 'win')).length;
              losses = matches.filter(m=> (m.players.find(p=>p.player_id===uid)?.result === 'loss')).length;
              draws = matches.filter(m=> (m.players.find(p=>p.player_id===uid)?.result === 'draw')).length;
            }
            const winRate = (matchesCount>0) ? Math.round((wins / matchesCount) * 100) : 0;
            if (elMatches) elMatches.textContent = String(matchesCount);
            
            const baseClass = "text-xl md:text-2xl font-bold mt-1 md:mt-2";
            
            // WinRate Color Scale
            let wrColor = 'text-gray-900 dark:text-white';
            if (matchesCount > 0) {
              if (winRate >= 80) wrColor = 'text-emerald-600 dark:text-emerald-400';
              else if (winRate >= 60) wrColor = 'text-lime-600 dark:text-lime-400';
              else if (winRate >= 40) wrColor = 'text-amber-500 dark:text-amber-400';
              else if (winRate >= 20) wrColor = 'text-orange-600 dark:text-orange-400';
              else wrColor = 'text-rose-600 dark:text-rose-500';
            } else {
              wrColor = 'text-gray-400 dark:text-gray-500';
            }

            if (elWinRate) {
              elWinRate.textContent = String(winRate) + '%';
              elWinRate.className = baseClass + ' ' + wrColor;
            }
            if (elWins) {
              elWins.textContent = String(wins);
              elWins.className = baseClass + ' text-emerald-600 dark:text-emerald-400';
            }
            if (elLosses) {
              elLosses.textContent = String(losses);
              elLosses.className = baseClass + ' text-rose-600 dark:text-rose-500';
            }
            if (elDraws) {
              elDraws.textContent = String(draws);
              elDraws.className = baseClass + ' text-amber-500 dark:text-amber-400';
            }

            // recent matches list (last 5 within range, falling back to latest overall if none)
            // recent matches list (last 5 within range, falling back to latest overall if none)
            // Use unfiltered matches to ensure badges relate to user's perspective, not searched player
            // IMPORTANT: If owner (views all matches), we must filter only matches where the logged-in user participated
            let recentMatches = allMatchesUnfiltered.filter(m => m.players.some(p => p.player_id === uid));
            if (recentMatches.length === 0){
              // fallback: fetch some latest overall
              const { data: latestRows = [] } = await sb.from('player_match_rows_for_current_user_matches')
                .select('event_state_id,session_date,event_title,court_index,round_index,player_label,display_name,team,score_for,score_against,result,player_id')
                .order('session_date', { ascending: false }).limit(50);
              recentMatches = buildMatchesFromRows(latestRows || []);
            }
            const recent = recentMatches.slice(0,5).map(m=>{ const p = m.players.find(p=>p.player_id===uid) || {}; return { result: p.result || '', date: m.session_date }; });
            await renderLast5Badges(recent);
            // update header name from profiles table if available
            try{
              const { data: prof } = await sb.from('profiles').select('full_name').eq('id', uid).maybeSingle();
              const nameEl = document.getElementById('ps_name'); if (nameEl) nameEl.textContent = prof?.full_name || (user.user_metadata?.full_name || 'Player');
            }catch{}
          }catch(e){
            if (elMatches) elMatches.textContent = '0';
            if (elWinRate) elWinRate.textContent = '0%';
            if (elWins) elWins.textContent = '0';
            if (elLosses) elLosses.textContent = '0';
            if (elDraws) elDraws.textContent = '0';
            console.warn('loadSummary failed', e);
          }
        }

        // Pagination state
        let __ps_allMatches = [];
        let __ps_pageSize = 10;
        let __ps_currentPage = 0;

        function buildMatchesFromRows(rows){
          const map = new Map();
          for (const r of rows){
            const key = `${r.event_state_id}|${r.court_index}|${r.round_index}`;
            if (!map.has(key)){
              map.set(key, { key, event_state_id: r.event_state_id, session_date: r.session_date, event_title: r.event_title, players: [] });
            }
            map.get(key).players.push(r);
          }
          const arr = Array.from(map.values());
          // sort by session_date desc
          arr.sort((a,b)=> (b.session_date||'').localeCompare(a.session_date||''));
          return arr;
        }

        function renderPage(pageIdx){
          const tbody = document.getElementById('psBody'); if (!tbody) return;
          const start = pageIdx * __ps_pageSize; const end = start + __ps_pageSize;
          const slice = __ps_allMatches.slice(start, end);
          tbody.innerHTML = '';
          if (slice.length === 0){ tbody.innerHTML = '<tr><td colspan="5" class="p-4 muted">No matches found in range.</td></tr>'; return; }
            for (const m of slice){
            // build pairing strings
            const teamA = m.players.filter(p=>p.team==='A').map(p=>escapeHtml(p.display_name||p.player_label||'')).join(' & ');
            const teamB = m.players.filter(p=>p.team==='B').map(p=>escapeHtml(p.display_name||p.player_label||'')).join(' & ');
            // find user's opponents
            const userId = uid;
            const userPlayers = m.players.filter(p=>p.player_id===userId).map(p=>p.display_name||p.player_label||'');
            const opponents = m.players.filter(p=>p.player_id!==userId).map(p=>p.display_name||p.player_label||'');
            const scoreA = m.players.filter(p=>p.team==='A').map(p=>p.score_for).find(v=>v!==undefined);
            const scoreB = m.players.filter(p=>p.team==='B').map(p=>p.score_for).find(v=>v!==undefined);
            const result = (userPlayers.length>0) ? (m.players.find(p=>p.player_id===userId)?.result || '') : '';
            const date = m.session_date || '';
            const event = escapeHtml(m.event_title || '');
            const pairing = `${teamA} vs ${teamB}`;
            const oppText = opponents.length ? opponents.join(', ') : '-';
            const scoreText = (typeof scoreA === 'number' || typeof scoreB === 'number') ? `${scoreA===null||scoreA===undefined?'-':scoreA} - ${scoreB===null||scoreB===undefined?'-':scoreB}` : '-';
            const tr = document.createElement('tr');
            let resultHtml = '';
            if (result === 'win') resultHtml = '<span class="text-emerald-600 font-semibold">Win</span>';
            else if (result === 'loss') resultHtml = '<span class="text-red-600 font-semibold">Loss</span>';
            else if (result === 'draw') resultHtml = '<span class="text-amber-600 font-semibold">Draw</span>';
            else resultHtml = '';
            tr.innerHTML = `<td class="p-3 align-top">${date}</td><td class="p-3 align-top">${event}</td><td class="p-3 align-top">${escapeHtml(pairing)}</td><td class="p-3 align-top">${escapeHtml(scoreText)}</td><td class="p-3 align-top">${resultHtml}</td>`;
            tbody.appendChild(tr);
          }
        }

        function renderPaginationControls(){
          const pageWrapId = 'psPagination';
          let wrap = document.getElementById(pageWrapId);
          if (!wrap){
            wrap = document.createElement('div'); wrap.id = pageWrapId; wrap.className = 'mt-3 flex items-center justify-between';
            const table = document.getElementById('psTable'); table.parentNode.appendChild(wrap);
          }
          wrap.innerHTML = '';
          const total = __ps_allMatches.length;
          const pages = Math.max(1, Math.ceil(total / __ps_pageSize));
          const left = document.createElement('div');
          left.className = 'flex items-center gap-2';
          const sizeSel = document.createElement('select'); sizeSel.id = 'psPageSize'; sizeSel.className = 'border rounded px-2 py-1';
          [10,20,50,100].forEach(n=>{ const o = document.createElement('option'); o.value = n; o.textContent = n; if (n===__ps_pageSize) o.selected=true; sizeSel.appendChild(o); });
          sizeSel.addEventListener('change', ()=>{ __ps_pageSize = Number(sizeSel.value); __ps_currentPage = 0; renderPage(__ps_currentPage); renderPaginationControls(); });
          left.appendChild(sizeSel);
          left.appendChild(document.createElement('div')).textContent = ` ${total} matches`;
          wrap.appendChild(left);

          const right = document.createElement('div'); right.className='flex items-center gap-2';
          const prev = document.createElement('button'); prev.className='px-3 py-1 rounded border'; prev.textContent='Prev'; prev.disabled = __ps_currentPage===0; prev.addEventListener('click', ()=>{ if (__ps_currentPage>0) { __ps_currentPage--; renderPage(__ps_currentPage); renderPaginationControls(); } });
          const next = document.createElement('button'); next.className='px-3 py-1 rounded border'; next.textContent='Next'; next.disabled = (__ps_currentPage >= pages-1); next.addEventListener('click', ()=>{ if (__ps_currentPage < pages-1){ __ps_currentPage++; renderPage(__ps_currentPage); renderPaginationControls(); } });
          right.appendChild(prev);
          // page numbers (simple)
          const pgInfo = document.createElement('div'); pgInfo.className='text-sm text-gray-600'; pgInfo.textContent = `Page ${__ps_currentPage+1} / ${pages}`;
          right.appendChild(pgInfo);
          right.appendChild(next);
          wrap.appendChild(right);
        }

        async function loadHistory(f,t,playerFilter){
          const historyPane = document.getElementById('psHistoryPane'); if (!historyPane) return;
          historyPane.innerHTML = '<div class="p-4 muted">Loading...</div>';
          try{
            const { data, error } = await sb.from('player_match_rows_for_current_user_matches')
              .select('event_state_id,session_date,event_title,court_index,round_index,player_label,display_name,team,score_for,score_against,result,player_id')
              .gte('session_date', f).lte('session_date', t)
              .order('session_date', { ascending: false });
            if (error) throw error;
            const rows = data || [];
            let matches = buildMatchesFromRows(rows);
            // Apply player filter if provided - exact match only (not substring)
            if (playerFilter){ 
              const f0 = playerFilter.toLowerCase().trim(); 
              matches = matches.filter(m => m.players.some(p => {
                const pName = String(p.display_name||p.player_label||'').toLowerCase().trim();
                return pName === f0; // exact match only
              })); 
            }
            // group by session_date (tanggal event)
            const datesMap = new Map();
            for (const m of matches){
              const key = m.session_date || 'Unknown Date';
              if (!datesMap.has(key)) datesMap.set(key, []);
              datesMap.get(key).push(m);
            }
            // render
            historyPane.innerHTML = '';
            
            // i18n helper
            const tr = (k,f)=> window.__i18n_get ? window.__i18n_get(k,f) : (f||k);

            for (const [sessionDate, dateMatches] of datesMap.entries()){
              const card = document.createElement('div'); card.className = 'mb-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm';
              const header = document.createElement('div'); header.className = 'px-4 py-3 border-b border-slate-200 dark:border-slate-700';
              // Ambil event title dari match pertama di grup ini
              const eventTitle = dateMatches[0]?.event_title || 'Unknown Event';
              const matchesLabel = tr('stats.matches', 'matches');
              header.innerHTML = `<div class="font-semibold text-slate-900 dark:text-white">${escapeHtml(eventTitle)}</div><div class="text-xs text-slate-500 dark:text-slate-400">${sessionDate}</div><div class="text-xs text-slate-400 dark:text-slate-500">${dateMatches.length} ${matchesLabel}</div>`;
              card.appendChild(header);
              const list = document.createElement('div'); list.className = 'divide-y divide-slate-100 dark:divide-slate-800';
              for (const m of dateMatches){
                // Find the searched player in this match
                let searchedPlayer = null;
                let searchedTeam = '';
                let partnerName = '';
                let opponentPlayers = [];
                let result = '';
                
                if (playerFilter) {
                  const filterLower = playerFilter.toLowerCase().trim();
                  searchedPlayer = m.players.find(p => {
                    const pName = String(p.display_name||p.player_label||'').toLowerCase().trim();
                    return pName === filterLower;
                  });
                  
                  if (searchedPlayer) {
                    searchedTeam = searchedPlayer.team;
                    result = searchedPlayer.result || '';
                    const teamPlayers = m.players.filter(p=>p.team===searchedTeam);
                    const partner = teamPlayers.find(p=>p.player_id!==searchedPlayer.player_id);
                    partnerName = partner?.display_name || partner?.player_label || '';
                    const opponentTeam = searchedTeam === 'A' ? 'B' : 'A';
                    opponentPlayers = m.players.filter(p=>p.team===opponentTeam).map(p=>p.display_name||p.player_label||'');
                  }
                } else {
                  searchedPlayer = m.players.find(p=>p.player_id===uid);
                  if (searchedPlayer) {
                    searchedTeam = searchedPlayer.team;
                    result = searchedPlayer.result || '';
                    const teamPlayers = m.players.filter(p=>p.team===searchedTeam);
                    const partner = teamPlayers.find(p=>p.player_id!==uid);
                    partnerName = partner?.display_name || partner?.player_label || '';
                    const opponentTeam = searchedTeam === 'A' ? 'B' : 'A';
                    opponentPlayers = m.players.filter(p=>p.team===opponentTeam).map(p=>p.display_name||p.player_label||'');
                  }
                }
                
                if (!searchedPlayer) continue;
                
                const searchedPlayerName = searchedPlayer.display_name || searchedPlayer.player_label || '';
                const scoreA = m.players.filter(p=>p.team==='A').map(p=>p.score_for).find(v=>v!==undefined);
                const scoreB = m.players.filter(p=>p.team==='B').map(p=>p.score_for).find(v=>v!==undefined);
                const searchedScore = searchedTeam === 'A' ? scoreA : scoreB;
                const oppScore = searchedTeam === 'A' ? scoreB : scoreA;
                
                // Buat row dengan struktur sama seperti renderMatchRow di mobile-nav.js
                const row = document.createElement('div');
                row.className = 'relative px-4 py-4 space-y-2';
                
                // Header: badge saja (no label pertandingan)
                const headerDiv = document.createElement('div');
                headerDiv.className = 'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide leading-none';
                const tag = document.createElement('span');
                tag.className = 'text-[11px] font-semibold px-2 py-1 rounded-full inline-block shadow-sm';
                if (result === 'win') { tag.className += ' bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'; tag.textContent = tr('stats.result.win', 'WIN'); }
                else if (result === 'loss') { tag.className += ' bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'; tag.textContent = tr('stats.result.loss', 'LOSS'); }
                else if (result === 'draw') { tag.className += ' bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'; tag.textContent = tr('stats.result.draw', 'DRAW'); }
                else { tag.className += ' bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'; tag.textContent = '-'; }
                headerDiv.appendChild(tag);
                
                // Body: nama pemain + score + opponent
                const body = document.createElement('div');
                body.className = 'flex items-start gap-3';
                
                // Left: nama pemain yang di-search + partner
                const left = document.createElement('div');
                left.className = 'flex-1 min-w-0 text-left pt-4';
                const names = document.createElement('div');
                names.className = 'text-[13px] leading-tight text-slate-800 dark:text-slate-100';
                
                let searchedPlayerHtml = escapeHtml(searchedPlayerName);
                let partnerHtml = escapeHtml(partnerName);
                
                // Bold the searched player name
                if (playerFilter && searchedPlayerName.toLowerCase().trim() === playerFilter.toLowerCase().trim()){
                  searchedPlayerHtml = `<strong>${searchedPlayerHtml}</strong>`;
                }
                
                names.innerHTML = `<span class="font-bold">${searchedPlayerHtml}</span> + ${partnerHtml}`;
                left.appendChild(names);
                
                // Center: score dengan background
                const scoreWrap = document.createElement('div');
                scoreWrap.className = 'flex-shrink-0 self-center';
                const score = document.createElement('div');
                score.className = 'text-lg font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md min-w-[76px] text-center';
                score.textContent = `${(typeof searchedScore==='number' || typeof oppScore==='number') ? `${searchedScore===null||searchedScore===undefined?'-':searchedScore} - ${oppScore===null||oppScore===undefined?'-':oppScore}` : '-'}`;
                scoreWrap.appendChild(score);
                
                // Right: opponent (bold jika di-search)
                const right = document.createElement('div');
                right.className = 'flex-1 min-w-0 text-right pt-4';
                const opp = document.createElement('div');
                opp.className = 'text-[13px] leading-tight text-slate-600 dark:text-slate-300 whitespace-normal break-words text-right';
                let opponentHtml = opponentPlayers.map(name => {
                  let escaped = escapeHtml(name);
                  if (playerFilter && name.toLowerCase().includes(playerFilter.toLowerCase())){
                    return `<strong>${escaped}</strong>`;
                  }
                  return escaped;
                }).join(' & ');
                opp.innerHTML = opponentHtml;
                right.appendChild(opp);
                
                body.appendChild(left);
                body.appendChild(scoreWrap);
                body.appendChild(right);
                
                row.appendChild(headerDiv);
                row.appendChild(body);
                list.appendChild(row);
              }
              card.appendChild(list);
              historyPane.appendChild(card);
            }
          }catch(e){ console.error('history load failed', e); historyPane.innerHTML = '<div class="p-4 text-red-600">Failed to load history</div>'; }
        }

        // initial loads with default filter (user's name)
        const currentFilter = (playerFilterEl && playerFilterEl.value) ? playerFilterEl.value.trim() : userName;
        await loadSummary(fromIso, toIso, currentFilter);
        await loadHistory(fromIso, toIso, currentFilter);

        // Role-based visibility: sembunyikan player filter untuk viewer, tampilkan untuk owner
        try{
          const isOwner = (typeof isOwnerNow === 'function') ? isOwnerNow() : !!window._isOwnerUser;
          if (playerFilterEl) playerFilterEl.style.display = isOwner ? '' : 'none';
        }catch{}

        // wire filter button
        filterBtn?.addEventListener('click', ()=>{
          const f = document.getElementById('psFrom').value || fromIso;
          const t = document.getElementById('psTo').value || toIso;
          const pf = (playerFilterEl && playerFilterEl.value) ? playerFilterEl.value.trim() : '';
          loadSummary(f,t,pf);
          loadHistory(f,t,pf);
        });
      });
    }catch(e){ console.warn('btnViewStats binding failed', e); }
  });
}catch(e){ console.warn('init btnViewStats failed', e); }
