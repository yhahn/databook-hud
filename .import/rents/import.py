"""The Fair Market Rents' importer, for databook-hud's rents/.

Reads HUD's FMR history (FMR_All_1983_2027.csv, latin-1, a row a county
or New England town), checks its shape (shape.json), and writes every page
of rents/: a page a place (`# Rents:`), in its state's folder (in New
England, its county's), each state and New England county a page listing
its places (SPEC B7); its rents a
card from FY1995 as HUD set them (at the 40th percentile, or the 50th
where HUD set it, SPEC D8), the older 45th-percentile years a table of
their own, its areas a table of runs, the percentile marked in each;
the changes in HUD's file, a page each, Changes.md listing them; README.md. Nothing it writes is
edited by hand: run it again.

    python3 -I .import/rents/import.py [source.csv]

Decisions: .import/rents/DECISIONS.md. Tests: test_import.py, vectors/.
"""

import csv
import importlib.util
import json
import math
import os
import re
import sys
import unicodedata
from collections import Counter
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(REPO, 'rents')
SOURCE = os.path.expanduser('~/.cache/proper/hud/fmr/FMR_All_1983_2027.csv')

# HUD's file has no FY1984 (its Read Me: "There are no Fiscal Year 1984 FMRs")
YEARS = [1983] + list(range(1985, 2028))
LATEST = YEARS[-1]
YY = {y: f'{y % 100:02d}' for y in YEARS}
BEDROOMS = range(5)

# The percentile eras (Read Me, and the file's fmrNN column, checked in
# check_shape): the 45th to FY1994; the 40th from FY1995, the current
# definition and so the main card; some areas at the 50th, FY2001-2019,
# a setting made place by place, and so in the card as set (SPEC D8).
P45 = [y for y in YEARS if y <= 1994]
P40 = [y for y in YEARS if y >= 1995]
P50 = list(range(2001, 2020))

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

# New England, where HUD keys towns, not counties: a state's folder holds
# a folder a county (Connecticut's, a planning region), named as HUD's
# income limits name it (.import/counties.json, from .import/counties.js)
NEW_ENGLAND = {'09', '23', '25', '33', '44', '50'}
with open(os.path.join(os.path.dirname(HERE), 'counties.json'), encoding='utf-8') as _f:
    COUNTIES = json.load(_f)


# --- V1: the source's shape, checked before anything is written -------------

class ShapeError(Exception):
    pass


def check_shape(raw, header, rows, shape):
    """Stop the import if HUD's file is not the shape it was: its encoding,
    its columns, its row count, its keys, its percentile eras."""
    said = []
    high = sum(b > 127 for b in raw)
    if high:
        try:
            raw.decode('utf-8')
            said.append(f'the file now reads as UTF-8 ({high} bytes over 127), not latin-1')
        except UnicodeDecodeError:
            pass
    want = shape['columns']
    if header != want:
        added = [c for c in header if c not in want]
        gone = [c for c in want if c not in header]
        said.append('its columns changed: '
                    + (f'new {", ".join(added[:12])}{" …" if len(added) > 12 else ""}; ' if added else '')
                    + (f'gone {", ".join(gone[:12])}{" …" if len(gone) > 12 else ""}' if gone else 'none gone'))
    lo, hi = shape['rows']
    if not lo <= len(rows) <= hi:
        said.append(f'{len(rows)} rows, not {lo} to {hi}')
    keys = [r.get('fips2027', '') for r in rows]
    odd = [k for k in keys if len(k) != 10 or not k.isdigit()]
    if odd:
        said.append(f'{len(odd)} fips2027 not ten digits ({", ".join(odd[:3])})')
    twice = [k for k, n in Counter(keys).items() if n > 1]
    if twice:
        said.append(f'{len(twice)} fips2027 twice ({", ".join(twice[:3])})')
    unknown = sorted({r.get('state') for r in rows} - set(STATES))
    if unknown:
        said.append(f'state codes not known: {", ".join(map(str, unknown))}')
    if not said:
        for y in YEARS:
            col = f'fmr{YY[y]}'
            if col not in header:
                continue
            seen = {r[col] for r in rows} - {''}
            allowed = {'45'} if y in P45 else ({'40', '50'} if y in P50 else {'40'})
            if not seen <= allowed:
                said.append(f'FY{y} percentiles {sorted(seen)}, not {sorted(allowed)}')
    if said:
        raise ShapeError("HUD's FMR file is not the shape this importer knows: "
                         + '; '.join(said)
                         + '. Read it, mend the importer and shape.json, and say the change (Changes.md).')


# --- the records ------------------------------------------------------------

def cell(s):
    """A value fit for a table cell or a row: one line, no pipes."""
    return ' '.join((s or '').split()).replace('|', '/')


def region(row, state_region):
    """HUD's census region in words; where a row has none, its state's
    (census regions are by state); none for a territory HUD gives none."""
    code = row['census_region'] or state_region.get(row['state'], '')
    return REGIONS.get(code, 'none')


def name_of(row, dupes):
    st = STATES[row['state']][1]
    name = cell(row['name'])
    if not name:
        return f"Unnamed ({row['fips2027']}), {st}"
    if (row['name'], row['state']) in dupes:
        return f"{name} ({row['fips2027']}), {st}"
    return f'{name}, {st}'


def percentile(row, y):
    """The percentile a place-year's FMR was set at: HUD's fmrNN; from
    FY2024 the file has no such column, and every FMR is the 40th."""
    pct = cell(row.get(f'fmr{YY[y]}'))
    if not pct and y >= 2024 and any(cell(row.get(f'fmr{YY[y]}_{b}')) for b in BEDROOMS):
        pct = '40'
    return pct


# The percentiles a card or table takes: the card, the rent as HUD set it
# from FY1995, at the 40th or, place by place, the 50th (SPEC D8)
AS_SET = ('40', '50')


def rent(row, y, b, at):
    """A rent, where the place-year was set at a percentile in `at`; else empty."""
    return cell(row.get(f'fmr{YY[y]}_{b}')) if percentile(row, y) in at else ''


def prev(y):
    return 1983 if y == 1985 else y - 1


def areas(row):
    """Runs of years under one area code at one percentile:
    (from, to, code, area name or '', percentile or '')."""
    runs = []
    for y in YEARS:
        code = cell(row.get(f'msa{YY[y]}'))
        if not code:
            continue
        name = cell(row.get(f'areaname{YY[y]}'))
        pct = percentile(row, y)
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


