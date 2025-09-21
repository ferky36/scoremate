"use strict";
// ===== Expand/Collapse "Filter / Jadwal" =====
(function(){
  const KEY = 'ui.filter.expanded';
  const btn = document.getElementById('btnFilterToggle');
  const chevron = document.getElementById('filterChevron');
  const panel = document.getElementById('filterPanel');

  if(!btn || !panel) return;

  // state awal: dari localStorage (default: expanded)
  let open = localStorage.getItem(KEY);
  if (open === null) {
    // kalau device pendek-lanskap -> start collapsed
    const isShortLandscape = window.matchMedia('(orientation: landscape) and (max-height: 480px)').matches;
    open = isShortLandscape ? '0' : '1';
  }
  open = open === '1';
  if (open) panel.classList.add('open'); else panel.classList.remove('open');
  chevron.textContent = open ? '▴' : '▾';

  btn.addEventListener('click', ()=>{
    panel.classList.toggle('open');
    const nowOpen = panel.classList.contains('open');
    chevron.textContent = nowOpen ? '▴' : '▾';
    localStorage.setItem(KEY, nowOpen ? '1' : '0');
  });
})();

// Fallback: sebelum keluar/refresh, commit autosave
window.addEventListener('beforeunload', saveToLocalSilent);

// Enhance collapsible behavior for Filter/Jadwal panel without touching existing handlers
(function fixFilterPanelCollapsible(){
  const panel = document.getElementById('filterPanel');
  const chevron = document.getElementById('filterChevron');
  if (!panel) return;

  function refresh(){
    if (panel.classList.contains('open')){
      try{ panel.style.maxHeight = (panel.scrollHeight + 24) + 'px'; panel.style.opacity = '1'; }catch{}
      try{ if (chevron) chevron.textContent = '▲'; }catch{}
    } else {
      try{ panel.style.maxHeight = '0px'; panel.style.opacity = '0'; }catch{}
      try{ if (chevron) chevron.textContent = '▼'; }catch{}
    }
  }

  // Initial
  refresh();
  // When panel content changes or class toggled
  try{ new MutationObserver(refresh).observe(panel, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] }); }catch{}
  window.addEventListener('resize', refresh);
})();


// Ketika ganti tanggal → simpan dulu yang lama, lalu load tanggal baru
// byId('sessionDate')?.addEventListener('change', () => {
//   saveToLocalSilent();
//   const d = normalizeDateKey(byId('sessionDate').value || '');
//   const all = readAllSessionsLS();
//   if (all[d]) applyPayload(all[d]);
//   else {
//     // tidak ada data tanggal tsb → kosongkan view sesuai setting sekarang
//     renderAll?.();
//     byId("unsavedDot")?.classList.add("hidden");
//   }
// });

byId('btnApplyPlayerTemplate')?.addEventListener('click', () => {
  if (confirm('Terapkan template pemain 10 orang? Daftar sekarang akan diganti.')) {
    applyDefaultPlayersTemplate();
  }
});




function fitPlayersScroll() {
  const panel = document.getElementById('playersPanel');
  const sc    = document.getElementById('playerListContainer');
  if (!panel || !sc || panel.classList.contains('hidden')) return;

  const rect = panel.getBoundingClientRect();
  const vh   = window.innerHeight || document.documentElement.clientHeight;

  // Tinggi sisa viewport dari atas panel sampai bawah, minus sedikit padding
  const h = Math.max(220, vh - rect.top - 12);
  sc.style.maxHeight = h + 'px';
}

// Panggil saat awal, saat resize/orientasi berubah, dan ketika panel dibuka
window.addEventListener('resize', fitPlayersScroll);
window.addEventListener('orientationchange', fitPlayersScroll);
document.addEventListener('DOMContentLoaded', fitPlayersScroll);

// Jika kamu punya tombol collapse pemain, ukur ulang setelah transisi
document.getElementById('btnCollapsePlayers')?.addEventListener('click', () => {
  setTimeout(fitPlayersScroll, 180);
});

