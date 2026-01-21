"use strict";

(function initFullscreenFeature() {
  const btn = document.getElementById('btnFullscreen');
  const wrap = document.getElementById('fsFloatingWrap');
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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
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

  // Handle click on button
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from triggering
    
    if (wrap.classList.contains('is-collapsed')) {
      // Restore if collapsed
      wrap.classList.remove('is-collapsed');
    } else {
      // Toggle FS if already visible
      toggleFullscreen();
    }
  });

  // Handle click outside to hide
  document.addEventListener('click', (e) => {
    // If clicking anywhere outside the wrap, hide it
    if (!wrap.contains(e.target)) {
      wrap.classList.add('is-collapsed');
    }
  });

  document.addEventListener('fullscreenchange', syncUI);
  
  // Initial sync
  syncUI();
})();