def fips_before(row):
    """(FIPS 2024, FIPS before): Connecticut's county codes before its
    planning regions (FY2026); any other code a place had before this
    year's (six Maine and Massachusetts towns, FY2027)."""
    now, f24, f = row['fips2027'], row.get('fips2024', ''), row.get('fips', '')
    if row['state'] == '09' and f24 != now:
        return f24, ''
    old = f24 if f24 != now else (f if f != now else '')
    return '', old


def table(head, rows_of, years, card=None, unit=None):
    """A card (drawn) or a plain table (kept as data), a row a label."""
    q = '> ' if card else ''
    cols = [head] + [str(y) for y in years]
    out = []
    if card:
        out.append(f'> [!CARD:line] {card}')
    out.append(q + '| ' + ' | '.join(cols) + ' |')
    out.append(q + '|' + '---|' * len(cols))
    for lab, vals in rows_of:
        out.append(q + f'| {lab} | ' + ' | '.join(vals) + ' |')
    if unit:
        out += ['>', f'> - Unit: {unit}']
    return out


UNIT = 'dollars a month, gross rent (rent and utilities)'


def record(row, dupes, state_region):
    st_name, _ = STATES[row['state']]
    f24, before = fips_before(row)
    lines = [f'# Rents: {name_of(row, dupes)}', '',
             f"- FIPS: {row['fips2027']}",
             f'- FIPS 2024: {f24}',
             f'- FIPS before: {before}',
             f"- Level: {'County' if row['cousub'] == '99999' else 'Town'}",
             f"- FMR area: {cell(row['areaname27'])}",
             f"- Metro code: {cell(row['msa27'])}",
             f'- State: {st_name}',
             f'- Census region: {region(row, state_region)}',
             f'- Area changes: {changes(row)}',
             '', '## Fair Market Rents', '']
    lines += table('Bedrooms', [(str(b), [rent(row, y, b, AS_SET) for y in P40]) for b in BEDROOMS],
                   P40, card='Fair Market Rents, as HUD set them', unit=UNIT)
    old = [(str(b), [rent(row, y, b, ('45',)) for y in P45]) for b in BEDROOMS]
    if any(v for _, vals in old for v in vals):
        lines += ['', '## 45th percentile, 1983 to 1994', '']
        lines += table('Bedrooms', old, P45)
    lines += ['', '## Areas', '',
              # HUD's old MSA numbers (to FY2005) and its metro codes (FY2006
              # on) are two columns: the one a number, the other text
              '| From | To | MSA | Metro code | Area | Percentile |',
              '|---|---|---|---|---|---|']
    for f, t, code, name, pct in areas(row):
        old_code, new_code = (code, '') if t < 2006 else ('', code)
        lines.append(f'| {f} | {t} | {old_code} | {new_code} | {name} | {pct} |')
    lines.append('')
    return lines


# --- a reader's way in (SPEC R2-R5) ----------------------------------------
# The questions a reader asks first, and what the data points to, are
# written by hand in .import/reading.md; their numbers are reckoned here,
# from HUD's file and each place's incomes (.import/incomes.json, which the
# limits' importer writes from HUD's income limits), at every release.

_spec = importlib.util.spec_from_file_location('reading', os.path.join(os.path.dirname(HERE), 'reading.py'))
reading = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(reading)

INCOMES = os.path.join(os.path.dirname(HERE), 'incomes.json')
GRID_YEARS = [y for y in P40 if (LATEST - y) % 4 == 0]  # every fourth year, to the latest
BASE, IL_LATEST = 2006, 2026  # the incomes' first year keyed by FIPS, and their latest
RECENT = 5  # the last years, set against those before


def r1(x):
    """Rounded to one place, halves up (as faq.js's Math.round does)."""
    return None if x is None else math.floor(x * 10 + 0.5) / 10


def median(a):
    a = sorted(a)
    if not a:
        return None
    m = len(a) // 2
    return a[m] if len(a) % 2 else (a[m - 1] + a[m]) / 2


def quartiles(a):
    """The lower and upper quartile, the medians of the halves either side."""
    a = sorted(a)
    if len(a) < 2:
        return (a[0], a[0]) if a else (None, None)
    h = len(a) // 2
    return median(a[:h]), median(a[-h:])


def rent2(row, y):
    v = rent(row, y, 2, AS_SET)
    return int(v) if v else None


def place(row, incomes):
    """What a reader compares of one place: its latest two-bedroom rent, its
    rent's and its median family income's rise FY2006 to FY2026 (as
    ratios), and twelve months of its FY2026 rent against the very low
    income limit for four (a percent); None where HUD gives no value."""
    inc = incomes.get(row['fips2027'], {})
    m, v = inc.get('median', {}), inc.get('vli4', {})
    r06, r26 = rent2(row, BASE), rent2(row, IL_LATEST)
    m06, m26, l26 = m.get(str(BASE)), m.get(str(IL_LATEST)), v.get(str(IL_LATEST))
    both = r06 and r26 and m06 and m26
    return {
        'latest': rent2(row, LATEST),
        'rg': r26 / r06 if both else None,
        'ig': m26 / m06 if both else None,
        'share': 100 * 12 * r26 / l26 if r26 and l26 else None,
    }


def series(rows, years):
    """{year: (median, lower quartile, upper quartile, how many)} of two-bedroom rents."""
    out = {}
    for y in years:
        vals = [v for v in (rent2(r, y) for r in rows) if v is not None]
        if vals:
            out[y] = (median(vals),) + quartiles(vals) + (len(vals),)
    return out


def prose_name(name):
    """A state's name as a sentence gives it: 'the District of Columbia'."""
    return ('the ' if name in ('District of Columbia', 'Northern Mariana Islands', 'U.S. Virgin Islands') else '') + name


def ties(items, key, best):
    """(the items whose key is the best, max or min, ties kept; the best)."""
    have = [i for i in items if key(i) is not None]
    if not have:
        return [], None
    b = best(key(i) for i in have)
    return [i for i in have if key(i) == b], b