// Setelah renderPlayersList selesai, ukur ulang juga
const _renderPlayersList = window.renderPlayersList;
window.renderPlayersList = function(...args){
  const r = _renderPlayersList?.apply(this, args);
  requestAnimationFrame(fitPlayersScroll);
  return r;
};

// Buka modal
// Open Create Event modal (extracted)
function setEventModalTab(mode){
  const isCreate = mode !== "search";
  const tCreate = document.getElementById("tabCreateEvent");
  const tSearch = document.getElementById("tabSearchEvent");
  const fCreate = document.getElementById("eventForm");
  const fSearch = document.getElementById("eventSearchForm");
  if (fCreate) fCreate.classList.toggle("hidden", !isCreate);
  if (fSearch) fSearch.classList.toggle("hidden", isCreate);
  const succ = document.getElementById("eventSuccess"); if (succ) succ.classList.add("hidden");
  if (tCreate){ tCreate.classList.toggle("bg-indigo-600", isCreate); tCreate.classList.toggle("text-white", isCreate); }
  if (tSearch){ tSearch.classList.toggle("bg-indigo-600", !isCreate); tSearch.classList.toggle("text-white", !isCreate); }
  // Ensure tabs are visible and title set for Create/Search context
  const tabs = document.getElementById('eventTabs'); if (tabs) tabs.classList.remove('hidden');
  const titleEl = document.querySelector('#eventModal h3'); if (titleEl) titleEl.textContent = 'Buat/Cari Event';
  // If editor link row exists from previous share, show it back in create/search context
  const ed = document.getElementById('eventEditorLinkOutput');
  if (ed && ed.parentElement) ed.parentElement.classList.remove('hidden');

  // When switching to Create tab, ensure optional location inputs exist
  if (isCreate) {
    try{
      const form = byId('eventForm');
      if (form && !byId('eventLocationInput')){
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <div>
            <label class="block text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-300">Lokasi (opsional)</label>
            <input id="eventLocationInput" type="text" placeholder="Mis. Lapangan A, GBK"
                  class="mt-1 border rounded-xl px-3 py-2 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
          </div>
          <div>
            <label class="block text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-300">Link Maps (opsional)</label>
            <input id="eventLocationUrlInput" type="url" placeholder="https://maps.app.goo.gl/..."
                  class="mt-1 border rounded-xl px-3 py-2 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
          </div>`;
        const btn = byId('eventCreateBtn');
        if (btn) form.insertBefore(wrap, btn);
        else form.appendChild(wrap);
      }
    }catch{}
  }
}
function openCreateEventModal(){
  setEventModalTab("create"); byId('eventDateInput').value = byId('sessionDate').value || new Date().toISOString().slice(0,10);
  byId('eventNameInput').value = document.querySelector('h1')?.textContent?.trim() || '';
  byId('eventModal').classList.remove('hidden');
  // Ensure optional location fields exist in form
  try{
    const form = byId('eventForm');
    if (form && !byId('eventLocationInput')){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div>
          <label class="block text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-300">Lokasi (opsional)</label>
          <input id="eventLocationInput" type="text" placeholder="Mis. Lapangan A, GBK"
                class="mt-1 border rounded-xl px-3 py-2 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
        <div>
          <label class="block text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-300">Link Maps (opsional)</label>
          <input id="eventLocationUrlInput" type="url" placeholder="https://maps.app.goo.gl/..."
                class="mt-1 border rounded-xl px-3 py-2 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>`;
      // insert before create button
      const btn = byId('eventCreateBtn');
      if (btn) form.insertBefore(wrap, btn);
      else form.appendChild(wrap);
    }
  }catch{}
}

// Helpers for Search Event modal
async function getMyEventIds(){
  try{
    showLoading('Memuat daftar event…');
    const { data: ud } = await sb.auth.getUser();
    const uid = ud?.user?.id || null;
    if (!uid) { hideLoading(); return []; }
    const out = new Set();
    // owned events
    try{
      const { data: owned } = await sb.from('events').select('id').eq('owner_id', uid);
      (owned||[]).forEach(r=> out.add(r.id));
    }catch{}
    // member events
    try{
      const { data: mems } = await sb.from('event_members').select('event_id').eq('user_id', uid);
      (mems||[]).forEach(r=> out.add(r.event_id));
    }catch{}
    hideLoading();
    return Array.from(out);
  }catch{ hideLoading(); return []; }
}

async function loadSearchDates(){
  const sel = byId('searchDateSelect'); if (!sel) return;
  sel.innerHTML = '<option value="">Pilih tanggal…</option>';
  const ids = await getMyEventIds();
  if (!ids.length) return;
  try{
    showLoading('Memuat tanggal…');
    const { data: rows } = await sb.from('event_states')
      .select('session_date')
      .in('event_id', ids)
      .order('session_date', { ascending: false });
    const seen = new Set();
    (rows||[]).forEach(r=>{ if (r.session_date && !seen.has(r.session_date)) { seen.add(r.session_date); const o=document.createElement('option'); o.value=r.session_date; o.textContent=r.session_date; sel.appendChild(o);} });
    // preselect current date if exists; otherwise select latest (first option)
    const cur = normalizeDateKey(byId('sessionDate')?.value || '');
    if (cur && seen.has(cur)) {
      sel.value = cur;
    } else {
      const first = sel.querySelector('option[value]:not([value=""])');
      if (first) sel.value = first.value;
    }
  }catch{}
  finally { hideLoading(); }
}

async function loadSearchEventsForDate(dateStr){
  const evSel = byId('searchEventSelect'); const btnOpen = byId('openEventBtn');
  if (!evSel) return;
  evSel.innerHTML = '<option value="">Memuat…</option>';
  btnOpen && (btnOpen.disabled = true);
  const delBtn = byId('deleteEventBtn'); if (delBtn) delBtn.disabled = true;
  const ids = await getMyEventIds();
  if (!ids.length || !dateStr){ evSel.innerHTML = '<option value="">– Tidak ada –</option>'; return; }
  try{
    showLoading('Memuat event…');
    const { data: states } = await sb.from('event_states')
      .select('event_id, updated_at')
      .eq('session_date', dateStr)
      .in('event_id', ids)
      .order('updated_at', { ascending: false });
    const eids = Array.from(new Set((states||[]).map(r=>r.event_id).filter(Boolean)));
    if (!eids.length){ evSel.innerHTML = '<option value="">– Tidak ada –</option>'; return; }
    const { data: evs } = await sb.from('events').select('id,title').in('id', eids);
    const titleMap = new Map((evs||[]).map(r=>[r.id, r.title || r.id]));
    evSel.innerHTML = '';
    eids.forEach(id=>{
      const o = document.createElement('option'); o.value = id; o.textContent = titleMap.get(id) || id; evSel.appendChild(o);
    });
    // Pastikan ada yang terseleksi (default ke pertama)
    if (!evSel.value && evSel.options.length > 0) evSel.value = evSel.options[0].value;
    btnOpen && (btnOpen.disabled = false);
    if (delBtn) delBtn.disabled = !(evSel.value && evSel.value.length > 0);
    try{ evSel.dispatchEvent(new Event('change')); }catch{}
  }catch{
    evSel.innerHTML = '<option value="">- Gagal memuat -</option>';
  } finally { hideLoading(); }
}

async function switchToEvent(eventId, dateStr){
  try{
    showLoading('Membuka event…');
    // Putuskan channel realtime sebelumnya bila ada
    try{ unsubscribeRealtimeForState?.(); }catch{}
    currentEventId = eventId; currentSessionDate = normalizeDateKey(dateStr);
    const url = new URL(location.href); url.searchParams.set('event', eventId); url.searchParams.set('date', currentSessionDate); history.replaceState({}, '', url);
    const meta = await fetchEventMetaFromDB(eventId);
    if (meta?.title) setAppTitle(meta.title);
    renderEventLocation(meta?.location_text || '', meta?.location_url || '');
    try{ ensureLocationFields(); await loadLocationFromDB(); }catch{}
    const ok = await loadStateFromCloud();
    if (!ok){ seedDefaultIfEmpty?.(); }
    renderPlayersList?.(); renderAll?.(); validateNames?.();
    subscribeRealtimeForState?.();
    startAutoSave?.();
    loadAccessRoleFromCloud?.();
    refreshEventButtonLabel?.();
    updateEventActionButtons?.();
    refreshJoinUI?.();
  }catch(e){ console.warn('switchToEvent failed', e); }
  finally { hideLoading(); }
}

function openSearchEventModal(){ setEventModalTab('search');
  const m = byId('eventModal'); if (!m) return;
  m.classList.remove('hidden');
  // reset
  const evSel = byId('searchEventSelect'); if (evSel) { evSel.innerHTML = '<option value="">- Pilih tanggal dulu -</option>'; }
  const btn = byId('openEventBtn'); if (btn) btn.disabled = true;
  ensureDeleteEventButton();
  // load dates then events for initial selection
  (async ()=>{
    await loadSearchDates();
    const d = byId('searchDateSelect')?.value || '';
    if (d) await loadSearchEventsForDate(d);
  })();
}

// Unified click behavior for header button
byId('btnMakeEventLink')?.addEventListener('click', async () => {
  const user = await getCurrentUser();
  // jika sudah login, buka tab Cari agar langsung bisa memilih
  if (user) openSearchEventModal(); else openCreateEventModal();
});
// Open Share/Invite for current event anytime
function openShareEventModal(){
  if (!isCloudMode() || !currentEventId){ openCreateEventModal(); return; }
  const m = byId('eventModal'); if (!m) return;
  // show modal
  m.classList.remove('hidden');
  // adjust header/title and hide Buat/Cari tabs for share-only view
  const titleEl = m.querySelector('h3'); if (titleEl) titleEl.textContent = 'Share / Undang';
  const tabs = byId('eventTabs'); if (tabs) tabs.classList.add('hidden');
  // show success panel, hide form
  byId('eventForm')?.classList.add('hidden');
  byId('eventSearchForm')?.classList.add('hidden');
  byId('eventSuccess')?.classList.remove('hidden');
  // neutralize success info text for share context
  (function tweakShareInfo(){
    const sb = byId('eventSuccess');
    const info = sb?.querySelector('.p-3');
    if (info) info.textContent = 'Bagikan Link Event';
  })();
  // ensure viewer link (public viewer, clean params)
  const d = byId('sessionDate')?.value || currentSessionDate || new Date().toISOString().slice(0,10);
  const viewerLink = buildPublicViewerUrl(currentEventId, d);
  const out = byId('eventLinkOutput'); if (out) out.value = viewerLink;

  // ensure extra field: Viewer (Hitung Skor) dengan ?view=1
  (function ensureScoreViewerField(){
    const successBox = byId('eventSuccess'); if (!successBox) return;
    let row = byId('eventViewerCalcRow');
    if (!row){
      row = document.createElement('div');
      row.id = 'eventViewerCalcRow';
      row.className = 'space-y-1';
      row.innerHTML = `
        <div class="text-xs text-gray-600 dark:text-gray-300">Link Viewer (boleh hitung skor)</div>
        <div class="flex items-center gap-2">
          <input id="eventViewerCalcLinkOutput" readonly class="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
          <button id="eventViewerCalcCopyBtn" class="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">Copy</button>
        </div>`;
      successBox.appendChild(row);
      try{
        byId('eventViewerCalcCopyBtn').addEventListener('click', async ()=>{
          const v = byId('eventViewerCalcLinkOutput')?.value || '';
          await copyToClipboard(v);
          const btn = byId('eventViewerCalcCopyBtn'); if (btn){ btn.textContent='Copied!'; setTimeout(()=>btn.textContent='Copy', 1200); }
        });
      }catch{}
    }
    const v2 = buildViewerUrl(currentEventId, d);
    const o2 = byId('eventViewerCalcLinkOutput'); if (o2) o2.value = v2;
  })();
  // hide editor link row in Share view to keep only viewer link and Invite
  (function hideEditorLinkInShare(){
    const inp = byId('eventEditorLinkOutput');
    if (inp && inp.parentElement) inp.parentElement.classList.add('hidden');
  })();
  // ensure invite form
  (function ensureInviteForm(){
    const successBox = byId('eventSuccess'); if (!successBox) return;
    if (byId('btnInviteMember')) return;
    const box = document.createElement('div');
    box.className = 'border-t dark:border-gray-700 pt-3 space-y-2';
    box.innerHTML = `
      <div class="text-sm font-semibold">Invite Anggota</div>
      <div class="text-xs text-gray-500 dark:text-gray-300">Masukkan email Supabase user (yang digunakan login), pilih role, lalu buat link undangan.</div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input id="inviteEmail" type="email" placeholder="email@example.com" class="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
        <select id="inviteRole" class="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
          <option value="editor">editor</option>
        </select>
        <button id="btnInviteMember" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm">Buat Link Undangan</button>
      </div>
      <div class="flex items-center gap-2 hidden" id="inviteLinkRow">
        <input id="inviteLinkOut" readonly class="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
        <button id="btnCopyInvite" class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Copy Link</button>
      </div>
      <div id="inviteMsg" class="text-xs"></div>`;
    successBox.appendChild(box);
    byId('btnInviteMember').addEventListener('click', async ()=>{
      const btn = byId('btnInviteMember');
      const email = (byId('inviteEmail').value||'').trim();
      const role = byId('inviteRole').value||'editor';
      const msg = byId('inviteMsg'); msg.textContent='';
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent='Email tidak valid.'; return; }
      if (!isCloudMode() || !currentEventId){ msg.textContent='Mode Cloud belum aktif. Buat event dulu.'; return; }
      try{
        if (btn){ btn.disabled = true; btn.textContent = 'Membuat…'; }
        const { data:ud } = await sb.auth.getUser();
        if (!ud?.user){ msg.textContent='Silakan login terlebih dahulu.'; return; }
        const { data: token, error } = await sb.rpc('create_event_invite', { p_event_id: currentEventId, p_email: email, p_role: role });
        if (error) throw error;
        const link = buildInviteUrl(currentEventId, byId('sessionDate').value || '', token);
        const row = byId('inviteLinkRow'); const out = byId('inviteLinkOut'); const cp = byId('btnCopyInvite');
        if (row && out && cp){ row.classList.remove('hidden'); out.value = link; msg.textContent='Link undangan dibuat. Kirimkan ke email terkait.'; cp.onclick = async ()=>{ try{ await navigator.clipboard.writeText(out.value); cp.textContent='Copied!'; setTimeout(()=>cp.textContent='Copy Link',1200);}catch{} }; }
      }catch(e){ console.error(e); msg.textContent = 'Gagal membuat link undangan' + (e?.message? ': '+e.message : ''); }
      finally { if (btn){ btn.disabled = false; btn.textContent = 'Buat Link Undangan'; } hideLoading(); }
    });
  })();
}
byId('btnShareEvent')?.addEventListener('click', openShareEventModal);
// Enhance players toolbar icons on startup
try{ setupPlayersToolbarUI?.(); }catch{}
// Tab handlers for Event modal
byId('tabCreateEvent')?.addEventListener('click', ()=>{ setEventModalTab('create'); });
byId('tabSearchEvent')?.addEventListener('click', async ()=>{ setEventModalTab('search'); await loadSearchDates(); const d = byId('searchDateSelect')?.value || ''; if (d) await loadSearchEventsForDate(d); });
byId('eventCancelBtn')?.addEventListener('click', () => {
  byId('eventModal').classList.add('hidden');
});

