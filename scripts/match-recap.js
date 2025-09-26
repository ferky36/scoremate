"use strict";

// Match Recap: builds a quick summary from current UI/locals (no Supabase fetch)
(function(){
  function byId(id){ return document.getElementById(id); }

  function ensureRecapButton(){
    const standings = byId('standings');
    if (!standings) return;
    const hostSection = standings.closest('section') || standings.parentElement;
    if (!hostSection) return;

    if (byId('btnMatchRecap')) return; // already inserted

    const wrap = document.createElement('div');
    wrap.className = 'mt-4 flex items-center justify-end';

    const btn = document.createElement('button');
    btn.id = 'btnMatchRecap';
    btn.className = 'recap-btn';
    btn.textContent = 'Match Recap';
    btn.addEventListener('click', openRecapModal);
    wrap.appendChild(btn);

    hostSection.appendChild(wrap);
  }

  function openRecapModal(){
    const modal = buildModalShell();
    document.body.appendChild(modal.backdrop);
    modal.backdrop.offsetHeight; // force reflow for animation
    modal.backdrop.classList.add('open');

    const content = buildRecapContent();
    modal.content.innerHTML = '';
    modal.content.appendChild(content);
  }

  function closeRecapModal(){
    const el = byId('matchRecapOverlay');
    if (!el) return;
    el.classList.remove('open');
    setTimeout(()=> el.remove(), 150);
  }

  function buildModalShell(){
    const overlay = document.createElement('div');
    overlay.id = 'matchRecapOverlay';
    overlay.className = 'recap-overlay';

    const panel = document.createElement('div');
    panel.className = 'recap-panel';

    const header = document.createElement('div');
    header.className = 'recap-header';
    const title = document.createElement('div');
    title.className = 'recap-title';
    title.textContent = 'Match Recap';
    const actions = document.createElement('div');
    actions.className = 'recap-actions';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'recap-action';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', ()=> copyRecapText());
    const closeBtn = document.createElement('button');
    closeBtn.className = 'recap-action';
    closeBtn.textContent = 'Tutup';
    closeBtn.addEventListener('click', closeRecapModal);
    actions.appendChild(copyBtn);
    actions.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'recap-body';

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (e)=>{ if (e.target === overlay) closeRecapModal(); });

    return { backdrop: overlay, content: body };
  }

  function textFrom(el){ return (el?.textContent || '').trim(); }

  function buildRecapContent(){
    const root = document.createElement('div');

    // Header info
    const title = textFrom(byId('appTitle')) || 'Event';
    const date = textFrom(byId('chipDateText')) || '';
    const hdr = document.createElement('div');
    hdr.className = 'recap-hdr';
    hdr.innerHTML = `<div class="recap-hdr-title">${escapeHtml(title)}</div>` +
                    (date ? `<div class="recap-hdr-sub">${escapeHtml(date)}</div>` : '');
    root.appendChild(hdr);

    // Standings snapshot (from DOM table)
    const standingsEl = byId('standings');
    const standingRows = [...(standingsEl?.querySelectorAll('tbody tr') || [])];
    const standings = standingRows.map(tr => {
      const tds = [...tr.children].map(td => textFrom(td));
      // Rank, Pemain, Total, Diff, W, L, D, WinRate
      return { rank: tds[0], player: tds[1], total: tds[2], diff: tds[3], w: tds[4], l: tds[5], d: tds[6], wr: tds[7] };
    }).filter(x => x.player);

    // Matches snapshot (from in-memory roundsByCourt if available; fallback to visible table)
    const matches = collectMatches();

    // Quick summary
    const sum = document.createElement('div');
    sum.className = 'recap-summary';
    const top3 = standings.slice(0,3).map(s => `${s.rank}. ${s.player} (${s.total}, Δ${s.diff})`).join(' | ');
    sum.innerHTML = `
      <div><b>Total Match</b>: ${matches.length}</div>
      <div><b>Top 3</b>: ${escapeHtml(top3 || '-')}</div>`;
    root.appendChild(sum);

    // Match list
    const list = document.createElement('div');
    list.className = 'recap-list';
    if (!matches.length){
      list.innerHTML = '<div class="recap-empty">Belum ada skor yang tercatat.</div>';
    } else {
      matches.forEach(m => {
        const row = document.createElement('div');
        row.className = 'recap-item';
        const time = m.time ? `<span class="recap-time">${escapeHtml(m.time)}</span>` : '';
        row.innerHTML = `
          <div class="recap-line">
            <span class="recap-badge">Lap ${m.court}</span>
            <span class="recap-badge">Match ${m.round}</span>
            ${time}
          </div>
          <div class="recap-match">
            <span class="team-a">${escapeHtml(m.a1)} & ${escapeHtml(m.a2)}</span>
            <span class="vs">vs</span>
            <span class="team-b">${escapeHtml(m.b1)} & ${escapeHtml(m.b2)}</span>
            <span class="score">${m.sa}:${m.sb}</span>
          </div>`;
        list.appendChild(row);
      });
    }
    root.appendChild(list);

    return root;
  }

  function collectMatches(){
    const arr = [];
    try {
      if (Array.isArray(window.roundsByCourt)){
        window.roundsByCourt.forEach((courtArr, ci) => {
          (courtArr||[]).forEach((r, ri) => {
            if (!(r && r.a1 && r.a2 && r.b1 && r.b2)) return;
            const hasSa = r.scoreA !== undefined && r.scoreA !== null && r.scoreA !== '';
            const hasSb = r.scoreB !== undefined && r.scoreB !== null && r.scoreB !== '';
            if (!(hasSa || hasSb)) return;
            const timeStr = timeForRoundSafe(ri);
            arr.push({
              court: ci+1, round: ri+1, time: timeStr,
              a1: r.a1||'-', a2: r.a2||'-', b1: r.b1||'-', b2: r.b2||'-',
              sa: String(r.scoreA||0), sb: String(r.scoreB||0)
            });
          });
        });
        console.log(arr)
        return arr;
      }
    } catch {console.log('roundsByCourt read error');}

    // Fallback: parse visible table (active court only)
    try {
      const rows = document.querySelectorAll('.rnd-table tbody tr');
      rows.forEach((tr, idx) => {
        const sels = tr.querySelectorAll('select');
        const inps = tr.querySelectorAll('input[type="tel"]');
        if (sels.length >= 4 && inps.length >= 2){
          const [a1,a2,b1,b2] = [...sels].map(s => s.value || s.options[s.selectedIndex]?.text || '');
          const [sa,sb] = [...inps].map(i => i.value || '');
          if (a1 && a2 && b1 && b2 && (sa!=='' || sb!=='')){
            arr.push({ court: window.activeCourt? (Number(window.activeCourt)+1) : 1, round: idx+1, time: timeForRoundSafe(idx), a1,a2,b1,b2, sa:String(sa||0), sb:String(sb||0) });
          }
        }
      });
    } catch {}
    return arr;
  }

  function timeForRoundSafe(i){
    try {
      if (typeof window.roundStartTime === 'function' && typeof window.roundEndTime === 'function'){
        const t = `${window.roundStartTime(i)}–${window.roundEndTime(i)}`;
        return t;
      }
    } catch {}
    return '';
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function copyRecapText(){
    const title = (byId('appTitle')?.textContent||'Event').trim();
    const date = (byId('chipDateText')?.textContent||'').trim();
    const matches = collectMatches();
    const standings = [...(byId('standings')?.querySelectorAll('tbody tr')||[])].map(tr=>{
      const t = [...tr.children].map(td=>td.textContent.trim());
      return `${t[0]}. ${t[1]} | Total ${t[2]} | Δ${t[3]} | W${t[4]}-L${t[5]}-D${t[6]} | ${t[7]}`;
    });
    let out = `Match Recap — ${title}${date?` (${date})`:''}\n\n`;
    if (matches.length){
      out += `Matches (${matches.length})\n`;
      matches.forEach(m=>{ out += `Lap ${m.court} • Match ${m.round}${m.time?` • ${m.time}`:''} — ${m.a1} & ${m.a2} vs ${m.b1} & ${m.b2} → ${m.sa}:${m.sb}\n`; });
      out += `\n`;
    }
    if (standings.length){
      out += `Standings\n` + standings.join('\n') + `\n`;
    }
    try{ navigator.clipboard.writeText(out); }catch{
      const ta = document.createElement('textarea');
      ta.value = out; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch{} ta.remove();
    }
    try{ window.showToast?.('Recap disalin ke clipboard', 'success'); }catch{}
  }

  // Boot
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRecapButton);
  else ensureRecapButton();
})();

