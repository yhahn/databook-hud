#!/usr/bin/env node
// Writes .import/counties.json: the name of every county (and Connecticut
// planning region, and New England county) by its five-digit code, as HUD's
// income limits files name it, FY1998 on, the latest year's name winning:
// in New England from County_Name (its rows are towns, FY2006 on), elsewhere
// from each county's own row (`…99999`, or before FY2006 the county's row).
// The rents' and limits' importers read it to name New England's county
// folders, the tax credits' to name every county's (SPEC B7, B8). The rents'
// file and the tax credits' name no county, so the names come from here, for
// all alike. Run once, and again when a new limits year is kept:
//
//   node .import/counties.js

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const XLSX = require('./limits/node_modules/xlsx');
const { FILES, readYear } = require('./limits/sources');

const NEW_ENGLAND = ['09', '23', '25', '33', '44', '50'];
const SRC = path.join(os.homedir(), '.cache/proper/hud/il');
const names = {};
// FY2026 cuts names at 26 letters ("Fairbanks North Star Borou"): where it
// has, the whole name an earlier year gave is kept
const put = (k, name) => {
  const was = names[k];
  if (name.length === 26 && was && was.length > 26 && was.toLowerCase().startsWith(name.toLowerCase())) return;
  names[k] = name;
};
for (const y of Object.keys(FILES).map(Number).sort()) {
  // every county's own row: the county's name
  for (const r of readYear(SRC, y).rows) {
    const k = r.stateFips + r.county3;
    if (NEW_ENGLAND.includes(r.stateFips)) continue;
    if (r.fips && !r.fips.endsWith('99999')) continue;
    // a name HUD wrote all in capitals (DADE COUNTY, FY1998), as the limits write it
    let name = r.name.replace(/\s+\(part\)$/i, '').trim();
    if (name === name.toUpperCase()) name = name.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
    if (name) put(k, name);
  }
  if (y < 2006) continue;
  // New England's rows are towns: their county's name is County_Name
  const wb = XLSX.readFile(path.join(SRC, FILES[y]), { sheets: 0, sheetRows: 10000 });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
  for (const r of rows) {
    const fips = String(r.fips ?? r.fips2010 ?? '').padStart(10, '0');
    const name = String(r.County_Name ?? '').trim();
    if (!name || !NEW_ENGLAND.includes(fips.slice(0, 2))) continue;
    put(fips.slice(0, 5), name);
  }
}
const sorted = Object.fromEntries(Object.entries(names).sort());
fs.writeFileSync(path.join(__dirname, 'counties.json'), JSON.stringify(sorted, null, 1) + '\n');
const ne = Object.keys(sorted).filter((k) => NEW_ENGLAND.includes(k.slice(0, 2))).length;
console.log(`${Object.keys(sorted).length} counties named (${ne} in New England, counties and planning regions)`);
