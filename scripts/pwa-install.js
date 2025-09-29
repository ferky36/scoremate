"use strict";
// Lightweight PWA installer (no changes to existing code required to live here).
// To enable: link manifest in <head> and include this script near the end of <body>.
// See usage notes in the PR message.
(function(){
  function byId(id){ return document.getElementById(id); }

  // Register service worker (optional but required for install prompt in Chrome)
  function registerSW(){
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }

  // UI: floating install prompt button
  function ensureInstallButton(){
    if (byId('pwaInstallBtn')) return;
    const btn = document.createElement('button');
    btn.id='pwaInstallBtn';
    btn.textContent='Install App';
    btn.style.cssText = [
      'position:fixed','right:14px','bottom:16px','z-index:70',
      'padding:10px 14px','border-radius:12px',
      'background:#16a34a','color:#fff','border:none','box-shadow:0 8px 20px rgba(0,0,0,.2)',
      'font-weight:700','cursor:pointer','display:none'
    ].join(';');
    btn.addEventListener('click', async ()=>{
      if (!window.__deferredPrompt) return;
      btn.disabled = true;
      try{
        window.__deferredPrompt.prompt();
        const choice = await window.__deferredPrompt.userChoice;
        if (choice?.outcome !== 'accepted') btn.disabled = false;
        window.__deferredPrompt = null;
        btn.style.display='none';
      }catch{ btn.disabled=false; }
    });
    document.body.appendChild(btn);
    return btn;
  }

  function wireHeaderButton(){
    let hdrBtn = byId('btnInstallAppHdr');
    if (!hdrBtn){
      const chips = byId('hdrChips');
      if (chips){
        // Sanitize any malformed leftover text/markup from previous injections
        try {
          [...chips.childNodes].forEach(n=>{
            if (n && n.nodeType===3 && /Install App/i.test(n.textContent||'')) n.remove();
            if (n && n.nodeType===1 && typeof n.id==='string' && /InstallAppHdr/i.test(n.id) && !/^btnInstallAppHdr$/.test(n.id)) n.remove();
          });
        } catch {}
        hdrBtn = document.createElement('button');
        hdrBtn.id = 'btnInstallAppHdr';
        hdrBtn.className = 'hidden px-3 py-2 rounded-xl bg-white/20 text-white font-semibold shadow hover:bg-white/30';
        hdrBtn.title = 'Install aplikasi ke perangkat';
        hdrBtn.textContent = 'Install App';
        chips.appendChild(hdrBtn);
      }
    }
    if (!hdrBtn) return;
    hdrBtn.addEventListener('click', async ()=>{
      if (!window.__deferredPrompt) return;
      try{
        await window.__deferredPrompt.prompt();
        const choice = await window.__deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') { hdrBtn.classList.add('hidden'); window.__deferredPrompt=null; }
      }catch{}
    });
  }

  // iOS standalone detection
  const isStandalone = () => window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  function showHelpOverlay(){
    const old = byId('pwaHelpOverlay'); if (old) old.remove();
    const wrap = document.createElement('div'); wrap.id='pwaHelpOverlay';
    wrap.style.cssText='position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.45)';
    const panel = document.createElement('div');
    panel.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:520px;width:92%;background:#0f172a;color:#e5e7eb;border:1px solid #334155;border-radius:16px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.3)';
    const ua = (navigator.userAgent||'').toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    let html = '<div style="font-weight:700;margin-bottom:6px">Install ke Perangkat</div>';
    if (isiOS){
      html += '<div>Di iOS Safari: buka ikon <b>Share</b>, lalu pilih <b>Add to Home Screen</b>.</div>';
    } else if (isAndroid){
      html += '<div>Di Chrome Android: buka menu <b>⋮</b>, pilih <b>Install app</b> atau <b>Add to Home screen</b>.</div>';
    } else {
      html += '<div>Buka menu browser dan pilih <b>Install app</b> / <b>Add to Home screen</b>.</div>';
    }
    const btn = document.createElement('button'); btn.textContent='Tutup';
    btn.style.cssText='margin-top:10px;padding:6px 10px;border:1px solid #475569;background:transparent;color:#e5e7eb;border-radius:10px';
    btn.onclick = ()=> wrap.remove();
    panel.innerHTML = html; panel.appendChild(btn); wrap.appendChild(panel); document.body.appendChild(wrap);
  }

  function setupInstallFlow(){
    // Hide in standalone mode
    const btn = ensureInstallButton();
    if (isStandalone()) {
      btn.style.display='none';
      const hb0 = byId('btnInstallAppHdr'); if (hb0) hb0.classList.add('hidden');
      return;
    }

    window.addEventListener('beforeinstallprompt', (e)=>{
      e.preventDefault();
      window.__deferredPrompt = e;
      const b = ensureInstallButton();
      b.style.display='inline-block';
      const hdrBtn = byId('btnInstallAppHdr'); if (hdrBtn) hdrBtn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', ()=>{
      const b = byId('pwaInstallBtn'); if (b) b.style.display='none';
      const hb = byId('btnInstallAppHdr'); if (hb) hb.classList.add('hidden');
      window.__deferredPrompt = null;
    });

    // iOS tip (no beforeinstallprompt). Show a subtle tip only once.
    try{
      const ua = navigator.userAgent || '';
      const isiOS = /iphone|ipad|ipod/i.test(ua);
      const inSafari = /safari/i.test(ua) && !/crios|fxios/i.test(ua);
      if (isiOS && inSafari && !isStandalone() && !localStorage.getItem('pwaTipShown')){
        const tip = document.createElement('div');
        tip.id='pwaInstallTip';
        tip.style.cssText = 'position:fixed;left:10px;right:10px;bottom:14px;z-index:70;background:#0f172a;color:#e5e7eb;border:1px solid #334155;padding:10px 12px;border-radius:12px;font-size:13px;box-shadow:0 8px 20px rgba(0,0,0,.2)';
        tip.innerHTML = 'Untuk memasang aplikasi: buka menu Share, lalu pilih <b>Add to Home Screen</b>.';
        const close = document.createElement('button');
        close.textContent='Tutup';
        close.style.cssText='margin-left:8px;padding:4px 8px;border:1px solid #475569;background:transparent;color:#e5e7eb;border-radius:8px;float:right';
        close.onclick = ()=>{ tip.remove(); localStorage.setItem('pwaTipShown','1'); };
        tip.appendChild(close); document.body.appendChild(tip);
      }
    }catch{}
  }

  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ registerSW(); wireHeaderButton(); setupInstallFlow();
      const hb = byId('btnInstallAppHdr'); if (hb) hb.addEventListener('click', ()=>{ if (!window.__deferredPrompt) showHelpOverlay(); });
    });
  } else { registerSW(); wireHeaderButton(); setupInstallFlow(); const hb = byId('btnInstallAppHdr'); if (hb) { hb.addEventListener('click', ()=>{ if (!window.__deferredPrompt) showHelpOverlay(); }); } }
})();
