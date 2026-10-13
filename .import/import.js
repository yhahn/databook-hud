#!/usr/bin/env node
// Writes the Income Limits databook from HUD's Section 8 income limits,
// FY1998 to the latest year kept.
//
//   node .import/import.js [--from 1998] [--src ~/.cache/proper/hud/il] [--out <repo>]
//
// A file a state; a record a county (or New England town) as HUD keys it
// today, by its 10-digit FIPS, the key of the Fair Market Rents databook.
// Each record carries its median family income and its three limits as
// cards, years across, and the areas it has belonged to. Says what it wrote,
// and every row it could not key.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { FILES, STATES, SIZES, readYear } = require('./sources');

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
const SRC = arg('src', path.join(os.homedir(), '.cache/proper/hud/il'));
const OUT = path.resolve(arg('out', path.join(__dirname, '..')));
const YEARS = Object.keys(FILES).map(Number).filter((y) => y >= Number(arg('from', 1998))).sort();
const LATEST = YEARS[YEARS.length - 1];
const KEYED = 2006; // from FY2006 the files carry the FIPS; before, state, county and MSA

const LEVELS = [
  ['l30', 'Extremely low income (30%)'],
  ['l50', 'Very low income (50%)'],
  ['l80', 'Low income (80%)'],
];

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stateOf = (fips) => STATES[fips.slice(0, 2)];

// --- the records: today's areas, then the years matched to them -----------

const byYear = new Map(YEARS.map((y) => [y, readYear(SRC, y)]));
const ledger = YEARS.map((y) => ({ year: y, rows: byYear.get(y).length, exact: 0, byName: 0, county: 0, split: 0, orphan: 0, twice: 0 }));
const L = (y) => ledger.find((l) => l.year === y);

const records = new Map(); // fips -> record
const newRecord = (row, fips) => ({
  fips, name: row.name, alpha: row.alpha || stateOf(fips)[0], stateFips: fips.slice(0, 2),
  years: new Map(), // year -> row
  county2006: null, // the state and county it lay in when keyed first (FY2006 or after)
  gone: false,
  before: new Set(), // the FIPS it was written under in earlier years, where they differ
});
const twice = [];
for (const r of byYear.get(LATEST)) records.set(r.fips, newRecord(r, r.fips));

// A name a state, for rows whose FIPS has changed (Connecticut's towns in
// FY2023, a few towns in Maine and Massachusetts): matched only where the
// name is one record's alone.
const nameIndex = new Map();
// and a base name a county, for a town whose name and code both changed when
// it took a city's form ("Amesbury town" to "Amesbury Town city" to
// "Amesbury city", each with a new code): the same place, renamed.
const base = (s) => norm(s).replace(/( (town|city|plantation|township|gore|grant|location|purchase|unorganized territory|ut))+$/, '');
// Places the Census renamed with a new code, which no name would find: the
// county and town changes it publishes, each the same land under a new name.
const RENAMED = {
  1202599999: '1208699999', // Dade County, FL to Miami-Dade County (1997)
  4611399999: '4610299999', // Shannon County, SD to Oglala Lakota County (2015)
  '0227099999': '0215899999', // Wade Hampton Census Area, AK to Kusilvak (2015)
  2300978920: '2300978925', // Verona town, ME to Verona Island town
  2301584135: '2301584140', // Westport town, ME to Westport Island town
  2301957937: '2301957936', // Penobscot Indian Island Reservation, ME (its Penobscot County part)
  2500546575: '2500546598', // North Attleborough town, MA to North Attleborough Town city
  5000126275: '5000126300', // Ferrisburg town, VT to Ferrisburgh
  5001123875: '5001124050', // Enosburg town, VT to Enosburgh
  5001300700: '5001300860', // Alburg town, VT to Alburgh
};
const baseIndex = new Map();
const index = (map, k, rec) => map.set(k, map.has(k) ? null : rec);
for (const rec of records.values()) {
  index(nameIndex, `${rec.stateFips}|${norm(rec.name)}`, rec);
  index(baseIndex, `${rec.fips.slice(0, 5)}|${base(rec.name)}`, rec);
}

