#!/usr/bin/env node
// The tax credits' importer, for databook-hud's lihtc/: HUD's National
// Low-Income Housing Tax Credit database, a project a row (LIHTCPUB.xlsx in
// lihtcpub.zip; its data dictionary beside it).
//
//   node .import/lihtc/import.js [--src ~/.cache/proper/hud/lihtc/src] [--out <repo>/lihtc]
//
// A record a project, `# Project: <name> (<HUD ID>)`, keyed by HUD's own id,
// every column of HUD's row written, its codes spelled out as the dictionary
// gives them, and its county's five-digit FIPS (from the latest tract HUD
// gives) so it joins the rents and the limits (SPEC B5, K2). A page a
// project, nested as a reader finds it: a state, its counties, a county's
// projects (B7). The source's shape is checked before anything is written
// (V1, shape.json). Tests: import.test.js, vectors/.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const XLSX = require('../limits/node_modules/xlsx');
const { STATES } = require('../limits/sources');
const { safe, link, unique } = require('../limits/import');

const FILE = 'LIHTCPUB.xlsx';
const COUNTIES = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'counties.json'), 'utf8'));
const BY_ALPHA = Object.fromEntries(Object.entries(STATES).map(([f, [a, n]]) => [a, [f, n]]));
const NEW_ENGLAND = new Set(['09', '23', '25', '33', '44', '50']);
const NO_COUNTY = 'County not given';

// --- the dictionary's codes (LIHTC Data Dictionary 2024, April 2026) ---------

const YES_NO = { 1: 'Yes', 2: 'No' };
const TARGET = { 1: 'Yes', 2: 'No', 0: 'Not indicated' };
const CODES = {
  scattered_site_cd: YES_NO, resyndication_cd: YES_NO, low_ceil: YES_NO, non_prof: YES_NO, basis: YES_NO,
  bond: YES_NO, mff_ra: YES_NO, fmha_514: YES_NO, fmha_515: YES_NO, fmha_538: YES_NO, home: YES_NO,
  tcap: YES_NO, cdbg: YES_NO, htf: YES_NO, fha: YES_NO, hopevi: YES_NO, tcep: YES_NO, rad: YES_NO,
  qozf: YES_NO, trgt_pop: YES_NO, qct: { 1: 'Yes', 2: 'No' }, nonprog: { 1: 'Yes' },
  trgt_fam: TARGET, trgt_eld: TARGET, trgt_dis: TARGET, trgt_hml: TARGET, trgt_oth: TARGET,
  aff_period: { 1: 'Yes', 2: 'No', 3: 'Not reported' },
  inc_ceil: { 1: '50% AMGI', 2: '60% AMGI', 3: 'Income average', 9: 'Not reported' },
  rentassist: { 1: 'Federal', 2: 'State', 3: 'Both federal and state', 4: 'Neither', 5: 'Unknown whether federal or state' },
  type: { 1: 'New construction', 2: 'Acquisition and rehab', 3: 'Both new construction and acquisition and rehab', 4: 'Existing' },
  credit: { 1: '30 percent present value', 2: '70 percent present value', 3: 'Both', 4: 'TCEP only' },
  metro: { 1: 'Metro, not central city', 2: 'Metro, central city', 3: 'Non-metro' },
  dda: { 0: 'Not in a DDA', 1: 'Metro DDA', 2: 'Non-metro DDA', 3: 'Metro GO Zone DDA', 4: 'Non-metro GO Zone DDA' },
  nlm_reason: { 1: 'Completed extended-use period', 2: 'Sale under qualified contract', 3: 'Other' },
  record_stat: { N: 'New', U: 'Updated', X: 'Existing, unchanged' },
};
const YEAR_MISSING = { 8888: 'Not confirmed (8888)', 9999: 'Confirmed, year not given (9999)' };