// Klik Create Event
byId('eventCreateBtn')?.addEventListener('click', async () => {
  const btnCreate = byId('eventCreateBtn');
  const oldText = btnCreate?.textContent;
  if (btnCreate) { btnCreate.disabled = true; btnCreate.textContent = 'Creating...'; }
  const name = (byId('eventNameInput').value || '').trim();
  const date = normalizeDateKey(byId('eventDateInput').value || '');
  if (!name || !date) { alert('Nama event dan tanggal wajib diisi.'); return; }

  try {
    // pastikan user login
    const { data: ud } = await sb.auth.getUser();
    if (!ud?.user) { byId('eventModal')?.classList.add('hidden'); byId('loginModal')?.classList.remove('hidden'); return; }

    const { id, created } = await createEventIfNotExists(name, date);
    if (!created) {
      alert('Event dengan nama itu di tanggal tersebut sudah ada.\nSilakan pilih nama lain atau tanggal lain.');
      return;
    }

    // update title
    setAppTitle(name);
    currentEventId = id;
    currentSessionDate = date;
    byId('sessionDate').value = date;

    // save optional location to events table
    try{
      const locText = (byId('eventLocationInput')?.value || '').trim();
      const locUrl  = (byId('eventLocationUrlInput')?.value || '').trim();
      if (locText || locUrl){
        await sb.from('events').update({ location_text: locText || null, location_url: locUrl || null }).eq('id', id);
        renderEventLocation(locText, locUrl);
      } else {
        renderEventLocation('', '');
      }
    }catch(e){ console.warn('Gagal menyimpan lokasi event:', e); }

    const url = new URL(location.href);
    url.searchParams.set('event', id);
    url.searchParams.set('date', date);
    history.replaceState({}, '', url);

    await saveStateToCloudWithLoading();
    subscribeRealtimeForState();
    startAutoSave();
    refreshEventButtonLabel?.();
    updateEventActionButtons?.();

    // tampilkan UI success: share link default = viewer (readonly) + embed owner
    const link = buildPublicViewerUrl(id, date);
    byId('eventForm').classList.add('hidden');
    byId('eventSuccess').classList.remove('hidden');
    // reset info text to creation success wording in create flow
    (function tweakCreateInfo(){
      const sb = byId('eventSuccess');
      const info = sb?.querySelector('.p-3');
      if (info) info.textContent = 'Event berhasil dibuat! Bagikan link berikut:';
    })();
    byId('eventLinkOutput').value = link;
    // Set also the score-only viewer link
    try{
      (function ensureScoreViewerField(){
        const successBox = byId('eventSuccess'); if (!successBox) return;
        let row = byId('eventViewerCalcRow');
        if (!row){
          row = document.createElement('div'); row.id='eventViewerCalcRow'; row.className='space-y-1';
          row.innerHTML = `
            <div class="text-xs text-gray-600 dark:text-gray-300">Link Viewer (boleh hitung skor)</div>
            <div class="flex items-center gap-2">
              <input id="eventViewerCalcLinkOutput" readonly class="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
              <button id="eventViewerCalcCopyBtn" class="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">Copy</button>
            </div>`;
          successBox.appendChild(row);
          byId('eventViewerCalcCopyBtn').addEventListener('click', async ()=>{
            const v = byId('eventViewerCalcLinkOutput')?.value || '';
            await copyToClipboard(v);
            const btn = byId('eventViewerCalcCopyBtn'); if (btn){ btn.textContent='Copied!'; setTimeout(()=>btn.textContent='Copy', 1200); }
          });
        }
        const v2 = buildViewerUrl(id, date);
        const o2 = byId('eventViewerCalcLinkOutput'); if (o2) o2.value = v2;
      })();
    }catch{}

    // HAPUS: tidak ada lagi editor link copy

    // tambahkan form invite sederhana bila belum ada
    (function ensureInviteForm(){
      const successBox = byId('eventSuccess'); if (!successBox) return;
      if (byId('btnInviteMember')) return;
      const box = document.createElement('div');
      box.className = 'border-t dark:border-gray-700 pt-3 space-y-2';
      box.innerHTML = `
        <div class="text-sm font-semibold">Invite Anggota</div>
        <div class="text-xs text-gray-500 dark:text-gray-300">Masukkan email Supabase user (yang digunakan login), pilih role, lalu buat link undangan.</div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input id="inviteEmail" type="email" placeholder="email@example.com" class="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
          <select id="inviteRole" class="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
            <option value="editor">editor</option>
          </select>
          <button id="btnInviteMember" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm">Buat Link Undangan</button>
        </div>
        <div class="flex items-center gap-2 hidden" id="inviteLinkRow">
          <input id="inviteLinkOut" readonly class="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" />
          <button id="btnCopyInvite" class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Copy Link</button>
        </div>
        <div id="inviteMsg" class="text-xs"></div>`;
      successBox.appendChild(box);
      byId('btnInviteMember').addEventListener('click', async ()=>{
        const btn = byId('btnInviteMember');
        const email = (byId('inviteEmail').value||'').trim();
        const role = byId('inviteRole').value||'editor';
        const msg = byId('inviteMsg'); msg.textContent='';
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent='Email tidak valid.'; return; }
        if (!isCloudMode() || !currentEventId){ msg.textContent='Mode Cloud belum aktif. Buat event dulu.'; return; }
        try{
          if (btn){ btn.disabled = true; btn.textContent = 'Membuat…'; }
          // Pastikan user login
          const { data:ud } = await sb.auth.getUser();
          if (!ud?.user){ msg.textContent='Silakan login terlebih dahulu.'; return; }

          // Panggil RPC SECURITY DEFINER agar lolos RLS dengan validasi owner/editor di sisi DB
          const { data: token, error } = await sb.rpc('create_event_invite', {
            p_event_id: currentEventId,
            p_email: email,
            p_role: role
          });
          if (error) throw error;

          const link = buildInviteUrl(currentEventId, byId('sessionDate').value || '', token);
          const row = byId('inviteLinkRow'); const out = byId('inviteLinkOut'); const cp = byId('btnCopyInvite');
          if (row && out && cp){ row.classList.remove('hidden'); out.value = link; msg.textContent='Link undangan dibuat. Kirimkan ke email terkait.';
            cp.onclick = async ()=>{ try{ await navigator.clipboard.writeText(out.value); cp.textContent='Copied!'; setTimeout(()=>cp.textContent='Copy Link',1200);}catch{} };
          }
        }catch(e){ console.error(e); msg.textContent = 'Gagal membuat link undangan' + (e?.message? ': '+e.message : ''); }
        finally { if (btn){ btn.disabled = false; btn.textContent = 'Buat Link Undangan'; } }
      });
  })();


  } catch (err) {
    console.error(err);
    alert('Gagal membuat event. Coba lagi.');
  } finally {
    if (btnCreate) { btnCreate.disabled = false; btnCreate.textContent = oldText || 'Create & Buat Link'; }
  }
  try{ updateAdminButtonsVisibility?.(); }catch{}
});

