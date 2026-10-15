#!/usr/bin/env node
// FAQ.md, the book's questions and their answers (SPEC B9). Reads the
// questions from .import/faq.md (written by hand, only added to), works out
// each answer from HUD's raw files, never from the book, and writes FAQ.md
// at the book's root: a record a question, its answer, and the pages where a
// reader finds it, each checked to exist.
//
//   node .import/faq.js [--fmr <csv>] [--il <dir>]
//
// Reads HUD's FMR history (FMR_All_1983_2027.csv, latin-1) and every year's
// Section 8 income limits (~/.cache/proper/hud/il/fy<year>/: fixed text to
// FY2000, spreadsheets after), with readers of its own: it borrows SheetJS
// from the limits' importer, and nothing else of it. A question in faq.md
// with no answer here, or an answer here with no question, stops it.
// Moved here from the databooks bench (bench/answers/hud.js), 2026-10-15.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');

const XLSX = createRequire(path.join(__dirname, 'limits', 'package.json'))('xlsx');

const REPO = path.dirname(__dirname);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FMR_CSV = arg('--fmr', path.join(os.homedir(), '.cache/proper/hud/fmr/FMR_All_1983_2027.csv'));
const IL_DIR = arg('--il', path.join(os.homedir(), '.cache/proper/hud/il'));

// --- the questions ---------------------------------------------------------------

const KEYS = ['Tier', 'Ask', 'Type', 'Tolerance', 'Rules', 'How', 'Look in'];

function parse(text) {
  return text.split(/\n(?=### Question: )/).slice(1).map((b) => {
    const id = /^### Question: (\S+)\s*$/m.exec(b)[1];
    const q = { id };
    for (const k of KEYS) {
      const m = new RegExp(`^- ${k}:[ \\t]*(.*)$`, 'm').exec(b);
      if (!m) throw new Error(`faq.md, ${id}: no ${k}`);
      q[k] = m[1].trim();
    }
    return q;
  });
}

// --- the FMR history ---------------------------------------------------------


function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const head = rows[0];
  return rows.slice(1).map((r) => {
    if (r.length !== head.length) throw new Error(`FMR: a row of ${r.length} cells, not ${head.length}: ${r.slice(0, 6)}`);
    return Object.fromEntries(head.map((h, i) => [h, r[i]]));
  });
}

const FMR = parseCSV(fs.readFileSync(FMR_CSV, 'latin1'));
const yy = (y) => String(y % 100).padStart(2, '0');
const rent = (r, y, b) => { const v = r[`fmr${yy(y)}_${b}`]; return v === '' || v == null ? null : Number(v); };
const pct = (r, y) => r[`fmr${yy(y)}`] || null; // HUD's percentile column; none from FY2024
const fmrBy = new Map(FMR.map((r) => [r.fips2027, r]));
const fmrCounties = FMR.filter((r) => r.cousub === '99999');

// --- the income limits ---------------------------------------------------------

const ilFile = (y) => {
  const dir = path.join(IL_DIR, `fy${y}`);
  const fs_ = fs.readdirSync(dir).filter((f) => /\.(txt|xlsx?)$/i.test(f));
  // FY2014 has two: Poverty.xls (the limit the Act of 2014 defined) and
  // Section8.xls (the plain 30% limit); the year's limits are Poverty.xls's
  if (y === 2014) return path.join(dir, 'Poverty.xls');
  if (fs_.length !== 1) throw new Error(`FY${y}: ${fs_.length} files (${fs_})`);
  return path.join(dir, fs_[0]);
};
const n = (v) => {
  const s = String(v ?? '').replace(/[$,\s]/g, '');
  return s === '' ? null : Number(s);
};
const pad = (v, k) => String(v ?? '').trim().padStart(k, '0');

// FY1998-2000: a block of lines a county's part in an area
function readText(file, year) {
  const rows = [];
  let cur = null;
  for (const line of fs.readFileSync(file, 'latin1').split(/\r?\n/)) {
    let m = /^\s*(\d+)\s+([A-Z]{2})\s+(\d+)\s+(.+?)\s+(\d+)\s+MSA:\s*(.*?)\s*$/.exec(line);
    if (m) {
      cur = { year, fips: null, st: pad(m[1], 2), county3: pad(m[3], 3), alpha: m[2], name: m[4].trim(),
        area: m[5], areaName: m[6], median: null, l30: null, l50: null, l80: null };
      rows.push(cur);
    } else if (cur && (m = /^MED .*\$\s*([\d,]+)/.exec(line))) cur.median = n(m[1]);
    else if (cur && (m = /^L(30|50|80) /.exec(line))) {
      const v = line.slice(30).trim().split(/\s+/).map(n);
      if (v.length !== 8) throw new Error(`FY${year}: ${line}`);
      cur[`l${m[1]}`] = v;
    }
  }
  return rows;
}

