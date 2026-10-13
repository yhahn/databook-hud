"""databook-hud's README.md, the repo's front page: what is here, each
dataset's counts and changes (from .import/<dataset>/counts.json, which each
importer writes), and the queries that join them. Run after both importers
(.import/build.sh does).

    python3 -I .import/readme.py
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def load(name):
    with open(os.path.join(HERE, name, 'counts.json'), encoding='utf-8') as f:
        return json.load(f)


def main():
    rents, limits = load('rents'), load('limits')
    L = ['# HUD: rents and income limits', '',
         "Two of HUD's yardsticks for housing help, for every county and New England "
         'town, year by year: what a modest home costs to rent (the Fair Market Rents) '
         'and the incomes under which a household may have help (the Income Limits). '
         'Data only, printable as a book and queryable as tables: a folder a dataset, '
         'and in it a page a place, as a reader finds it: a state\'s page listing its '
         'places (`rents/Alabama.md`), a folder of them beside it (`rents/Alabama/Autauga '
         'County.md`), and in New England a county\'s page and folder between '
         '(`rents/Maine/Penobscot County/Bangor city.md`); proper gathers them into DuckDB. Both '
         'are keyed by the same ten-digit FIPS, so a place\'s rent and its limits join.', '',
         '## The datasets', '',
         f"- [Fair Market Rents](./rents/README.md), FY1983 to FY2027: {rents['records']} places "
         f"({rents['counties']} counties, {rents['towns']} New England towns), "
         '`### Rents:`, their rents by bedroom count as HUD set them: at the 40th '
         'percentile, or, for some costly areas in FY2001 to FY2019, the 50th, marked '
         "in each place's Areas.",
         f"- [Income Limits](./limits/README.md), FY1998 to FY2026: {limits['current']} places "
         f"as HUD lists them now and {limits['gone']} it no longer lists, `### Limits:`, "
         'their median family income and limits by household size; and '
         f"{limits['era']} county rows from before FY2006 that no place's record can hold (New England's, keyed by county then, and one Missouri county split in two), `### County before 2006:`.", '',
         'Each dataset is written by its own importer, in `.import/rents/` (Python) and '
         '`.import/limits/` (Node); nothing here is edited by hand.', '',
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
         '`FIPS` is gathered as a number in both, so the leading zero goes alike and the '
         "join holds; `lpad(cast(\"FIPS\" as varchar), 10, '0')` gives it back.", '',
         '## Changes', '',
         "Where HUD changed a definition or a key during a dataset's years, the latest "
         'form is in the cards and the older only in tables of their own, never spliced. '
         'A setting HUD made place by place, on and off (the rents\' 50th percentile, '
         'FY2001 to FY2019), is the value\'s own: the rents are in the card as set, the '
         'setting marked beside them, and its start and end are said as changes. '
         'Every change is a record, `### Change:`, in the dataset\'s Changes page '
         '([rents](./rents/Changes.md), [limits](./limits/Changes.md)).', '']
    for name, counts in (('Fair Market Rents', rents), ('Income Limits', limits)):
        for year, title in counts['changes']:
            L.append(f'- {name}, {year}: {title}')
    L += ['', '## The source', '',
          'HUD User, the Office of Policy Development and Research of the U.S. Department '
          'of Housing and Urban Development: <https://www.huduser.gov/portal/datasets/fmr.html> '
          'and <https://www.huduser.gov/portal/datasets/il.html>. HUD\'s data are a work of '
          'the United States Government, and so free of copyright in the United States '
          '(17 U.S.C. 105). This databook is not HUD\'s, nor endorsed by it.', '']
    with open(os.path.join(REPO, 'README.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


if __name__ == '__main__':
    main()
