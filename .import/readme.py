"""databook-hud's README.md, the repo's front page: what is here, each
dataset's counts and changes (from .import/<dataset>/counts.json, which each
importer writes), the questions it answers (FAQ.md, from .import/faq.md), and the
queries that join them. Run after both importers
(.import/build.sh does).

    python3 -I .import/readme.py
"""

import importlib.util
import json
import os
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

_spec = importlib.util.spec_from_file_location('reading', os.path.join(HERE, 'reading.py'))
reading = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(reading)


def load(name):
    with open(os.path.join(HERE, name, 'counts.json'), encoding='utf-8') as f:
        return json.load(f)


def questions():
    """The questions in .import/faq.md, which .import/faq.js answers into FAQ.md."""
    with open(os.path.join(HERE, 'faq.md'), encoding='utf-8') as f:
        return sum(1 for line in f if line.startswith('### Question: '))


# the last year the tax credits' database covers, as its importer's shape has it
# (a few projects HUD dates later are counted, and said)
with open(os.path.join(HERE, 'lihtc', 'shape.json'), encoding='utf-8') as _f:
    LIHTC_LAST = json.load(_f)['lastYear']

# names the prose gives an article ("the District of Columbia's rent")
THE = {'District of Columbia', 'Northern Mariana Islands', 'U.S. Virgin Islands'}


def link(path):
    """A link from the front page: every character but letters, digits and
    -_.~ written as %XX, the comma left bare (as the importers write them)."""
    return './' + '/'.join(quote(p, safe=',') for p in path.split('/'))


def card(kind, title, head, rows, notes=()):
    """A picture (cards.md), its table under it in the file."""
    return ([f'> [!CARD:{kind}] {title}', '> | ' + ' | '.join(str(h) for h in head) + ' |', '> |' + '---|' * len(head)]
            + ['> | ' + ' | '.join(str(c) for c in r) + ' |' for r in rows] + [f'> - {n}' for n in notes] + [''])


def cell(v, money=False):
    if v is None:
        return ''
    return str(int(v + 0.5)) if money else f'{v:g}'


def front(rents_read, lihtc):
    """The front page's reading (SPEC R2-R5): what the data points to, then
    each question a stranger asks first, answered, drawn and linked; and the
    values kept, {record id: values}."""
    nat = dict(rents_read['nation'])
    pics = rents_read['pictures']
    lr = lihtc['reading']
    nat.update({'projects': sum(v['projects'] for v in lr['by_state'].values()),
                'li_units': sum(v['li_units'] for v in lr['by_state'].values()),
                'lihtc_first': lr['first_year'], 'lihtc_last': LIHTC_LAST,
                'lihtc_after': sum(v['projects'] for y, v in lr['by_year'].items() if int(y) > LIHTC_LAST),
                'lihtc_none': sum(v['projects'] for v in lr['by_state'].values()) - sum(v['projects'] for v in lr['by_year'].values()),
                'peak_year': lr['peak_year'],
                'peak_projects': lr['peak_projects'], 'early_size': lr['early_size'], 'late_size': lr['late_size']})
    links = nat.pop('_links')
    shown = {k: [f'[{n}]({link("rents/" + p)})' for n, p in zip(nat[k], links[k])] for k in links}
    for k in ('dear_top', 'dear_bottom', 'share_top', 'share_bottom', 'burden_three'):
        shown[k] = [('the ' if n in THE else '') + f'[{n}]({link(f"rents/{n}.md")})' for n in nat[k]]
    recs = {r['id']: r for r in reading.of_page('README.md')}
    kept = {rid: reading.kept(nat, rec) for rid, rec in recs.items()}

    def q(rid, more):
        return [f"**{recs[rid]['Ask']}** {reading.answer(recs[rid], nat, shown)}" + (f' {more}' if more else ''), '']
    L = ['## What the data points to', '',
         ' '.join(reading.answer(r, nat, shown) for r in recs.values() if r['kind'] == 'Finding'), '']

    years = sorted(pics['nation'], key=int)
    L += ['## Rent over the years', '']
    L += q('front-trend', "Each place's rents, every year and bedroom count, are on its page: see "
           '[Fair Market Rents](./rents/README.md).')
    L += ["The median county's two-bedroom rent each year, as HUD set it, and its middle half (the band, "
          'from a quarter of the way up to three quarters).', '']
    L += card('line', 'Two-bedroom rent, the median county', ['', 'stat'] + years,
              [['Counties', s] + [cell(pics['nation'][y][i], True) for y in years]
               for i, s in ((0, 'line'), (1, 'low'), (2, 'high'))],
              ['Mark: 2001 Some at the 50th', 'Mark: 2020 All at the 40th',
               'Unit: dollars a month, two bedrooms, as HUD set them'])

    g = pics['growth']
    gy = sorted(g['Rent'], key=int)
    L += ['## Rent and income', '']
    L += q('front-income', "Each place's median family income and limits are on its page: see "
           '[Income Limits](./limits/README.md).')
    L += ["The median county's rise since FY2006, in percent, each year: its two-bedroom rent, and its "
          'median family income, over the counties with both in FY2006 and FY2026.', '']
    L += card('line', 'Rise since FY2006, the median county', [''] + gy,
              [[k] + [cell(g[k][y]) for y in gy] for k in ('Rent', 'Income')], ['Unit: percent'])

    states = pics['states']
    gyears = sorted({y for s in states for y in s['grid']}, key=int)
    L += ['## The states compared', '']
    L += q('front-burden', '')
    L += q('front-dear', "Each state's page compares its own places.")
    L += ['Each state, dearest first by the median two-bedroom rent of its places (its counties, or in New '
          'England its towns), every fourth year, shaded against the dearest; then, at the right, the median '
          "place's rise in rent and in median family income from FY2006 to FY2026, in percent, and its burden: "
          'twelve months of the FY2026 two-bedroom rent as a share of the very low income limit for four. '
          'Beneath, the same, each state linked to its page, with its tax credit housing.', '']
    L += card('grid', 'Two-bedroom rent, a state a row', ['State'] + gyears + ['Rent up, %', 'Income up, %', 'Burden, %'],
              [[s['state']] + [cell(s['grid'].get(y), True) for y in gyears]
               + [cell(s['rent_up']), cell(s['inc_up']), cell(s['share'])] for s in states],
              ['Gutter: Rent up, %', 'Gutter: Income up, %', 'Gutter: Burden, %', 'Unit: dollars a month, two bedrooms'])
    L += ['### The states, linked', '',
          '| State | Places | Two-bedroom rent | Rent up since 2006, % | Income up since 2006, % | Burden, % '
          '| Tax credit projects | Low-income units |', '|---|---|---|---|---|---|---|---|']
    for s in states:
        c = lr['by_state'].get(s['state'], {})
        L.append(f"| [{s['state']}]({link('rents/' + s['state'] + '.md')}) | {s['places']} | {cell(s['latest'], True)} "
                 f"| {cell(s['rent_up'])} | {cell(s['inc_up'])} | {cell(s['share'])} "
                 f"| {c.get('projects', '')} | {c.get('li_units', '')} |")
    L.append('')

    by = lr['by_year']
    ys = sorted(by, key=int)
    L += ['## Tax credit housing, year by year', '']
    L += q('front-credits', 'Each project is a page: see [Low-Income Housing Tax Credit projects](./lihtc/README.md).')
    L += ['The projects placed in service each year, and their low-income units, each on its own scale.', '']
    L += card('bars', 'Tax credit housing placed in service', [''] + ys,
              [['Projects'] + [by[y]['projects'] for y in ys], ['Low-income units'] + [by[y]['li_units'] for y in ys]])
    return L, kept


