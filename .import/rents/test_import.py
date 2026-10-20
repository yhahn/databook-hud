"""The rents importer's tests: every vector in vectors/ (V2, a few of HUD's
rows in, the exact markdown out), and the shape check (V1).

    python3 -I -m unittest discover -s .import/rents -p 'test_*.py'
"""

import glob
import importlib.util
import json
import os
import unittest
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('rents_import', os.path.join(HERE, 'import.py'))
imp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(imp)


def written(rows):
    """The records the importer writes for these rows, as in a run: names
    twice in a state, and a state's census region, from the rows given."""
    names = Counter((r['name'], r['state']) for r in rows)
    dupes = {k for k, v in names.items() if v > 1}
    region = {}
    for r in rows:
        if r['census_region']:
            region.setdefault(r['state'], r['census_region'])
    return '\n'.join('\n'.join(imp.record(r, dupes, region)) for r in rows)


class Vectors(unittest.TestCase):
    def test_vectors(self):
        files = sorted(glob.glob(os.path.join(HERE, 'vectors', '*.json')))
        self.assertTrue(files)
        for fn in files:
            with open(fn, encoding='utf-8') as f:
                v = json.load(f)
            with self.subTest(vector=os.path.basename(fn), rule=v['rule']):
                if isinstance(v['output'], dict):
                    # B7: the pages written, by path; README and the changes aside
                    pages = {k: t for k, t in imp.build(v['input'], v.get('incomes'))[0].items()
                             if k != 'README.md' and k != 'Changes.md' and not k.startswith('Changes/')}
                    self.assertEqual(sorted(pages), sorted(v['output']), v['about'])
                    for k, t in v['output'].items():
                        self.assertEqual(pages[k], t, k)
                else:
                    self.assertEqual(written(v['input']), v['output'], v['about'])


class FileNames(unittest.TestCase):
    """B7: a page's name is the place's, made safe; a link to it, every
    character but letters, digits and -_.~, written as %XX."""

    def test_safe(self):
        self.assertEqual(imp.safe('Vi St.John/St.Thomas'), 'Vi St.John-St.Thomas')
        self.assertEqual(imp.safe(' .Odd:  name? '), 'Odd name')
        self.assertEqual(imp.safe('Añasco Municipio'), 'Añasco Municipio')

    def test_link(self):
        self.assertEqual(imp.link('Maine/Penobscot County/Indian Island (2301957936).md'),
                         './Maine/Penobscot%20County/Indian%20Island%20%282301957936%29.md')
        self.assertEqual(imp.link('Puerto Rico/Añasco Municipio.md'), './Puerto%20Rico/A%C3%B1asco%20Municipio.md')

    def test_unique(self):
        # one name twice in a folder, whatever its case: each named with its FIPS
        self.assertEqual(imp.unique([('Dup town', '1'), ('DUP town', '2'), ('Other', '3')]),
                         ['Dup town (1)', 'DUP town (2)', 'Other'])


class Shape(unittest.TestCase):
    """V1: a release unlike the last stops the import, saying what changed."""

    def setUp(self):
        with open(os.path.join(HERE, 'shape.json'), encoding='utf-8') as f:
            self.shape = json.load(f)
        with open(os.path.join(HERE, 'vectors', 'autauga.json'), encoding='utf-8') as f:
            self.row = json.load(f)['input'][0]
        self.header = list(self.shape['columns'])
        self.rows = [dict(self.row, fips2027=f'{i:010d}') for i in range(4764)]

    def check(self, raw=b'fips2027', header=None, rows=None):
        imp.check_shape(raw, header or self.header, self.rows if rows is None else rows, self.shape)

    def test_as_last_read(self):
        self.check()

    def test_a_column_gone(self):
        with self.assertRaisesRegex(imp.ShapeError, 'gone fmr27_2'):
            self.check(header=[h for h in self.header if h != 'fmr27_2'])

    def test_a_new_year(self):
        with self.assertRaisesRegex(imp.ShapeError, 'new msa28'):
            self.check(header=self.header + ['msa28'])

    def test_rows_out_of_range(self):
        with self.assertRaisesRegex(imp.ShapeError, '100 rows'):
            self.check(rows=self.rows[:100])

    def test_a_short_key(self):
        rows = [dict(r) for r in self.rows]
        rows[0]['fips2027'] = '100199999'
        with self.assertRaisesRegex(imp.ShapeError, 'not ten digits'):
            self.check(rows=rows)

    def test_now_utf8(self):
        with self.assertRaisesRegex(imp.ShapeError, 'UTF-8'):
            self.check(raw='Cataño'.encode('utf-8'))

    def test_a_percentile_unknown(self):
        rows = [dict(r) for r in self.rows]
        rows[0]['fmr95'] = '50'
        with self.assertRaisesRegex(imp.ShapeError, 'FY1995 percentiles'):
            self.check(rows=rows)


if __name__ == '__main__':
    unittest.main()