function readSheet(file, year) {
  const wb = XLSX.readFile(file, { sheets: 0, sheetRows: 10000 });
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true });
  const heads = raw[0].map((h) => String(h).trim().toLowerCase().replace(/\s+/g, ' '));
  const col = (...names) => { for (const k of names) { const i = heads.indexOf(k); if (i >= 0) return i; } return -1; };
  const lim = (lv) => [1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
    let i = heads.findIndex((h) => h === `l${lv}_${k}` || (lv === 30 && h === `eli_${k}`));
    if (i < 0) { // FY2001 spells them out
      const word = lv === 80 ? /^low\b/ : new RegExp(`${lv}%`);
      i = heads.findIndex((h) => word.test(h) && new RegExp(`-\\s*${k} person`).test(h));
    }
    if (i < 0) throw new Error(`FY${year}: no ${lv}% limit for ${k}`);
    return i;
  });
  const c = {
    fips: col('fips', 'fips2010', 'fips2000'),
    st: col('state', 'fips state code'), county: col('county', 'fips county code'),
    alpha: col('state_alpha', 'stusps', 'statealpha', 'state abrev.'),
    name: col('county_town_name', 'countyname', 'county name'),
    area: col('hud_area_code', 'cbsasub', 'msa', 'hud msa code'),
    oldMsa: col('cbsasub') >= 0 ? col('msa') : -1,
    areaName: col('hud_area_name', 'metro_area_name', 'msaname', 'msa name', 'name'),
    median: col(`median${year}`, 'median', `fy ${year} median family income`),
  };
  for (const [k, i] of Object.entries(c)) if (i < 0 && !['fips', 'oldMsa'].includes(k)) throw new Error(`FY${year}: no ${k}`);
  const L = { 30: lim(30), 50: lim(50), 80: lim(80) };
  return raw.slice(1).filter((r) => r.some((v) => v !== '')).map((r) => {
    const fips = c.fips >= 0 ? pad(r[c.fips], 10) : null;
    return {
      year, fips, st: fips ? fips.slice(0, 2) : pad(r[c.st], 2), county3: fips ? fips.slice(2, 5) : pad(r[c.county], 3),
      alpha: String(r[c.alpha]).trim(), name: String(r[c.name]).trim(), area: String(r[c.area]).trim(),
      oldMsa: c.oldMsa >= 0 ? String(r[c.oldMsa]).trim() : null, areaName: String(r[c.areaName]).trim(),
      median: n(r[c.median]), l30: L[30].map((i) => n(r[i])), l50: L[50].map((i) => n(r[i])), l80: L[80].map((i) => n(r[i])),
    };
  });
}

const ilCache = new Map();
function IL(year, file = null) {
  const k = file ?? year;
  if (!ilCache.has(k)) {
    const f = file ?? ilFile(year);
    ilCache.set(k, f.endsWith('.txt') ? readText(f, year) : readSheet(f, year));
  }
  return ilCache.get(k);
}
const ilBy = (year, fips) => {
  const rows = IL(year).filter((r) => r.fips === fips);
  if (rows.length !== 1) throw new Error(`FY${year} ${fips}: ${rows.length} rows`);
  return rows[0];
};
const ilCounty = (year, st, county3) => IL(year).filter((r) => r.st === st && r.county3 === county3);

// --- following a place across a change of code (SPEC K3) ----------------------

// by code, then this table of Census renames (the same land under a new
// code), then by name within its county, less its kind ("Agawam city" is
// "Agawam Town city"; "Drew plantation" is "Drew UT")
const RENAMED = {
  1202599999: '1208699999', // Dade County, FL to Miami-Dade (1997)
  4611399999: '4610299999', // Shannon County, SD to Oglala Lakota (2015)
  '0227099999': '0215899999', // Wade Hampton Census Area, AK to Kusilvak (2015)
  2300978920: '2300978925', // Verona town, ME to Verona Island
  2301584135: '2301584140', // Westport town, ME to Westport Island
  2500546575: '2500546598', // North Attleborough town, MA to North Attleborough Town city
  2301957937: '2301957936', // Penobscot Indian Island Reservation, ME (Penobscot County part)
  5000126275: '5000126300', // Ferrisburg town, VT to Ferrisburgh
  5001123875: '5001124050', // Enosburg town, VT to Enosburgh
  5001300700: '5001300860', // Alburg town, VT to Alburgh
};
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const base = (s) => norm(s).replace(/( (town|city|plantation|township|ut|unorganized territory|re|reservation))+$/, '');
const NE = new Set(['09', '23', '25', '33', '44', '50']);