def main():
    rents, limits, lihtc = load('rents'), load('limits'), load('lihtc')
    with open(os.path.join(HERE, 'rents', 'reading.json'), encoding='utf-8') as f:
        rents_read = json.load(f)
    reading_lines, kept = front(rents_read, lihtc)
    out = os.path.join(HERE, 'reading.json')
    reading.turned(out, {'README.md': kept})
    reading.save(out, {'README.md': kept})
    L = ['# HUD: rents, income limits and tax credit housing', '',
         "Two of HUD's yardsticks for housing help, for every county and New England "
         'town, year by year: what a modest home costs to rent (the Fair Market Rents) '
         'and the incomes under which a household may have help (the Income Limits). '
         'Data only, printable as a book and queryable as tables: a folder a dataset, '
         'and in it a page a place, as a reader finds it: a state\'s page listing its '
         'places (`rents/Alabama.md`), a folder of them beside it (`rents/Alabama/Autauga '
         'County.md`), and in New England a county\'s page and folder between '
         '(`rents/Maine/Penobscot County/Bangor city.md`); proper gathers them into DuckDB. Both '
         'are keyed by the same ten-digit FIPS, so a place\'s rent and its limits join. '
         'Beside them, the housing those yardsticks govern: every project built or kept '
         'with the Low-Income Housing Tax Credit, a page a project, filed by state and county, '
         'its county\'s FIPS joining the rents and the limits.', '',
         '## The datasets', '',
         f"- [Fair Market Rents](./rents/README.md), FY1983 to FY2027: {rents['records']} places "
         f"({rents['counties']} counties, {rents['towns']} New England towns), "
         '`### Rents:`, their rents by bedroom count as HUD set them: at the 40th '
         'percentile, or, for some costly areas in FY2001 to FY2019, the 50th, marked '
         "in each place's Areas.",
         f"- [Income Limits](./limits/README.md), FY1998 to FY2026: {limits['current']} places "
         f"as HUD lists them now and {limits['gone']} it no longer lists, `### Limits:`, "
         'their median family income and limits by household size; and '
         f"{limits['era']} county rows from before FY2006 that no place's record can hold (New England's, keyed by county then, and one Missouri county split in two), `### County before 2006:`; "
         f"and {limits['second']} second listings of a county inside another area (Rockland and Westchester, NY, FY2006 to 2020), `### Second listing:`, each on its county's page.",
         f"- [Low-Income Housing Tax Credit projects](./lihtc/README.md), placed in service 1987 to 2024: "
         f"{lihtc['projects']} projects in {lihtc['counties']} counties, `# Project:`, keyed by HUD's id: "
         'each its address, tracts, units by bedroom count, income ceiling and other help, '
         'and its county\'s five-digit FIPS.', '',
         'Each dataset is written by its own importer, in `.import/rents/` (Python), '
         '`.import/limits/` and `.import/lihtc/` (Node); nothing here is edited by hand.', '',
         f'[Questions and answers](./FAQ.md): {questions()} questions a reader of this book can answer, '
         'from one rent in one place to what changed and why, each with its answer and the page to look in.', '',
         'The questions and findings above, and those that open each state\'s rents page, are written '
         'by hand in `.import/reading.md`; their numbers are worked out from HUD\'s files at every '
         'release, never written in, and the same questions are asked again of the source in FAQ.md, '
         'so a page that has drifted from it stops the build.', '',
         '## Rent against income', '',
         'A family of four at the very low income limit, and what a two-bedroom Fair '
         'Market Rent takes of its income, FY2026: the rents and the limits joined on FIPS.', '',
         '```sql',
         'select l.name, v."2026" as "Very low income, 4", r."2026" as "Two-bedroom rent",',
         '  round(100 * 12 * r."2026" / v."2026") as "Rent, % of income"',
         'from Limits l',
         'join Limits_Very_low_income_50 v on v.record = l.name and v.Persons = 4',
         'join Rents rp on rp.FIPS = l.FIPS',
         'join Rents_Fair_Market_Rents r on r.record = rp.name and r.Bedrooms = 2',
         'order by "Rent, % of income" desc limit 10',
         '```', '',
         '```sql',
         '-- the same, a state at a time: the median share across its places',
         'select l.State, count(*) as places,',
         '  round(median(100 * 12 * r."2026" / v."2026")) as "Median rent, % of income"',
         'from Limits l',
         'join Limits_Very_low_income_50 v on v.record = l.name and v.Persons = 4',
         'join Rents rp on rp.FIPS = l.FIPS',
         'join Rents_Fair_Market_Rents r on r.record = rp.name and r.Bedrooms = 2',
         'group by l.State order by "Median rent, % of income" desc limit 10',
         '```', '',
         '`FIPS` is gathered as text in both, its leading zero kept (SPEC K2), so the join holds.', '',
         '## Tax credit housing against rents', '',
         'The counties with the dearest two-bedroom Fair Market Rent, FY2027, and the tax '
         'credit housing in each: the projects joined to the rents on the county\'s FIPS '
         '(its five digits and `99999`, the rents\' key for a county).', '',
         '```sql',
         'select r.name, f."2027" as "Two-bedroom rent", count(p."HUD ID") as projects,',
         '  sum(p."Low-income units") as "Low-income units"',
         'from Rents r',
         'join Rents_Fair_Market_Rents f on f.record = r.name and f.Bedrooms = 2',
         'left join Project p on p."County FIPS" || \'99999\' = r.FIPS',
         "where r.Level = 'County'",
         'group by all order by "Two-bedroom rent" desc limit 10',
         '```', '',
         '## Changes', '',
         "Where HUD changed a definition or a key during a dataset's years, the latest "
         'form is in the cards and the older only in tables of their own, never spliced. '
         'A setting HUD made place by place, on and off (the rents\' 50th percentile, '
         'FY2001 to FY2019), is the value\'s own: the rents are in the card as set, the '
         'setting marked beside them, and its start and end are said as changes. '
         'Every change is a record, `### Change:`, in the dataset\'s Changes page '
         '([rents](./rents/Changes.md), [limits](./limits/Changes.md), [tax credits](./lihtc/Changes.md)). '
         'A tax credit project is one record of one year, so nothing in it is split: '
         'its changes are said, and its columns read with them.', '']
    for name, counts in (('Fair Market Rents', rents), ('Income Limits', limits), ('Tax Credit Projects', lihtc)):
        for year, title in counts['changes']:
            L.append(f'- {name}, {year}: {title}')
    L += ['', '## The source', '',
          'HUD User, the Office of Policy Development and Research of the U.S. Department '
          'of Housing and Urban Development: <https://www.huduser.gov/portal/datasets/fmr.html> '
          '<https://www.huduser.gov/portal/datasets/il.html> and '
          '<https://www.huduser.gov/portal/datasets/lihtc/property.html>. HUD\'s data are a work of '
          'the United States Government, and so free of copyright in the United States '
          '(17 U.S.C. 105). This databook is not HUD\'s, nor endorsed by it.', '']
    L += ['## Licence', '', 'This book, its pages and its importer, is given to the public domain', 'under CC0 1.0 ([LICENSE](LICENSE)): copy it, change it and use it as you', 'like, without asking. Its sources are free of copyright too, as above;', 'citing them is still the courteous thing.', '']
    # the reader's way in, after what the book is and before how it is made
    i = L.index('## The datasets')
    L[i:i] = reading_lines
    with open(os.path.join(REPO, 'README.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


if __name__ == '__main__':
    main()
