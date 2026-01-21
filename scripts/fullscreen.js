"use strict";

(function initFullscreenFeature() {
  const btn = document.getElementById('btnFullscreen');
  const wrap = document.getElementById('fsFloatingWrap');
  const btnHide = document.getElementById('btnHideFsToggle');
  if (!btn || !wrap) return;

  const iconExpand = document.getElementById('fsIconExpand');
  const iconCompress = document.getElementById('fsIconCompress');
  
  let wlSentinel = null;
  let lastFSState = false;

  async function requestWL() {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wlSentinel) return; 
      wlSentinel = await navigator.wakeLock.request('screen');
      wlSentinel.addEventListener('release', () => { wlSentinel = null; });
    } catch (err) { console.warn('WL fail:', err); }
  }

  async function releaseWL() {
    if (wlSentinel) {
      await wlSentinel.release();
      wlSentinel = null;
    }
  }

  function toggleFullscreen() {
    // If collapsed, clicking the handle should restore it instead of toggling FS
    if (wrap.classList.contains('is-collapsed')) {
      restoreToggle();
      return;
    }

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  function hideToggle(e) {
    if (e) e.stopPropagation();
    wrap.classList.add('is-collapsed');
    if (btnHide) btnHide.classList.add('hidden');
  }

  function restoreToggle() {
    wrap.classList.remove('is-collapsed');
    if (btnHide) btnHide.classList.remove('hidden');
  }

  function syncUI() {
    const isFS = !!document.fullscreenElement;
    if (iconExpand) iconExpand.classList.toggle('hidden', isFS);
    if (iconCompress) iconCompress.classList.toggle('hidden', !isFS);
    
    // Update Tooltip
    const labelKey = isFS ? 'header.exitFullscreen' : 'header.fullscreen';
    const fallback = isFS ? 'Exit Fullscreen' : 'Fullscreen';
    if (typeof t === 'function') {
      btn.title = t(labelKey, fallback);
    } else if (window.__i18n_get) {
      btn.title = __i18n_get(labelKey, fallback);
    }

    if (isFS !== lastFSState) {
      lastFSState = isFS;
      if (isFS) {
        requestWL();
        if (typeof showToast === 'function') {
          showToast(t?.('header.fullscreen', 'Layar Penuh') || 'Layar Penuh', 'info');
        }
      } else {
        releaseWL();
      }
    }
  }

  btn.addEventListener('click', toggleFullscreen);
  btnHide?.addEventListener('click', hideToggle);
  document.addEventListener('fullscreenchange', syncUI);
  
  // Hover effect to show hide button
  wrap.addEventListener('mouseenter', () => {
    if (!wrap.classList.contains('is-collapsed') && btnHide) {
      btnHide.style.opacity = '1';
    }
  });
  wrap.addEventListener('mouseleave', () => {
    if (btnHide) btnHide.style.opacity = '0';
  });

  syncUI();
})();
