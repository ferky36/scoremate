"use strict";
/**
 * Cashflow - Utility Functions
 * Helper functions for cashflow data management and formatting
 */

/**
 * Format number as Indonesian Rupiah currency
 * @param {number} n - Number to format
 * @returns {string} Formatted currency string
 */
export function fmtIDR(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(n || 0));
}

/**
 * Format date to Indonesian locale
 * @param {string|Date} raw - Date to format (DD/MM/YYYY, YYYY-MM-DD, or ISO)
 * @returns {string} Formatted date string (e.g., "Senin, 06 Januari 2026")
 */
export function fmtDateID(raw) {
  try {
    if (!raw) return '';
    let s = String(raw).trim();
    
    // Accept DD/MM/YYYY or YYYY-MM-DD or ISO
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split('/');
      s = `${y}-${m}-${d}`;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      // already ISO date
    } else if (!isNaN(Date.parse(s))) {
      const d = new Date(s);
      s = d.toISOString().slice(0, 10);
    }
    
    return new Date(s + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return String(raw || '');
  }
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
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function byId(id) {
  return document.getElementById(id);
}

/**
 * Query selector
 * @param {string} s - Selector string
 * @param {HTMLElement|Document} r - Root element (default: document)
 * @returns {HTMLElement|null}
 */
export function qs(s, r = document) {
  return r.querySelector(s);
}

/**
 * Query selector all
 * @param {string} s - Selector string
 * @param {HTMLElement|Document} r - Root element (default: document)
 * @returns {Array<HTMLElement>}
 */
export function qsa(s, r = document) {
  return Array.from(r.querySelectorAll(s));
}

/**
 * Calculate sum of cashflow items
 * @param {Array<Object>} list - List of cashflow items
 * @returns {number} Total sum
 */
export function sum(list) {
  return list.reduce((s, it) => s + (Number(it.amount || 0) * Number(it.pax || 1)), 0);
}

/**
 * Generate unique ID for cashflow item
 * @returns {string} Unique ID
 */
export function generateId() {
  return `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate cashflow item
 * @param {Object} item - Cashflow item to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array<string> }
 */
export function validateCashflowItem(item) {
  const errors = [];
  
  if (!item.label || !item.label.trim()) {
    errors.push('Label tidak boleh kosong');
  }
  
  if (!item.amount || Number(item.amount) <= 0) {
    errors.push('Amount harus lebih dari 0');
  }
  
  if (!item.pax || Number(item.pax) <= 0) {
    errors.push('Pax harus lebih dari 0');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sort cashflow items by date
 * @param {Array<Object>} items - Items to sort
 * @param {boolean} ascending - Sort order (default: true)
 * @returns {Array<Object>} Sorted items
 */
export function sortByDate(items, ascending = true) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date || a.eventDate || 0);
    const dateB = new Date(b.date || b.eventDate || 0);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Group cashflow items by event
 * @param {Array<Object>} masuk - Income items
 * @param {Array<Object>} keluar - Expense items
 * @returns {Array<Object>} Grouped events
 */
export function groupByEvent(masuk, keluar) {
  const map = new Map();
  
  const add = (it) => {
    const id = it.event_id || it.eventId || `${it.eventTitle}|${it.eventDate}`;
    if (!map.has(id)) {
      map.set(id, {
        title: it.eventTitle || '',
        date: it.eventDate || '',
        masuk: [],
        keluar: []
      });
    }
    const ent = map.get(id);
    (it.kind === 'keluar' ? ent.keluar : ent.masuk).push(it);
  };
  
  (masuk || []).forEach(add);
  (keluar || []).forEach(add);
  
  // Sort by date ascending
  return [...map.values()].sort((a, b) => 
    String(a.date).localeCompare(String(b.date))
  );
}

/**
 * Calculate balance (income - expense)
 * @param {number} income - Total income
 * @param {number} expense - Total expense
 * @returns {number} Balance
 */
export function calculateBalance(income, expense) {
  return Number(income || 0) - Number(expense || 0);
}