// --- the answers -----------------------------------------------------------------
// Each: the answer as the bench grades it (answer), the same in words for
// FAQ.md (text: a number bare, as the book's pages write it), and how it was
// found in HUD's files (note). A Gap question's answer is null.

const r2 = (x, k = 2) => Math.round(x * 10 ** k) / 10 ** k;
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmr = (fips) => { const r = fmrBy.get(fips); if (!r) throw new Error(`FMR: no ${fips}`); return r; };
const one = (rows, what) => { if (rows.length !== 1) throw new Error(`${what}: ${rows.length} rows`); return rows[0]; };
const nameOf = (s) => s.replace(/ (town|city)$/, '');

const once = (f) => { let v; return () => (v ??= f()); };
// the counties with both FY2006 and FY2026, rents and medians (analysis 1 and 4)
const growth = once(() => {
  const i06 = new Map(IL(2006).map((r) => [r.fips, r])), i26 = new Map(IL(2026).map((r) => [r.fips, r]));
  const back = Object.fromEntries(Object.entries(RENAMED).map(([a, b]) => [b, String(a).padStart(10, '0')]));
  return fmrCounties.map((r) => {
    const a = i06.get(r.fips2027) ?? i06.get(back[r.fips2027]), b = i26.get(r.fips2027), r06 = rent(r, 2006, 2), r26 = rent(r, 2026, 2);
    return a && b && r06 && r26 ? { r, rg: r26 / r06, ig: b.median / a.median } : null;
  }).filter(Boolean);
});