// The record's keys, in order: [key, column or function of the row]
const pad = (n) => (v) => (v === '' || v == null ? '' : String(v).padStart(n, '0'));
const year = (col) => (r) => (YEAR_MISSING[r[col]] ? '' : r[col]);
const missing = (col) => (r) => YEAR_MISSING[r[col]] ?? '';
const tract = (y) => (r) => (/^\d{11}$/.test(String(r[`fips${y}`])) ? r[`fips${y}`] : '');
// a ZIP code (99654, or 94579-2157 written 94579 and 2157); a name in its
// place (eight, a person's), not a ZIP, blank
const zipOf = (r) => {
  const m = /^(\d{5})-?(\d{4})?$/.exec(String(r.proj_zip));
  return m ? [m[1], m[2] ?? ''] : ['', ''];
};
const KEYS = [
  ['HUD ID', 'hud_id'], ['HUD ID before', (r) => idBefore(r.datanote)], ['Project', 'project'],
  ['Address', 'proj_add'], ['City', 'proj_cty'], ['State', 'proj_st'], ['ZIP', (r) => zipOf(r)[0]], ['ZIP extension', (r) => zipOf(r)[1]],
  ['State project ID', 'state_id'], ['Latitude', 'latitude'], ['Longitude', 'longitude'],
  ['County FIPS', (r) => countyOf(r)[0]], ['County from', (r) => countyOf(r)[1]],
  // a tract: its eleven digits, blank where HUD writes X for one missing
  ['Tract 2020', tract(2020)], ['Tract 2010', tract(2010)], ['Tract 2000', tract(2000)], ['Tract 1990', tract(1990)],
  // place codes: FIPS place codes are five digits, the 1990 Census place codes
  // four; HUD's spreadsheet stores them as numbers, losing the leading zeros
  ['Place 2020', (r) => pad(5)(r.place2020)], ['Place 2010', (r) => pad(5)(r.place2010)],
  ['Place 2000', (r) => pad(5)(r.place2000)], ['Place 1990', (r) => pad(4)(r.place1990)],
  ['Year placed in service', year('yr_pis')], ['Placed in service note', missing('yr_pis')],
  ['Allocation year', year('yr_alloc')], ['Allocation year note', missing('yr_alloc')],
  ['Allocation amount', 'allocamt'],
  ['Units', 'n_unitsr'], ['Low-income units', 'li_unitr'],
  ['Units reported', 'n_units'], ['Low-income reported', 'li_units'],
  ['Efficiencies', 'n_0br'], ['1-bedroom units', 'n_1br'], ['2-bedroom units', 'n_2br'],
  ['3-bedroom units', 'n_3br'], ['4-bedroom units', 'n_4br'],
  ['Construction', 'type'], ['Credit', 'credit'], ['Income ceiling', 'inc_ceil'],
  ['Rents below ceiling', 'low_ceil'], ['Units below ceiling', 'ceilunit'],
  ['Affordable over 30 years', 'aff_period'], ['Affordability years', 'aff_yrs'],
  ['Non-profit sponsor', 'non_prof'], ['Increased basis', 'basis'], ['Tax-exempt bond', 'bond'],
  ['HUD multifamily aid', 'mff_ra'], ['RHS 514 loan', 'fmha_514'], ['RHS 515 loan', 'fmha_515'], ['RHS 538 loan', 'fmha_538'],
  ['HOME', 'home'], ['HOME amount', 'home_amt'], ['CDBG', 'cdbg'], ['CDBG amount', 'cdbg_amt'],
  ['TCAP', 'tcap'], ['TCAP amount', 'tcap_amt'], ['TCEP', 'tcep'], ['TCEP amount', 'tcep_amt'],
  ['HTF', 'htf'], ['HTF amount', 'htf_amt'], ['FHA', 'fha'], ['HOPE VI', 'hopevi'], ['HOPE VI amount', 'hpvi_amt'],
  ['RAD', 'rad'], ['QOZF', 'qozf'], ['QOZF amount', 'qozf_amt'], ['Rental assistance', 'rentassist'],
  ['Targets a population', 'trgt_pop'], ['Families', 'trgt_fam'], ['Elderly', 'trgt_eld'], ['Disabled', 'trgt_dis'],
  ['Homeless', 'trgt_hml'], ['Other population', 'trgt_oth'], ['Other population named', 'trgt_spc'],
  ['Scattered site', 'scattered_site_cd'], ['Resyndicated', 'resyndication_cd'],
  ['Metro', 'metro'], ['DDA', 'dda'], ['QCT', 'qct'],
  ['No longer monitored', 'nonprog'], ['Why no longer monitored', 'nlm_reason'], ['Why, other', 'nlm_spc'],
  ['Data note', 'datanote'], ['Record status', 'record_stat'],
];