def short(rows, dupes):
    """A label for each place in a grid (cards.md cuts one past 12
    characters): its name less its kind (County, town), where that
    leaves it its own."""
    kinds = (r' (County|Parish|Borough|Census Area|City and Borough|Municipality|Municipio|'
             r'Planning Region|town|city|plantation|township)$')
    full = [stem(name_of(r, dupes)) for r in rows]
    cut = [re.sub(kinds, '', f) for f in full]
    n = Counter(cut)
    return [c if n[c] == 1 and c else f for c, f in zip(cut, full)]


def growth_series(counties, incomes):
    """Each year FY2006 to FY2026, the median county's rise since FY2006 of
    its two-bedroom rent and of its median family income, in percent, over
    the counties with both in FY2006 and FY2026 (front-income's)."""
    out = {'Rent': {}, 'Income': {}}
    base = []
    for r in counties:
        m = incomes.get(r['fips2027'], {}).get('median', {})
        if rent2(r, BASE) and rent2(r, IL_LATEST) and m.get(str(BASE)) and m.get(str(IL_LATEST)):
            base.append((r, m))
    for y in range(BASE, IL_LATEST + 1):
        rs = [rent2(r, y) / rent2(r, BASE) for r, m in base if rent2(r, y)]
        ms = [m[str(y)] / m[str(BASE)] for r, m in base if m.get(str(y))]
        out['Rent'][y] = r1(100 * (median(rs) - 1)) if rs else None
        out['Income'][y] = r1(100 * (median(ms) - 1)) if ms else None
    return out


def reckon(rows, by_state, incomes, dupes, paths):
    """Every value the reading needs: (the nation's, each state's, each
    place's, the front page's pictures)."""
    counties = [r for r in rows if r['cousub'] == '99999']
    P = {r['fips2027']: place(r, incomes) for r in rows}
    nat = series(counties, P40)
    NATION_SERIES.clear()
    NATION_SERIES.update(nat)
    years = sorted(nat)
    up = [y for a, y in zip(years, years[1:]) if nat[y][0] > nat[a][0]]
    down = [y for a, y in zip(years, years[1:]) if nat[y][0] < nat[a][0]]
    steps = [(nat[y][0] / nat[a][0] - 1, y) for a, y in zip(years, years[1:])]
    step, step_year = max(steps)
    rf = LATEST - RECENT
    first = years[0]

    def rate(a, b):
        return 100 * ((nat[b][0] / nat[a][0]) ** (1 / (b - a)) - 1)
    n50 = {y: sum(percentile(r, y) == '50' for r in counties) for y in P50}
    n50_max = max(n50.values())
    at40 = {y: median([v for r in counties if percentile(r, y) == '40' for v in [rent2(r, y)] if v]) for y in P50}
    d50 = max([abs(nat[y][0] - at40[y]) for y in P50 if y in nat and at40[y] is not None], default=0)
    grow = [P[r['fips2027']] for r in counties if P[r['fips2027']]['rg'] is not None]
    rg, ig = median([g['rg'] for g in grow]), median([g['ig'] for g in grow])
    shares = [P[r['fips2027']]['share'] for r in counties if P[r['fips2027']]['share'] is not None]
    top_county, top_share = ties(counties, lambda r: P[r['fips2027']]['share'], max)
    dear_county, dear_county_v = ties(counties, lambda r: P[r['fips2027']]['latest'], max)
    full = lambda r: f"{stem(name_of(r, dupes))}, {STATES[r['state']][1]}"
    nation = {
        'latest': LATEST, 'counties': len(counties), 'r1995': nat[first][0], 'r2027': nat[LATEST][0],
        'rose': 'rose' if nat[LATEST][0] > nat[first][0] else 'fell',
        'rise_pct': r1(100 * (nat[LATEST][0] / nat[first][0] - 1)),
        'recent_n': RECENT, 'recent_from': rf, 'recent_pct': r1(100 * (nat[LATEST][0] / nat[rf][0] - 1)),
        'step_year': step_year, 'step_pct': r1(100 * step),
        'n50_max': n50_max, 'n50_year': min(y for y in P50 if n50[y] == n50_max), 'd50': d50,
        'mostly': 'rose' if len(up) >= len(down) else 'fell', 'up_years': max(len(up), len(down)),
        'n_steps': len(steps),
        'recent_rate': r1(rate(rf, LATEST)), 'before_rate': r1(rate(first, rf)),
        'quickened': 'quickened' if rate(rf, LATEST) > rate(first, rf) else 'slowed',
        'growth_n': len(grow), 'rent_growth': rise(rg), 'inc_growth': rise(ig),
        'n_faster': sum(g['rg'] > g['ig'] for g in grow),
        'yes': None if not grow else ('Yes' if rg > ig else 'No'),
        'outran': None if not grow else ('outrun' if rg > ig else 'lagged behind'),
        'nation_share': r1(median(shares)),
        'share_top_county': [full(r) for r in top_county], 'share_top_county_v': r1(top_share),
        'dear_county': [full(r) for r in dear_county], 'dear_county_v': dear_county_v,
        '_links': {'share_top_county': [paths[r['fips2027']] for r in top_county],
                   'dear_county': [paths[r['fips2027']] for r in dear_county]},
    }

    states = {}
    for code, srows in by_state.items():
        st_name = STATES[code][0]
        srs = series(srows, P40)
        sy = sorted(srs)
        ps = [P[r['fips2027']] for r in srows]
        sg = [p for p in ps if p['rg'] is not None]
        ss = [p['share'] for p in ps if p['share'] is not None]
        dear, dear_v = ties(srows, lambda r: P[r['fips2027']]['latest'], max)
        cheap, cheap_v = ties(srows, lambda r: P[r['fips2027']]['latest'], min)
        btop, btop_v = ties(srows, lambda r: P[r['fips2027']]['share'], max)
        bbot, bbot_v = ties(srows, lambda r: P[r['fips2027']]['share'], min)
        ne = code in NEW_ENGLAND
        fy = sy[0] if sy else None
        has = fy is not None and LATEST in srs

        def names(rs):
            return [stem(name_of(r, dupes)) for r in rs] or None
        st = {
            'state': prose_name(st_name), 'latest': LATEST, 'n_places': len(srows),
            'places_word': ('towns' if ne else 'counties') if len(srows) > 1 else ('town' if ne else 'county'),
            'first_year': fy, 's_first': srs[fy][0] if fy else None, 's_latest': srs[LATEST][0] if has else None,
            'rose': ('rose' if srs[LATEST][0] > srs[fy][0] else 'fell') if has else None,
            's_rise': r1(100 * (srs[LATEST][0] / srs[fy][0] - 1)) if has else None,
            'n_rise': r1(100 * (nat[LATEST][0] / nat[fy][0] - 1)) if fy in nat else None,
            'dear': names(dear), 'dear_v': dear_v, 'cheap': names(cheap), 'cheap_v': cheap_v,
            's_share': r1(median(ss)) if ss else None, 'nation_share': nation['nation_share'],
            'burden_top': names(btop), 'burden_top_v': r1(btop_v) if btop_v is not None else None,
            'burden_bottom': names(bbot), 'burden_bottom_v': r1(bbot_v) if bbot_v is not None else None,
            'growth_n': len(sg), 'faster': sum(p['rg'] > p['ig'] for p in sg),
            'slower': sum(p['rg'] < p['ig'] for p in sg),
            'rent_growth': rise(median([p['rg'] for p in sg])),
            'inc_growth': rise(median([p['ig'] for p in sg])),
        }
        st['more'] = 'faster' if st['faster'] > st['slower'] else ('slower' if st['faster'] < st['slower'] else 'even')
        st['_links'] = {k: [paths[r['fips2027']] for r in rs] for k, rs in
                        (('dear', dear), ('cheap', cheap), ('burden_top', btop), ('burden_bottom', bbot))}
        st['_series'] = srs
        states[code] = st

    # the states set side by side, each by the median of its places (the front page's)
    have = [c for c in states if states[c]['s_latest'] is not None]
    dt, dtv = ties(have, lambda c: states[c]['s_latest'], max)
    db, dbv = ties(have, lambda c: states[c]['s_latest'], min)
    st_, stv = ties(have, lambda c: states[c]['s_share'], max)
    sb, sbv = ties(have, lambda c: states[c]['s_share'], min)
    by_share = sorted((c for c in have if states[c]['s_share'] is not None), key=lambda c: (-states[c]['s_share'], STATES[c][0]))
    nation.update({
        'dear_top': [STATES[c][0] for c in dt], 'dear_top_v': dtv,
        'dear_bottom': [STATES[c][0] for c in db], 'dear_bottom_v': dbv,
        'share_top': [STATES[c][0] for c in st_], 'share_top_v': stv,
        'share_bottom': [STATES[c][0] for c in sb], 'share_bottom_v': sbv,
        'burden_three': [STATES[c][0] for c in by_share[:3]],
    })
    pictures = {
        'nation': {str(y): list(v) for y, v in nat.items()},
        'growth': growth_series(counties, incomes),
        'states': [{'code': c, 'state': STATES[c][0], 'places': states[c]['n_places'],
                    'grid': {str(y): states[c]['_series'][y][0] for y in GRID_YEARS if y in states[c]['_series']},
                    'latest': states[c]['s_latest'], 'rent_up': states[c]['rent_growth'],
                    'inc_up': states[c]['inc_growth'], 'share': states[c]['s_share']}
                   for c in sorted(have, key=lambda c: (-states[c]['s_latest'], STATES[c][0]))],
    }
    return nation, states, P, pictures


