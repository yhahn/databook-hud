"""The Fair Market Rents databook's importer.

Reads HUD's FMR history (FMR_All_1983_2027.csv, latin-1, a row a county
or New England town) and writes every page of the databook: a file a
state, a record a place, its rents a card, its areas a table of runs;
and README.md. Nothing it writes is edited by hand: run it again.

    python3 -I .import/import.py [source.csv]

Decisions: .import/DECISIONS.md.
"""

import csv
import os
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
SOURCE = os.path.expanduser('~/.cache/proper/hud/fmr/FMR_All_1983_2027.csv')

# HUD's file has no FY1984 (its Read Me: "There are no Fiscal Year 1984 FMRs")
YEARS = [1983] + list(range(1985, 2028))
YY = {y: f'{y % 100:02d}' for y in YEARS}

STATES = {
    '01': ('Alabama', 'AL'), '02': ('Alaska', 'AK'), '04': ('Arizona', 'AZ'),
    '05': ('Arkansas', 'AR'), '06': ('California', 'CA'), '08': ('Colorado', 'CO'),
    '09': ('Connecticut', 'CT'), '10': ('Delaware', 'DE'),
    '11': ('District of Columbia', 'DC'), '12': ('Florida', 'FL'),
    '13': ('Georgia', 'GA'), '15': ('Hawaii', 'HI'), '16': ('Idaho', 'ID'),
    '17': ('Illinois', 'IL'), '18': ('Indiana', 'IN'), '19': ('Iowa', 'IA'),
    '20': ('Kansas', 'KS'), '21': ('Kentucky', 'KY'), '22': ('Louisiana', 'LA'),
    '23': ('Maine', 'ME'), '24': ('Maryland', 'MD'), '25': ('Massachusetts', 'MA'),
    '26': ('Michigan', 'MI'), '27': ('Minnesota', 'MN'), '28': ('Mississippi', 'MS'),
    '29': ('Missouri', 'MO'), '30': ('Montana', 'MT'), '31': ('Nebraska', 'NE'),
    '32': ('Nevada', 'NV'), '33': ('New Hampshire', 'NH'), '34': ('New Jersey', 'NJ'),
    '35': ('New Mexico', 'NM'), '36': ('New York', 'NY'), '37': ('North Carolina', 'NC'),
    '38': ('North Dakota', 'ND'), '39': ('Ohio', 'OH'), '40': ('Oklahoma', 'OK'),
    '41': ('Oregon', 'OR'), '42': ('Pennsylvania', 'PA'), '44': ('Rhode Island', 'RI'),
    '45': ('South Carolina', 'SC'), '46': ('South Dakota', 'SD'), '47': ('Tennessee', 'TN'),
    '48': ('Texas', 'TX'), '49': ('Utah', 'UT'), '50': ('Vermont', 'VT'),
    '51': ('Virginia', 'VA'), '53': ('Washington', 'WA'), '54': ('West Virginia', 'WV'),
    '55': ('Wisconsin', 'WI'), '56': ('Wyoming', 'WY'), '60': ('American Samoa', 'AS'),
    '66': ('Guam', 'GU'), '69': ('Northern Mariana Islands', 'MP'),
    '72': ('Puerto Rico', 'PR'), '78': ('U.S. Virgin Islands', 'VI'),
}
REGIONS = {'1': 'Northeast', '2': 'Midwest', '3': 'South', '4': 'West'}


def cell(s):
    """A value fit for a table cell or a row: one line, no pipes."""
    return ' '.join((s or '').split()).replace('|', '/')


STATE_REGION = {}  # a state's census region, from its other rows (main fills it)


def region(row):
    """HUD's census region in words; where a row has none, its state's
    (census regions are by state); none for a territory HUD gives none."""
    code = row['census_region'] or STATE_REGION.get(row['state'], '')
    return REGIONS.get(code, 'none')


def name_of(row, dupes):
    st = STATES[row['state']][1]
    name = cell(row['name'])
    if not name:
        return f"Unnamed ({row['fips2027']}), {st}"
    if (row['name'], row['state']) in dupes:
        return f"{name} ({row['fips2027']}), {st}"
    return f'{name}, {st}'


def areas(row):
    """Runs of years under one area code at one percentile:
    (from, to, code, area name or '', percentile or '')."""
    runs = []
    for y in YEARS:
        yy = YY[y]
        code = cell(row.get(f'msa{yy}'))
        if not code:
            continue
        name = cell(row.get(f'areaname{yy}'))
        pct = cell(row.get(f'fmr{yy}'))
        # FY2024 on, HUD gives no percentile column: every FMR is the 40th
        if not pct and y >= 2024 and row.get(f'fmr{yy}_2', '').strip():
            pct = '40'
        last = runs[-1] if runs else None
        if last and last[2] == code and last[4] == pct and last[1] == prev(y) and y != 2006:
            last[1] = y
            if name:
                last[3] = name  # the latest name the run has
        else:
            runs.append([y, y, code, name, pct])
    return runs