// HUD's note on a record re-keyed: "PREV HUD_ID IS ALA19950137", "PREV HUD_ID=…", "PREV HUD_ID: …"
function idBefore(note) {
  const m = /PREV(?:IOUS)?\s*HUD[_ ]ID\s*(?:IS|=|:)?\s*([A-Z]{3}[0-9X]{7,8})/.exec(String(note ?? '').toUpperCase());
  return m ? m[1] : '';
}

// A project's county: the first five characters of the latest tract HUD
// gives that names one (2020, then 2010, 2000, 1990; `X` where missing)
function countyOf(r) {
  for (const y of [2020, 2010, 2000, 1990]) {
    const c = String(r[`fips${y}`] ?? '').slice(0, 5);
    if (/^\d{5}$/.test(c)) return [c, y];
  }
  return ['', ''];
}

// a cell, as a key's value: a code spelled out where the dictionary gives
// it, else as HUD writes it (a code it does not give, bare)
function value(r, col) {
  const v = r[col];
  if (v === '' || v == null) return '';
  const codes = CODES[col];
  if (codes && codes[v] !== undefined) return codes[v];
  return String(v).replace(/\s+/g, ' ').trim();
}
const keyValue = (r, src) => (typeof src === 'function' ? String(src(r)) : value(r, src));

// --- V1: the source's shape --------------------------------------------------

class ShapeError extends Error {}

function checkShape(heads, rows, shape) {
  const said = [];
  if (JSON.stringify(heads) !== JSON.stringify(shape.heads)) {
    const added = heads.filter((h) => !shape.heads.includes(h));
    const gone = shape.heads.filter((h) => !heads.includes(h));
    said.push(`its columns changed (new: ${added.join(', ') || 'none'}; gone: ${gone.join(', ') || 'none'}${added.length || gone.length ? '' : '; reordered'})`);
  }
  if (rows.length < shape.rows[0] || rows.length > shape.rows[1]) said.push(`${rows.length} rows, not ${shape.rows[0]} to ${shape.rows[1]}`);
  const ids = new Set();
  let badId = 0;
  for (const r of rows) {
    if (!/^[A-Z]{3}[0-9X]{8}$/.test(r.hud_id) || ids.has(r.hud_id)) badId++;
    ids.add(r.hud_id);
  }
  if (badId) said.push(`${badId} HUD IDs not eleven characters or not unique`);
  const states = [...new Set(rows.map((r) => r.proj_st))].filter((s) => !BY_ALPHA[s]);
  if (states.length) said.push(`states not known: ${states.join(', ')}`);
  const tracts = rows.filter((r) => [1990, 2000, 2010, 2020].some((y) => !/^[0-9X]{11}$/.test(String(r[`fips${y}`])))).length;
  if (tracts) said.push(`${tracts} rows with a tract not eleven characters`);
  // every coded column's values as last read: a new code may be a new meaning
  for (const [col, seen] of Object.entries(shape.codes)) {
    const now = [...new Set(rows.map((r) => String(r[col])))].filter((v) => !seen.includes(v));
    if (now.length) said.push(`${col} has values not seen before: ${now.join(', ')}`);
  }
  const years = [...new Set(rows.map((r) => r.yr_pis))].filter((y) => !(y >= 1987 && y <= shape.lastYear) && !YEAR_MISSING[y] && !shape.oddYears.includes(y));
  if (years.length) said.push(`years placed in service not known: ${years.join(', ')}`);
  if (said.length) throw new ShapeError(`HUD's ${FILE} is not the shape this importer knows: ${said.join('; ')}. Read it and its dictionary, mend the importer and shape.json, and say the change.`);
}