NATION_SERIES = {}


def num(v, money=False):
    """A number for a table cell: whole dollars, or a percent to one place."""
    if v is None:
        return ''
    if money:
        return str(int(v + 0.5))
    return f'{r1(v):g}'


def rise(g):
    return None if g is None else r1(100 * (g - 1))


def place_cells(p):
    """The comparing cells of a place's row in a Places table: blank for a
    New England county, whose towns carry them."""
    if p is None:
        return ' |  |  |  |'
    return f" {num(p['latest'], True)} | {num(rise(p['rg']))} | {num(rise(p['ig']))} | {num(p['share'])} |"


def ranked(rows, P):
    """Places dearest first (their latest two-bedroom rent), then by name."""
    return sorted(rows, key=lambda r: (-(P[r['fips2027']]['latest'] or -1), r['name'], r['fips2027']))


def state_reading(code, srows, st, P, dupes, link_of):
    """A state's page, its reading part (SPEC R2, R4, R5): the questions its
    reader asks first, each answered; rent over the years, drawn; and its
    places compared, a row each. Returns (lines, values kept)."""
    name = STATES[code][0]
    prose = st['state']
    Prose = prose[0].upper() + prose[1:]
    alone = len(srows) == 1
    shown = {k: [f'[{n}]({link_of(p)})' for n, p in zip(st[k], paths)]
             for k, paths in st['_links'].items() if st.get(k)}
    values = {k: v for k, v in st.items() if not k.startswith('_')}
    L = ['## Questions', '']
    kept = {}
    for rec in reading.of_page('rents/<State>.md'):
        L += [f"**{reading.ask(rec, prose)}** {reading.answer(rec, st, shown, alone, prose)}", '']
        kept[rec['id']] = reading.kept(values, rec)
    srs = st['_series']
    sy = P40 if srs else []  # every year, blank where none: one table's columns on every page (B4)
    if sy:
        L += ['## Rent over the years', '',
              (f"{Prose}'s two-bedroom rent each year, as HUD set it, and the nation's median county beside it."
               if alone else
               f"The median two-bedroom rent of {prose}'s {st['places_word']} each year, as HUD set it, "
               'with its middle half (the band, from a quarter of the way up to three quarters), '
               "and the nation's median county beside it."), '',
              f'> [!CARD:line] Two-bedroom rent, {name} and the nation',
              '> | | stat | ' + ' | '.join(str(y) for y in sy) + ' |',
              '> |---|---|' + '---|' * len(sy)]
        for i, stat in ((0, 'line'),) if alone else ((0, 'line'), (1, 'low'), (2, 'high')):
            L.append(f'> | {name} | {stat} | ' + ' | '.join(num(srs[y][i], True) if y in srs else '' for y in sy) + ' |')
        L.append('> | The nation | line | ' + ' | '.join(num(NATION_SERIES[y][0], True) if y in NATION_SERIES else ''
                                                      for y in sy) + ' |')
        if any(percentile(r, y) == '50' for r in srows for y in P50):
            L += ['> - Mark: 2001 Some at the 50th', '> - Mark: 2020 All at the 40th']
        L += ['> - Unit: dollars a month, two bedrooms, as HUD set them', '']
    rs = ranked(srows, P)
    L += ['## Places compared', '',
          (f"{Prose}'s one {st['places_word']}: its two-bedroom rent every fourth year, shaded against its dearest; "
           if alone else
           f"Each of {prose}'s {st['places_word']}, dearest first: its two-bedroom rent every fourth year, "
           'shaded against the dearest here; ')
          + 'then, at the right, how much its rent and its median '
          'family income rose from FY2006 to FY2026, in percent, and its burden: twelve months of its FY2026 '
          'two-bedroom rent as a share of the very low income limit for four. '
          + ("Each town's page is linked from its county's, under Places." if code in NEW_ENGLAND
             else 'The same, linked, under Places.'), '',
          '> [!CARD:grid] Two-bedroom rent, a place a row',
          '> | Place | FIPS | ' + ' | '.join(str(y) for y in GRID_YEARS) + ' | Rent up, % | Income up, % | Burden, % |',
          '> |---|---|' + '---|' * (len(GRID_YEARS) + 3)]
    for r, lab in zip(rs, short(rs, dupes)):
        p = P[r['fips2027']]
        L.append(f"> | {cell(lab)} | {r['fips2027']} | " + ' | '.join(num(rent2(r, y), True) for y in GRID_YEARS)
                 + f" | {num(rise(p['rg']))} | {num(rise(p['ig']))} | {num(p['share'])} |")
    L += ['> - Hide: FIPS', '> - Gutter: Rent up, %', '> - Gutter: Income up, %', '> - Gutter: Burden, %',
          '> - Unit: dollars a month, two bedrooms', '']
    return L, kept


