// ===================================================
// js/renderers.js — Table & dashboard rendering
// ===================================================

// ── DASHBOARD SUMMARY TABLE ────────────────────────
function renderDashboard(mba, bba, eng, law) {
  const m = mba.find(d => String(d.spec).toUpperCase() === 'TOTAL' || d.spec === 'Overall MBA') || mba[0] || {};
  const b = bba.find(d => String(d.spec).toUpperCase().includes('TOTAL') || d.spec === 'Overall BBA') || bba[0] || {};
  const e = eng.find(d => String(d.spec).toUpperCase() === 'TOTAL' || d.spec.includes('Overall Engineering')) || eng[0] || {};
  const l = law.find(d => String(d.spec).toUpperCase() === 'TOTAL' || d.spec === 'Overall Law') || law[0] || {};

  const makeRow = (title, obj) => {
    if (!obj || obj.totalBatch === undefined) return '';
    return `<tr>
      <td><strong>${title}</strong></td><td>${pctBadge(obj.pct)}</td>
      <td>${fmt(obj.totalBatch)}</td><td>${fmt(obj.totalReg)}</td>
      <td>${fmt(obj.placed)}</td><td>${fmt(obj.eligNotPlaced)}</td>
      <td>${fmt(obj.notEligible)}</td><td>${fmt(obj.optedOut)}</td>
      <td>${fmt(obj.blocked)}</td>
    </tr>`;
  };

  const container = document.getElementById('dash-table');
  if (!container) return;

  if (!m.totalBatch && !b.totalBatch && !e.totalBatch && !l.totalBatch) {
    container.innerHTML = `<div class="error-state"><p>⚠️ No dashboard summary data found for ${currentYear}.</p></div>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead><tr>
        <th>Program</th><th>Placement %</th><th>Total Batch</th>
        <th>Registered</th><th>Placed</th><th>Eligible – Not Placed</th>
        <th>Not Eligible</th><th>Opted Out</th><th>Blocked</th>
      </tr></thead>
      <tbody>
        ${makeRow('MBA', m)}
        ${makeRow('BBA / B.Com', b)}
        ${makeRow('Engineering', e)}
        ${makeRow('Law', l)}
      </tbody>
    </table>`;
}

// ── GENERIC DATA TABLE ─────────────────────────────
function renderTable(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!rows || rows.length === 0) {
    el.innerHTML = `<div class="error-state"><p>⚠️ No data found for ${currentYear}.</p></div>`;
    return;
  }

  el.innerHTML = `
    <table>
      <thead><tr>
        <th>Program / Specialization</th><th>Placement %</th><th>Total Batch</th>
        <th>Total Reg</th><th>Placed</th><th>Eligible - Not Placed</th>
        <th>Not Eligible</th><th>Opted Out</th><th>Blocked</th>
      </tr></thead>
      <tbody>${rows.map((r, i) => `
        <tr class="${
          i === 0 ||
          r.spec.toUpperCase().includes('TOTAL') ||
          r.spec.toUpperCase().includes('OVERALL') ||
          r.spec === 'ASAC' ||
          r.spec === 'ASAE'
            ? 'total-row' : ''
        }">
          <td>${r.spec}</td><td>${pctBadge(r.pct)}</td>
          <td>${fmt(r.totalBatch)}</td><td>${fmt(r.totalReg)}</td>
          <td>${fmt(r.placed)}</td><td>${fmt(r.eligNotPlaced)}</td>
          <td>${fmt(r.notEligible)}</td><td>${fmt(r.optedOut)}</td>
          <td>${fmt(r.blocked)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ── ANNOUNCEMENTS TABLE ────────────────────────────
function renderAnnouncementsTable(objs) {
  const container = document.getElementById('announce-table-container');
  if (!objs || objs.length === 0) {
    container.innerHTML = `<div class="error-state"><p>No announcements found.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Date</th><th>School</th><th>Company Name</th><th>Primary Stream</th>
          <th>Job Title</th><th>CTC Max</th><th>Students Eligible</th><th>Students Applied</th>
        </tr></thead>
        <tbody>${objs.map(o => {
          const date     = o['announced date'] || o['added on'];
          const school   = o['school'] || '—';
          const comp     = o['company name'] || o['company'] || '—';
          const stream   = o['primary stream'] || '—';
          const role     = o['title'] || o['job title'] || '—';
          const ctc      = o['ctc maximum'] || o['average package offered'] || '—';
          const eligible = o['number of students eligible'] !== undefined && o['number of students eligible'] !== ''
            ? fmt(o['number of students eligible']) : '—';
          const applied  = o['number of students applied'] !== undefined && o['number of students applied'] !== ''
            ? fmt(o['number of students applied']) : '—';

          return `
          <tr>
            <td style="white-space:nowrap; color:var(--muted);">${formatDate(date)}</td>
            <td><span style="background:var(--row-alt); padding:4px 8px; border-radius:12px; font-size:0.85rem; font-weight:600; color:var(--navy);">${school}</span></td>
            <td style="color:var(--navy); font-weight:700;">${comp}</td>
            <td>${stream}</td><td>${role}</td>
            <td style="color:var(--teal-dark); font-weight:700;">${fmtCTC(ctc)}</td>
            <td style="text-align:center;">${eligible}</td><td style="text-align:center;">${applied}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>`;
}
