#!/usr/bin/env node
// The Income Limits' importer, for databook-hud's limits/: HUD's Section 8
// income limits, FY1998 to the latest year kept.
//
//   node .import/limits/import.js [--src ~/.cache/proper/hud/il] [--out <repo>/limits]
//
// A page a place (SPEC B7), in its state's folder (in New England, its
// county's), each state and New England county a page listing its places;
// a record a county (or New England town) as HUD keys it today,
// `# Limits: <name>`, by its 10-digit FIPS, the rents' key. Each
// record carries its median family income and its limits as cards, years
// across, and the areas it has belonged to. Where HUD changed a definition
// or a key, the older form is kept apart and never spliced (SPEC D1-D7):
// the plain 30% limit to FY2014, New England's county rows before FY2006,
// the places HUD no longer lists. Says what it wrote, and every row it could
// not key. Tests: import.test.js, vectors/.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { FILES, OLD30, STATES, SIZES, readYear } = require('./sources');

const YEARS = Object.keys(FILES).map(Number).sort();
const LATEST = YEARS[YEARS.length - 1];
const KEYED = 2006; // from FY2006 the files carry the FIPS; before, state, county and MSA
const ELI = 2014; // the extremely low income limit, redefined (Consolidated Appropriations Act, 2014)
const OLD30_YEARS = YEARS.filter((y) => y >= 1999 && y <= ELI); // FY1998 has no 30% limit
const NEW_ENGLAND = new Set(['09', '23', '25', '33', '44', '50']);
// New England's counties (Connecticut's planning regions, and its counties
// before them) by code, as HUD's files name them: .import/counties.js
const COUNTIES = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'counties.json'), 'utf8'));

const LEVELS = [
  ['l30', 'Extremely low income (30%)', YEARS.filter((y) => y >= ELI)],
  ['l50', 'Very low income (50%)', YEARS],
  ['l80', 'Low income (80%)', YEARS],
];

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stateOf = (fips) => STATES[fips.slice(0, 2)];
// HUD's nonmetropolitan mark before FY2006: 0 to FY2002, 10000 from FY2003
const msaOf = (code) => (code === '0' ? '10000' : code);
const isCounty = (fips) => /9999[89]$/.test(fips);

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

// --- the records: today's places, then the years matched to them ----------