def same(code):
    """A code as compared: HUD's nonmetro mark was 10000 to FY2004 and 9999
    in FY2005, and FY2023-24 has NCTNY for NCNTY; neither is a move."""
    if code in ('10000', '9999'):
        return 'nonmetro'
    return code.replace('NCTNY', 'NCNTY')


def changes(row):
    """How many times its area code changed from one year to the next,
    leaving out FY2005 to FY2006, when HUD renumbered every area, and
    the recodings same() names."""
    codes = [(y, same(cell(row.get(f'msa{YY[y]}')))) for y in YEARS]
    codes = [(y, c) for y, c in codes if c]
    return sum(1 for (y0, a), (y1, b) in zip(codes, codes[1:]) if a != b and y1 != 2006)


def prev(y):
    return 1983 if y == 1985 else y - 1


def record(row, dupes):
    st_name, _ = STATES[row['state']]
    fips = row['fips2027']
    runs = areas(row)
    lines = [f'### County: {name_of(row, dupes)}', '']
    lines.append(f'- FIPS: {fips}')
    if row.get('fips2024') and row['fips2024'] != fips:
        lines.append(f"- FIPS 2024: {row['fips2024']}")
    if row.get('fips') and row['fips'] != fips:
        lines.append(f"- FIPS before: {row['fips']}")
    lines.append(f"- Level: {'County' if row['cousub'] == '99999' else 'Town'}")
    lines.append(f"- FMR area: {cell(row['areaname27'])}")
    lines.append(f"- Metro code: {cell(row['msa27'])}")
    lines.append(f'- State: {st_name}')
    lines.append(f"- Census region: {region(row)}")
    lines.append(f'- Area changes: {changes(row)}')
    lines.append('')
    head = ['Bedrooms'] + [str(y) for y in YEARS]
    lines.append('> [!CARD:line] Fair Market Rents')
    lines.append('> | ' + ' | '.join(head) + ' |')
    lines.append('> |' + '---|' * len(head))
    for b in range(5):
        vals = [cell(row.get(f'fmr{YY[y]}_{b}')) for y in YEARS]
        lines.append(f'> | {b} | ' + ' | '.join(vals) + ' |')
    lines.append('>')
    lines.append('> - Unit: dollars a month, gross rent (rent and utilities)')
    lines.append('')
    lines.append('#### Areas')
    lines.append('')
    # HUD's old MSA numbers (to FY2005) and its metro codes (FY2006 on) are
    # two columns: the one a number, the other text
    lines.append('| From | To | MSA | Metro code | Area | Percentile |')
    lines.append('|---|---|---|---|---|---|')
    for f, t, code, name, pct in runs:
        old, new = (code, '') if t < 2006 else ('', code)
        lines.append(f'| {f} | {t} | {old} | {new} | {name} | {pct} |')
    lines.append('')
    return lines


def state_page(code, rows, dupes):
    st_name, st = STATES[code]
    counties = sum(r['cousub'] == '99999' for r in rows)
    towns = len(rows) - counties
    moved = sum(changes(r) > 0 for r in rows)
    lines = [f'# State: {st_name}', '']
    lines.append(f'- Postal code: {st}')
    lines.append(f'- State FIPS: {code}')
    lines.append(f'- Counties: {counties}')
    lines.append(f'- Towns: {towns}')
    lines.append('')
    what = (f'{counties} counties' if counties != 1 else '1 county') + \
        (f' and {towns} towns' if towns else '')
    if not counties:
        what = f'{towns} towns'
    lines.append(f'HUD\'s Fair Market Rents for {st_name}, fiscal years 1983 to 2027: {what}, '
                 'each with its rents by bedroom count and the FMR areas it has sat in. '
                 + (f'{moved} of them have changed FMR area at least once '
                    if len(rows) > 1 else
                    ('It has changed FMR area ' if moved else 'It has never changed FMR area ')) +
                 '(not counting 2006, when HUD renumbered every area).')
    lines.append('')
    lines.append('## Places')
    lines.append('')
    for r in rows:
        lines += record(r, dupes)
    return '\n'.join(lines).rstrip() + '\n'


