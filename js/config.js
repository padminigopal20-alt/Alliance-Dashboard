// ===================================================
// js/config.js — App constants and global state
// ===================================================

const GOOGLE_SHEET_ID     = '1e9jGUstCcSgvoMIwCigZprPy6bHKjhG4';
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

// Sheet GIDs — the number after #gid= in each tab's URL
const SHEET_GIDS = {
  'B.School 2025':      73392595,
  'Engineering 2025':   336600283,
  'Law 2025':           1146169487,
  'Announcements 2025': 1145582951,
  'B.School 2026':      279935137,
  'Engineering 2026':   727718610,
  'Law 2026':           766569327,
  'Announcements 2026': 1661337084,
};

// Global state
let globalWorkbook          = null;
let currentYear             = '2025';
let globalMBAData           = [];
let globalEngData           = [];
let globalAnnouncementsData = [];