"use strict";

(function initFullscreenFeature() {
  const btn = document.getElementById('btnFullscreen');
  if (!btn) return;

  const iconExpand = document.getElementById('fsIconExpand');
  const iconCompress = document.getElementById('fsIconCompress');
  
  let wlSentinel = null;
  let lastFSState = false; // Track state to prevent multiple toasts

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
    
    // Update Icons
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

    // Only trigger effects if state changed
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
  document.addEventListener('fullscreenchange', syncUI);
  
  // Initial sync
  syncUI();
})();