// Klik Copy Link
byId('eventCopyBtn')?.addEventListener('click', async () => {
  // Salin apa adanya dari field viewer publik (tanpa owner/view)
  const link = byId('eventLinkOutput').value;
  try {
    await navigator.clipboard.writeText(link);
    byId('eventCopyBtn').textContent = 'Copied!';
    setTimeout(()=> byId('eventCopyBtn').textContent = 'Copy', 2000);
  } catch {
    alert('Gagal menyalin link, salin manual: ' + link);
  }
});

// Search Event modal bindings
byId('searchCancelBtn')?.addEventListener('click', ()=> byId('eventModal')?.classList.add('hidden'));
byId('searchDateSelect')?.addEventListener('change', async ()=>{
  const d = byId('searchDateSelect')?.value || '';
  await loadSearchEventsForDate(d);
  const delBtn = byId('deleteEventBtn'); if (delBtn) delBtn.disabled = true;
});
byId('openEventBtn')?.addEventListener('click', async ()=>{
  const d = byId('searchDateSelect')?.value || '';
  const ev = byId('searchEventSelect')?.value || '';
  if (!d || !ev) { alert('Pilih tanggal dan event.'); return; }
  byId('eventModal')?.classList.add('hidden');
  await switchToEvent(ev, d);
});

