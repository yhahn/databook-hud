#!/usr/bin/env node
// Writes .import/counties.json: the name of every New England county (and
// Connecticut planning region) by its five-digit code, as HUD's income
// limits files name it (County_Name, FY2006 on; the latest year's name
// wins). Both importers read it to make New England's folders: a state, its
// counties, their towns (SPEC B7). The rents' file names no county, so the
// names come from here, for both alike. Run once, and again when a new
// limits year is kept:
//
//   node .import/counties.js

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const XLSX = require('./limits/node_modules/xlsx');
const { FILES } = require('./limits/sources');

const NEW_ENGLAND = ['09', '23', '25', '33', '44', '50'];
const SRC = path.join(os.homedir(), '.cache/proper/hud/il');
const names = {};
for (const y of Object.keys(FILES).map(Number).sort().filter((y) => y >= 2006)) {
  const wb = XLSX.readFile(path.join(SRC, FILES[y]), { sheets: 0, sheetRows: 10000 });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
  for (const r of rows) {
    const fips = String(r.fips ?? r.fips2010 ?? '').padStart(10, '0');
    const name = String(r.County_Name ?? '').trim();
    if (!name || !NEW_ENGLAND.includes(fips.slice(0, 2))) continue;
    names[fips.slice(0, 5)] = name;
  }
}
const sorted = Object.fromEntries(Object.entries(names).sort());
fs.writeFileSync(path.join(__dirname, 'counties.json'), JSON.stringify(sorted, null, 1) + '\n');
console.log(`${Object.keys(sorted).length} New England counties and planning regions named`);