# --- the pages, a place each (SPEC B7) ------------------------------------

def safe(name):
    """A page's name, made safe for a file: a slash a dash, the characters
    no file system takes dropped, spaces single, no leading dot."""
    s = unicodedata.normalize('NFC', name)
    s = re.sub(r'[/\\]', '-', s)
    s = re.sub(r'[:*?"<>|\x00-\x1f]', '', s)
    return ' '.join(s.split()).lstrip('. ')


def link(path):
    """A link to a page, from the folder it is listed in: every character
    but letters, digits and -_.~, written as %XX (UTF-8). The comma is
    left as it is: proper reads %2C in a link as itself, not a comma."""
    return './' + '/'.join(quote(p, safe=',') for p in path.split('/'))


def unique(named):
    """Names for the pages of one folder, from (name, FIPS): a name two
    pages would share, whatever its case, is given each one's FIPS."""
    n = Counter(safe(name).casefold() for name, _ in named)
    return [safe(name) + (f' ({fips})' if n[safe(name).casefold()] > 1 else '') for name, fips in named]


def stem(name):
    """A place's page name: its record's name, less the state's code."""
    return re.sub(r', [A-Z]{2}$', '', name)


PLACES = ['## Places', '',
                        '| Place | FIPS | Level | Towns | Two-bedroom rent | Rent up since 2006, % | Income up since 2006, % | Burden, % |',
                        '|---|---|---|---|---|---|---|---|']


def keys(level, st, code, county, counties, towns):
    return [f'- Level: {level}', f'- Postal code: {st}', f'- State FIPS: {code}',
            f'- County FIPS: {county}', f'- Counties: {counties}', f'- Towns: {towns}', '']


def page_paths(code, rows, dupes):
    """{FIPS: its page's path in rents/}: `<State>/<place>.md`, or in New
    England `<State>/<county>/<town>.md`."""
    st_name = STATES[code][0]
    out = {}
    if code in NEW_ENGLAND:
        by_county = {}
        for r in rows:
            by_county.setdefault(r['fips2027'][:5], []).append(r)
        for cf, crows in sorted(by_county.items()):
            if cf not in COUNTIES:
                raise SystemExit(f'no name for county {cf} in .import/counties.json: run node .import/counties.js')
            county = safe(COUNTIES[cf])
            for r, fn in zip(crows, unique([(stem(name_of(r, dupes)), r['fips2027']) for r in crows])):
                out[r['fips2027']] = f'{st_name}/{county}/{fn}.md'
    else:
        for r, fn in zip(rows, unique([(stem(name_of(r, dupes)), r['fips2027']) for r in rows])):
            out[r['fips2027']] = f'{st_name}/{fn}.md'
    return out