for (const y of YEARS.filter((y) => y >= KEYED)) {
  const l = L(y);
  // rows whose FIPS is a record's first, so that a name never takes a year
  // its own row holds (Rockland and Westchester, NY, are listed twice in
  // FY2006-2020: as themselves, 99999, and in the New York area, 99998)
  const rows = byYear.get(y);
  for (const r of [...rows.filter((r) => records.has(r.fips)), ...rows.filter((r) => !records.has(r.fips))]) {
    let rec = records.get(r.fips);
    if (rec) { if (!rec.years.has(y)) l.exact++; } else {
      rec = records.get(RENAMED[r.fips]) ?? nameIndex.get(`${r.stateFips}|${norm(r.name)}`) ?? baseIndex.get(`${r.fips.slice(0, 5)}|${base(r.name)}`);
      if (rec && !rec.years.has(y)) { l.byName++; rec.before.add(r.fips); }
      else {
        // an area HUD no longer lists (a county split or merged, a town
        // deorganized): a record of its own, under its last FIPS
        rec = newRecord(r, r.fips);
        rec.gone = true;
        records.set(r.fips, rec);
        l.orphan++;
      }
    }
    if (rec.years.has(y)) { l.twice++; twice.push(`FY${y} ${r.fips} ${r.name} (${r.areaName}): ${rec.fips} has FY${y} already`); continue; }
    rec.years.set(y, r);
    if (!rec.county2006) rec.county2006 = r.fips.slice(0, 5);
    if (rec.gone) rec.name = r.name; // its name as it was last written
  }
}

// Before FY2006 a row is a county's part in one area. Where a county lay
// wholly in one area, every record within it takes that row; where it was
// split among areas (New England's counties, mostly), no record can be told
// which part was its own, and the year is left empty.
for (const y of YEARS.filter((y) => y < KEYED)) {
  const l = L(y);
  const parts = new Map();
  for (const r of byYear.get(y)) {
    let k = r.stateFips + r.county3;
    if (RENAMED[`${k}99999`]) k = RENAMED[`${k}99999`].slice(0, 5);
    if (!parts.has(k)) parts.set(k, []);
    parts.get(k).push(r);
  }
  const claimed = new Set();
  for (const rec of records.values()) {
    const k = rec.county2006 ?? rec.fips.slice(0, 5);
    const p = parts.get(k);
    if (!p) continue;
    claimed.add(k);
    if (p.length === 1) rec.years.set(y, p[0]);
  }
  for (const [k, p] of parts) {
    if (!claimed.has(k)) {
      // a county gone before FY2006: a record of its own
      const fips = `${k}99999`;
      const rec = records.get(fips) ?? Object.assign(newRecord(p[0], fips), { gone: true });
      records.set(fips, rec);
      if (p.length === 1) { rec.years.set(y, p[0]); rec.name = rec.name || p[0].name; l.orphan++; } else l.split += p.length;
    } else if (p.length === 1) l.county++;
    else l.split += p.length;
  }
}

// --- writing ----------------------------------------------------------------

const cell = (v) => (v == null ? '' : String(v));
const titleCase = (s) => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : s);

// FY2026 cuts names at 26 letters ("Penobscot Indian Island Re"): where it
// has, the name an earlier year gave whole.
function fullName(rec) {
  if (rec.name.length !== 26) return rec.name;
  const whole = [...rec.years.values()].map((r) => r.name).filter((n) => n.length > 26 && n.toLowerCase().startsWith(rec.name.toLowerCase()));
  return whole.length ? whole[whole.length - 1] : rec.name;
}

function displayName(rec, clashes) {
  const latest = rec.years.get(Math.max(...rec.years.keys()));
  let name = titleCase(fullName(rec));
  if (clashes.has(`${rec.stateFips}|${norm(rec.name)}`)) name += ` (${rec.fips})`;
  return `${name}, ${rec.alpha || latest.alpha}`;
}

function card(title, head, rows) {
  const out = [`> [!CARD:line] ${title}`, `> | ${head} | ${YEARS.join(' | ')} |`, `> |${' --- |'.repeat(YEARS.length + 1).replace(/ /g, '')}`];
  for (const [label, vals] of rows) out.push(`> | ${label} | ${vals.map(cell).join(' | ')} |`);
  return out.join('\n');
}

// the areas a record has belonged to, a row a run of years
function areas(rec) {
  const runs = [];
  for (const y of YEARS) {
    const r = rec.years.get(y);
    if (!r) continue;
    const last = runs[runs.length - 1];
    // a run is one code over unbroken years; its name, the last written
    if (last && (last.from < KEYED) === (y < KEYED) && last.code === r.areaCode && last.to === YEARS[YEARS.indexOf(y) - 1]) { last.to = y; last.name = r.areaName ?? last.name; }
    else runs.push({ from: y, to: y, code: r.areaCode, name: r.areaName ?? '' });
  }
  return runs;
}