const ANSWERS = {
  // Lookup
  'hud-lookup-1': () => ({ answer: ilBy(2020, '2805199999').l30[3],
    note: 'Section8-FY20.xlsx, fips 2805199999, ELI_4 (the extremely low income limit as defined since FY2014).' }),
  'hud-lookup-2': () => ({ answer: rent(fmr('3606199999'), 2027, 2), note: 'FMR history, fips2027 3606199999, fmr27_2.' }),
  'hud-lookup-3': () => ({ answer: ilBy(2026, '3606799999').median, note: 'Section8-FY26.xlsx, fips 3606799999, median2026.' }),
  'hud-lookup-4': () => {
    const la = one(FMR.filter((r) => r.state === '06' && r.name === 'Los Angeles County'), 'LA');
    return { answer: rent(la, 2010, 1), note: `FMR history, fips2027 ${la.fips2027}, fmr10_1 (percentile column fmr10: ${pct(la, 2010)}).` };
  },

  // Page
  'hud-page-1': () => {
    const b = one(FMR.filter((r) => r.state === '23' && r.name === 'Bangor city'), 'Bangor');
    return { answer: rent(b, 2027, 2), note: `FMR history, Bangor city, ME (${b.fips2027}, Penobscot County), fmr27_2.` };
  },
  'hud-page-2': () => {
    const v = one(IL(2026).filter((r) => r.st === '50' && r.name === 'Burlington city'), 'Burlington');
    return { answer: v.l50[2], note: `Section8-FY26.xlsx, Burlington city, VT (${v.fips}, Chittenden County), l50_3. South Burlington city has the same value; Burlington town, CT ${IL(2026).find((r) => r.fips === '0916010100').l50[2]} and Burlington town, MA ${IL(2026).find((r) => r.fips === '2501709840').l50[2]} do not.` };
  },
  'hud-page-3': () => {
    const a = fmr('0100199999'), i = ilBy(2015, '0100199999');
    return { answer: [a.msa15], note: `FMR history msa15 for 0100199999; the FY2015 income limits' cbsasub agrees (${i.area}). Its old MSA number, in the limits' msa column, is ${i.oldMsa} (Montgomery, AL).` };
  },

  // Across
  'hud-across-1': () => {
    const c = fmrCounties.filter((r) => rent(r, 2027, 2) != null).sort((x, y) => rent(y, 2027, 2) - rent(x, 2027, 2));
    const tenth = rent(c[9], 2027, 2);
    const ST = Object.fromEntries(IL(2026).map((r) => [r.st, r.alpha]));
    const list = c.filter((r) => rent(r, 2027, 2) >= tenth).map((r) => ({ county: `${r.name}, ${ST[r.state]}`, fips: r.fips2027, fmr27_2: rent(r, 2027, 2) }));
    const tied = list.filter((x) => x.fmr27_2 === tenth).length;
    return { answer: list, text: list.map((x) => `${x.county} ${x.fmr27_2}`).join('; '),
      note: `Counties are rows with cousub 99999 (New England has none: its rows are towns). The tenth value, ${tenth}, is shared by ${tied} counties of the New York HUD Metro FMR Area, so the "ten" are nine and a tie of ${tied}; ${list.length} counties in all. Next below: ${rent(c[list.length], 2027, 2)} (${c[list.length].name}).` };
  },
  'hud-across-2': () => {
    const g = fmrCounties.filter((r) => rent(r, 2010, 2) && rent(r, 2027, 2))
      .map((r) => ({ r, up: 100 * (rent(r, 2027, 2) / rent(r, 2010, 2) - 1) })).sort((x, y) => y.up - x.up);
    const [w, s] = g;
    const at50 = g.filter((x) => pct(x.r, 2010) === '50').length;
    return { answer: [`${w.r.name}, ND`],
      note: `${g.length} counties (cousub 99999) have both. ${w.r.name} (${w.r.fips2027}): ${rent(w.r, 2010, 2)} to ${rent(w.r, 2027, 2)}, +${r2(w.up, 1)}%; next ${s.r.name} +${r2(s.up, 1)}%. Both years at the 40th percentile (fmr10 = ${pct(w.r, 2010)}); ${at50} counties were at the 50th in FY2010, none near the top, so as set or at the 40th only, the answer is the same. A row of the FMR history carries its place's years, so a county recoded (Oglala Lakota, Kusilvak) is followed by its row.` };
  },
  'hud-across-3': () => {
    const rows = IL(2026);
    const over = rows.filter((r) => r.l80[3] > 100000).length, at = rows.filter((r) => r.l80[3] === 100000).length;
    return { answer: over, note: `Section8-FY26.xlsx, ${rows.length} rows, l80_4 > 100000. ${at} more rows are exactly 100,000 (at or above: ${over + at}). A row is a county, or a New England town.` };
  },
  'hud-across-4': () => {
    const ne = IL(2026).filter((r) => NE.has(r.st));
    return { answer: ne.filter((r) => !r.fips.endsWith('99999')).length,
      note: `Section8-FY26.xlsx, rows of CT ME MA NH RI VT, all ${ne.length} with a county subdivision (none 99999): towns, cities, plantations, unorganized territories, reservations and the like, by state ${[...NE].map((s) => `${s}:${ne.filter((r) => r.st === s).length}`).join(' ')}.` };
  },

  // Join
  'hud-join-1': () => {
    const out = [];
    for (const [f, place] of [['3606199999', 'New York County (Manhattan)'], ['3606799999', 'Onondaga County']]) {
      const v = rent(fmr(f), 2026, 2), l = ilBy(2026, f).l80[3];
      out.push({ place, percent: r2(100 * 12 * v / l), fmr26_2: v, l80_4: l });
    }
    return { answer: out, text: out.map((x) => `${x.place} ${x.percent}% (12 × ${x.fmr26_2} / ${x.l80_4})`).join('; '),
      note: '12 × fmr26_2 (FMR history) / l80_4 (Section8-FY26.xlsx), by FIPS, in percent.' };
  },
  'hud-join-2': () => {
    const i26 = new Map(IL(2026).map((r) => [r.fips, r]));
    const j = fmrCounties.map((r) => { const b = i26.get(r.fips2027), v = rent(r, 2026, 2); return b && v ? { r, s: 100 * 12 * v / b.l50[3], v, l: b.l50[3] } : null; })
      .filter(Boolean).sort((x, y) => y.s - x.s);
    return { answer: [`${j[0].r.name}, HI`],
      note: `${j.length} counties (cousub 99999) joined by FIPS. ${j[0].r.name}: 12 × ${j[0].v} / ${j[0].l} = ${r2(j[0].s, 1)}%; next ${j[1].r.name} ${r2(j[1].s, 1)}%, ${j[2].r.name} ${r2(j[2].s, 1)}%. Kalawao (the Kalaupapa settlement, a few score people) is a county in HUD's files; an answer leaving it out names ${j[1].r.name}, FL.` };
  },

  // Change
  'hud-change-1': () => {
    const h13 = ilBy(2013, '2805199999').l30[3], hNew = ilBy(2014, '2805199999').l30[3];
    const hOld = one(IL(2014, path.join(IL_DIR, 'fy2014/Section8.xls')).filter((r) => r.fips === '2805199999'), 'old30').l30[3];
    return { answer: { fy2013_30pct: h13, fy2014_30pct: hOld, fy2014_eli: hNew, old_rise: hOld - h13, spliced_rise: hNew - h13 },
      text: `Not like for like: HUD redefined the limit in FY2014 (the greater of 30% of the median and the poverty guideline). The old 30% limit rose ${hOld - h13}, from ${h13} to ${hOld}; the new limit was ${hNew} in FY2014, so ${hNew - h13} is a splice of two definitions, not a rise.`,
      note: `FY2013 Section8.xls l30_4 ${h13}; FY2014 Section8.xls (the plain 30% limit) l30_4 ${hOld}; FY2014 Poverty.xls ELI_4 ${hNew} (the greater of 30% of median and the poverty guideline, capped at the 50% limit, which it equals here: l50_4 ${ilBy(2014, '2805199999').l50[3]}). Right only if it says the definition changed; ${hNew - h13} spliced is wrong.` };
  },
  'hud-change-2': () => {
    const dc = fmr('1100199999');
    const ys = []; for (let y = 1983; y <= 2027; y++) if (pct(dc, y) === '50') ys.push(y);
    return { answer: ys, note: `FMR history, fips2027 1100199999, the years whose fmrNN column is 50; FY2009 and FY2013-2015, 2019 are 40. HUD's file has no percentile column from FY2024.` };
  },
  'hud-change-3': () => {
    const h = FMR.filter((r) => r.fips2024.startsWith('09003'));
    const groups = {};
    for (const r of h) { const k = `${r.fips2027.slice(0, 5)} ${r.areaname27}: ${rent(r, 2027, 2)}`; (groups[k] = groups[k] || []).push(r.name); }
    const by = Object.entries(groups).map(([k, towns]) => { const [, code, area, v] = /^(\d+) (.*): (\d+)$/.exec(k); return { code, area, rent: Number(v), towns }; })
      .sort((a, b) => b.towns.length - a.towns.length || a.code.localeCompare(b.code));
    // the regions' names, as HUD's limits files give them (.import/counties.json, from those files)
    const regions = JSON.parse(fs.readFileSync(path.join(__dirname, 'counties.json'), 'utf8'));
    const said = by.map((g) => `${g.towns.length > 5 ? `${g.towns.length} are in the ${regions[g.code]}` : `${g.towns.map(nameOf).join(' and ')} in the ${regions[g.code]}`} (${g.area}), at ${g.rent}`);
    const fy25 = [...new Set(h.map((r) => rent(r, 2025, 2)))];
    return { answer: { towns: h.length, fy2027_by_region_area: Object.fromEntries(by.map((g) => [`${g.code} ${g.area}: ${g.rent}`, g.towns.length > 5 ? `${g.towns.length} towns` : g.towns.join(', ')])), fy2025_2br: fy25, recoded_rents: 'FY2026 (fips2024: codes used before the FY2026 FMRs)', recoded_limits: 'FY2025 (the limits file writes CT towns 091xx from FY2025)' },
      text: `There is no one rent: Hartford County is no longer a unit in HUD's files, its towns keyed from FY2026 by Connecticut's planning regions. Of the county's ${h.length} towns, ${said.join('; ')}.`,
      note: `Hartford County's ${h.length} towns by fips2024 0900 3xxxxx, and fmr27_2 by fips2027. In FY2025 all were ${fy25.join(', ')}. A single figure is right only if it says it is the Hartford MSA's and that three former Hartford County towns differ.` };
  },

  // Gap
  'hud-gap-1': () => ({ answer: null, note: `The FMR history has no FY1984 columns (fmr83_* then fmr85_*); HUD published no FY1984 FMRs. Cook County FY1983 2BR is ${rent(fmr('1703199999'), 1983, 2)} and FY1985 ${rent(fmr('1703199999'), 1985, 2)}: neither is the answer.` }),
  'hud-gap-2': () => {
    const h = one(ilCounty(1998, '28', '051'), 'Holmes 1998');
    return { answer: null, note: `allstate.txt (FY1998) has no L30 lines for any county (MED, L50, L80, FMR only); the 30% limit begins FY1999 (allst99.txt). Holmes County, MS is there with L50_4 ${h.l50[3]} and L80_4 ${h.l80[3]}; 30% of the median (${h.median}) is not HUD's limit.` };
  },
  'hud-gap-3': () => {
    const b = fmr('0801499999');
    return { answer: null, note: `FMR history, Broomfield County (0801499999): fmr03 = ${pct(b, 2003)} (marked at the 50th) and fmr03_2 empty; empty FY2001-2004, first rent FY2005 (${rent(b, 2005, 2)}). Denver's or Boulder's rent is not Broomfield's.` };
  },
  'hud-gap-4': () => {
    // The source holds an answer: FY2006's msa column gives each New England
    // town the old MSA it lay in, and the FY2003 file a row each county's
    // part in an MSA; the parts are the same every year FY1998-2005.
    const t = one(IL(2006).filter((r) => r.st === '25' && r.name === 'Ashby town'), 'Ashby');
    const parts = ilCounty(2003, '25', '017');
    const part = one(parts.filter((r) => r.area === t.oldMsa), 'Ashby part');
    return { answer: part.l50[3],
      note: `Not a gap, though first written as one: the source answers it. FY2006's msa column puts Ashby (${t.fips}) in old MSA ${t.oldMsa} (${part.areaName}), and FY2003's Section8.xls has Middlesex County's part in it: l50_4 ${part.l50[3]}. Middlesex's other parts: ${parts.filter((r) => r !== part).map((r) => `${r.areaName} ${r.l50[3]}`).join('; ')}.` };
  },
  'hud-gap-5': () => {
    // Valdez-Cordova Census Area (02261) was split in 2019 into Chugach (02063)
    // and Copper River (02066); the FMR history is keyed by FY2027's codes.
    if (fmrBy.has('0226199999')) throw new Error('hud-gap-5: Valdez-Cordova has a row');
    const parts = ['0206399999', '0206699999'].map((f) => `${fmr(f).name} ${rent(fmr(f), 2027, 2)}`).join('; ');
    return { answer: null, note: `No row for Valdez-Cordova Census Area (0226199999) in the FMR history: it was split into Chugach and Copper River census areas, which have FY2027 2BR rents (${parts}). Neither is Valdez-Cordova's.` };
  },

  // Analysis
  'hud-analysis-1': () => {
    const ms = growth().filter((x) => x.r.state === '28');
    const faster = ms.filter((x) => x.rg > x.ig).length, slower = ms.filter((x) => x.rg < x.ig).length;
    return { answer: { faster, slower }, text: `${faster} faster, ${slower} slower`,
      note: `${ms.length} Mississippi counties; fmr26_2/fmr06_2 against median2026/median2006 (Section8-FY26.xlsx, Section8FY2006.xls), by FIPS; ${ms.length - faster - slower} ties.` };
  },
  'hud-analysis-2': () => {
    const NAMES = { 1: 'Northeast', 2: 'Midwest', 3: 'South', 4: 'West' };
    const reg = {}, all = {};
    for (const r of fmrCounties) { const v = rent(r, 2027, 2); if (v != null && r.census_region) (reg[r.census_region] = reg[r.census_region] || []).push(v); }
    for (const r of FMR) { const v = rent(r, 2027, 2); if (v != null && r.census_region) (all[r.census_region] = all[r.census_region] || []).push(v); }
    const m = Object.entries(reg).map(([k, v]) => [NAMES[k], v.length, median(v)]).sort((a, b) => b[2] - a[2]);
    return { answer: [m[0][0]],
      note: `FMR history, census_region, counties (cousub 99999), median fmr27_2: ${m.map(([k, n, v]) => `${k} ${v} (${n})`).join(', ')}. The Northeast's counties are NY, NJ and PA only; with New England's towns too: ${Object.entries(all).map(([k, v]) => `${NAMES[k]} ${median(v)}`).join(', ')}.` };
  },
  'hud-analysis-3': () => {
    // Every place listed FY1998-2025, followed to FY2026 by code, renames, then
    // name within its county less its kind. Before FY2006 a row is a county's
    // part in an area, keyed by state and county: it is followed when its
    // county is keyed in FY2006 or after (New England's counties through their
    // towns), else by rename; what is left is gone.
    const now = new Set(IL(2026).map((r) => r.fips));
    const byBase = new Map(), byState = new Map();
    const index = (m, k, v) => m.set(k, m.has(k) ? null : v);
    for (const r of IL(2026)) { index(byBase, `${r.fips.slice(0, 5)}|${base(r.name)}`, r.fips); index(byState, `${r.st}|${base(r.name)}`, r.fips); }
    const gone = new Map(), second = new Map();
    for (let y = 2006; y <= 2025; y++) for (const r of IL(y)) {
      // a second row for a county listed the same year (…99998): not a place
      if (r.fips.endsWith('99998') && IL(y).some((x) => x.fips === `${r.fips.slice(0, 5)}99999`)) { second.set(r.fips, { name: r.name, last: y }); continue; }
      if (now.has(r.fips) || now.has(RENAMED[r.fips]) || byBase.get(`${r.fips.slice(0, 5)}|${base(r.name)}`) || byState.get(`${r.st}|${base(r.name)}`)) continue;
      const g = gone.get(r.fips) ?? { place: `${r.name}, ${r.alpha}`, code: r.fips, last: y };
      g.last = Math.max(g.last, y); gone.set(r.fips, g);
    }
    const keyedLater = new Set(); for (let y = 2006; y <= 2026; y++) for (const r of IL(y)) keyedLater.add(r.fips.slice(0, 5));
    for (let y = 1998; y <= 2005; y++) for (const r of IL(y)) {
      const k = r.st + r.county3;
      if (keyedLater.has(k) || now.has(RENAMED[`${k}99999`])) continue;
      const g = gone.get(k) ?? { place: `${r.name}, ${r.alpha}`, code: k, last: y };
      g.last = Math.max(g.last, y); gone.set(k, g);
    }
    const list = [...gone.values()].sort((a, b) => a.last - b.last || a.place.localeCompare(b.place));
    const last = list.filter((g) => g.last === list[list.length - 1].last);
    return { answer: { count: list.length, last_to_go: last.map((g) => `${g.place} (last listed FY${g.last})`), gone: list.map((g) => `${g.place} ${g.code} FY${g.last}`), second_listings_not_counted: [...second].map(([f, s]) => `${s.name} ${f} FY${s.last}`) },
      text: `${list.length} places; the last to go, ${last.map((g) => `${g.place}, last listed FY${g.last}`).join('; ')}`,
      note: `Followed by code, a table of Census renames, then name less its kind, within the county or else the state where it is one place's alone (K3; Connecticut's towns, recoded to planning regions in FY2025), so towns that changed form (Agawam city to Agawam Town city) or were deorganized into an unorganized territory of the same name (Drew plantation to Drew UT, FY2026) are not gone. Gone: ${list.map((g) => `${g.place} FY${g.last}`).join('; ')}. Not counted: the second rows HUD gave Rockland and Westchester, NY (…99998, FY2006-2020), each a county still listed; counted, the total is ${list.length + second.size}. Connecticut's eight counties, keyed before FY2006 and by their towns' codes to FY2024, are followed through their towns, not counted.` };
  },
  'hud-analysis-4': () => {
    const g = growth();
    const st = g.filter((x) => Number(x.r.state) <= 56);
    const rm = median(g.map((x) => x.rg)), im = median(g.map((x) => x.ig)), dm = median(g.map((x) => x.rg - x.ig));
    const a = { counties: g.length, median_rent_growth_pct: r2(100 * (rm - 1), 1), median_income_growth_pct: r2(100 * (im - 1), 1), gap_of_medians_points: r2(100 * (rm - im), 1), median_of_gaps_points: r2(100 * dm, 1), counties_faster: g.filter((x) => x.rg > x.ig).length, at_50th_fy2006: g.filter((x) => pct(x.r, 2006) === '50').length };
    return { answer: a,
      text: `${rm > im ? 'Yes, faster' : 'No, slower'}: across ${a.counties} counties, FY2006 to FY2026, the median growth of the two-bedroom rent was ${a.median_rent_growth_pct}%, of the median family income ${a.median_income_growth_pct}%; the rent grew faster in ${a.counties_faster} of them.`,
      note: `Counties (cousub 99999) with both years in both files, by FIPS (Oglala Lakota and Kusilvak by their old codes in FY2006). Rents as HUD set them (FY2006 includes ${a.at_50th_fy2006} counties at the 50th). The two readings of "by how much" differ by more than the point allowed: the medians' gap ${a.gap_of_medians_points} points, the median of each county's gap ${a.median_of_gaps_points}. States and DC only: rent ${r2(100 * (median(st.map((x) => x.rg)) - 1), 1)}%, income ${r2(100 * (median(st.map((x) => x.ig)) - 1), 1)}%. At the 40th only in FY2006: rent ${r2(100 * (median(g.filter((x) => pct(x.r, 2006) === '40').map((x) => x.rg)) - 1), 1)}%.` };
  },
  'hud-analysis-5': () => {
    const f = fmr('2805199999');
    const a = [2006, 2026].map((year) => { const l = ilBy(year, '2805199999').l50[3], v = rent(f, year, 2); return { year, percent: r2(100 * 12 * v / l), fmr_2: v, l50_4: l }; });
    return { answer: a, text: a.map((x) => `FY${x.year} ${x.percent}% (12 × ${x.fmr_2} / ${x.l50_4})`).join('; '),
      note: '12 × fmr06_2 / l50_4 (FY2006) and 12 × fmr26_2 / l50_4 (FY2026), Holmes County, MS, 2805199999.' };
  },
};

