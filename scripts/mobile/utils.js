"use strict";
/**
 * Mobile Navigation - Utility Functions
 * Helper functions for mobile navigation and UI management
 */

/**
 * Check if current viewport is mobile
 * @returns {boolean} True if mobile (max-width: 640px)
 */
export function isMobile() {
  return window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
}

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function byId(id) {
  return document.getElementById(id);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Toggle element visibility
 * @param {HTMLElement} el - Element to toggle
 * @param {boolean} show - True to show, false to hide
 */
export function toggle(el, show) {
  if (!el) return;
  el.classList.toggle('hidden', !show);
}

/**
 * Check if event data exists
 * @returns {boolean} True if event data exists
 */
export function hasEventData() {
  try {
    if (typeof window.currentEventId !== 'undefined' && window.currentEventId) return true;
    if (Array.isArray(window.players) && window.players.length > 0) return true;
    const cc = document.getElementById('courtContainer');
    if (cc && cc.children.length > 0) return true;
    const sb = document.querySelector('#standings tbody');
    if (sb && sb.children.length > 0) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if cashflow is allowed for current user
 * @returns {boolean} True if cashflow is allowed
 */
export function isCashflowAllowed() {
  try {
    // Check for global override first
    if (typeof window.isCashflowAllowed === 'function') {
      return window.isCashflowAllowed();
    }
    
    const loggedIn = !!window.__hasUser;
    const ownerNow = (typeof window.isOwnerNow === 'function') ? window.isOwnerNow() : !!window._isOwnerUser;
    const cashAdmin = !!window._isCashAdmin;
    const allow = loggedIn && (ownerNow || cashAdmin);
    const inCloud = (typeof window.isCloudMode === 'function' && window.isCloudMode());
    const hasEvent = (typeof window.currentEventId !== 'undefined' && !!window.currentEventId);
    
    return !!(allow && inCloud && hasEvent);
  } catch {
    return false;
  }
}

/**
 * Inject mobile-specific styles for klasemen (standings)
 */
export function injectMobileKlasemenStyles() {
  try {
    const existingStyle = document.getElementById('mobile-klasemen-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'mobile-klasemen-styles';
    style.textContent = `
      @media (max-width: 640px) {
        #standings table { font-size: 0.875rem; }
        #standings th, #standings td { padding: 0.5rem 0.25rem; }
        #standings .player-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      }
    `;
    document.head.appendChild(style);
  } catch (err) {
    console.warn('Failed to inject mobile klasemen styles', err);
  }
}

/**
 * Enhance standings table for mobile view
 */
export function enhanceStandingsMobile() {
  try {
    const table = document.querySelector('#standings table');
    if (!table) return;
    
    // Add mobile-friendly classes
    table.classList.add('text-sm');
    
    // Ensure table is scrollable horizontally if needed
    const container = table.closest('div');
    if (container) {
      container.classList.add('overflow-x-auto');
    }
  } catch (err) {
    console.warn('Failed to enhance standings for mobile', err);
  }
}

/**
 * Watch for event switch and reset tab to default
 */
export function watchEventSwitchResetTab() {
  try {
    let prevEventId = window.currentEvent?.id;
    
    const checkEventSwitch = () => {
      const currentEventId = window.currentEvent?.id;
      if (currentEventId && currentEventId !== prevEventId) {
        prevEventId = currentEventId;
        // Reset to jadwal tab
        if (typeof window.reapplyMobileTab === 'function') {
          // Use reapply if available
          const selectFn = window.__mobileSelectTab;
          if (selectFn) selectFn('jadwal');
        }
      }
    };
    
    // Check periodically
    setInterval(checkEventSwitch, 1000);
    
    // Also listen to custom events if available
    window.addEventListener('event:switched', checkEventSwitch);
    window.addEventListener('event:loaded', checkEventSwitch);
  } catch (err) {
    console.warn('Failed to setup event switch watcher', err);
  }
}

/**
 * Refresh tab labels (for i18n)
 * @param {Function} t - Translation function
 */
export function refreshTabLabels(t) {
  if (!t) {
    t = window.__i18n_get ? window.__i18n_get : (k, f) => f;
  }
  
  try {
    const tabs = {
      'tab-jadwal': t('mobile.tab.jadwal', 'Jadwal'),
      'tab-klasemen': t('mobile.tab.klasemen', 'Klasemen'),
      'tab-recap': t('mobile.tab.recap', 'Recap'),
      'tab-insight': t('mobile.tab.insight', 'Insight'),
      'tab-kas': t('mobile.tab.kas', 'Cashflow')
    };
    
    Object.entries(tabs).forEach(([id, label]) => {
      const btn = document.getElementById(id);
      if (btn) {
        const labelEl = btn.querySelector('.mobtab-label');
        if (labelEl) labelEl.textContent = label;
      }
    });
  } catch (err) {
    console.warn('Failed to refresh tab labels', err);
  }
}
