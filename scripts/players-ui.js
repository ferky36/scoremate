"use strict";
// ================== PLAYERS UI ================== //
function escapeHtml(s) {
  return s.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        c
      ])
  );
}
function renderPlayersList() {
  const ul = byId("playersList");
  ul.innerHTML = "";
  players.forEach((name, idx) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-700";
    li.innerHTML =
      "<span class='player-name flex-1'>" +
      escapeHtml(name) +
      "</span><button class='del text-red-600 hover:underline text-xs'>hapus</button>";
      // === meta mini controls (gender + level)
      const meta = playerMeta[name] || { gender:'', level:'' };

      // gender select
      const gSel = document.createElement('select');
      gSel.className = 'player-meta border rounded px-1 py-0.5 text-xs dark:bg-gray-900 dark:border-gray-700';
      ['','M','F'].forEach(v => gSel.appendChild(new Option(v || '-Pilih Gender-', v)));
      gSel.value = meta.gender || '';
      gSel.disabled = isViewer();
      gSel.onchange = () => {
        playerMeta[name] = { ...playerMeta[name], gender: gSel.value };
        markDirty();
        validateNames();    // << tambah ini
      };

      // level select
      const lSel = document.createElement('select');
      lSel.className = 'player-meta border rounded px-1 py-0.5 text-xs dark:bg-gray-900 dark:border-gray-700';
      [['','-Pilih Level-'], ['beg','Beginner'], ['pro','Pro']]
        .forEach(([v,t]) => lSel.add(new Option(t, v)));
      lSel.value = meta.level || '';
      lSel.disabled = isViewer();
      lSel.onchange = () => {
        playerMeta[name] = { ...playerMeta[name], level: lSel.value };
        markDirty();
        validateNames();    // << tambah ini
      };

      // sisipkan di antara nama & tombol hapus
      const nameSpan = li.querySelector('.player-name');
      const delBtn   = li.querySelector('.del');
      if (isViewer()) delBtn.style.display = 'none';
      // Tombol toggle "Paid" (khusus editor)
      const pBtn = document.createElement('button');
      function _refreshPaidBtn(){
        const paid = isPlayerPaid(name);
        pBtn.className = 'px-2 py-0.5 text-xs rounded border flex items-center gap-1 ' +
                        (paid ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-transparent border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300');
        pBtn.title = paid ? 'Tandai belum bayar' : 'Tandai sudah bayar';
        pBtn.innerHTML = (paid ? '✓ ' : '') + 'Paid';
      }
      pBtn.addEventListener('click', () => {
        if (isViewer()) return;              // safety
        togglePlayerPaid(name);
        _refreshPaidBtn();
      });
      if (isViewer()) pBtn.style.display = 'none';
      _refreshPaidBtn();

      nameSpan.after(gSel, lSel, pBtn);


    li.querySelector(".del").addEventListener("click", () => {
      if (!confirm("Hapus " + name + "?")) return;
      players.splice(idx, 1);
      removePlayerFromRounds(name);
      delete playerMeta[name];
      try{
        const promoted = autoPromoteIfSlot?.();
        if (promoted) replaceNameInRounds(name, promoted);
      }catch{}
      markDirty();
      renderPlayersList();
      renderAll();
      validateNames();
      try{ maybeAutoSaveCloud(); }catch{}
    });
    ul.appendChild(li);
  });
  byId("globalInfo").textContent =
    "Pemain: " +
    players.length +
    " | Match/lapangan: " +
    (byId("roundCount").value || 10) +
    " | Menit/ronde: " +
    (byId("minutesPerRound").value || 12);
  try { if (isViewer()) renderViewerPlayersList?.(); } catch {}
  try{ renderHeaderChips(); }catch{}
  // render waiting list (editor panel)
  try {
    let wrap = byId('waitingListWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'waitingListWrap';
      wrap.className = 'mt-3';
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between mb-1';
      const h = document.createElement('div');
      h.className = 'text-xs font-semibold text-gray-600 dark:text-gray-300';
      h.textContent = 'Waiting List';
      const btnAll = document.createElement('button');
      btnAll.id = 'btnPromoteAllWL';
      btnAll.className = 'px-2 py-0.5 text-xs rounded bg-emerald-600 text-white hidden';
      btnAll.textContent = 'Promote semua';
      btnAll.addEventListener('click', promoteAllFromWaiting);
      header.append(h, btnAll);
      const ulw = document.createElement('ul');
      ulw.id = 'waitingList';
      ulw.className = 'min-h-[32px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2';
      wrap.append(header, ulw);
      const container = byId('playerListContainer')?.parentElement || byId('playersPanel');
      container && container.appendChild(wrap);
    }
    // toggle button visibility for editor only
    const btnAll = byId('btnPromoteAllWL');
    if (btnAll) btnAll.classList.toggle('hidden', isViewer());
    const ulw = byId('waitingList');
    if (ulw) {
      ulw.innerHTML = '';
      (waitingList||[]).forEach((name) => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-700';
        const meta = playerMeta[name] || { gender:'', level:'' };
        const badge = (txt, cls) => `<span class="text-[10px] px-1.5 py-0.5 rounded ${cls}">${escapeHtml(String(txt))}</span>`;
        const g = meta.gender||''; const lv = meta.level||'';
        const badges = [ g?badge(g,'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'):'' , lv?badge(lv,'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'):'' ].filter(Boolean).join('');
        li.innerHTML = `<span class='flex-1'>${escapeHtml(name)}</span><span class='flex gap-1'>${badges}</span>`;
        if (!isViewer()){
          const promote = document.createElement('button');
          promote.className = 'px-2 py-0.5 text-xs rounded bg-emerald-600 text-white flex items-center gap-1';
          promote.title = 'Promote dari waiting list';
          promote.innerHTML = `
            <span class="sm:hidden" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M5 15l7-7 7 7" />
              </svg>
            </span>
            <span class="hidden sm:inline">Promote</span>`;
          promote.addEventListener('click', ()=> promoteFromWaiting(name));
          const del = document.createElement('button');
          del.className = 'px-2 py-0.5 text-xs rounded border dark:border-gray-700 flex items-center gap-1';
          del.title = 'Hapus dari waiting list';
          del.innerHTML = `
            <span class="sm:hidden" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 10v8M14 10v8" />
              </svg>
            </span>
            <span class="hidden sm:inline">hapus</span>`;
          del.addEventListener('click', ()=> removeFromWaiting(name));
          li.appendChild(promote);
          li.appendChild(del);
        }
        ulw.appendChild(li);
      });
    }
  } catch {}
}
// Ensure a viewer-only players panel exists; return wrapper element
function ensureViewerPlayersPanel(){
  let wrap = byId('viewerPlayersWrap');
  if (wrap) return wrap;
  const globalInfo = byId('globalInfo');
  const parent = globalInfo ? globalInfo.parentElement : document.querySelector('main section');
  if (!parent) return null;
  wrap = document.createElement('div');
  wrap.id = 'viewerPlayersWrap';
  wrap.className = 'mt-4 hidden';
  const h3 = document.createElement('h3');
  h3.className = 'text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2';
  h3.textContent = 'Daftar Pemain';
  const ul = document.createElement('ul');
  ul.id = 'viewerPlayersList';
  ul.className = 'min-h-[44px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2';
  // waiting list holder (created later if needed)
  wrap.append(h3, ul);
  parent.appendChild(wrap);
  return wrap;
}