def state_pages(code, rows, dupes, state_region, P, st_values):
    """A state's pages, {path: text}, and its reading values kept: its own
    page, which answers its reader's first questions and compares its
    places, then lists them, dearest first (in New England, its counties);
    and a page a place; in New England a page a county, listing its towns,
    and a folder of them."""
    st_name, st = STATES[code]
    counties = sum(r['cousub'] == '99999' for r in rows)
    towns = len(rows) - counties
    moved = sum(changes(r) > 0 for r in rows)
    what = (f'{counties} counties' if counties != 1 else '1 county') + \
        (f' and {towns} towns' if towns else '')
    if not counties:
        what = f'{towns} towns'
    said = (f"HUD's Fair Market Rents for {st_name}, fiscal years 1983 to {LATEST}: {what}, "
            'each with its rents by bedroom count and the FMR areas it has sat in. '
            + (f'{moved} of them have changed FMR area at least once '
               if len(rows) > 1 else
               ('It has changed FMR area ' if moved else 'It has never changed FMR area ')) +
            '(not counting 2006, when HUD renumbered every area). Its income limits are on its '
            f"[limits page](../limits/{quote(st_name)}.md), its tax credit housing on its "
            f"[tax credits page](../lihtc/{quote(st_name)}.md).")
    paths = page_paths(code, rows, dupes)
    listing = ('Its places, dearest first: each linked, with its two-bedroom rent in '
               f'FY{LATEST}, its rent\'s and its median family income\'s rise from FY2006 to FY2026, '
               'and its burden, twelve months of its FY2026 rent as a share of the very low income limit for four.')
    pages, listed = {}, []
    if code in NEW_ENGLAND:
        said += " Each county's page lists its towns."
        listing = ("Its counties, linked: in New England HUD sets rents by town, so a county's are its towns', "
                   "compared on its page, and above.")
        by_county = {}
        for r in rows:
            by_county.setdefault(r['fips2027'][:5], []).append(r)
        for cf, crows in sorted(by_county.items()):
            county = safe(COUNTIES[cf])
            town_rows = []
            for r in ranked(crows, P):
                fn = paths[r['fips2027']].split('/', 1)[1]
                pages[paths[r['fips2027']]] = '\n'.join(record(r, dupes, state_region)).rstrip() + '\n'
                town_rows.append(f"| [{name_of(r, dupes)}]({link(fn)}) | {r['fips2027']} | Town |  |"
                                 + place_cells(P[r['fips2027']]))
            pages[f'{st_name}/{county}.md'] = '\n'.join([
                f'# Fair Market Rents: {COUNTIES[cf]}, {st}', '',
                *keys('County', st, code, cf, '', len(crows)),
                f"HUD's Fair Market Rents for the towns of {COUNTIES[cf]}, {st_name}, fiscal years 1983 to "
                f'{LATEST}, a page a town. In New England HUD draws its areas by town, not county, so the '
                'county has no rents of its own.', '',
                'Its towns, dearest first: each linked, with its two-bedroom rent in '
                f'FY{LATEST}, its rent\'s and its median family income\'s rise from FY2006 to FY2026, '
                'and its burden, twelve months of its FY2026 rent as a share of the very low income limit for four.', '',
                *PLACES, *town_rows]) + '\n'
            listed.append(f"| [{COUNTIES[cf]}, {st}]({link(f'{st_name}/{county}.md')}) | {cf} | County | {len(crows)} |"
                          + place_cells(None))
        n_counties = len(by_county)
    else:
        for r in ranked(rows, P):
            pages[paths[r['fips2027']]] = '\n'.join(record(r, dupes, state_region)).rstrip() + '\n'
            level = 'County' if r['cousub'] == '99999' else 'Town'
            listed.append(f"| [{name_of(r, dupes)}]({link(paths[r['fips2027']])}) | {r['fips2027']} | {level} |  |"
                          + place_cells(P[r['fips2027']]))
        n_counties = counties
    reading_lines, kept = state_reading(code, rows, st_values, P, dupes, link)
    pages[f'{st_name}.md'] = '\n'.join([f'# Fair Market Rents: {st_name}', '',
                                        *keys('State', st, code, '', n_counties, towns),
                                        said, '', *reading_lines, *PLACES[:2], listing, '',
                                        *PLACES[2:], *listed]) + '\n'
    return pages, {f'rents/{st_name}.md': kept}


# --- the changes in HUD's file (D5) ----------------------------------------

def found_changes(rows):
    """Every change of definition or key in HUD's file, as found in it:
    (title, boundary, was, now, crosswalk, source, places)."""
    def at(y, pct):
        return sum(r.get(f'fmr{YY[y]}') == pct for r in rows)
    ct = [r for r in rows if r['state'] == '09' and r['fips2024'] != r['fips2027']]
    six = [r for r in rows if fips_before(r)[1]]
    readme = "HUD's Read Me for the FMR history (READ_ME_FMRHIST_FY2025)"
    return sorted([
        ('Percentile, 45th to 40th', 1995,
         f'FMRs set at the 45th percentile of gross rents ({at(1994, "45")} places in FY1994)',
         f'FMRs set at the 40th percentile ({at(1995, "40")} places in FY1995)',
         'None in this file: HUD says the FY1995 proposed FMRs were published at both, but this file '
         'holds the 40th only. The years to FY1994 are in each place\'s table "45th percentile, '
         '1983 to 1994", never in its card.',
         readme + ', note 2; the fmr94 and fmr95 columns', at(1994, '45')),
        ('Some areas at the 50th percentile', 2001,
         'every FMR at the 40th percentile',
         f'FMRs of selected costly areas at the 50th percentile ({at(2001, "50")} places in FY2001)',
         'None: a place-year has one FMR in this file, the one HUD set, and the legal rent that '
         "year. A setting made place by place, not a change of definition (SPEC D8): the rents "
         "are in each place's card as set, marked by its Areas runs, Percentile 50.",
         readme + ', note 4; the fmr01 column', at(2001, '50')),
        ('The 50th percentile ended', 2020,
         f'FMRs of {at(2019, "50")} places at the 50th percentile in FY2019',
         'every FMR at the 40th percentile (the Small Area FMR rule, 81 FR 80567)',
         "None, as in 2001: the rents of those places are in their cards as set, marked by "
         "their Areas runs' Percentile (SPEC D8).", readme + ', note 4; the fmr19 and fmr20 columns', at(2019, '50')),
        ("HUD's nonmetropolitan mark", 2005,
         'MSA 10000 for a county outside a metropolitan area',
         'MSA 9999', "None needed: a code, not a move; each place's Areas runs show both.",
         "HUD's file, the msa04 and msa05 columns", sum(r['msa05'] == '9999' for r in rows)),
        ('Areas renumbered', 2006,
         "HUD's MSA numbers (5240), areas as OMB drew them in the 1990s",
         "HUD Metro FMR Area codes (METRO33860M33860, NCNTY…), areas from OMB's 2003 "
         'definitions and the 2000 Census',
         'Each place: its Areas runs end at 2005 under an MSA number and begin at 2006 under a Metro code.',
         readme + ', fields msa_83 to msa_06, and note 4', len(rows)),
        ("Connecticut's planning regions", 2026,
         "towns keyed by Connecticut's eight counties (090xx)",
         'towns keyed by its nine planning regions (0911x to 0919x)',
         f'Each town: `- FIPS 2024:` holds its old code ({len(ct)} towns).',
         readme + ', field fips2024', len(ct)),
        ('New England town codes', LATEST,
         f'{len(six)} towns under the codes they had to FY{LATEST - 1}',
         'the same towns under new codes',
         f'Each town: `- FIPS before:` holds its old code ({len(six)} towns).',
         "HUD's file, fips and fips2024 against fips2027", len(six),
         sorted((name_of(r, set()), fips_before(r)[1], r['fips2027'], 'new code') for r in six)),
    ], key=lambda c: c[1])


