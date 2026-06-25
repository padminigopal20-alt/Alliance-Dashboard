// ===================================================
// js/parsers.js — Excel sheet data parsers
// ===================================================


// ── B.SCHOOL PARSER (MBA + BBA) ────────────────────
function parseBSchool(rows) {
  const mbaData = [];
  const bbaData = [];
  let isBBA = false;
  let currentCohort = 'Overall MBA';

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || [];

    // Find the first non-empty cell (handles sheets with leading blank columns)
    let startIdx = r.findIndex(c => c !== undefined && c !== null && String(c).trim() !== '');
    if (startIdx === -1) continue;

    let spec = safeVal(r[startIdx]);
    const upperSpec = spec.toUpperCase();

    // Detect transition to BBA section
    if (spec.toLowerCase().includes('bba')) {
      isBBA = true;
      currentCohort = 'Overall BBA';
      continue;
    }

    // Skip headers and empty rows
    if (
      spec === '' ||
      upperSpec.includes('SPECIALIZATION') ||
      upperSpec.includes('PLACEMENT STATUS') ||
      upperSpec.includes('SECTOR WISE') ||
      upperSpec.includes('REPORT SUMMARY') ||
      upperSpec.includes('ELIGIBILITY AS ON')
    ) continue;

    // Use "Total Batch" (startIdx + 2) to identify data rows
    let batch = safeVal(r[startIdx + 2]);
    let isDataRow = batch !== '' && !isNaN(parseFloat(batch));

    if (isDataRow) {
      let pct = safePct(r[startIdx + 1]);

      // Update cohort based on spec name
      if (!isBBA) {
        if (upperSpec === 'TOTAL' || upperSpec.includes('OVERALL')) { 
          /* Keep cohort */ 
        }
        else if (upperSpec.includes('ASCENT')) { 
          // Check the active year: 2025 gets "Aug", 2026 (and beyond) gets "JAN"
          currentCohort = currentYear === '2025' ? 'Ascent MBA Aug' : 'Ascent MBA JAN'; 
        }
        else if (upperSpec.includes('MBA JAN')) { 
          currentCohort = 'MBA JAN'; 
        }
        else if (upperSpec.includes('MBA JULY') || upperSpec.includes('MBA JUL')) { 
          currentCohort = 'MBA JULY'; 
        }
      }

      const rowData = {
        cohort:        isBBA ? 'BBA' : currentCohort,
        spec:          spec,
        pct:           pct,
        totalBatch:    batch,
        totalReg:      safeVal(r[startIdx + 3]),
        placed:        safeVal(r[startIdx + 4]),
        eligNotPlaced: safeVal(r[startIdx + 5]),
        notEligible:   safeVal(r[startIdx + 6]),
        optedOut:      safeVal(r[startIdx + 7]),
        blocked:       safeVal(r[startIdx + 8])
      };

      if (!isBBA) mbaData.push(rowData);
      else        bbaData.push(rowData);
    }
  }

  return { mba: mbaData, bba: bbaData };
}
// ── ENGINEERING PARSER ─────────────────────────────
function parseEngineering(rows) {
  const data = [];
  let currentCohort = 'Overall Engineering';

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || [];
    let startIdx = r.findIndex(c => c !== undefined && c !== null && String(c).trim() !== '');
    if (startIdx === -1) continue;

    let specName  = safeVal(r[startIdx]);
    const upperSpec = specName.toUpperCase();

    // Skip non-data header rows
    if (
      upperSpec.includes('SECTOR WISE') ||
      upperSpec.includes('REPORT SUMMARY') ||
      upperSpec.includes('PLACEMENT STATUS') ||
      upperSpec.includes('ELIGIBILITY AS ON')
    ) continue;

    let pctStr      = safePct(r[startIdx + 1]);
    let totalBatchStr = safeVal(r[startIdx + 2]);
    const isDataRow   = totalBatchStr !== '' && !isNaN(parseFloat(totalBatchStr));

    // Update cohort from category header rows
    if (!isDataRow && !upperSpec.includes('PLACEMENT') && !upperSpec.includes('PERCENTAGE')) {
      if      (upperSpec === 'TOTAL' || upperSpec.includes('B.TECH') || upperSpec.includes('BTECH')) currentCohort = 'Overall Engineering';
      else if (upperSpec === 'ASAC')                                                                  currentCohort = 'ASAC';
      else if (upperSpec === 'ASAE')                                                                  currentCohort = 'ASAE';
      else if (upperSpec.includes('M.TECH') || upperSpec.includes('MTECH'))                          currentCohort = 'M.Tech';
      else if (upperSpec.includes('M.SC') || upperSpec.includes('MSC'))                              currentCohort = 'M.Sc';
      else                                                                                            currentCohort = specName;
      continue;
    }

    if (isDataRow) {
      if (upperSpec === 'TOTAL')           { specName = 'Overall Engineering'; }
      if (upperSpec === 'ASAC')            { specName = 'B.Tech ASAC';   currentCohort = 'ASAC'; }
      if (upperSpec === 'ASAE')            { specName = 'B.Tech ASAE';   currentCohort = 'ASAE'; }
      if (upperSpec.includes('M.TECH'))    { specName = 'M.Tech';        currentCohort = 'M.Tech'; }
      if (upperSpec.includes('M.SC'))      { specName = 'M.Sc';          currentCohort = 'M.Sc'; }

      data.push({
        cohort:        currentCohort,
        spec:          specName,
        pct:           pctStr,
        totalBatch:    totalBatchStr,
        totalReg:      safeVal(r[startIdx + 3]),
        placed:        safeVal(r[startIdx + 4]),
        eligNotPlaced: safeVal(r[startIdx + 5]),
        notEligible:   safeVal(r[startIdx + 6]),
        optedOut:      safeVal(r[startIdx + 7]),
        blocked:       safeVal(r[startIdx + 8])
      });
    }
  }

  return data;
}

// ── GENERIC SHEET PARSER (Law, etc.) ───────────────
function parseGenericSheet(rows, defaultCohortName) {
  const data = [];
  let currentCohort = defaultCohortName;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || [];
    let startIdx = r.findIndex(c => c !== undefined && c !== null && String(c).trim() !== '');
    if (startIdx === -1) continue;

    let specName    = safeVal(r[startIdx]);
    const upperSpec = specName.toUpperCase();

    if (
      upperSpec.includes('SECTOR WISE') ||
      upperSpec.includes('REPORT SUMMARY') ||
      upperSpec.includes('PLACEMENT STATUS') ||
      upperSpec.includes('ELIGIBILITY AS ON')
    ) continue;

    let pctStr      = safePct(r[startIdx + 1]);
    let totalBatchStr = safeVal(r[startIdx + 2]);
    const isDataRow   = totalBatchStr !== '' && !isNaN(parseFloat(totalBatchStr));

    if (!isDataRow && !upperSpec.includes('PLACEMENT') && !upperSpec.includes('PERCENTAGE')) {
      currentCohort = specName;
      continue;
    }

    if (isDataRow) {
      data.push({
        cohort:        currentCohort,
        spec:          specName,
        pct:           pctStr,
        totalBatch:    totalBatchStr,
        totalReg:      safeVal(r[startIdx + 3]),
        placed:        safeVal(r[startIdx + 4]),
        eligNotPlaced: safeVal(r[startIdx + 5]),
        notEligible:   safeVal(r[startIdx + 6]),
        optedOut:      safeVal(r[startIdx + 7]),
        blocked:       safeVal(r[startIdx + 8])
      });
    }
  }

  return data;
}