function compute(ids) {
  const out = {};
  for (const id of ids) {
    if (!ANSWERS[id]) throw new Error(`${id}: a question with no answer in faq.js`);
    out[id] = ANSWERS[id]();
  }
  return out;
}

// --- FAQ.md -----------------------------------------------------------------------

const NOT_SAID = 'The book does not say.';

function words(q, a) {
  if (q.Type === 'none') {
    if (a.answer !== null) throw new Error(`${q.id}: a Gap question with an answer`);
    return NOT_SAID;
  }
  const t = a.text ?? (Array.isArray(a.answer)
    ? a.answer.join(a.answer.some((x) => String(x).includes(',')) ? '; ' : ', ')
    : String(a.answer ?? ''));
  if (!t.trim() || a.answer == null) throw new Error(`${q.id}: no answer`);
  return t;
}

const href = (p) => `./${p.replace(/ /g, '%20')}`;

function lookIn(q) {
  const pages = q['Look in'].split(/;\s*/).filter(Boolean);
  if (!pages.length && q.Type !== 'none') throw new Error(`${q.id}: no Look in`);
  for (const p of pages) if (!fs.existsSync(path.join(REPO, p))) throw new Error(`${q.id}: Look in ${p}: no such page`);
  return pages.map((p) => `[${p.replace(/\.md$/, '')}](${href(p)})`).join(', ');
}