// the shape as read now, for shape.json (--shape)
function shapeOf(heads, rows) {
  const codes = {};
  for (const col of [...Object.keys(CODES)].sort()) codes[col] = [...new Set(rows.map((r) => String(r[col])))].sort();
  return {
    file: FILE, heads, rows: [rows.length, rows.length], lastYear: 2024,
    oddYears: [...new Set(rows.map((r) => r.yr_pis))].filter((y) => y > 2024 && !YEAR_MISSING[y]).sort(), codes,
  };
}

// --- the records and pages ----------------------------------------------------

function build(rows) {
  const titleOf = (r) => `${String(r.project).replace(/\s+/g, ' ').trim() || 'Unnamed'} (${r.hud_id})`;
  const texts = new Map();
  const counts = {
    projects: 0, states: 0, counties: 0, pages: 0, ids_before: 0, bare_codes: 0, unplaced: 0, elsewhere: 0,
    county_from: '', join_county: 0, unnamed: {},
    source: {
      rows: rows.length, units: 0, li_units: 0, units_reported: 0, li_units_reported: 0,
      pis_missing: 0, alloc_missing: 0,
    },
  };
  const num = (v) => (v === '' || v == null ? 0 : Number(v));
  const from = {};
  for (const r of rows) {
    counts.source.units += num(r.n_unitsr); counts.source.li_units += num(r.li_unitr);
    counts.source.units_reported += num(r.n_units); counts.source.li_units_reported += num(r.li_units);
    if (YEAR_MISSING[r.yr_pis]) counts.source.pis_missing++;
    if (YEAR_MISSING[r.yr_alloc]) counts.source.alloc_missing++;
    const [c, y] = countyOf(r);
    from[y || 'none'] = (from[y || 'none'] ?? 0) + 1;
    if (c && !NEW_ENGLAND.has(c.slice(0, 2))) counts.join_county++;
    for (const col of Object.keys(CODES)) if (r[col] !== '' && r[col] != null && CODES[col][r[col]] === undefined) counts.bare_codes++;
    if (idBefore(r.datanote)) counts.ids_before++;
  }
  // a reader's way in (SPEC R2): the projects and low-income units by year
  // placed in service, and by state; the busiest year, and the median
  // project's low-income units up to it and after (read by .import/readme.py)
  const byYear = {}, byStateCount = {};
  for (const r of rows) {
    const [, stateName] = BY_ALPHA[r.proj_st];
    const s = (byStateCount[stateName] ??= { projects: 0, li_units: 0 });
    s.projects++; s.li_units += num(r.li_unitr);
    if (YEAR_MISSING[r.yr_pis] || r.yr_pis === '' || r.yr_pis == null) continue;
    const y = (byYear[r.yr_pis] ??= { projects: 0, li_units: 0 });
    y.projects++; y.li_units += num(r.li_unitr);
  }
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const peak = years.reduce((a, y) => (byYear[y].projects > byYear[a].projects ? y : a), years[0]);
  const med = (a) => { const v = [...a].sort((x, y) => x - y), m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
  const sized = rows.filter((r) => !YEAR_MISSING[r.yr_pis] && r.yr_pis !== '' && r.yr_pis != null && r.li_unitr !== '' && r.li_unitr != null);
  counts.reading = {
    by_year: byYear, by_state: byStateCount, first_year: years[0], last_year: years[years.length - 1],
    peak_year: peak, peak_projects: byYear[peak].projects,
    early_size: med(sized.filter((r) => r.yr_pis <= peak).map((r) => num(r.li_unitr))),
    late_size: med(sized.filter((r) => r.yr_pis > peak).map((r) => num(r.li_unitr))),
  };
  counts.county_from = Object.entries(from).sort((a, b) => String(b[0]).localeCompare(String(a[0]))).map(([k, n]) => `${k}:${n}`).join(' ');

  function recordText(r) {
    const name = titleOf(r);
    const lines = [`# Project: ${name}`, '', ...KEYS.map(([k, src]) => `- ${k}: ${keyValue(r, src)}`)];
    texts.set(name, lines.join('\n'));
    counts.projects++;
    return lines.join('\n');
  }

  const pages = {};
  const page = (lines) => lines.join('\n').trimEnd() + '\n';
  const cellText = (s) => String(s).replace(/\|/g, '-').replace(/\[/g, '(').replace(/\]/g, ')');
  const keys = (level, st, sf, cf, c, p, u, li) => [`- Level: ${level}`, `- Postal code: ${st}`, `- State FIPS: ${sf}`, `- County FIPS: ${cf}`,
    `- Counties: ${c}`, `- Projects: ${p}`, `- Units: ${u}`, `- Low-income units: ${li}`, ''];
  const sum = (rs, col) => rs.reduce((s, r) => s + num(r[col]), 0);

  // by state (as HUD addresses the project), then county (as its tract has it)
  const byState = new Map();
  for (const r of rows) {
    if (!byState.has(r.proj_st)) byState.set(r.proj_st, new Map());
    const [c] = countyOf(r);
    const [sf] = BY_ALPHA[r.proj_st];
    // a county in the project's own state; else none here (the tract's county
    // is still its key, County FIPS)
    const k = c && c.slice(0, 2) === sf ? c : '';
    if (!k) { counts.unplaced++; if (c) counts.elsewhere++; }
    const counties = byState.get(r.proj_st);
    if (!counties.has(k)) counties.set(k, []);
    counties.get(k).push(r);
  }
  const statesListed = [];
  for (const st of [...byState.keys()].sort((a, b) => BY_ALPHA[a][1].localeCompare(BY_ALPHA[b][1]))) {
    const [sf, stateName] = BY_ALPHA[st];
    const counties = [...byState.get(st)].sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)));
    const cname = (k) => {
      if (!k) return NO_COUNTY;
      // a county HUD's limits never name (two, in American Samoa and the
      // Northern Mariana Islands): by its code, not a name from elsewhere
      if (!COUNTIES[k]) { counts.unnamed[k] = true; return `County ${k}`; }
      return COUNTIES[k];
    };
    const folders = unique(counties.map(([k]) => [cname(k), k]));
    const listed = [];
    const all = counties.flatMap(([, rs]) => rs);
    counties.forEach(([k, rs], i) => {
      const folder = folders[i];
      rs.sort((a, b) => a.hud_id.localeCompare(b.hud_id));
      const names = rs.map((r) => safe(titleOf(r)));
      const projectRows = rs.map((r, j) => {
        pages[`${stateName}/${folder}/${names[j]}.md`] = page([recordText(r)]);
        return `| [${cellText(titleOf(r))}](${link(`${folder}/${names[j]}.md`)}) | ${r.hud_id} | ${cellText(value(r, 'proj_cty'))} | ${year('yr_pis')(r)} | ${value(r, 'n_unitsr')} | ${value(r, 'li_unitr')} |`;
      });
      const what = k
        ? `The low-income housing tax credit projects of ${cname(k)}, ${stateName}, as HUD's database has them (placed in service 1987 to 2024), a page a project.`
        : `The low-income housing tax credit projects HUD addresses in ${stateName} whose tracts name no county here: none at all, or one in another state (its \`County FIPS\` all the same). A page a project.`;
      pages[`${stateName}/${folder}.md`] = page([`# Tax Credit Projects: ${cname(k)}, ${st}`, '',
        ...keys('County', st, sf, k, '', rs.length, sum(rs, 'n_unitsr'), sum(rs, 'li_unitr')), what, '',
        '## Projects', '', '| Project | HUD ID | City | Year placed in service | Units | Low-income units |', '|---|---|---|---|---|---|',
        ...projectRows]);
      if (k) counts.counties++;
      listed.push(`| [${cname(k)}](${link(`${stateName}/${folder}.md`)}) | ${k} | ${rs.length} | ${sum(rs, 'n_unitsr')} | ${sum(rs, 'li_unitr')} |`);
    });
    const nCounties = counties.filter(([k]) => k).length;
    pages[`${stateName}.md`] = page([`# Tax Credit Projects: ${stateName}`, '',
      ...keys('State', st, sf, '', nCounties, all.length, sum(all, 'n_unitsr'), sum(all, 'li_unitr')),
      `The low-income housing tax credit projects of ${stateName} in HUD's database, placed in service 1987 to 2024: ${all.length} projects in ${nCounties} ${nCounties === 1 ? 'county' : 'counties'}, a county a page and a folder of its projects. What rent costs across its places, and against a low income, is on its [rents page](${link(`../rents/${stateName}.md`)}).`, '',
      '## Counties', '', '| County | FIPS | Projects | Units | Low-income units |', '|---|---|---|---|---|', ...listed]);
    statesListed.push([stateName, all.length, nCounties]);
    counts.states++;
  }

  const changes = foundChanges(rows);
  Object.assign(pages, changesPages(changes));
  counts.changes = changes.map((c) => [c.year, c.title]);
  counts.pages = Object.keys(pages).length + 1; // and README.md
  counts.unnamed = Object.keys(counts.unnamed).sort().join(' ');
  return { pages, texts, counts, states: statesListed, changes };
}

