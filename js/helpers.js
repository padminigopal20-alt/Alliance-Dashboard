// ===================================================
// js/helpers.js — Formatting & utility functions
// ===================================================

// ── SAFE DATA EXTRACTORS ───────────────────────────
// Prevents crashes if Excel cells contain #DIV/0!, error objects, or uncomputed formulas
function safeVal(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return '0'; // catches #DIV/0! error objects from xlsx.js
  let str = String(val).trim();
  if (str === '' || str === ' ') return ''; // IFERROR(..., " ") returns a space
  if (str.toLowerCase() === 'nan' || str.includes('#') || str.toLowerCase().includes('div')) return '0';
  if (str.startsWith('=')) return '0'; // unresolved cross-workbook formula
  return str;
}

function safePct(val) {
  const s = safeVal(val).replace(/[,%]/g, '').trim();
  if (s === '' || isNaN(parseFloat(s))) return '0';
  return s;
}

// ── VALUE FORMATTERS ───────────────────────────────
function num(v)    { const n = parseFloat(String(v || '').replace(/[,%]/g, '')); return isNaN(n) ? 0 : n; }
function fmt(v)    { const n = num(v); return n ? n.toLocaleString('en-IN') : '0'; }
function fmtCTC(v) { const n = num(v); return n ? '₹' + n.toLocaleString('en-IN') : '—'; }

function pctBadge(v) {
  const n = parseFloat(String(v || '').replace(/[,%]/g, ''));
  if (isNaN(n)) return `<span style="color:#64748b">—</span>`;
  const cls = n >= 85 ? 'pct-high' : n >= 70 ? 'pct-mid' : 'pct-low';
  return `<span class="pct-badge ${cls}">${n.toFixed(1)}%</span>`;
}

function formatDate(dateStr) {
  if (!dateStr || String(dateStr).trim() === '') return '—';
  if (!isNaN(dateStr) && typeof dateStr === 'number') {
    const d = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr).split(' ')[0];
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── UI STATE HELPERS ───────────────────────────────
function setLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="error-state"><p>⚠️ ${msg}</p></div>`;
}

function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) el.innerHTML = `<span style="color:var(--teal)">✓</span> Live · Updated ` +
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}