function build({ byYear, old30 }) {
  const rowsOf = (y) => byYear.get(y) ?? [];
  const ledger = YEARS.map((y) => ({ year: y, rows: rowsOf(y).length, exact: 0, byName: 0, county: 0, era: 0, orphan: 0, second: 0, twice: 0 }));
  const L = (y) => ledger.find((l) => l.year === y);

  const records = new Map(); // fips -> record
  const newRecord = (row, fips) => ({
    fips, name: row.name, alpha: row.alpha || stateOf(fips)[0], stateFips: fips.slice(0, 2),
    years: new Map(), // year -> row
    county2006: null, // the state and county it lay in when keyed first (FY2006 or after)
    gone: false,
    second: null, // a second listing (…99998): the FIPS of the county it lists again
    codes: new Map(), // year -> the FIPS its row had that year
    era: null, // New England: the county row it lay in before FY2006 (the crosswalk)
  });
  const twice = [];
  for (const r of rowsOf(LATEST)) records.set(r.fips, newRecord(r, r.fips));

  // A name a state, for rows whose FIPS has changed (Connecticut's towns in
  // FY2025, a few towns in Maine and Massachusetts): matched only where the
  // name is one record's alone; and a base name a county, for a town whose
  // name and code both changed when it took a city's form ("Amesbury town"
  // to "Amesbury Town city" to "Amesbury city").
  const base = (s) => norm(s).replace(/( (town|city|plantation|township|gore|grant|location|purchase|unorganized territory|ut))+$/, '');
  const nameIndex = new Map();
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
    const rows = rowsOf(y);
    for (const r of [...rows.filter((r) => records.has(r.fips)), ...rows.filter((r) => !records.has(r.fips))]) {
      let rec = records.get(r.fips);
      const own = r.fips.endsWith('99998') && records.get(`${r.fips.slice(0, 5)}99999`);
      if (rec) { if (!rec.years.has(y)) (rec.second ? l.second++ : l.exact++); } else if (own) {
        // a county listed a second time, inside another area (Rockland and
        // Westchester, NY, FY2006-2020): its county's, not a place (D7)
        rec = Object.assign(newRecord(r, r.fips), { second: own.fips });
        records.set(r.fips, rec);
        l.second++;
      } else {
        rec = records.get(RENAMED[r.fips]) ?? nameIndex.get(`${r.stateFips}|${norm(r.name)}`) ?? baseIndex.get(`${r.fips.slice(0, 5)}|${base(r.name)}`);
        if (rec && !rec.years.has(y)) l.byName++;
        else {
          // a place HUD no longer lists (a county split or merged, a town
          // deorganized): a record of its own, under its last FIPS
          rec = newRecord(r, r.fips);
          rec.gone = true;
          records.set(r.fips, rec);
          l.orphan++;
        }
      }
      if (rec.years.has(y)) { l.twice++; twice.push(`FY${y} ${r.fips} ${r.name} (${r.areaName}): ${rec.fips} has FY${y} already`); continue; }
      rec.years.set(y, r);
      rec.codes.set(y, r.fips);
      if (!rec.county2006) rec.county2006 = r.fips.slice(0, 5);
      if (rec.gone) rec.name = r.name; // its name as it was last written
    }
  }

  // Before FY2006 a row is a county's part in one area. Outside New England a
  // county lay in one area, and its row is every record's within it. In New
  // England HUD drew areas by town but keyed these years by county: its rows
  // are records of their own (County before 2006), never a town's (D6).
  const eraRecords = new Map(); // county5|msa -> era record
  for (const y of YEARS.filter((y) => y < KEYED)) {
    const l = L(y);
    const parts = new Map();
    for (const r of rowsOf(y)) {
      let k = r.stateFips + r.county3;
      if (NEW_ENGLAND.has(r.stateFips)) {
        const ek = `${k}|${msaOf(r.areaCode)}`;
        if (!eraRecords.has(ek)) eraRecords.set(ek, { county5: k, msa: msaOf(r.areaCode), years: new Map(), towns: 0 });
        eraRecords.get(ek).years.set(y, r);
        l.era++;
        continue;
      }
      if (RENAMED[`${k}99999`]) k = RENAMED[`${k}99999`].slice(0, 5);
      if (!parts.has(k)) parts.set(k, []);
      parts.get(k).push(r);
    }
    // a county outside New England split between areas in a year (Crawford
    // County, MO, FY2003-2004): its parts are county rows of their own too,
    // and its record's year is empty
    for (const [k, p] of parts) {
      if (p.length < 2) continue;
      for (const r of p) {
        const ek = `${k}|${msaOf(r.areaCode)}`;
        if (!eraRecords.has(ek)) eraRecords.set(ek, { county5: k, msa: msaOf(r.areaCode), years: new Map(), towns: 0 });
        eraRecords.get(ek).years.set(y, r);
        l.era++;
      }
    }
    const claimed = new Set();
    for (const rec of records.values()) {
      // a county's row is its own record's: never a second listing's
      // (Rockland and Westchester's 99998 rows, FY2006-2020 only)
      if (NEW_ENGLAND.has(rec.stateFips) || !rec.fips.endsWith('99999')) continue;
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
        if (p.length === 1) { rec.years.set(y, p[0]); rec.name = rec.name || p[0].name; l.orphan++; }
      } else if (p.length === 1) l.county++;
    }
  }
  // the crosswalk at 2006: FY2006's msa column gives each New England town
  // the MSA it lay in, and so its county's row before
  const unmatched = [];
  for (const rec of records.values()) {
    const r = rec.years.get(KEYED);
    if (!NEW_ENGLAND.has(rec.stateFips) || !r) continue;
    const era = eraRecords.get(`${r.fips.slice(0, 5)}|${msaOf(r.oldMsa ?? '')}`);
    if (era && era.years.has(KEYED - 1)) { rec.era = era; era.towns++; } else unmatched.push(`${rec.fips} ${rec.name} (msa ${r.oldMsa})`);
  }

  // FY2014's plain 30% limit, by FIPS: the old definition in the year of the
  // new; the 50% and 80% limits and the median must be the same in both files
  const old30By = new Map();
  for (const [y, rows] of old30) {
    const now = new Map(rowsOf(y).map((r) => [r.fips, r]));
    for (const r of rows) {
      const n = now.get(r.fips);
      if (!n || n.median !== r.median || String(n.l50) !== String(r.l50) || String(n.l80) !== String(r.l80)) {
        throw new Error(`FY${y}: the two files differ beyond the 30% limit at ${r.fips} ${r.name}; read them before going on`);
      }
      old30By.set(`${y}|${r.fips}`, r.l30);
    }
    if (now.size !== rows.length) throw new Error(`FY${y}: ${now.size} rows in one file, ${rows.length} in the other`);
  }
  const old30Of = (rec, y) => {
    if (y === ELI) { const r = rec.years.get(y); return r ? old30By.get(`${y}|${r.fips}`) ?? null : null; }
    return y < ELI ? rec.years.get(y)?.l30 ?? null : null;
  };

  // --- writing --------------------------------------------------------------

  const all = [...records.values()].filter((r) => r.years.size > 0 && !r.second);
  const seconds = [...records.values()].filter((r) => r.second).sort((a, b) => a.fips.localeCompare(b.fips));
  const clashKeys = new Map();
  for (const r of all) { const k = `${r.stateFips}|${norm(r.name)}`; clashKeys.set(k, (clashKeys.get(k) ?? 0) + 1); }
  const clashes = new Set([...clashKeys].filter(([, n]) => n > 1).map(([k]) => k));
  const displayName = (rec) => {
    let name = titleCase(fullName(rec));
    if (clashes.has(`${rec.stateFips}|${norm(rec.name)}`)) name += ` (${rec.fips})`;
    return `${name}, ${rec.alpha || rec.years.get(Math.max(...rec.years.keys())).alpha}`;
  };
  const eraName = (e) => {
    const r = e.years.get(Math.max(...e.years.keys()));
    const county = titleCase(r.name.replace(/\s+\(part\)$/i, ''));
    return `${county}, ${stateOf(e.county5 + '00000')[0]} (${e.msa === '10000' ? 'nonmetro' : `MSA ${e.msa}`})`;
  };

  const texts = new Map(); // a record's name -> its markdown, for the tests
  const pages = {};
  const counts = {
    records: 0, current: 0, gone: 0, second: seconds.length, counties: 0, towns: 0, era: eraRecords.size, eraTowns: 0,
    unmatched: unmatched.length,
    tables: {},
    cells: Object.fromEntries(YEARS.map((y) => [y, 0])),
  };
  const tally = (table, rows, cells) => {
    const t = (counts.tables[table] ??= { rows: 0, cells: 0 });
    t.rows += rows; t.cells += cells;
  };
  const filled = (vals) => vals.filter((v) => v != null && v !== '').length;

  function recordText(rec) {
    const latestYear = Math.max(...rec.years.keys());
    const latest = rec.years.get(latestYear);
    const [f24, before, earlier] = fipsBefore(rec);
    const name = displayName(rec);
    const lines = [
      `# Limits: ${name}`, '',
      `- FIPS: ${rec.fips}`,
      `- FIPS 2024: ${f24}`,
      `- FIPS before: ${before}`,
      `- FIPS earlier: ${earlier}`,
      `- Level: ${isCounty(rec.fips) ? 'County' : 'Town'}`,
      `- State: ${stateOf(rec.fips)[1]}`,
      `- Area: ${latest.areaName ?? ''}`,
      // HUD's area codes since FY2006 (METRO…, NCNTY…); its MSA numbers before
      `- Metro code: ${latestYear >= KEYED ? latest.areaCode : ''}`,
      `- MSA: ${latestYear < KEYED ? latest.areaCode : ''}`,
      `- County before 2006: ${rec.era ? eraName(rec.era) : ''}`,
      `- Last year: ${rec.gone ? latestYear : ''}`,
    ];
    const median = YEARS.map((y) => rec.years.get(y)?.median);
    lines.push('', '## Median family income', '', ...card('Median family income', 'Measure', YEARS, [['Median', median]]));
    tally('Limits_Median_family_income', 1, filled(median));
    for (const [k, title, years] of LEVELS) {
      const rows = SIZES.map((n) => [n, years.map((y) => rec.years.get(y)?.[k]?.[n - 1])]);
      lines.push('', `## ${title}`, '', ...card(title, 'Persons', years, rows));
      tally(`Limits_${tableName(title)}`, 8, rows.reduce((s, [, v]) => s + filled(v), 0));
    }
    const old = SIZES.map((n) => [n, OLD30_YEARS.map((y) => old30Of(rec, y)?.[n - 1])]);
    if (old.some(([, v]) => filled(v))) {
      lines.push('', '## 30% limit, 1999 to 2014', '', ...plain('Persons', OLD30_YEARS, old));
      tally('Limits_30_limit_1999_to_2014', 8, old.reduce((s, [, v]) => s + filled(v), 0));
    }
    const runs = areas(rec);
    lines.push('', '## Areas', '', '| From | To | MSA | Metro code | Area |', '|---|---|---|---|---|');
    for (const a of runs) lines.push(`| ${a.from} | ${a.to} | ${a.from < KEYED ? a.code : ''} | ${a.from < KEYED ? '' : a.code} | ${a.name} |`);
    tally('Limits_Areas', runs.length, 0);
    const text = lines.join('\n');
    texts.set(name, text);
    counts.records++;
    for (const y of rec.years.keys()) counts.cells[y]++;
    return text;
  }

  const ERA_YEARS = YEARS.filter((y) => y < KEYED);
  function eraText(e) {
    const r = e.years.get(Math.max(...e.years.keys()));
    const name = eraName(e);
    const lines = [
      `### County before 2006: ${name}`, '',
      `- County FIPS: ${e.county5}`,
      `- State: ${stateOf(e.county5 + '00000')[1]}`,
      `- MSA: ${e.msa}`,
      `- Area: ${r.areaName ?? ''}`,
      `- Towns: ${e.towns}`,
    ];
    const median = ERA_YEARS.map((y) => e.years.get(y)?.median);
    lines.push('', '#### Median family income', '', ...plain('Measure', ERA_YEARS, [['Median', median]]));
    tally('County before 2006_Median_family_income', 1, filled(median));
    const sets = [['l30', '30% limit', ERA_YEARS.filter((y) => y >= 1999)], ['l50', 'Very low income (50%)', ERA_YEARS], ['l80', 'Low income (80%)', ERA_YEARS]];
    for (const [k, title, years] of sets) {
      const rows = SIZES.map((n) => [n, years.map((y) => e.years.get(y)?.[k]?.[n - 1])]);
      lines.push('', `#### ${title}`, '', ...plain('Persons', years, rows));
      tally(`County before 2006_${tableName(title)}`, 8, rows.reduce((s, [, v]) => s + filled(v), 0));
    }
    texts.set(name, lines.join('\n'));
    counts.eraTowns += e.towns;
    return lines.join('\n');
  }

  // a county listed a second time inside another area: on its county's page,
  // after its record, with the limits of the area it was listed in (D7)
  const SECOND_YEARS = YEARS.filter((y) => y >= KEYED);
  const secondName = (s) => `${titleCase(s.name)}, ${stateOf(s.fips)[0]} (${s.fips})`;
  function secondText(s) {
    const ys = [...s.years.keys()];
    const last = s.years.get(Math.max(...ys));
    const name = secondName(s);
    const lines = [
      `### Second listing: ${name}`, '',
      `- FIPS: ${s.fips}`,
      `- Listing of: ${s.second}`,
      `- State: ${stateOf(s.fips)[1]}`,
      `- Area: ${last.areaName ?? ''}`,
      `- Metro code: ${last.areaCode}`,
      `- First year: ${Math.min(...ys)}`,
      `- Last year: ${Math.max(...ys)}`,
    ];
    const median = SECOND_YEARS.map((y) => s.years.get(y)?.median);
    lines.push('', '#### Median family income', '', ...plain('Measure', SECOND_YEARS, [['Median', median]]));
    tally('Second listing_Median_family_income', 1, filled(median));
    const sets = [...LEVELS.map(([k, title, years]) => [k, title, years.filter((y) => y >= KEYED)]), ['old30', '30% limit, 2006 to 2014', OLD30_YEARS.filter((y) => y >= KEYED)]];
    for (const [k, title, years] of sets) {
      const rows = SIZES.map((n) => [n, years.map((y) => (k === 'old30' ? old30Of(s, y) : s.years.get(y)?.[k])?.[n - 1])]);
      lines.push('', `#### ${title}`, '', ...plain('Persons', years, rows));
      tally(`Second listing_${tableName(title)}`, 8, rows.reduce((t, [, v]) => t + filled(v), 0));
    }
    const runs = areas(s);
    lines.push('', '#### Areas', '', '| From | To | Metro code | Area |', '|---|---|---|---|');
    for (const a of runs) lines.push(`| ${a.from} | ${a.to} | ${a.code} | ${a.name} |`);
    tally('Second listing_Areas', runs.length, 0);
    texts.set(name, lines.join('\n'));
    return lines.join('\n');
  }
  const secondsOf = (fips) => seconds.filter((s) => s.second === fips);
  const secondsText = (fips) => (secondsOf(fips).length ? ['', '## Second listings', '', secondsOf(fips).map(secondText).join('\n\n')] : []);

  const byState = new Map();
  for (const r of all) {
    if (!byState.has(r.stateFips)) byState.set(r.stateFips, []);
    byState.get(r.stateFips).push(r);
  }
  // a county's rows before FY2006 go on its county's page (B7): in New
  // England the county's own, listing its towns; elsewhere, its record's
  const erasOf = new Map(); // county5 -> era records
  for (const e of eraRecords.values()) {
    if (!erasOf.has(e.county5)) erasOf.set(e.county5, []);
    erasOf.get(e.county5).push(e);
  }
  for (const es of erasOf.values()) es.sort((a, b) => eraName(a).localeCompare(eraName(b)));
  const erasText = (k) => ['## Counties before 2006', '', (erasOf.get(k) ?? []).map(eraText).join('\n\n')];
  const PLACES = ['## Places', '', '| Place | FIPS | Level | Towns |', '|---|---|---|---|'];
  const keys = (level, st, sf, cf, c, t) => [`- Level: ${level}`, `- Postal code: ${st}`, `- State FIPS: ${sf}`, `- County FIPS: ${cf}`, `- Counties: ${c}`, `- Towns: ${t}`, ''];
  const page = (lines) => lines.join('\n').trimEnd() + '\n';
  const countyName = (k) => {
    if (!COUNTIES[k]) throw new Error(`no name for county ${k} in .import/counties.json: run node .import/counties.js`);
    return COUNTIES[k];
  };
  const states = [];
  const goneRecs = [];
  for (const [sf, recs] of [...byState].sort()) {
    const [alpha, stateName] = STATES[sf];
    const cur = recs.filter((r) => !r.gone).sort((a, b) => a.fips.localeCompare(b.fips));
    goneRecs.push(...recs.filter((r) => r.gone));
    const counties = cur.filter((r) => isCounty(r.fips)).length;
    const towns = cur.length - counties;
    counts.current += cur.length; counts.counties += counties; counts.towns += towns;
    const eraKeys = [...erasOf.keys()].filter((k) => k.slice(0, 2) === sf);
    const what = [counties && `${counties} ${counties === 1 ? 'county' : 'counties'}`, towns && `${towns} ${towns === 1 ? 'town' : 'towns'}`].filter(Boolean).join(' and ');
    let said = `HUD's Section 8 income limits for ${stateName}, fiscal years ${YEARS[0]} to ${LATEST}: ${what}, as HUD lists them in FY${LATEST}.`
      + (eraKeys.length && NEW_ENGLAND.has(sf) ? ` Before FY2006 HUD keyed New England's limits by county, not town: those rows are kept on each county's page, under Counties before 2006, and each town names its own as \`County before 2006\`.` : '')
      + (eraKeys.length && !NEW_ENGLAND.has(sf) ? ` Before FY2006 a county split between two areas in a year has its parts kept on its own page, under Counties before 2006, and its own year empty.` : '');
    const listed = []; // [code, row]
    let nCounties = counties;
    if (NEW_ENGLAND.has(sf)) {
      said += " Each county's page lists its towns.";
      const byCounty = new Map();
      for (const r of cur) { const k = r.fips.slice(0, 5); if (!byCounty.has(k)) byCounty.set(k, []); byCounty.get(k).push(r); }
      for (const k of eraKeys) if (!byCounty.has(k)) byCounty.set(k, []);
      nCounties = [...byCounty.values()].filter((c) => c.length).length;
      for (const [k, crecs] of [...byCounty].sort()) {
        const cname = countyName(k);
        const folder = safe(cname);
        const era = erasOf.has(k);
        if (!crecs.length) {
          // a county no more (Connecticut's, before its planning regions): its rows before FY2006
          pages[`${stateName}/${folder}.md`] = page([`# Income Limits: ${cname}, ${alpha}`, '', ...keys('County', alpha, sf, k, '', 0),
            `HUD's Section 8 income limits for ${cname}, ${stateName}, as HUD keyed them before FY${KEYED}, by county; its towns are now listed under their planning regions, each naming its county's row as \`County before 2006\`.`, '',
            ...erasText(k)]);
          listed.push([k, `| [${cname}, ${alpha}](${link(`${stateName}/${folder}.md`)}) | ${k} | County before 2006 |  |`]);
          continue;
        }
        const names = unique(crecs.map((r) => [stem(displayName(r)), r.fips]));
        const rows = crecs.map((r, i) => {
          pages[`${stateName}/${folder}/${names[i]}.md`] = page([recordText(r)]);
          return `| [${displayName(r)}](${link(`${folder}/${names[i]}.md`)}) | ${r.fips} | Town |  |`;
        });
        pages[`${stateName}/${folder}.md`] = page([`# Income Limits: ${cname}, ${alpha}`, '', ...keys('County', alpha, sf, k, '', crecs.length),
          `HUD's Section 8 income limits for the towns of ${cname}, ${stateName}, fiscal years ${YEARS[0]} to ${LATEST}, a page a town.`
            + (era ? ` Before FY${KEYED} HUD keyed New England's limits by county: the county's own rows are below, under Counties before 2006.` : ''), '',
          ...PLACES, ...rows, ...(era ? ['', ...erasText(k)] : [])]);
        listed.push([k, `| [${cname}, ${alpha}](${link(`${stateName}/${folder}.md`)}) | ${k} | County | ${crecs.length} |`]);
      }
    } else {
      const names = unique(cur.map((r) => [stem(displayName(r)), r.fips]));
      cur.forEach((r, i) => {
        const k = r.fips.slice(0, 5);
        const era = isCounty(r.fips) && erasOf.has(k);
        pages[`${stateName}/${names[i]}.md`] = page([recordText(r), ...secondsText(r.fips), ...(era ? ['', ...erasText(k)] : [])]);
        listed.push([r.fips, `| [${displayName(r)}](${link(`${stateName}/${names[i]}.md`)}) | ${r.fips} | ${isCounty(r.fips) ? 'County' : 'Town'} |  |`]);
      });
      for (const k of eraKeys) if (!cur.some((r) => r.fips === `${k}99999`)) throw new Error(`county ${k}'s rows before 2006 have no page to go on`);
    }
    said += ` How rent and income compare across its places, and how they have moved, is on its [rents page](${link(`../rents/${stateName}.md`)}).`;
    pages[`${stateName}.md`] = page([`# Income Limits: ${stateName}`, '', ...keys('State', alpha, sf, '', nCounties, towns), said, '',
      ...PLACES, ...listed.sort((a, b) => a[0].localeCompare(b[0])).map(([, l]) => l)]);
    states.push([stateName, counties, towns]);
  }
  goneRecs.sort((a, b) => a.fips.localeCompare(b.fips));
  const goneNames = unique(goneRecs.map((r) => [displayName(r), r.fips]));
  pages['Gone.md'] = page([
    '# Places HUD no longer lists', '',
    `${goneRecs.length} places HUD listed in some years and no longer does: a county split or merged, a town deorganized. Each is kept under its last FIPS, with its last year (\`- Last year:\`), so a count of the years it was listed still finds it. A page each:`, '',
    ...goneRecs.map((r, i) => {
      pages[`Gone/${goneNames[i]}.md`] = page([recordText(r)]);
      return `- [${displayName(r)}](${link(`Gone/${goneNames[i]}.md`)}): FIPS ${r.fips}, last listed FY${Math.max(...r.years.keys())}`;
    }),
  ]);
  counts.gone = goneRecs.length;
  for (const es of erasOf.values()) for (const e of es) if (!texts.has(eraName(e))) throw new Error(`${eraName(e)} on no page`);
  for (const s of seconds) if (!texts.has(secondName(s))) throw new Error(`${secondName(s)}: its county is on no page`);

  const changes = foundChanges({ records: all, eraRecords, ledger, rowsOf, old30By, unmatched, goneRecs, seconds, placeName: displayName, secondName });
  Object.assign(pages, changesPages(changes));
  counts.pages = Object.keys(pages).length + 1; // and README.md
  counts.changes = changes.map((c) => [c.year, c.title]);
  // every limit in HUD's files, to be found once in what is written
  const vals = (rows, f) => rows.reduce((s, r) => s + filled(f(r) ?? []), 0);
  const allRows = YEARS.flatMap(rowsOf);
  counts.source = {
    median: allRows.filter((r) => r.median != null).length,
    l50: vals(allRows, (r) => r.l50),
    l80: vals(allRows, (r) => r.l80),
    l30: vals(allRows.filter((r) => r.year < ELI), (r) => r.l30) + vals(old30.get(ELI) ?? [], (r) => r.l30),
    eli: vals(allRows.filter((r) => r.year >= ELI), (r) => r.l30),
  };

  // each place's median family income and very low income limit for four,
  // FY2006 on, by the FIPS it has now: for the rents' pages, which set rent
  // against income (.import/incomes.json, written by main; SPEC R2)
  const incomes = {};
  for (const rec of records.values()) {
    if (rec.gone || rec.second) continue;
    const median = {}, vli4 = {};
    for (const [y, r] of [...rec.years].sort((a, b) => a[0] - b[0])) {
      if (y < KEYED) continue;
      if (r.median != null) median[y] = r.median;
      if (r.l50?.[3] != null) vli4[y] = r.l50[3];
    }
    incomes[rec.fips] = { median, vli4 };
  }

  return { pages, texts, counts, ledger, twice, unmatched, states, changes, incomes };
}