def changes_pages(found):
    """The changes, a page each (SPEC B7), and Changes.md listing them."""
    pages, listed = {}, []
    for title, year, was, now, cross, source, n, *table in found:
        fn = safe(f'{title}, {year}')
        lines = [f'# Change: {title}, {year}', '',
                 '- Dataset: Fair Market Rents',
                 f'- Boundary: {year}',
                 f'- Was: {was}',
                 f'- Now: {now}',
                 f'- Crosswalk: {cross}',
                 f'- Places: {n}',
                 f'- Source: {source}', '']
        if table:
            lines += ['## Places', '', '| Place | Was | Now | What |', '|---|---|---|---|']
            lines += [f'| {p} | {was_} | {now_} | {what} |' for p, was_, now_, what in table[0]]
        pages[f'Changes/{fn}.md'] = '\n'.join(lines).rstrip() + '\n'
        listed.append(f"- [{title}, {year}]({link(f'Changes/{fn}.md')})")
    pages['Changes.md'] = '\n'.join([
        '# Changes in the Fair Market Rents', '',
        "Where HUD's file changes a definition or a key during its years: the "
        'latest form is kept in the cards, the older only in tables of their own, '
        'and nothing runs across a change. A setting HUD made place by place, the '
        "50th percentile, is the rent's own: in the cards as set, marked beside "
        'it (SPEC D8). A change a page:', '', *listed]) + '\n'
    return pages


# --- README -----------------------------------------------------------------

def readme(by_state, total, counties, towns, found):
    L = [f'# Fair Market Rents, 1983 to {LATEST}', '',
         "Every county's Fair Market Rents from HUD, fiscal years 1983 to "
         f'{LATEST} ({len(YEARS)} years; there was no FY1984), by bedroom count: '
         f'{total} places, {counties} counties and {towns} New England towns, '
         'in the states, the District of Columbia, Puerto Rico and the territories. '
         'Part of databook-hud: data only, printable as a book and queryable as tables.', '',
         '## What a Fair Market Rent is', '',
         'A Fair Market Rent (FMR) is what HUD reckons a modest, decent home '
         'costs to rent in an area: the 40th percentile gross rent (rent and '
         'utilities) of standard-quality units, set each fiscal year for each '
         'metropolitan area and each county outside one. It is the yardstick for '
         'Housing Choice Vouchers (Section 8) and other HUD programs. A county '
         'takes the rents of its FMR area, so all the counties of one metro area '
         'have the same rents. In New England HUD draws its areas by town, not '
         'county, so there each town is a place of its own.', '',
         '## How it is written', '',
         'A page a place, as a reader finds it: `Alabama/Autauga County.md`; in '
         "New England, where HUD's places are towns, `Maine/Penobscot County/Bangor "
         "city.md` (Connecticut's under its planning regions). A state's page "
         '(`Alabama.md`) lists its places, or in New England its counties, and a '
         "New England county's page its towns, linked, in a table gathered as "
         '`Fair_Market_Rents_Places`, dearest first, with each place\'s latest two-bedroom rent, '
         'its rent\'s and its median family income\'s rise since FY2006, and its burden. A state\'s '
         'page opens with the questions a reader asks of it first, answered from the data at '
         'every release (`.import/reading.md`), and draws its rent over the years '
         '(`Fair_Market_Rents_Rent_over_the_years`) and its places side by side, a row each '
         '(`Fair_Market_Rents_Places_compared`). A page is named for its place, a slash a '
         'dash; a name two pages of one folder would share takes its FIPS. The '
         'changes are a page each, in `Changes/`, listed in [Changes](./Changes.md).', '',
         'Each place is a record, `# Rents: <name>, <ST>` (towns too, with '
         '`- Level: Town`), keyed by `- FIPS:`, the ten digits HUD writes '
         '(state, county, county subdivision; `99999` for a whole county). Its '
         'card, **Fair Market Rents**, holds its rents as HUD set them from '
         'FY1995, a row a bedroom count and a column a year: at the 40th '
         'percentile, the definition since FY1995, or, for some costly areas in '
         'some years from FY2001 to FY2019, at the 50th. The rent HUD set was '
         'the legal rent that year, so it is in the card, and the percentile is '
         "marked beside it, in the place's `#### Areas`. The years before FY1995, "
         'at the 45th percentile for every place, are kept beside the card, never '
         'in it: `#### 45th percentile, 1983 to 1994`. '
         "Its `#### Areas` are the runs of years it sat in one FMR area at one "
         'percentile: HUD names areas only from FY2022, so older runs give the '
         'code alone. '
         '`- Area changes:` counts the years its code changed, leaving out 2006.', '',
         '## How to ask', '',
         'Each table is one across the country, a row a place and bedroom count: '
         '`Rents_Fair_Market_Rents` and `Rents_45th_percentile_1983_to_1994`; '
         'and `Rents_Areas`, a row a run, with its `Percentile`.', '',
         '```sql',
         '-- two-bedroom rents in Manhattan and Onondaga County, 1995 and now',
         f'select record, "1995", "2010", "{LATEST}" from Rents_Fair_Market_Rents',
         "where Bedrooms = 2 and record in ('New York County, NY', 'Onondaga County, NY')",
         '```', '',
         '```sql',
         "-- the counties with the dearest two-bedroom FMRs this year, ties kept, with each one's area",
         f'select t.record, r."FMR area", t."{LATEST}" from Rents_Fair_Market_Rents t join Rents r on r.name = t.record',
         f"where t.Bedrooms = 2 and r.Level = 'County'",
         f'qualify rank() over (order by t."{LATEST}" desc) <= 10 order by t."{LATEST}" desc, t.record',
         '```', '',
         '```sql',
         '-- the places set at the 50th percentile longest',
         'select record, sum("To" - "From" + 1) as years',
         'from Rents_Areas where Percentile = 50',
         'group by record order by years desc, record limit 10',
         '```', '',
         '`FIPS` is gathered as text, its leading zero kept (SPEC K2).', '',
         '## Changes', '',
         "Where HUD's file changes a definition or a key, in full in "
         '[Changes](./Changes.md):', '']
    for title, year, *_ in sorted(found, key=lambda c: c[1]):
        L.append(f'- {year}: {title}')
    L += ['', '## The source', '',
          'HUD User, the Office of Policy Development and Research of the U.S. '
          'Department of Housing and Urban Development: *FMR History 1983 - '
          'Present: All Bedroom Unit data*, `FMR_All_1983_2027.csv`, from '
          '<https://www.huduser.gov/portal/datasets/fmr.html>, with its Read Me '
          '(updated August 2025). Written here by the importer (`.import/rents/`); '
          'nothing here is edited by hand.', '',
          "Notice of use: HUD's data are a work of the United States Government, "
          'and so free of copyright in the United States (17 U.S.C. 105). HUD '
          "User's notice: reference to a product or firm is not endorsement by "
          "HUD. This databook is not HUD's, nor endorsed by it.", '',
          '## The states', '']
    for code in sorted(by_state, key=lambda c: STATES[c][0]):
        rows = by_state[code]
        st_name = STATES[code][0]
        n = len(rows)
        towns = sum(r['cousub'] != '99999' for r in rows)
        word = 'towns' if towns == n else ('places' if towns else 'counties')
        if n == 1:
            word = {'towns': 'town', 'places': 'place', 'counties': 'county'}[word]
        L.append(f'- [{st_name}](./{st_name.replace(" ", "%20")}.md): {n} {word}')
    L.append('')
    return '\n'.join(L)


