"""A reader's way in (SPEC R2, R3): the questions and findings written by
hand in .import/reading.md, their words filled from the values an
importer reckons, and the values kept, so a rerun whose finding turns
warns `finding-turned`. Used by .import/rents/import.py (a state's page)
and .import/readme.py (the front page); not run itself.

A record's words hold `{name}`, `{name:$}` (dollars) and `{name:%}` (a
percent); a value that is a list is written "a, b and c". A value
reckoned as None (HUD's files give none) leaves the record's answer as
the book not saying, never a guess.
"""

import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
KEYS = ['Page', 'Ask', 'Answer', 'Alone', 'Measure', 'Picture', 'Turns on', 'FAQ', 'FAQ page', 'Holds', 'Says']


def records():
    """{id: record} from reading.md, in its order; each record's keys as written."""
    with open(os.path.join(HERE, 'reading.md'), encoding='utf-8') as f:
        text = f.read()
    out = {}
    for block in re.split(r'\n(?=### (?:Question|Finding): )', text)[1:]:
        m = re.match(r'### (Question|Finding): (\S+)\s*\n', block)
        kind, rid = m.group(1), m.group(2)
        if rid in out:
            raise SystemExit(f'reading.md: {rid} twice')
        rec = {'kind': kind, 'id': rid}
        for line in block.splitlines():
            km = re.match(r'- ([^:]+):[ \t]*(.*)$', line)
            if km and km.group(1) in KEYS:
                rec[km.group(1)] = km.group(2).strip()
        rec['turns'] = [k.strip() for k in rec.get('Turns on', '').split(',') if k.strip()]
        out[rid] = rec
    return out


def of_page(page):
    """The records of one page ('README.md', or 'rents/<State>.md' for every state's)."""
    return [r for r in records().values() if r.get('Page') == page]


def money(v):
    return f'${int(v + 0.5):,}'


def percent(v):
    s = f'{v:.1f}'
    return (s[:-2] if s.endswith('.0') else s) + '%'


def listed(v):
    v = [str(x) for x in v]
    if len(v) > 6:
        return f'{", ".join(v[:3])} and {len(v) - 3} more'
    return v[0] if len(v) == 1 else f'{", ".join(v[:-1])} and {v[-1]}'


class _V:
    def __init__(self, v):
        self.v = v

    def __format__(self, spec):
        v = self.v
        if isinstance(v, list):
            return listed(v)
        if spec == '$':
            return money(v)
        if spec == '%':
            return percent(v)
        return format(v, spec) if spec else str(v)


def fill(template, values, shown=None):
    """The words, each `{name}` filled: from `shown` (a name already written
    as words, links and all) where it has the name, else from `values`.
    None if a value it needs is None."""
    shown = shown or {}
    need = re.findall(r'\{(\w+)(?::[^}]*)?\}', template)
    for k in need:
        if k not in shown and k not in values:
            raise SystemExit(f'reading.md: no value {k} for "{template[:60]}…"')
        if shown.get(k, values.get(k)) is None:
            return None
    return template.format_map({k: _V(shown.get(k, values.get(k))) for k in need})


def answer(rec, values, shown=None, alone=False, state=''):
    """A question's sentence (its Alone where the state is one place), or a
    finding's (Says); where a value is missing, the book says so."""
    t = rec['Alone'] if alone and rec.get('Alone') else rec.get('Answer') or rec.get('Says')
    said = fill(t, values, shown)
    if said is None:
        return f"The book does not say{' for ' + state if state else ''}: HUD's files give it no value this needs."
    return said[0].upper() + said[1:]  # a sentence may open with "the District of Columbia's"


def ask(rec, state=''):
    return rec['Ask'].replace('{state}', state)


def kept(values, rec):
    """The values a record uses (its words', its turns', its Holds'), as
    they are kept in reading.json: plain JSON."""
    words = ' '.join(rec.get(k, '') for k in ('Answer', 'Alone', 'Says'))
    used = set(re.findall(r'\{(\w+)(?::[^}]*)?\}', words)) | set(rec['turns']) \
        | {p.split('=')[0].strip() for p in rec.get('Holds', '').split(',') if '=' in p}
    return {k: v for k, v in values.items()
            if k in used and (isinstance(v, (int, float, str, list)) or v is None)}


def turned(path, pages):
    """Warn of each finding turned since the last release: pages is
    {page: {record id: values}}; the last release's are in path (JSON).
    Writes the new ones in its place. Returns the warnings."""
    try:
        with open(path, encoding='utf-8') as f:
            before = json.load(f).get('pages', {})
    except FileNotFoundError:
        before = {}
    recs = records()
    said = []
    for page, ids in sorted(pages.items()):
        for rid, now in ids.items():
            was = before.get(page, {}).get(rid)
            if not was:
                continue
            for k in recs[rid]['turns']:
                if k in was and was[k] != now.get(k):
                    said.append(f'finding-turned: {page}, {rid}: {k} was {was[k]!r}, now {now.get(k)!r}')
    for s in said:
        print(s)
    return said


def save(path, pages, **more):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'pages': pages, **more}, f, indent=1, ensure_ascii=False, sort_keys=True)
        f.write('\n')