// --- the changes in HUD's files (D5) ----------------------------------------

function foundChanges({ records, eraRecords, ledger, rowsOf, old30By, unmatched, goneRecs, seconds = [], placeName, secondName }) {
  const out = [];
  const firstWith = (test) => YEARS.find((y) => rowsOf(y).some(test));
  const eli = rowsOf(ELI).filter((r) => { const o = old30By.get(`${ELI}|${r.fips}`); return o && String(o) !== String(r.l30); }).length;
  out.push({
    title: 'Extremely low income redefined', year: ELI,
    was: 'the 30% limit: 30/50ths of the very low income limit',
    now: 'the greater of that and the federal poverty guideline for the household size, never above the very low income limit',
    cross: `FY${ELI} carries both: HUD's Section8.xls, the old 30% limit, is in each place's table "30% limit, 1999 to 2014"; its Poverty.xls, the new, begins the card "Extremely low income (30%)". The new differs from the old in ${eli} of ${rowsOf(ELI).length} places in FY${ELI}.`,
    places: eli,
    source: "HUD's FY2014 income limits, Section8.xls and Poverty.xls; the Consolidated Appropriations Act, 2014",
  });
  const ne05 = ledger.find((l) => l.year === KEYED - 1)?.era ?? 0;
  const ne06 = rowsOf(KEYED).filter((r) => NEW_ENGLAND.has(r.stateFips)).length;
  const tied = records.filter((r) => r.era).length;
  out.push({
    title: 'New England keyed by town', year: KEYED,
    was: `New England's limits by county, a row a county's part in one MSA (${ne05} rows in FY${KEYED - 1})`,
    now: `by town, as HUD draws New England's areas (${ne06} towns in FY${KEYED})`,
    cross: `FY${KEYED}'s msa column gives each town the MSA it lay in, and so its county's row before: \`- County before 2006:\` on ${tied} towns (${unmatched.length} not tied). The county rows are records of their own (County before 2006), ${eraRecords.size} of them; a town's own cards are empty before FY${KEYED}.`,
    places: tied,
    source: "HUD's FY2005 and FY2006 income limits (Section8FY2005.xls, Section8FY2006.xls)",
  });
  out.push({
    title: 'Areas renumbered', year: KEYED,
    was: "HUD's MSA numbers (5240), areas as OMB drew them in the 1990s",
    now: "HUD's area codes (METRO33860M33860, NCNTY…), areas from OMB's 2003 definitions and the 2000 Census",
    cross: `FY${KEYED} and FY${KEYED + 1} give each place's old MSA number beside its new code (msa, CBSASub); each place's Areas runs end at FY${KEYED - 1} under an MSA number and begin at FY${KEYED} under a Metro code.`,
    places: rowsOf(KEYED).length,
    source: "HUD's FY2006 income limits, the CBSASub and msa columns",
  });
  const mark = firstWith((r) => r.areaCode === '10000');
  out.push({
    title: "HUD's nonmetropolitan mark", year: mark,
    was: 'MSA 0 for a county outside a metropolitan area', now: 'MSA 10000',
    cross: "None needed: a code, not a move. The County before 2006 records count both as one (nonmetro).",
    places: rowsOf(mark).filter((r) => r.areaCode === '10000').length,
    source: `HUD's FY${mark - 1} and FY${mark} income limits`,
  });
  // codes: Connecticut's all at once; the rest year by year
  const moves = []; // [year, record, was, now]
  for (const rec of records) {
    const ys = [...rec.codes.keys()].sort();
    for (let i = 1; i < ys.length; i++) {
      const was = rec.codes.get(ys[i - 1]); const now = rec.codes.get(ys[i]);
      if (was !== now) moves.push([ys[i], rec, was, now]);
    }
  }
  const ct = moves.filter(([, , was, now]) => was.startsWith('090') && now.startsWith('091'));
  if (ct.length) {
    const y = ct[0][0];
    out.push({
      title: "Connecticut's planning regions", year: y,
      was: "towns keyed by Connecticut's eight counties (090xx)",
      now: 'towns keyed by its nine planning regions (0911x to 0919x)',
      cross: `Each town: \`- FIPS 2024:\` holds its old code (${ct.length} towns). The rents made the same change in FY2026.`,
      places: ct.length,
      source: `HUD's FY${y - 1} and FY${y} income limits`,
    });
  }
  const other = moves.filter((m) => !ct.includes(m));
  const listed = new Map(); // year -> [[place, was, now]]
  const add = (y, row) => { if (!listed.has(y)) listed.set(y, []); listed.get(y).push(row); };
  for (const [y, rec, was, now] of other) add(y, [placeName(rec), was, now, 'new code']);
  for (const rec of goneRecs) {
    const last = Math.max(...rec.years.keys());
    if (last >= KEYED) add(YEARS[YEARS.indexOf(last) + 1], [placeName(rec), rec.fips, '', 'no longer listed']);
  }
  for (const s of seconds) {
    const last = Math.max(...s.years.keys());
    if (last < LATEST) add(YEARS[YEARS.indexOf(last) + 1], [secondName(s), s.fips, '', 'second listing ended']);
  }
  for (const rec of records) {
    if (rec.gone) continue;
    const first = Math.min(...[...rec.years.keys()].filter((y) => y >= KEYED));
    if (first > KEYED) add(first, [placeName(rec), '', rec.codes.get(first), 'first listed']);
  }
  for (const [y, rows] of [...listed].sort((a, b) => a[0] - b[0])) {
    const n = (w) => rows.filter((r) => r[3] === w).length;
    const parts = [n('new code') && `${n('new code')} under a new code`, n('first listed') && `${n('first listed')} first listed`, n('no longer listed') && `${n('no longer listed')} no longer listed`, n('second listing ended') && `${n('second listing ended')} second listings ended`].filter(Boolean);
    out.push({
      title: 'Places recoded, listed or dropped', year: y,
      was: `the places as HUD listed them in FY${YEARS[YEARS.indexOf(y) - 1]}`,
      now: `${parts.join(', ')} in FY${y}`,
      cross: 'A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`; a second listing of a county, inside another area, is on the county\'s page.',
      places: rows.length,
      source: `HUD's FY${YEARS[YEARS.indexOf(y) - 1]} and FY${y} income limits`,
      table: rows.sort((a, b) => a[0].localeCompare(b[0])),
    });
  }
  return out.sort((a, b) => a.year - b.year);
}

