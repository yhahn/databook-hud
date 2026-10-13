"""V3: plays .import/vectors/target.sql against what proper gathers, and runs
every ```sql block of the READMEs (each must answer, with rows). Run from
the repo, after the importers:

    python3 -I .import/target.py

Says each check, held or not, and exits 1 if any is not.
"""

import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)


def counts():
    c = {}
    for name in ('rents', 'limits', 'lihtc'):
        with open(os.path.join(HERE, name, 'counts.json'), encoding='utf-8') as f:
            c[name] = json.load(f)
    c['changes'] = len(c['rents']['changes']) + len(c['limits']['changes']) + len(c['lihtc']['changes'])
    c['lihtc']['changes_n'] = len(c['lihtc']['changes'])
    c['limits']['rows_2006_on'] = ' '.join(str(l['rows']) for l in c['limits']['ledger'] if l['year'] >= 2006)
    return c


def want_of(text, c):
    def look(m):
        v = c
        parts = m.group(1).split('.')
        v = v[parts[0]]
        rest = '.'.join(parts[1:])
        # table names hold dots never, but may hold spaces: walk by known keys
        while rest:
            for k in sorted(v, key=len, reverse=True):
                if rest == k or rest.startswith(k + '.'):
                    v = v[k]
                    rest = rest[len(k) + 1:]
                    break
            else:
                raise KeyError(m.group(1))
        return str(v)
    return re.sub(r'\{([^}]+)\}', look, text)


def query(sql):
    p = subprocess.run(['proper', 'query', sql], cwd=REPO, capture_output=True, text=True)
    out = p.stdout + p.stderr
    rows = [l for l in out.splitlines() if l.startswith('|')]
    if p.returncode or len(rows) < 2:
        return None, out.strip()
    return rows[2:], out


def main():
    c = counts()
    with open(os.path.join(HERE, 'vectors', 'target.sql'), encoding='utf-8') as f:
        text = f.read()
    failed = 0
    for block in re.split(r'\n(?=-- name: )', text):
        m = re.match(r'-- name: ([^\n]*)\n-- want: ([^\n]*)\n(.*)', block, re.S)
        if not m:
            continue
        name, want, sql = m.group(1), want_of(m.group(2).strip(), c), m.group(3).strip().rstrip(';')
        rows, out = query(sql)
        have = rows[0].strip('| ').strip() if rows else out
        ok = have == want
        failed += not ok
        print(f"{'held' if ok else 'NOT HELD'}  {name}" + ('' if ok else f'\n    want {want}\n    have {have}'))
    for readme in ('README.md', 'rents/README.md', 'limits/README.md', 'lihtc/README.md'):
        with open(os.path.join(REPO, readme), encoding='utf-8') as f:
            blocks = re.findall(r'```sql\n(.*?)```', f.read(), re.S)
        for i, sql in enumerate(blocks, 1):
            rows, out = query(sql)
            ok = bool(rows)
            failed += not ok
            print(f"{'held' if ok else 'NOT HELD'}  {readme}, query {i}: {len(rows) if rows else 0} rows"
                  + ('' if ok else f'\n    {out[:400]}'))
    print(f'{failed} not held' if failed else 'every check held')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
