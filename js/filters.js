// ===================================================
// js/filters.js — Filter UI initialization
// ===================================================

// ── MBA FILTERS ────────────────────────────────────
function initMBAFilters(mbaData) {
  globalMBAData = mbaData;
  const container = document.getElementById('mba-filters');
  if (!container) return;

  if (mbaData.length === 0) {
    container.innerHTML = '';
    renderTable('mba-table', []);
    return;
  }

  let cohorts = [...new Set(mbaData.map(d => d.cohort))].filter(c => c !== 'Overall MBA');

  container.innerHTML = `
    <div class="filter-group">
      <span class="filter-label">Filter by MBA Branch</span>
      <div class="filter-buttons">
        <button class="filter-btn active" data-cohort="Overall MBA">Overall MBA</button>
        ${cohorts.map(c => `<button class="filter-btn" data-cohort="${c}">${c}</button>`).join('')}
      </div>
    </div>`;

  const btns = container.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const selected = e.target.dataset.cohort;
      renderTable('mba-table', selected === 'Overall MBA'
        ? globalMBAData
        : globalMBAData.filter(d => d.cohort === selected)
      );
    });
  });

  renderTable('mba-table', globalMBAData);
}

// ── ENGINEERING FILTERS ────────────────────────────
function initEngFilters(engData) {
  globalEngData = engData;
  const container = document.getElementById('eng-filters');
  if (!container) return;

  if (engData.length === 0) {
    container.innerHTML = '';
    renderTable('eng-table', []);
    return;
  }

  let cohorts = [...new Set(engData.map(d => d.cohort))].filter(c => c !== 'Overall Engineering');

  container.innerHTML = `
    <div class="filter-group">
      <span class="filter-label">Filter by Engineering Branch</span>
      <div class="filter-buttons">
        <button class="filter-btn active" data-cohort="Overall Engineering">Overall Engineering</button>
        ${cohorts.map(c => `<button class="filter-btn" data-cohort="${c}">${c}</button>`).join('')}
      </div>
    </div>`;

  const btns = container.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const selected = e.target.dataset.cohort;
      renderTable('eng-table', selected === 'Overall Engineering'
        ? globalEngData
        : globalEngData.filter(d => d.cohort === selected)
      );
    });
  });

  renderTable('eng-table', globalEngData);
}

// ── ANNOUNCEMENTS FILTERS ──────────────────────────
function initAnnouncementFilters(rows) {
  const container = document.getElementById('announce-container');
  if (!container) return;

  if (!rows || rows.length < 2) {
    container.innerHTML = `<div class="error-state"><p>⚠️ No announcements data found for ${currentYear}.</p></div>`;
    return;
  }

  const hdr  = rows[0].map(h => String(h || '').toLowerCase().trim());
  const data = rows.slice(1).filter(r => r.some(c => String(c || '').trim() !== ''));

  globalAnnouncementsData = data.map(r => {
    let obj = {};
    hdr.forEach((h, i) => obj[h] = r[i]);
    obj['calculated_week'] = obj['week days'] || obj['week'] || 'Recent';
    return obj;
  });

  let weeks = [...new Set(globalAnnouncementsData.map(d => String(d['calculated_week']).trim()))];
  weeks = weeks.filter(w => w !== '' && w !== 'undefined' && w !== 'Recent');
  weeks.sort((a, b) => new Date(b.split(' to ')[0]) - new Date(a.split(' to ')[0]));

  const emptyState = `
    <div class="loading-state" style="padding: 60px 20px; background: var(--card); border-radius: 10px; border: 1px dashed var(--border);">
      <p style="font-size: 1.1rem; color: var(--navy); font-weight: 600;">☝️ Please select a week from the dropdown</p>
    </div>`;

  container.innerHTML = `
    <div class="filter-group" style="margin-bottom: 20px;">
      <label for="week-select" class="filter-label" style="display:block; margin-bottom:8px; font-weight:600; color:var(--navy);">
        Select Week to View Announcements
      </label>
      <select id="week-select" class="filter-btn" style="padding: 10px; width: 100%; max-width: 400px; cursor: pointer; border-radius: 6px; border: 1px solid var(--border);">
        <option value="">-- Choose a week --</option>
        ${weeks.map(w => `<option value="${w}">${w}</option>`).join('')}
      </select>
    </div>
    <div id="announce-table-container">${emptyState}</div>`;

  container.querySelector('#week-select').addEventListener('change', (e) => {
    if (e.target.value) {
      const filtered = globalAnnouncementsData
        .filter(d => String(d['calculated_week']).trim() === e.target.value)
        .sort((a, b) => new Date(b['announced date'] || 0) - new Date(a['announced date'] || 0));
      renderAnnouncementsTable(filtered);
    } else {
      document.getElementById('announce-table-container').innerHTML = emptyState;
    }
  });
}
