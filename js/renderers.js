// ===================================================
// js/renderers.js — Table & dashboard rendering
// ===================================================

// ── DASHBOARD SUMMARY TABLE ────────────────────────
// ── DASHBOARD SUMMARY TABLE ────────────────────────
function renderDashboard(mba, bba, eng, law) {
  const m = mba.find(d => String(d.spec).toUpperCase() === 'TOTAL' || d.spec === 'Overall MBA') || mba[0] || {};
  const b = bba.find(d => String(d.spec).toUpperCase().includes('TOTAL') || d.spec === 'Overall BBA') || bba[0] || {};
  const e = eng.find(d => String(d.spec).toUpperCase() === 'TOTAL' || d.spec.includes('Overall Engineering')) || eng[0] || {};
  const l = law.find(d => String(d.spec).toUpperCase() === 'TOTAL' || d.spec === 'Overall Law') || law[0] || {};

  // 1. Group the overall summaries into an array
  const summaries = [
    { title: 'MBA', data: m },
    { title: 'BBA / B.Com', data: b },
    { title: 'Engineering', data: e },
    { title: 'Law', data: l }
  ].filter(item => item.data && item.data.totalBatch !== undefined); // Remove any empty/missing data

  const container = document.getElementById('dash-table');
  if (!container) return;

  if (summaries.length === 0) {
    container.innerHTML = `<div class="error-state"><p>⚠️ No dashboard summary data found for ${currentYear}.</p></div>`;
    return;
  }

  // 2. Sort the main programs in descending order of placement percentage
  summaries.sort((a, b) => parseFloat(b.data.pct || 0) - parseFloat(a.data.pct || 0));

  const makeRow = (title, obj) => {
    return `<tr>
      <td><strong>${title}</strong></td><td>${pctBadge(obj.pct)}</td>
      <td>${fmt(obj.totalBatch)}</td><td>${fmt(obj.totalReg)}</td>
      <td>${fmt(obj.placed)}</td><td>${fmt(obj.eligNotPlaced)}</td>
      <td>${fmt(obj.notEligible)}</td><td>${fmt(obj.optedOut)}</td>
      <td>${fmt(obj.blocked)}</td>
    </tr>`;
  };

  container.innerHTML = `
    <table>
      <thead><tr>
        <th>Program</th><th>Placement %</th><th>Total Batch</th>
        <th>Registered</th><th>Placed</th><th>Eligible – Not Placed</th>
        <th>Not Eligible</th><th>Opted Out</th><th>Blocked</th>
      </tr></thead>
      <tbody>
        ${summaries.map(s => makeRow(s.title, s.data)).join('')}
      </tbody>
    </table>`;
}


function renderTable(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;

  // 0. Filter out useless spreadsheet artifacts before rendering
  const cleanRows = rows.filter(r => !String(r.spec).toUpperCase().includes('TOTAL OF JULY BATCH'));

  if (!cleanRows || cleanRows.length === 0) {
    el.innerHTML = `<div class="error-state"><p>⚠️ No data found for ${currentYear}.</p></div>`;
    return;
  }

  // Helper to identify top-level rows so they don't get mixed in with normal sorting
  const isTotalRow = (spec) => {
    const s = String(spec).toUpperCase();
    return s.includes('TOTAL') || 
           s.includes('OVERALL') || 
           s.includes('ASAC') || 
           s.includes('ASAE') || 
           s.includes('M.TECH') || 
           s.includes('M.SC') ||
           s.includes('MBA JAN') ||
           s.includes('MBA JULY') ||
           s.includes('ASCENT');
  };

  // 1. Separate summary/total rows from regular specializations (using cleanRows)
  const totalRows = cleanRows.filter(r => isTotalRow(r.spec));
  const regularRows = cleanRows.filter(r => !isTotalRow(r.spec));

  // 2. Sort rows in descending order of placement percentage
  const sortByPct = (a, b) => parseFloat(b.pct || 0) - parseFloat(a.pct || 0);
  
  // Sort the normal specializations
  regularRows.sort(sortByPct);

  // Sort the top-level branches, but PIN the grand total to the very top
  totalRows.sort((a, b) => {
    const aName = String(a.spec).toUpperCase();
    const bName = String(b.spec).toUpperCase();
    const aIsGrand = aName.includes('OVERALL ENGINEERING') || aName === 'TOTAL' || aName === 'OVERALL MBA';
    const bIsGrand = bName.includes('OVERALL ENGINEERING') || bName === 'TOTAL' || bName === 'OVERALL MBA';

    if (aIsGrand && !bIsGrand) return -1; // Keep 'a' at the top
    if (!aIsGrand && bIsGrand) return 1;  // Keep 'b' at the top
    
    // If neither (or both) are grand totals, sort by percentage
    return parseFloat(b.pct || 0) - parseFloat(a.pct || 0);
  });

  // Combine back: Grand total -> Sorted Branches -> Sorted Specializations
  const sortedRows = [...totalRows, ...regularRows];

  // 3. Conditional configuration: Check if this is the MBA or Engineering Summary tab
  // const isSummaryTable = (id === 'mba-table' || id === 'eng-table');
  // const isSummaryTable = (id === 'mba-table');
  // No summary tables - show all columns for every table
  const isSummaryTable = false;
  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Program / Specialization</th>
          <th>Placement %</th>
          <th>Total Batch</th>
          <th>Total Reg</th>
          <th>Placed</th>
          ${isSummaryTable ? '' : `
          <th>Eligible - Not Placed</th>
          <th>Not Eligible</th>
          <th>Opted Out</th>
          <th>Blocked</th>
          `}
        </tr>
      </thead>
      <tbody>${sortedRows.map((r) => {
        return `
        <tr class="${isTotalRow(r.spec) ? 'total-row' : ''}">
          <td>${r.spec}</td>
          <td>${pctBadge(r.pct)}</td>
          <td>${fmt(r.totalBatch)}</td>
          <td>${fmt(r.totalReg)}</td>
          <td>${fmt(r.placed)}</td>
          ${isSummaryTable ? '' : `
          <td>${fmt(r.eligNotPlaced)}</td>
          <td>${fmt(r.notEligible)}</td>
          <td>${fmt(r.optedOut)}</td>
          <td>${fmt(r.blocked)}</td>
          `}
        </tr>`;
      }).join('')}
      </tbody>
    </table>`;
}
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