// --- the changes in HUD's dictionary, found in the data where they can be (D5)

function foundChanges(rows) {
  const n = (test) => rows.filter(test).length;
  const pis = (r) => (YEAR_MISSING[r.yr_pis] ? null : r.yr_pis);
  const firstAvg = Math.min(...rows.filter((r) => r.inc_ceil === 3 && pis(r)).map(pis));
  return [
    {
      title: 'HUD ID gains a digit', year: 2015,
      was: 'ten characters: the allocating agency (3), the year placed in service (4), a record number (3)',
      now: 'eleven: the eighth, inserted, the number of years after its first request a record was added to the database (0 for records added before the 2015 update)',
      cross: `None in this file: HUD gives only the new. An old ID is the new less its eighth character where that is 0 (HUD's dictionary). ${n((r) => r.hud_id[7] !== '0')} IDs have an eighth character not 0 (${n((r) => r.hud_id[7] === 'X')} of them X, which the dictionary does not explain).`,
      places: rows.length,
      source: "HUD's LIHTC Data Dictionary 2024 (April 2026), HUD_ID",
    },
    {
      title: 'Qualified census tracts on the 2000 tracts', year: 2004,
      was: "a project's QCT on the 1990 Census tracts (placed in service before 2003)",
      now: 'on the 2000 tracts (placed in service 2004 to 2012)',
      cross: `None: each project's QCT is its own year's, not redrawn. Its tracts of each census are beside it (Tract 1990, Tract 2000). The dictionary says nothing of 2003 (${n((r) => pis(r) === 2003)} projects).`,
      places: n((r) => pis(r) >= 2004 && pis(r) <= 2012),
      source: "HUD's LIHTC Data Dictionary 2024 (April 2026), QCT",
    },
    {
      title: 'Qualified census tracts on the 2010 tracts', year: 2013,
      was: 'on the 2000 Census tracts (placed in service 2004 to 2012)',
      now: 'on the 2010 tracts (placed in service 2013 to 2023)',
      cross: `None: each project's QCT is its own year's. Its tracts beside it (Tract 2000, Tract 2010). The dictionary says nothing of 2024 on (${n((r) => pis(r) >= 2024)} projects).`,
      places: n((r) => pis(r) >= 2013 && pis(r) <= 2023),
      source: "HUD's LIHTC Data Dictionary 2024 (April 2026), QCT",
    },
    {
      title: 'Income averaging', year: 2018,
      was: 'a project elected one rent and income ceiling for its low-income units: 50% or 60% of the area median gross income',
      now: 'or the average of its units\' ceilings, as the Consolidated Appropriations Act, 2018 allowed: Income ceiling "Income average" (code 3)',
      cross: `None needed: a new choice beside the old, which keep their meaning. ${n((r) => r.inc_ceil === 3)} projects elected it, the first placed in service in ${firstAvg} (${n((r) => r.inc_ceil === 3 && pis(r) === firstAvg)}), as reported later.`,
      places: n((r) => r.inc_ceil === 3),
      source: "HUD's LIHTC Data Dictionary 2024 (April 2026), INC_CEIL; the Consolidated Appropriations Act, 2018",
    },
  ].sort((a, b) => a.year - b.year);
}