function changesPages(changes) {
  const pages = {};
  const listed = [];
  for (const c of changes) {
    const fn = safe(`${c.title}, ${c.year}`);
    const lines = [`# Change: ${c.title}, ${c.year}`, '',
      '- Dataset: Income Limits',
      `- Boundary: ${c.year}`,
      `- Was: ${c.was}`,
      `- Now: ${c.now}`,
      `- Crosswalk: ${c.cross}`,
      `- Places: ${c.places}`,
      `- Source: ${c.source}`, ''];
    if (c.table) {
      lines.push('## Places', '', '| Place | Was | Now | What |', '|---|---|---|---|');
      for (const [p, was, now, what] of c.table) lines.push(`| ${p} | ${was} | ${now} | ${what} |`);
    }
    pages[`Changes/${fn}.md`] = lines.join('\n').trimEnd() + '\n';
    listed.push(`- [${c.title}, ${c.year}](${link(`Changes/${fn}.md`)})`);
  }
  pages['Changes.md'] = ['# Changes in the Income Limits', '',
    "Where HUD's files change a definition or a key during their years: the latest form is kept in the cards, the older only in tables or records of their own, and nothing runs across a change. A change a page:", '',
    ...listed].join('\n') + '\n';
  return pages;
}

// --- small things ------------------------------------------------------------