def readme(by_state, total, counties, towns):
    L = []
    L.append('# Fair Market Rents, 1983 to 2027')
    L.append('')
    L.append("Every county's Fair Market Rents from HUD, fiscal years 1983 to 2027 "
             f'({len(YEARS)} years; there was no FY1984), by bedroom count: '
             f'{total} places, {counties} counties and {towns} New England towns, '
             'in the states, the District of Columbia, Puerto Rico and the territories. '
             'Data only, printable as a book and queryable as tables: a file a state, '
             'a record a place, and proper gathers them into DuckDB.')
    L.append('')
    L.append('## What a Fair Market Rent is')
    L.append('')
    L.append('A Fair Market Rent (FMR) is what HUD reckons a modest, decent home '
             'costs to rent in an area: the 40th percentile gross rent (rent and '
             'utilities) of standard-quality units, set each fiscal year for each '
             'metropolitan area and each county outside one. It is the yardstick for '
             'Housing Choice Vouchers (Section 8) and other HUD programs. It was the '
             '45th percentile until FY1995; from FY2001 to FY2019 some costly areas '
             'were set at the 50th. A county takes the rents of its FMR area, so all '
             'the counties of one metro area have the same rents. In New England HUD '
             'draws its areas by town, not county, so there each town is a place of '
             'its own.')
    L.append('')
    L.append('## How it is written')
    L.append('')
    L.append('Each place is a record, `### County: <name>, <ST>` (towns too, with '
             '`- Level: Town`), keyed by `- FIPS:`, the ten digits HUD writes '
             '(state, county, county subdivision; `99999` for a whole county). Its '
             'rents are a card, a row a bedroom count and a column a year; empty where '
             "HUD gives none. Its `#### Areas` are the runs of years it sat in one FMR "
             'area: HUD names areas only from FY2022, so older runs give the code '
             'alone, and a new code is not always a move (HUD renumbered every area '
             'in FY2006). `- Area changes:` counts the years its code changed, leaving '
             'out 2006.')
    L.append('')
    L.append('## How to ask')
    L.append('')
    L.append('Every place\'s rents are one table, `County_table`, a row a place and bedroom count:')
    L.append('')
    L.append('```sql')
    L.append('-- two-bedroom rents in Manhattan and Onondaga County, then and now')
    L.append('select record, "1983", "2000", "2027" from County_table')
    L.append("where Bedrooms = 2 and record in ('New York County, NY', 'Onondaga County, NY')")
    L.append('```')
    L.append('')
    L.append('```sql')
    L.append("-- the dearest two-bedroom FMRs this year, with each place's area")
    L.append('select t.record, c."FMR area", t."2027" from County_table t join County c on c.name = t.record')
    L.append('where t.Bedrooms = 2 order by t."2027" desc limit 10')
    L.append('```')
    L.append('')
    L.append('```sql')
    L.append('-- the places that have sat in the most FMR areas')
    L.append('select name, "Area changes" from County order by "Area changes" desc limit 10')
    L.append('```')
    L.append('')
    L.append('`FIPS` is gathered as a number, so its leading zero goes; '
             "`lpad(cast(\"FIPS\" as varchar), 10, '0')` gives it back.")
    L.append('')
    L.append('## The source')
    L.append('')
    L.append("HUD User, the Office of Policy Development and Research of the U.S. "
             "Department of Housing and Urban Development: *FMR History 1983 - "
             "Present: All Bedroom Unit data*, `FMR_All_1983_2027.csv`, from "
             "<https://www.huduser.gov/portal/datasets/fmr.html>, with its Read Me "
             "(updated August 2025). Written here by the importer (`.import/`); "
             "nothing here is edited by hand.")
    L.append('')
    L.append("Notice of use: HUD's data are a work of the United States Government, "
             "and so free of copyright in the United States (17 U.S.C. 105). HUD "
             "User's notice: reference to a product or firm is not endorsement by "
             "HUD. This databook is not HUD's, nor endorsed by it.")
    L.append('')
    L.append('## The states')
    L.append('')
    for code in sorted(by_state, key=lambda c: STATES[c][0]):
        rows = by_state[code]
        st_name = STATES[code][0]
        n = len(rows)
        towns = sum(r['cousub'] != '99999' for r in rows)
        word = 'towns' if towns == n else ('places' if towns else 'counties')
        if n == 1:
            word = {'towns': 'town', 'places': 'place', 'counties': 'county'}[word]
        kind = f'{n} {word}'
        L.append(f'- [{st_name}](./{st_name.replace(" ", "%20")}.md): {kind}')
    L.append('')
    return '\n'.join(L)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else SOURCE
    with open(src, encoding='latin-1', newline='') as f:
        rows = list(csv.DictReader(f))
    names = Counter((r['name'], r['state']) for r in rows)
    dupes = {k for k, v in names.items() if v > 1}
    by_state = {}
    for r in rows:
        if r['census_region']:
            STATE_REGION.setdefault(r['state'], r['census_region'])
        by_state.setdefault(r['state'], []).append(r)
    # the pages a run writes: the old ones go first, so a gone state goes
    for fn in os.listdir(OUT):
        if fn.endswith('.md') and not fn.startswith('.'):
            os.remove(os.path.join(OUT, fn))
    written = 0
    for code, srows in by_state.items():
        srows.sort(key=lambda r: r['fips2027'])
        path = os.path.join(OUT, STATES[code][0] + '.md')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(state_page(code, srows, dupes))
        written += len(srows)
    counties = sum(r['cousub'] == '99999' for r in rows)
    with open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8') as f:
        f.write(readme(by_state, len(rows), counties, len(rows) - counties))
    print(f'{len(rows)} rows read, {written} records written in {len(by_state)} files '
          f'({counties} counties, {len(rows) - counties} towns)')


if __name__ == '__main__':
    main()