// Enable delete button on select change
byId('searchEventSelect')?.addEventListener('change', ()=>{
  const ev = byId('searchEventSelect')?.value || '';
  const delBtn = byId('deleteEventBtn'); if (delBtn) delBtn.disabled = !ev;
});

// Ensure Delete Event button exists under Open button in Search tab
function ensureDeleteEventButton(){
  const container = byId('eventSearchForm') || byId('eventModal');
  if (!container) return;
  if (byId('deleteEventBtn')) return;
  const openBtn = byId('openEventBtn');
  const del = document.createElement('button');
  del.id = 'deleteEventBtn';
  del.textContent = 'Hapus Event';
  del.className = 'mt-2 w-full px-3 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50';
  del.disabled = true;
  if (openBtn && openBtn.parentElement){
    openBtn.parentElement.appendChild(del);
  } else {
    container.appendChild(del);
  }
  del.addEventListener('click', onDeleteSelectedEvent);
}

async function onDeleteSelectedEvent(){
  const d = byId('searchDateSelect')?.value || '';
  const ev = byId('searchEventSelect')?.value || '';
  if (!d || !ev) return;
  if (!confirm('Hapus event ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) return;
  try{
    showLoading('Menghapus event…');
    const { data: ud } = await sb.auth.getUser();
    if (!ud?.user){ alert('Silakan login terlebih dahulu.'); return; }
    const { data, error } = await sb.rpc('delete_event', { p_event_id: ev });
    if (error) throw error;
    const status = (data && data.status) || '';
    if (status !== 'deleted'){
      const msg = status==='forbidden' ? 'Anda bukan owner event ini.' : status==='not_found' ? 'Event tidak ditemukan.' : 'Gagal menghapus event.';
      showToast?.(msg, 'error');
      return;
    }
    showToast?.('Event dihapus.', 'success');
    // Reload penuh agar UI bersih dari sisa state
    try{ leaveEventMode?.(true); }catch{}
    window.location.reload();
  }catch(e){ console.error(e); showToast?.('Gagal menghapus event: ' + (e?.message||''), 'error'); }
  finally { hideLoading(); }
}

byId('btnLeaveEvent')?.addEventListener('click', ()=>{
  if (confirm('Keluar event dan hapus data lokal?')) {
    leaveEventMode(true);   // true = clear localStorage
    roundsByCourt[activeCourt] = [];
    markDirty(); renderAll();refreshFairness();
    window.location.reload(true);

  }
});

// Toggle visibility of Share/Undang and Keluar buttons based on event presence
function updateEventActionButtons(){
  const hasEvent = !!currentEventId;
  ['btnShareEvent','btnLeaveEvent'].forEach(id=>{
    const el = byId(id);
    if (el) el.classList.toggle('hidden', !hasEvent || isViewer());
  });
}



// Pastikan inisialisasi mode Cloud + Access selalu dipanggil saat load
document.addEventListener('DOMContentLoaded', async ()=>{
  try{ await handleAuthRedirect(); }catch{}
  try{ initCloudFromUrl?.(); }catch(e){ console.warn('initCloudFromUrl error', e); }
  try{ updateAuthUI?.(); }catch{}
  try{ ensureAuthButtons?.(); updateAuthUI?.(); }catch{}
  try{ refreshEventButtonLabel?.(); }catch{}
  try{ updateEventActionButtons?.(); }catch{}
  try{ renderFilterSummary?.(); }catch{}
  try{ ensureJoinControls?.(); refreshJoinUI?.(); }catch{}
  try{ ensureJoinOpenFields(); }catch{}
  try{ if (currentEventId) getPaidChannel(); }catch{}
  try{ if (currentEventId && window.sb) await loadJoinOpenFromDB(); }catch{}
  try{ refreshJoinUI?.(); }catch{}

});

document.addEventListener('DOMContentLoaded', boot);