// Earlier keys, as the rents write them: Connecticut's old county codes
// (090xx, before its planning regions) as `FIPS 2024`, any other as
// `FIPS before`.
function fipsBefore(rec) {
  const ct = [...rec.before].filter((f) => f.startsWith('090') && rec.fips.startsWith('091'));
  const other = [...rec.before].filter((f) => !ct.includes(f)).sort();
  // the latest earlier code; the one before it, for the three places that
  // have had two
  const [latest, earlier] = other.reverse();
  return [...ct.map((f) => `- FIPS 2024: ${f}`), ...(latest ? [`- FIPS before: ${latest}`] : []), ...(earlier ? [`- FIPS earlier: ${earlier}`] : [])];
}

function recordText(rec, clashes) {
  const latest = rec.years.get(Math.max(...rec.years.keys()));
  const lines = [
    `### County: ${displayName(rec, clashes)}`, '',
    `- FIPS: ${rec.fips}`,
    ...fipsBefore(rec),
    `- Level: ${/9999[89]$/.test(rec.fips) ? 'County' : 'Town'}`,
    `- State: ${stateOf(rec.fips)[1]}`,
    `- Area: ${latest.areaName ?? ''}`,
    // HUD's area codes since FY2006 (METRO…, NCNTY…); its MSA numbers before
    ...(latest.year >= KEYED ? [`- Metro code: ${latest.areaCode}`] : [`- Metro code: none`, `- MSA: ${latest.areaCode}`]),
  ];
  if (rec.gone) lines.push(`- Last year: ${Math.max(...rec.years.keys())}`);
  lines.push('', '#### Median family income', '',
    card('Median family income', 'Measure', [['Median', YEARS.map((y) => rec.years.get(y)?.median)]]));
  for (const [k, title] of LEVELS) {
    lines.push('', `#### ${title}`, '',
      card(title, 'Persons', SIZES.map((n) => [n, YEARS.map((y) => rec.years.get(y)?.[k]?.[n - 1])])));
  }
  lines.push('', '#### Areas', '', '| From | To | MSA | Metro code | Area |', '|---|---|---|---|---|');
  for (const a of areas(rec)) lines.push(`| ${a.from} | ${a.to} | ${a.from < KEYED ? a.code : ''} | ${a.from < KEYED ? '' : a.code} | ${a.name} |`);
  return lines.join('\n');
}

const written = { files: 0, records: 0, gone: 0, cells: Object.fromEntries(YEARS.map((y) => [y, 0])) };
const all = [...records.values()].filter((r) => r.years.size > 0);
const clashKeys = new Map();
for (const r of all) { const k = `${r.stateFips}|${norm(r.name)}`; clashKeys.set(k, (clashKeys.get(k) ?? 0) + 1); }
const clashes = new Set([...clashKeys].filter(([, n]) => n > 1).map(([k]) => k));

// clear what an earlier run wrote (every state file; README.md is rewritten)
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.md') && f !== 'README.md' && !f.startsWith('.')) fs.rmSync(path.join(OUT, f));

const byState = new Map();
for (const r of all) {
  if (!byState.has(r.stateFips)) byState.set(r.stateFips, []);
  byState.get(r.stateFips).push(r);
}
for (const [sf, recs] of [...byState].sort()) {
  const [, stateName] = STATES[sf];
  recs.sort((a, b) => (a.gone - b.gone) || a.fips.localeCompare(b.fips));
  const text = [`# State: ${stateName}`, '', ...recs.map((r) => recordText(r, clashes) + '\n')].join('\n');
  fs.writeFileSync(path.join(OUT, `${stateName}.md`), text);
  written.files++;
  for (const r of recs) {
    written.records++;
    if (r.gone) written.gone++;
    for (const y of r.years.keys()) written.cells[y]++;
  }
}

const states = [...byState].sort().map(([sf, recs]) => {
  const cur = recs.filter((r) => !r.gone);
  return [STATES[sf][1], cur.filter((r) => /9999[89]$/.test(r.fips)).length, cur.filter((r) => !/9999[89]$/.test(r.fips)).length];
});
require('./readme').write(OUT, { YEARS, ledger, written, states });

console.log(`Wrote ${written.files} files, ${written.records} records (${written.gone} areas HUD no longer lists).`);
console.log('year  rows  exact byName county split orphan twice  records-with-year');
for (const l of ledger) console.log([l.year, l.rows, l.exact, l.byName, l.county, l.split, l.orphan, l.twice, written.cells[l.year]].map((v) => String(v).padStart(5)).join(' '));
if (twice.length) console.log(`Rows a record had already in their year, not written:\n  ${twice.join('\n  ')}`);
fs.writeFileSync(path.join(__dirname, 'ledger.json'), JSON.stringify({ ledger, written }, null, 1) + '\n');