function changesPages(changes) {
  const pages = {};
  const listed = [];
  for (const c of changes) {
    const fn = safe(`${c.title}, ${c.year}`);
    pages[`Changes/${fn}.md`] = [`# Change: ${c.title}, ${c.year}`, '',
      '- Dataset: Tax Credit Projects',
      `- Boundary: ${c.year}`,
      `- Was: ${c.was}`,
      `- Now: ${c.now}`,
      `- Crosswalk: ${c.cross}`,
      `- Places: ${c.places}`,
      `- Source: ${c.source}`].join('\n') + '\n';
    listed.push(`- [${c.title}, ${c.year}](${link(`Changes/${fn}.md`)})`);
  }
  pages['Changes.md'] = ['# Changes in the tax credit projects', '',
    "Where HUD's dictionary changes what a column or the key means during the database's years. A project is one record, of one year, so nothing is split: each change is said here, and its column read with it. A change a page:", '',
    ...listed].join('\n') + '\n';
  return pages;
}

// --- the run -------------------------------------------------------------------

// HUD's sheet as rows of cells (the first its heads), as objects by column
function toRows(raw) {
  const heads = raw[0].map(String);
  const rows = raw.slice(1).filter((r) => r.some((v) => v !== '')).map((r) => Object.fromEntries(heads.map((h, i) => [h, typeof r[i] === 'string' ? r[i].trim() : r[i]])));
  return { heads, rows };
}