# --- the run ----------------------------------------------------------------

def read(src):
    with open(src, 'rb') as f:
        raw = f.read()
    reader = csv.reader(raw.decode('latin-1').splitlines())
    header = next(reader)
    rows = [dict(zip(header, r)) for r in reader if r]
    return raw, header, rows


def build(rows, incomes=None):
    """Every page, as {file name: text}; the counts written; and the reading
    (the values the state pages filled, the nation's, its pictures'), for
    reading.json and the front page. incomes: each place's, by FIPS, from
    .import/incomes.json (none given, the pages say so where they need them)."""
    incomes = incomes or {}
    names = Counter((r['name'], r['state']) for r in rows)
    dupes = {k for k, v in names.items() if v > 1}
    state_region = {}
    by_state = {}
    for r in rows:
        if r['census_region']:
            state_region.setdefault(r['state'], r['census_region'])
        by_state.setdefault(r['state'], []).append(r)
    pages, kept, paths = {}, {}, {}
    for code, srows in by_state.items():
        srows.sort(key=lambda r: r['fips2027'])
        paths.update(page_paths(code, srows, dupes))
    nation, states, P, pictures = reckon(rows, by_state, incomes, dupes, paths)
    for code, srows in by_state.items():
        sp, sk = state_pages(code, srows, dupes, state_region, P, states[code])
        pages.update(sp)
        kept.update(sk)
    found = found_changes(rows)
    pages.update(changes_pages(found))
    counties = sum(r['cousub'] == '99999' for r in rows)
    pages['README.md'] = readme(by_state, len(rows), counties, len(rows) - counties, found)

    def cells(years, at):
        vals = [int(v) for r in rows for y in years for b in BEDROOMS for v in [rent(r, y, b, at)] if v]
        return {'cells': len(vals), 'sum': sum(vals)}

    def has(years, at):
        return sum(any(rent(r, y, b, at) for y in years for b in BEDROOMS) for r in rows)
    src_vals = [int(v) for r in rows for y in YEARS for b in BEDROOMS
                for v in [cell(r.get(f'fmr{YY[y]}_{b}'))] if v]
    counts = {
        'records': len(rows), 'counties': counties, 'towns': len(rows) - counties,
        'states': len(by_state), 'pages': len(pages), 'changes': [[c[1], c[0]] for c in found],
        'tables': {
            'Rents_Fair_Market_Rents': {'rows': 5 * len(rows), **cells(P40, AS_SET),
                                        'at_50th': cells(P50, ('50',))},
            'Rents_45th_percentile_1983_to_1994': {'rows': 5 * has(P45, ('45',)), **cells(P45, ('45',))},
            'Rents_Areas': {'rows': sum(len(areas(r)) for r in rows)},
        },
        'place_years_at_50th': sum(percentile(r, y) == '50' for r in rows for y in P50),
        # HUD marks Broomfield County, CO at the 50th in FY2001-04 but gives it no rents
        'place_years_at_50th_with_rents': sum(percentile(r, y) == '50' and any(rent(r, y, b, ('50',)) for b in BEDROOMS)
                                              for r in rows for y in P50),
        'source': {'rows': len(rows), 'cells': len(src_vals), 'sum': sum(src_vals)},
    }
    return pages, counts, {'pages': kept, 'nation': nation, 'pictures': pictures}


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else SOURCE
    raw, header, rows = read(src)
    with open(os.path.join(HERE, 'shape.json'), encoding='utf-8') as f:
        shape = json.load(f)
    try:
        check_shape(raw, header, rows, shape)
    except ShapeError as e:
        sys.exit(str(e))
    if not os.path.exists(INCOMES):
        sys.exit(f"no {INCOMES}: the limits' importer writes it (node .import/limits/import.js); run it first")
    with open(INCOMES, encoding='utf-8') as f:
        incomes = json.load(f)
    pages, counts, read_out = build(rows, incomes)
    t = counts['tables']
    written = sum(t[k]['cells'] for k in t if 'cells' in t[k])
    if written != counts['source']['cells']:
        sys.exit(f"would write {written} rent cells, but the source has {counts['source']['cells']}")
    os.makedirs(OUT, exist_ok=True)
    # the pages a run writes: the old ones go first, so a gone page goes,
    # and the folders left empty
    for d, _, files in os.walk(OUT, topdown=False):
        for fn in files:
            if fn.endswith('.md'):
                os.remove(os.path.join(d, fn))
        if d != OUT and not os.listdir(d):
            os.rmdir(d)
    for fn, text in pages.items():
        os.makedirs(os.path.dirname(os.path.join(OUT, fn)), exist_ok=True)
        with open(os.path.join(OUT, fn), 'w', encoding='utf-8') as f:
            f.write(text)
    with open(os.path.join(HERE, 'counts.json'), 'w', encoding='utf-8') as f:
        json.dump(counts, f, indent=1)
        f.write('\n')
    # the state pages' reading, kept: a finding turned since the last release warns (SPEC R3)
    out = os.path.join(HERE, 'reading.json')
    reading.turned(out, read_out['pages'])
    reading.save(out, read_out['pages'], nation=read_out['nation'], pictures=read_out['pictures'])
    print(f"{len(rows)} rows read; {counts['records']} records on {counts['pages']} pages ({counts['states']} states), "
          f"{len(counts['changes'])} changes; the source's {counts['source']['cells']:,} rents written as "
          + ' + '.join(f"{t[k]['cells']:,} ({k})" for k in t if 'cells' in t[k]))


if __name__ == '__main__':
    main()
