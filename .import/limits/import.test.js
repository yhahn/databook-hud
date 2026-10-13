// The limits importer's tests: every vector in vectors/ (V2, a few of HUD's
// rows in, by file, the exact markdown out), and the shape check (V1).
//
//   node --test .import/limits/import.test.js

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { OLD30, readRows, readText, checkShape, ShapeError } = require('./sources');
const { build, safe, link, unique } = require('./import');

// a vector's input: HUD's rows by file (a spreadsheet's heads and rows, or
// a text year's blocks), read as a run reads them, and built
function play(input) {
  const byYear = new Map();
  const old30 = new Map();
  for (const [file, rows] of Object.entries(input)) {
    const year = Number(file.slice(2, 6));
    const parsed = typeof rows === 'string' ? readText(rows, year) : readRows(rows, year);
    if (Object.values(OLD30).includes(file)) old30.set(year, parsed); else byYear.set(year, parsed);
  }
  return build({ byYear, old30 });
}
// B7: the pages written, by path; the changes aside (README is main's)
const pagesOf = (built) => Object.fromEntries(Object.entries(built.pages).filter(([k]) => k !== 'Changes.md' && !k.startsWith('Changes/')));

const dir = path.join(__dirname, 'vectors');
const vectors = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
test('there are vectors', () => assert.ok(vectors.length > 0));
for (const f of vectors) {
  const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  test(`${f} (${v.rule}): ${v.about}`, () => {
    const built = play(v.input);
    // a record vector: the places' records, then the county rows before 2006
    const era = (t) => t.startsWith('### County before 2006:');
    if (typeof v.output === 'string') return assert.strictEqual([...built.texts.values()].sort((a, b) => era(a) - era(b)).join('\n\n'), v.output);
    const pages = pagesOf(built);
    assert.deepStrictEqual(Object.keys(pages).sort(), Object.keys(v.output).sort());
    for (const [k, t] of Object.entries(v.output)) assert.strictEqual(pages[k], t, k);
  });
}

// V1: a release unlike the last stops the import, saying what changed
const shape = JSON.parse(fs.readFileSync(path.join(__dirname, 'shape.json'), 'utf8'));
const andover = JSON.parse(fs.readFileSync(path.join(dir, 'andover-ct.json'), 'utf8')).input;
const file = 'fy2026/Section8-FY26.xlsx';
const [heads, row] = andover[file];
const rows = (n) => readRows([heads, ...Array(n).fill(row)], 2026);

test('V1: a file as last read passes', () => checkShape(file, 2026, heads.map(String), rows(4764), shape));
test('V1: a column gone stops it', () => assert.throws(
  () => checkShape(file, 2026, heads.filter((h) => h !== 'l50_8').map(String), rows(4764), shape), (e) => e instanceof ShapeError && /gone: l50_8/.test(e.message)));
test('V1: rows not as last read stop it', () => assert.throws(
  () => checkShape(file, 2026, heads.map(String), rows(4700), shape), (e) => e instanceof ShapeError && /4700 rows, not 4764/.test(e.message)));
test('V1: a file never read stops it', () => assert.throws(
  () => checkShape('fy2027/Section8-FY27.xlsx', 2027, heads.map(String), rows(4764), shape), (e) => e instanceof ShapeError && /no shape known/.test(e.message)));
test('V1: a limit column not found stops it', () => assert.throws(
  () => readRows([heads.map((h) => (h === 'ELI_4' ? 'eli4' : h)), row], 2026), (e) => e instanceof ShapeError && /30% limit, 4 persons/.test(e.message)));

// B7: a page's name is the place's, made safe; a link, every character but
// letters, digits and -_.~, as %XX; as the rents' importer writes them
test('B7: file names made safe', () => {
  assert.strictEqual(safe('Vi St.John/St.Thomas, VI'), 'Vi St.John-St.Thomas, VI');
  assert.strictEqual(safe(' .Odd:  name? '), 'Odd name');
  assert.strictEqual(link('Gone/Bedford city, VA.md'), './Gone/Bedford%20city,%20VA.md');
  assert.strictEqual(link('Puerto Rico/Añasco Municipio.md'), './Puerto%20Rico/A%C3%B1asco%20Municipio.md');
  assert.deepStrictEqual(unique([['Dup town', '1'], ['DUP town', '2'], ['Other', '3']]), ['Dup town (1)', 'DUP town (2)', 'Other']);
});
