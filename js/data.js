// ===================================================
// js/data.js — Data fetch and year processing (DEBUG)
// ===================================================

function xlsxUrl() {
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=xlsx`;
}

function sheetToRows(sheet) {
  if (!sheet) return null;
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
}

// ── DEEP DEBUG: log exactly what xlsx.js sees in each cell ──
function debugSheet(sheetName, sheet) {
  if (!sheet) { console.warn(`[DEBUG] Sheet "${sheetName}" not found in workbook`); return; }

  console.group(`[DEBUG] Sheet: "${sheetName}"`);
  console.log('Sheet keys (cell addresses):', Object.keys(sheet).filter(k => !k.startsWith('!')).slice(0, 30));

  // Print first 20 non-empty rows with raw cell objects
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
  let printed = 0;
  for (let i = 0; i < rows.length && printed < 20; i++) {
    const r = rows[i];
    if (r.some(c => c !== '')) {
      console.log(`Row ${i + 1}:`, r.slice(0, 9));
      printed++;

      // Also print the raw cell object for columns B-I (index 1-8) of this row
      const rowLetter = i + 1;
      ['B','C','D','E','F','G','H','I'].forEach((col, ci) => {
        const cellAddr = col + rowLetter;
        const cell = sheet[cellAddr];
        if (cell) {
          console.log(`  Cell ${cellAddr}: t="${cell.t}" v=${JSON.stringify(cell.v)} f=${JSON.stringify(cell.f)} w="${cell.w}"`);
        }
      });
    }
  }
  console.groupEnd();
}

async function processYearData() {
  if (!globalWorkbook) return;

  const ids = ['dash-table','mba-table','bba-table','eng-table','law-table','announce-container'];
  ids.forEach(setLoading);

  const mbaFilters = document.getElementById('mba-filters');
  const engFilters = document.getElementById('eng-filters');
  if (mbaFilters) mbaFilters.innerHTML = '';
  if (engFilters) engFilters.innerHTML = '';

  console.log('=== WORKBOOK SHEET NAMES ===', globalWorkbook.SheetNames);
  console.log('=== CURRENT YEAR ===', currentYear);

  // Debug the B.School sheet for current year
  debugSheet(`B.School ${currentYear}`, globalWorkbook.Sheets[`B.School ${currentYear}`]);
  debugSheet(`Engineering ${currentYear}`, globalWorkbook.Sheets[`Engineering ${currentYear}`]);

  try {
    const bschoolRows  = sheetToRows(globalWorkbook.Sheets[`B.School ${currentYear}`]);
    const engRows      = sheetToRows(globalWorkbook.Sheets[`Engineering ${currentYear}`]);
    const lawRows      = sheetToRows(globalWorkbook.Sheets[`Law ${currentYear}`]);
    const announceRows = sheetToRows(globalWorkbook.Sheets[`Announcements ${currentYear}`]);

    console.log(`[DEBUG] bschoolRows count: ${bschoolRows ? bschoolRows.length : 'null'}`);
    if (bschoolRows) {
      console.log('[DEBUG] bschoolRows first 15 non-empty:');
      bschoolRows.filter(r => r.some(c => c !== '')).slice(0, 15).forEach((r, i) => console.log(`  [${i}]`, r.slice(0, 9)));
    }

    let mba = [], bba = [], eng = [], law = [];

    if (bschoolRows) {
      const parsed = parseBSchool(bschoolRows);
      mba = parsed.mba;
      bba = parsed.bba;
      console.log('[DEBUG] Parsed MBA rows:', mba);
      console.log('[DEBUG] Parsed BBA rows:', bba);
      initMBAFilters(mba);
      renderTable('bba-table', bba);
    } else {
      ['mba-table','bba-table'].forEach(id => setError(id, `B.School ${currentYear} sheet not found.`));
    }

    if (engRows) {
      eng = parseEngineering(engRows);
      console.log('[DEBUG] Parsed Eng rows:', eng);
      initEngFilters(eng);
    } else {
      setError('eng-table', `Engineering ${currentYear} sheet not found.`);
    }

    if (lawRows) {
      law = parseGenericSheet(lawRows, 'Overall Law');
      renderTable('law-table', law);
    } else {
      setError('law-table', `Law ${currentYear} sheet not found.`);
    }

    renderDashboard(mba, bba, eng, law);

    if (announceRows) {
      initAnnouncementFilters(announceRows);
    } else {
      setError('announce-container', `Announcements ${currentYear} sheet not found.`);
    }

    updateTimestamp();

  } catch (err) {
    console.error('Processing Error:', err);
    ids.forEach(id => setError(id, 'Error processing data: ' + err.message));
  }
}

async function loadExcelData() {
  ['dash-table','mba-table','bba-table','eng-table','law-table','announce-container'].forEach(setLoading);

  try {
    console.log('[DEBUG] Fetching xlsx from:', xlsxUrl());
    const response = await fetch(xlsxUrl());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    console.log('[DEBUG] xlsx size (bytes):', arrayBuffer.byteLength);

    globalWorkbook = XLSX.read(new Uint8Array(arrayBuffer), {
      type: 'array',
      cellDates: true,
      cellFormula: false,
      cellNF: false,
      raw: true
    });

    console.log('[DEBUG] Workbook sheets:', globalWorkbook.SheetNames);
    await processYearData();

  } catch (err) {
    console.error('[DEBUG] Load error:', err);
    ['dash-table','mba-table','bba-table','eng-table','law-table','announce-container']
      .forEach(id => setError(id, err.message));
  }
}