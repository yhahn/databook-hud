// faq.js, held by five questions, one of each Type, their answers worked
// out from HUD's files and their records frozen (SPEC B9, V2). A change
// here is a change in what FAQ.md says: say why in DECISIONS.md.
//   node --test .import/faq.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const faq = require('./faq');

const questions = faq.parse(fs.readFileSync(path.join(__dirname, 'faq.md'), 'utf8'));
const q = (id) => questions.find((x) => x.id === id);
const FIVE = ['hud-lookup-1', 'hud-page-3', 'hud-join-1', 'hud-gap-2', 'hud-change-1'];
const A = faq.compute(FIVE);

test('faq.md: 26 questions, ids unique, every one with the same keys', () => {
  assert.strictEqual(questions.length, 26);
  assert.strictEqual(new Set(questions.map((x) => x.id)).size, 26);
  for (const x of questions) assert.deepStrictEqual(Object.keys(x), ['id', 'Tier', 'Ask', 'Type', 'Tolerance', 'Rules', 'How', 'Look in']);
});

test('one of each Type', () => {
  assert.deepStrictEqual(FIVE.map((id) => q(id).Type), ['number', 'set', 'list', 'none', 'judge']);
});

test('the answers, from the source', () => {
  assert.strictEqual(A['hud-lookup-1'].answer, 26200);
  assert.deepStrictEqual(A['hud-page-3'].answer, ['METRO33860M33860']);
  assert.deepStrictEqual(A['hud-join-1'].answer, [
    { place: 'New York County (Manhattan)', percent: 25.73, fmr26_2: 2910, l80_4: 135700 },
    { place: 'Onondaga County', percent: 19.55, fmr26_2: 1392, l80_4: 85450 }]);
  assert.strictEqual(A['hud-gap-2'].answer, null);
  assert.deepStrictEqual(A['hud-change-1'].answer,
    { fy2013_30pct: 12600, fy2014_30pct: 12750, fy2014_eli: 21250, old_rise: 150, spliced_rise: 8650 });
});

const RECORDS = {
  'hud-lookup-1': `### Question: hud-lookup-1

- Tier: Lookup
- Ask: What was the extremely low income limit for a household of four in Holmes County, Mississippi, in FY2020?
- Answer: 26200
- Type: number
- Tolerance: 0
- Look in: [limits/Mississippi/Holmes County](./limits/Mississippi/Holmes%20County.md)

Section8-FY20.xlsx, fips 2805199999, ELI_4 (the extremely low income limit as defined since FY2014).
`,
  'hud-page-3': `### Question: hud-page-3

- Tier: Page
- Ask: Which FMR area did Autauga County, Alabama belong to in FY2015? Give HUD's area code.
- Answer: METRO33860M33860
- Type: set
- Tolerance:
- Look in: [rents/Alabama/Autauga County](./rents/Alabama/Autauga%20County.md)

FMR history msa15 for 0100199999; the FY2015 income limits' cbsasub agrees (METRO33860M33860). Its old MSA number, in the limits' msa column, is 5240 (Montgomery, AL).
`,
  'hud-join-1': `### Question: hud-join-1

- Tier: Join
- Ask: In FY2026, twelve months of the two-bedroom Fair Market Rent are what percent of the low income limit for a household of four, in Manhattan and in Onondaga County, New York?
- Answer: New York County (Manhattan) 25.73% (12 × 2910 / 135700); Onondaga County 19.55% (12 × 1392 / 85450)
- Type: list
- Tolerance: 0.1
- Look in: [rents/New York/New York County](./rents/New%20York/New%20York%20County.md), [limits/New York/New York County](./limits/New%20York/New%20York%20County.md), [rents/New York/Onondaga County](./rents/New%20York/Onondaga%20County.md), [limits/New York/Onondaga County](./limits/New%20York/Onondaga%20County.md)

12 × fmr26_2 (FMR history) / l80_4 (Section8-FY26.xlsx), by FIPS, in percent.
`,
  'hud-gap-2': `### Question: hud-gap-2

- Tier: Gap
- Ask: What was the extremely low income limit for a household of four in Holmes County, Mississippi, in FY1998?
- Answer: The book does not say.
- Type: none
- Tolerance:
- Look in:

allstate.txt (FY1998) has no L30 lines for any county (MED, L50, L80, FMR only); the 30% limit begins FY1999 (allst99.txt). Holmes County, MS is there with L50_4 14900 and L80_4 23850; 30% of the median (17100) is not HUD's limit.
`,
  'hud-change-1': `### Question: hud-change-1

- Tier: Change
- Ask: By how much did Holmes County, Mississippi's extremely low income limit for a household of four rise from FY2013 to FY2014?
- Answer: Not like for like: HUD redefined the limit in FY2014 (the greater of 30% of the median and the poverty guideline). The old 30% limit rose 150, from 12600 to 12750; the new limit was 21250 in FY2014, so 8650 is a splice of two definitions, not a rise.
- Type: judge
- Tolerance:
- Look in: [limits/Mississippi/Holmes County](./limits/Mississippi/Holmes%20County.md), [limits/Changes/Extremely low income redefined, 2014](./limits/Changes/Extremely%20low%20income%20redefined,%202014.md)

FY2013 Section8.xls l30_4 12600; FY2014 Section8.xls (the plain 30% limit) l30_4 12750; FY2014 Poverty.xls ELI_4 21250 (the greater of 30% of median and the poverty guideline, capped at the 50% limit, which it equals here: l50_4 21250). Right only if it says the definition changed; 8650 spliced is wrong.
`,
};

for (const id of FIVE) {
  test(`the record of ${id}, as FAQ.md writes it`, () => {
    assert.strictEqual(faq.record(q(id), A[id]), RECORDS[id]);
  });
}

test('a Look in that leads nowhere is refused', () => {
  assert.throws(() => faq.record({ ...q('hud-lookup-1'), 'Look in': 'limits/Nowhere.md' }, A['hud-lookup-1']), /Nowhere/);
});

test('a Gap question with no Look in is let be; any other is refused', () => {
  assert.throws(() => faq.record({ ...q('hud-lookup-1'), 'Look in': '' }, A['hud-lookup-1']), /Look in/);
});
