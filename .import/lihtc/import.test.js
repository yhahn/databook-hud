// The tax credits' importer's tests: every vector in vectors/ (V2, a few of
// HUD's rows in, the exact pages out), and the shape check (V1).
//
//   node --test .import/lihtc/import.test.js

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { build, toRows, checkShape, ShapeError, countyOf, idBefore } = require('./import');

const dir = path.join(__dirname, 'vectors');
const vectors = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
test('there are vectors', () => assert.ok(vectors.length > 0));
for (const f of vectors) {
  const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  test(`${f} (${v.rule}): ${v.about.slice(0, 120)}…`, () => {
    const { pages } = build(toRows(v.input).rows);
    assert.deepStrictEqual(Object.keys(pages).sort(), Object.keys(v.output).sort());
    for (const [k, t] of Object.entries(v.output)) assert.strictEqual(pages[k], t, k);
  });
}

// V1: a release unlike the last stops the import, saying what changed
const shape = JSON.parse(fs.readFileSync(path.join(__dirname, 'shape.json'), 'utf8'));
const { input } = JSON.parse(fs.readFileSync(path.join(dir, 'projects.json'), 'utf8'));
const { heads, rows } = toRows(input);
const small = { ...shape, rows: [rows.length, rows.length] };
test('V1: rows as last read pass', () => checkShape(heads, rows, small));
test('V1: a column gone stops it', () => assert.throws(
  () => checkShape(heads.filter((h) => h !== 'qct'), rows, small), (e) => e instanceof ShapeError && /gone: qct/.test(e.message)));
test('V1: rows not as last read stop it', () => assert.throws(
  () => checkShape(heads, rows, shape), (e) => e instanceof ShapeError && /11 rows, not 55345/.test(e.message)));
test('V1: a code not seen before stops it (a new code may be a new meaning)', () => assert.throws(
  () => checkShape(heads, [...rows, { ...rows[0], hud_id: 'AKA19890099', credit: 5 }], { ...small, rows: [12, 12] }),
  (e) => e instanceof ShapeError && /credit has values not seen before: 5/.test(e.message)));
test('V1: a HUD ID twice stops it', () => assert.throws(
  () => checkShape(heads, [...rows, rows[0]], { ...small, rows: [12, 12] }), (e) => e instanceof ShapeError && /not unique/.test(e.message)));

// K1, B5: the key before, and the county, from what HUD writes
test('K1: a HUD ID before, from HUD\'s note in its three forms', () => {
  assert.strictEqual(idBefore('PREV HUD_ID IS ALA19950137;PIN=AL-95-0083'), 'ALA19950137');
  assert.strictEqual(idBefore('PREV HUD_ID=ALA19920110;PIN=AL-92-0007'), 'ALA19920110');
  assert.strictEqual(idBefore('PREVIOUSLY LISTED AS X.;PREV HUD_ID: CAA19970115'), 'CAA19970115');
  assert.strictEqual(idBefore('Resyndicated 3 projects in to 1. New HUD ID WVA20210015'), '');
});
test('B5: the county of the latest tract that names one', () => {
  assert.deepStrictEqual(countyOf({ fips2020: '02XXXXXXXXX', fips2010: '02XXXXXXXXX', fips2000: '02270000100', fips1990: '02270000100' }), ['02270', 2000]);
  assert.deepStrictEqual(countyOf({ fips2020: '69110XXXXXX', fips2010: 'XXXXXXXXXXX', fips2000: 'XXXXXXXXXXX', fips1990: 'XXXXXXXXXXX' }), ['69110', 2020]);
  assert.deepStrictEqual(countyOf({ fips2020: 'XXXXXXXXXXX', fips2010: 'XXXXXXXXXXX', fips2000: 'XXXXXXXXXXX', fips1990: 'XXXXXXXXXXX' }), ['', '']);
});
