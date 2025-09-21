"use strict";
// ===== Minor delta applier: hindari full render jika hanya 1 match yang berubah skornya
function applyMinorRoundDelta(newState){
  try{
    const nr = Array.isArray(newState?.roundsByCourt) ? newState.roundsByCourt : null;
    const or = Array.isArray(roundsByCourt) ? roundsByCourt : null;
    if (!nr || !or) return false;

    let diffCourt=-1, diffRound=-1, diffCount=0, allowedOnly=true;
    for (let c=0; c<Math.max(or.length, nr.length); c++){
      const oc = or[c] || []; const nc = nr[c] || [];
      const len = Math.max(oc.length, nc.length);
      for (let i=0;i<len;i++){
        const o = oc[i] || {}; const n = nc[i] || {};
        const sameTeams = (o.a1===n.a1 && o.a2===n.a2 && o.b1===n.b1 && o.b2===n.b2);
        if (!sameTeams) { allowedOnly=false; diffCount++; if (diffCount>1) break; continue; }
        const keys = ['scoreA','scoreB','startedAt','finishedAt'];
        const otherKeysChanged = Object.keys({...o, ...n}).some(k=>!keys.includes(k) && o[k]!==n[k]);
        if (otherKeysChanged) { allowedOnly=false; diffCount++; if (diffCount>1) break; continue; }
        const changed = (o.scoreA!==n.scoreA)||(o.scoreB!==n.scoreB)||(o.startedAt!==n.startedAt)||(o.finishedAt!==n.finishedAt);
        if (changed){ diffCount++; diffCourt=c; diffRound=i; }
        if (diffCount>1) break;
      }
      if (diffCount>1) break;
    }
    if (diffCount!==1 || !allowedOnly) return false;

    const n = (nr[diffCourt]||[])[diffRound] || {};
    const target = (roundsByCourt[diffCourt]||[])[diffRound];
    if (!target) return false;
    target.scoreA = (n.scoreA ?? '');
    target.scoreB = (n.scoreB ?? '');
    if ('startedAt' in n) target.startedAt = n.startedAt; else delete target.startedAt;
    if ('finishedAt' in n) target.finishedAt = n.finishedAt; else delete target.finishedAt;

    try{
      if (diffCourt === activeCourt){
        const row = document.querySelector('.rnd-table tbody tr[data-index="'+diffRound+'"]');
        const aInp = row?.querySelector('.rnd-scoreA input');
        const bInp = row?.querySelector('.rnd-scoreB input');
        if (aInp) aInp.value = String(target.scoreA||'');
        if (bInp) bInp.value = String(target.scoreB||'');
        const actions = row?.querySelector('.rnd-col-actions');
        const live = actions?.querySelector('.live-badge');
        const done = actions?.querySelector('.done-badge');
        const liveOn = !!(target.startedAt && !target.finishedAt);
        const doneOn = !!target.finishedAt;
        if (live) live.classList.toggle('hidden', !liveOn);
        if (done) done.classList.toggle('hidden', !doneOn);
        if (doneOn) { try{ updateNextStartButton(diffCourt, diffRound); }catch{} }
      }
    }catch{}

    try{
      const modal = byId('scoreModal');
      const isOpen = modal && !modal.classList.contains('hidden');
      if (isOpen && scoreCtx.court===diffCourt && scoreCtx.round===diffRound){
        scoreCtx.a = Number(target.scoreA||0);
        scoreCtx.b = Number(target.scoreB||0);
        byId('scoreAVal').textContent = scoreCtx.a;
        byId('scoreBVal').textContent = scoreCtx.b;
        const startBtn = byId('btnStartTimer');
        if (target.startedAt){ if (startBtn) startBtn.classList.add('hidden'); setScoreModalPreStart(false); }
        if (target.finishedAt){ setScoreModalLocked(true); const t = byId('scoreTimer'); if (t) t.textContent='Permainan Selesai'; }
      }
    }catch{}

    return true;
  }catch(e){ return false; }
}

// Minor delta for players list only: update players/waitingList without full payload
function applyMinorPlayersDelta(newState){
  try{
    const newPlayersArr = String(newState?.players||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const curPlayersArr = Array.isArray(players) ? players.slice() : [];
    const newWaitingArr = String(newState?.waitingList||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const curWaitingArr = Array.isArray(window.waitingList) ? window.waitingList.slice() : [];

    const roundsSame = JSON.stringify(newState?.roundsByCourt||[]) === JSON.stringify(roundsByCourt||[]);
    const playersChanged = JSON.stringify(newPlayersArr)!==JSON.stringify(curPlayersArr);
    const waitingChanged = JSON.stringify(newWaitingArr)!==JSON.stringify(curWaitingArr);
    if (!(playersChanged || waitingChanged)) return false;
    if (!roundsSame) return false; // kalau jadwal berubah, jangan pakai delta ringan

    // apply
    players.splice(0, players.length, ...newPlayersArr);
    if (!Array.isArray(window.waitingList)) window.waitingList = [];
    window.waitingList.splice(0, window.waitingList.length, ...newWaitingArr);

    // 🔧 NEW: sinkronkan playerMeta agar UID/atribut tidak hilang
    const newMeta = newState?.playerMeta;
    if (newMeta && typeof newMeta === 'object') {
      // ganti isi object tetap (jaga referensi)
      Object.keys(playerMeta).forEach(k => delete playerMeta[k]);
      Object.assign(playerMeta, newMeta);
    }

    // re-render list pemain saja (editor + viewer), hindari overlay
    try{ renderPlayersList?.(); }catch{}
    try{ renderViewerPlayersList?.(); }catch{}
    try{ renderHeaderChips?.(); }catch{}
    try{ refreshJoinUI?.(); }catch{}
    return true;
  }catch(e){ return false; }
}

// Highlight helper untuk menyorot pemain tertentu di daftar editor
function highlightPlayer(name){
  const norm = s => String(s||'').trim().toLowerCase();
  const list = byId('playersList');
  if (!list) return;
  const items = list.querySelectorAll('li');
  for (const li of items){
    const span = li.querySelector('.player-name');
    if (!span) continue;
    if (norm(span.textContent) === norm(name)){
      li.classList.add('ring-2','ring-amber-400');
      try{ li.scrollIntoView({ behavior:'smooth', block:'nearest' }); }catch{}
      setTimeout(()=>{ li.classList.remove('ring-2','ring-amber-400'); }, 1800);
      break;
    }
  }
}