function record(q, a) {
  const key = (k, v) => (v === '' ? `- ${k}:` : `- ${k}: ${v}`);
  return [`### Question: ${q.id}`, '',
    key('Tier', q.Tier), key('Ask', q.Ask), key('Answer', words(q, a)), key('Type', q.Type),
    key('Tolerance', q.Tolerance), key('Look in', lookIn(q)), '', a.note, ''].join('\n');
}

function page(questions, answers) {
  const n = questions.length;
  return [`# Questions and answers`, '',
    `${n} questions a careful reader of this book can answer, from the plainest (one rent, one place, one year) ` +
    'to the hardest (what changed, and why), each with its answer and the page to look in. Read a question, open ' +
    'the page, and find the answer yourself; or put the questions to a reader or an agent with this page hidden, ' +
    'and mark what comes back. Where the book cannot answer, the right answer is to say so. The answers are worked ' +
    "out afresh from HUD's own files at every release, not copied from the pages: where the two disagree, one is wrong.", '',
    ...questions.map((q) => record(q, answers[q.id]))].join('\n');
}

function main() {
  const questions = parse(fs.readFileSync(path.join(__dirname, 'faq.md'), 'utf8'));
  const ids = questions.map((q) => q.id);
  if (new Set(ids).size !== ids.length) throw new Error('faq.md: an id given twice');
  const extra = Object.keys(ANSWERS).filter((k) => !ids.includes(k));
  if (extra.length) throw new Error(`faq.js: answers with no question in faq.md: ${extra}`);
  const answers = compute(ids);
  fs.writeFileSync(path.join(REPO, 'FAQ.md'), page(questions, answers));
  console.log(`FAQ.md: ${questions.length} questions, ${questions.filter((q) => q.Type === 'none').length} the book does not answer`);
}

module.exports = { parse, compute, record, words, NOT_SAID };
if (require.main === module) main();
