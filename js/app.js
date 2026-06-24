// ===================================================
// js/app.js — Tabs, year switcher & initialization
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── MAIN NAVIGATION TABS ────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // ── YEAR SWITCHER ───────────────────────────────
  const btn2025 = document.getElementById('btn-2025');
  const btn2026 = document.getElementById('btn-2026');

  function setActiveYear(activeBtn, inactiveBtn, year) {
    activeBtn.style.background = 'var(--teal)';
    activeBtn.style.color      = 'white';
    inactiveBtn.style.background = 'transparent';
    inactiveBtn.style.color      = 'var(--navy)';
    currentYear = year;
    processYearData();
  }

  if (btn2025 && btn2026) {
    btn2025.addEventListener('click', () => setActiveYear(btn2025, btn2026, '2025'));
    btn2026.addEventListener('click', () => setActiveYear(btn2026, btn2025, '2026'));
  }

  // ── INITIAL LOAD ────────────────────────────────
  loadExcelData();
  setInterval(loadExcelData, REFRESH_INTERVAL_MS);
});
