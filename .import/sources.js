// Reads each fiscal year's Section 8 income limits from HUD's files into
// one shape: a row an area-part (a county, a New England town, or before
// FY2006 a county's part in one metropolitan area), with its median family
// income and its limits at 30, 50 and 80 percent for households of 1 to 8.
//
// The files, a year each, kept in ~/.cache/proper/hud/il/fy<year>/:
//   FY1998-2000  allstate.txt, a block a county-area (fixed text)
//   FY2001-2005  a spreadsheet keyed by state, county and MSA
//   FY2006-2026  a spreadsheet keyed by a 10-digit FIPS (state, county,
//                New England town or 99999)

const fs = require('node:fs');
const path = require('node:path');
const XLSX = require('xlsx');

const FILES = {
  1998: 'fy1998/allstate.txt',
  1999: 'fy1999/allst99.txt',
  2000: 'fy2000/allst00.txt',
  2001: 'fy2001/incfy01.xls',
  2002: 'fy2002/prts801_02.xls',
  2003: 'fy2003/Section8.xls',
  2004: 'fy2004/Section8.xls',
  2005: 'fy2005/Section8FY2005.xls',
  2006: 'fy2006/Section8FY2006.xls',
  2007: 'fy2007/Section8-rev.xls',
  2008: 'fy2008/Section8_FY08.xls',
  2009: 'fy2009/Section8.xls',
  2010: 'fy2010/Section8.xls',
  2011: 'fy2011/Section8_v3.xls',
  2012: 'fy2012/Section8.xls',
  2013: 'fy2013/Section8.xls',
  // FY2014's Section8.xls gives the plain 30% limit; Poverty.xls the
  // extremely low income limit as the Act of 2014 defined it. Otherwise alike.
  2014: 'fy2014/Poverty.xls',
  2015: 'fy2015/Section8_Rev.xlsx',
};
for (let y = 2016; y <= 2026; y++) FILES[y] = `fy${y}/Section8-FY${String(y).slice(2)}.xlsx`;

const STATES = {
  '01': ['AL', 'Alabama'], '02': ['AK', 'Alaska'], '04': ['AZ', 'Arizona'], '05': ['AR', 'Arkansas'],
  '06': ['CA', 'California'], '08': ['CO', 'Colorado'], '09': ['CT', 'Connecticut'], '10': ['DE', 'Delaware'],
  '11': ['DC', 'District of Columbia'], '12': ['FL', 'Florida'], '13': ['GA', 'Georgia'], '15': ['HI', 'Hawaii'],
  '16': ['ID', 'Idaho'], '17': ['IL', 'Illinois'], '18': ['IN', 'Indiana'], '19': ['IA', 'Iowa'],
  '20': ['KS', 'Kansas'], '21': ['KY', 'Kentucky'], '22': ['LA', 'Louisiana'], '23': ['ME', 'Maine'],
  '24': ['MD', 'Maryland'], '25': ['MA', 'Massachusetts'], '26': ['MI', 'Michigan'], '27': ['MN', 'Minnesota'],
  '28': ['MS', 'Mississippi'], '29': ['MO', 'Missouri'], '30': ['MT', 'Montana'], '31': ['NE', 'Nebraska'],
  '32': ['NV', 'Nevada'], '33': ['NH', 'New Hampshire'], '34': ['NJ', 'New Jersey'], '35': ['NM', 'New Mexico'],
  '36': ['NY', 'New York'], '37': ['NC', 'North Carolina'], '38': ['ND', 'North Dakota'], '39': ['OH', 'Ohio'],
  '40': ['OK', 'Oklahoma'], '41': ['OR', 'Oregon'], '42': ['PA', 'Pennsylvania'], '44': ['RI', 'Rhode Island'],
  '45': ['SC', 'South Carolina'], '46': ['SD', 'South Dakota'], '47': ['TN', 'Tennessee'], '48': ['TX', 'Texas'],
  '49': ['UT', 'Utah'], '50': ['VT', 'Vermont'], '51': ['VA', 'Virginia'], '53': ['WA', 'Washington'],
  '54': ['WV', 'West Virginia'], '55': ['WI', 'Wisconsin'], '56': ['WY', 'Wyoming'], '60': ['AS', 'American Samoa'],
  '66': ['GU', 'Guam'], '69': ['MP', 'Northern Mariana Islands'], '72': ['PR', 'Puerto Rico'], '78': ['VI', 'Virgin Islands'],
};
const STATE_BY_ALPHA = Object.fromEntries(Object.entries(STATES).map(([f, [a]]) => [a, f]));