const cell = (v) => (v == null ? '' : String(v));

// B7: a page's name, made safe for a file (a slash a dash, the characters no
// file system takes dropped, spaces single, no leading dot); a link to it,
// every character but letters, digits and -_.~, as %XX; names a folder's
// pages would share, whatever their case, each given its FIPS. As the
// rents' importer does.
const safe = (name) => name.normalize('NFC').replace(/[/\\]/g, '-').replace(/[:*?"<>|\x00-\x1f]/g, '').split(/\s+/).filter(Boolean).join(' ').replace(/^[. ]+/, '');
// (the comma left as it is: proper reads %2C in a link as itself)
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%2C/g, ',');
const link = (p) => './' + p.split('/').map(enc).join('/');
function unique(named) {
  const n = new Map();
  for (const [name] of named) { const k = safe(name).toLowerCase(); n.set(k, (n.get(k) ?? 0) + 1); }
  return named.map(([name, fips]) => safe(name) + (n.get(safe(name).toLowerCase()) > 1 ? ` (${fips})` : ''));
}
// a place's page name: its record's name, less the state's code
const stem = (name) => name.replace(/, [A-Z]{2}$/, '');
const titleCase = (s) => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : s);
// the table proper gathers a heading's card or table as
const tableName = (title) => title.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