function readSource(file) {
  const wb = XLSX.readFile(file, { dense: true });
  return toRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true }));
}

function main() {
  const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
  const SRC = arg('src', path.join(os.homedir(), '.cache/proper/hud/lihtc/src'));
  const OUT = path.resolve(arg('out', path.join(__dirname, '..', '..', 'lihtc')));
  const { heads, rows } = readSource(path.join(SRC, FILE));
  if (process.argv.includes('--shape')) {
    fs.writeFileSync(path.join(__dirname, 'shape.json'), JSON.stringify(shapeOf(heads, rows), null, 1) + '\n');
    console.log('shape.json written from the source as it is: read it before trusting it');
    return;
  }
  try {
    checkShape(heads, rows, JSON.parse(fs.readFileSync(path.join(__dirname, 'shape.json'), 'utf8')));
  } catch (e) {
    if (e instanceof ShapeError) { console.error(e.message); process.exit(1); }
    throw e;
  }
  const { pages, counts, states, changes } = build(rows);
  pages['README.md'] = require('./readme').text({ counts, states, changes });

  fs.mkdirSync(OUT, { recursive: true });
  const clear = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { clear(p); if (!fs.readdirSync(p).length) fs.rmdirSync(p); } else if (e.name.endsWith('.md')) fs.rmSync(p);
    }
  };
  clear(OUT);
  for (const [f, text] of Object.entries(pages)) {
    fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
    fs.writeFileSync(path.join(OUT, f), text);
  }
  fs.writeFileSync(path.join(__dirname, 'counts.json'), JSON.stringify(counts, null, 1) + '\n');
  console.log(`Wrote ${Object.keys(pages).length} pages: ${counts.projects} projects of ${rows.length} rows, ${counts.states} states, ${counts.counties} counties, ${counts.unplaced} in no county of their state (${counts.elsewhere} of them geocoded to another state), ${changes.length} changes.`);
  console.log(`County from the tracts of: ${counts.county_from}; codes not in the dictionary, left bare: ${counts.bare_codes}; HUD IDs before, from HUD's notes: ${counts.ids_before}.`);
}

module.exports = { build, checkShape, shapeOf, ShapeError, countyOf, idBefore, toRows, KEYS };
if (require.main === module) main();