const pad = (v, n) => String(v ?? '').trim().padStart(n, '0');
const num = (v) => {
  if (v == null) return null;
  const s = String(v).replace(/[$,\s]/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

// FY1998-2000: a block of lines a county-area.
function readText(file, year) {
  const rows = [];
  let cur = null;
  const head = /^\s*(\d+)\s+([A-Z]{2})\s+(\d+)\s+(.+?)\s+(\d+)\s+MSA:\s*(.*?)\s*$/;
  for (const raw of fs.readFileSync(file, 'latin1').split(/\r*\n/)) {
    const line = raw.replace(/\r/g, '');
    let m;
    if ((m = head.exec(line))) {
      cur = {
        year, stateFips: pad(m[1], 2), alpha: m[2], county3: pad(m[3], 3), fips: null,
        name: m[4].trim(), areaCode: m[5], areaName: m[6].replace(/^\(|\)$/g, '').trim() || null,
        median: null, l30: null, l50: null, l80: null,
      };
      rows.push(cur);
    } else if (cur && (m = /^MED .*\$\s*([\d,]+)/.exec(line))) {
      cur.median = num(m[1]);
    } else if (cur && (m = /^L(30|50|80) /.exec(line))) {
      const vals = line.slice(30).trim().split(/\s+/).map(num);
      if (vals.length !== 8) throw new Error(`FY${year}: ${vals.length} limits on ${JSON.stringify(line)}`);
      cur[`l${m[1]}`] = vals;
    }
  }
  return rows;
}

// A spreadsheet's first sheet, its columns found by name whatever the year
// calls them.
function readSheet(file, year) {
  const wb = XLSX.readFile(file, { sheets: 0, sheetRows: 10000 });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true });
  const heads = rows[0].map((h) => String(h).trim().toLowerCase().replace(/\s+/g, ' '));
  const col = (...names) => { for (const n of names) { const i = heads.indexOf(n); if (i >= 0) return i; } return -1; };
  // FY2001 spells its limits out ("30% income limit - 1 person"); the rest
  // write l30_1, eli_1 and the like.
  const limitCols = (level) => SIZES.map((k) => {
    let i = heads.findIndex((h) => h === `l${level}_${k}` || (level === 30 && h === `eli_${k}`));
    if (i < 0) i = heads.findIndex((h) => /income limit/.test(h) && h.includes(`${level === 80 ? 'low' : `${level}%`}`) && new RegExp(`-\\s*${k} person`).test(h)
      && (level !== 80 || !/very|30%|50%/.test(h)));
    if (i < 0 && level === 80) i = heads.findIndex((h) => /^low\b.*income limit/.test(h) && new RegExp(`-\\s*${k} person`).test(h));
    if (i < 0) throw new Error(`FY${year}: no column for the ${level}% limit, ${k} persons (${file})`);
    return i;
  });
  const c = {
    fips: col('fips', 'fips2010', 'fips2000'),
    fips2000: col('fips2000'),
    alpha: col('state_alpha', 'stusps', 'statealpha', 'state abrev.'),
    state: col('state', 'fips state code'),
    county: col('county', 'fips county code'),
    name: col('county_town_name', 'countyname', 'county name', 'county_name'),
    areaCode: col('hud_area_code', 'cbsasub', 'msa', 'hud msa code'),
    areaName: col('hud_area_name', 'metro_area_name', 'msaname', 'msa name', 'name'),
    median: col(`median${year}`, 'median', `fy ${year} median family income`),
  };
  for (const k of ['alpha', 'name', 'areaCode', 'areaName', 'median']) if (c[k] < 0) throw new Error(`FY${year}: no ${k} column (${file})`);
  const l = { 30: limitCols(30), 50: limitCols(50), 80: limitCols(80) };
  const out = [];
  for (const r of rows.slice(1)) {
    if (r.every((v) => v === '' || v == null)) continue;
    const fips = c.fips >= 0 && r[c.fips] !== '' ? pad(r[c.fips], 10) : null;
    const alpha = String(r[c.alpha]).trim();
    out.push({
      year,
      stateFips: fips ? fips.slice(0, 2) : (c.state >= 0 && r[c.state] !== '' ? pad(r[c.state], 2) : STATE_BY_ALPHA[alpha]),
      alpha,
      county3: fips ? fips.slice(2, 5) : pad(r[c.county], 3),
      fips,
      name: String(r[c.name]).trim(),
      areaCode: String(r[c.areaCode]).trim(),
      areaName: String(r[c.areaName]).trim() || null,
      median: num(r[c.median]),
      l30: l[30].map((i) => num(r[i])),
      l50: l[50].map((i) => num(r[i])),
      l80: l[80].map((i) => num(r[i])),
    });
  }
  return out;
}

function readYear(dir, year) {
  const file = path.join(dir, FILES[year]);
  return file.endsWith('.txt') ? readText(file, year) : readSheet(file, year);
}

module.exports = { FILES, STATES, SIZES, readYear };