// FY2026 cuts names at 26 letters ("Penobscot Indian Island Re"): where it
// has, the name an earlier year gave whole.
function fullName(rec) {
  if (rec.name.length !== 26) return rec.name;
  const whole = [...rec.years.values()].map((r) => r.name).filter((n) => n.length > 26 && n.toLowerCase().startsWith(rec.name.toLowerCase()));
  return whole.length ? whole[whole.length - 1] : rec.name;
}

function card(title, head, years, rows) {
  return [`> [!CARD:line] ${title}`, `> | ${head} | ${years.join(' | ')} |`, `> |${'---|'.repeat(years.length + 1)}`,
    ...rows.map(([label, vals]) => `> | ${label} | ${vals.map(cell).join(' | ')} |`)];
}

function plain(head, years, rows) {
  return [`| ${head} | ${years.join(' | ')} |`, `|${'---|'.repeat(years.length + 1)}`,
    ...rows.map(([label, vals]) => `| ${label} | ${vals.map(cell).join(' | ')} |`)];
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
// (090xx, before its planning regions) as `FIPS 2024`; any other, the
// latest as `FIPS before`, the one before it as `FIPS earlier`.
function fipsBefore(rec) {
  const before = new Set([...rec.codes.values()].filter((f) => f !== rec.fips));
  const ct = [...before].filter((f) => f.startsWith('090') && rec.fips.startsWith('091'));
  const ys = [...rec.codes.keys()].sort((a, b) => b - a);
  const other = [];
  for (const y of ys) { const f = rec.codes.get(y); if (f !== rec.fips && !ct.includes(f) && !other.includes(f)) other.push(f); }
  return [ct[0] ?? '', other[0] ?? '', other[1] ?? ''];
}

// --- the run -------------------------------------------------------------------

function main() {
  const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback; };
  const SRC = arg('src', path.join(os.homedir(), '.cache/proper/hud/il'));
  const OUT = path.resolve(arg('out', path.join(__dirname, '..', '..', 'limits')));
  const shape = JSON.parse(fs.readFileSync(path.join(__dirname, 'shape.json'), 'utf8'));
  let byYear, old30;
  try {
    byYear = new Map(YEARS.map((y) => [y, readYear(SRC, y, shape).rows]));
    old30 = new Map(Object.entries(OLD30).map(([y, f]) => [Number(y), readYear(SRC, Number(y), shape, f).rows]));
  } catch (e) {
    if (e.name === 'ShapeError' || e.constructor.name === 'ShapeError') { console.error(e.message); process.exit(1); }
    throw e;
  }
  const { pages, counts, ledger, twice, unmatched, states, changes, incomes } = build({ byYear, old30 });
  pages['README.md'] = require('./readme').text({ YEARS, LATEST, counts, ledger, states, changes });

  fs.mkdirSync(OUT, { recursive: true });
  // clear what an earlier run wrote, so a page no longer written goes, and
  // the folders left empty
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

  console.log(`Wrote ${Object.keys(pages).length} pages: ${counts.records} records (${counts.current} listed in FY${LATEST}, ${counts.gone} gone), ${counts.second} second listings, ${counts.era} county rows before 2006, ${changes.length} changes.`);
  console.log('year  rows  exact byName county   era orphan second twice  records-with-year');
  for (const l of ledger) console.log([l.year, l.rows, l.exact, l.byName, l.county, l.era, l.orphan, l.second, l.twice, counts.cells[l.year]].map((v) => String(v).padStart(5)).join(' '));
  if (twice.length) console.log(`Rows a record had already in their year, not written:\n  ${twice.join('\n  ')}`);
  if (unmatched.length) console.log(`New England towns not tied to a county row before 2006:\n  ${unmatched.join('\n  ')}`);
  fs.writeFileSync(path.join(__dirname, 'counts.json'), JSON.stringify({ ...counts, ledger }, null, 1) + '\n');
  fs.writeFileSync(path.join(__dirname, '..', 'incomes.json'), JSON.stringify(incomes) + '\n');
}

module.exports = { build, YEARS, LATEST, safe, link, unique };
if (require.main === module) main();
