# Decisions: databook-hud

Taken by the databooks seat's deputy, 2026-10-13, on branch `import`,
when the rents and the limits became one repo and were held to SPEC.md.
Each: what, why, how to undo it. Each dataset's own decisions are in
`.import/rents/DECISIONS.md` and `.import/limits/DECISIONS.md`.

## The repo

1. **One repo, both histories.** `databook-hud-rents` main and
   `databook-hud-limits` main were fetched into branches `rents` and
   `limits` (no remote added), each moved into its folder by a commit of
   renames only (`git mv`), then joined on `import` with
   `git merge --allow-unrelated-histories`. `git log --follow
   rents/Alabama.md` reaches the first commit. The old repos are
   untouched. The branches `rents` and `limits` are kept; `main` is not
   made (the seat's). Undo: delete the repo; the old ones stand.
2. **A folder a dataset, an importer a folder**: `rents/` and
   `.import/rents/` (Python, stdlib), `limits/` and `.import/limits/`
   (Node, SheetJS). `.import/build.sh` runs both, writes the front page
   (`.import/readme.py`) and plays every test. `.import/target.py` plays
   `.import/vectors/target.sql`, which spans both datasets.
3. **The front page, README.md, is written** by `.import/readme.py` from
   each importer's `counts.json`; each folder's README by its importer.
   The join rent-against-income is the front page's, on FIPS.

## The kinds (SPEC B5)

4. **`### Rents: <place>` and `### Limits: <place>`**, the seat's lean.
   The state pages too: `# Fair Market Rents: <State>` and
   `# Income Limits: <State>` (both had `# State:`, which would have made
   one table of two shapes). New England's county rows before 2006 are
   `### County before 2006: <county>, <ST> (MSA <n>)`, named for their
   era. The changes, `### Change: <what>, <year>`, one kind in both
   folders, told apart by `- Dataset:`. Undo: the heading strings.
5. **Every key written in every record, blank where none** (SPEC B3):
   `- FIPS 2024:`, `- FIPS before:`, `- Last year:` and the like were
   written only where they had a value. proper gathers a blank as null.
6. **Virgin Islands**: the limits wrote `Virgin Islands.md`, the rents
   `U.S. Virgin Islands.md`; both now `U.S. Virgin Islands`, so a
   state's pages share a name. Undo: `STATES` in sources.js.

## The changes (SPEC D)

7. **A change is found in the data where it can be**, not written from
   memory: the percentile years from `fmrNN`, the nonmetro mark's year,
   the CT year, every place recoded, listed or dropped. What HUD says
   (its Read Me, the Act of 2014) is cited in `- Source:`.
8. **The rents' main card is the 40th percentile, FY1995 on** (D1): the
   45th-percentile years, FY1983-1994, are a table of their own
   (`45th percentile, 1983 to 1994`), and so are the place-years HUD set
   at the 50th, FY2001-2019 (`50th percentile, 2001 to 2019`), empty in
   the card (D4, D6). 3,270 place-years, 16,330 rents, 368 places.
   HUD published no year at both percentiles in this file, so there is
   no crosswalk year (D2 cannot be kept): the Change records say so.
   Undo: `P40`, `rent()` and `record()` in import.py.
9. **Methods are not definitions.** HUD changed how it reckons both
   series many times (recent-mover rents, the ACS base, hold-harmless
   to FY2009, caps since); these change the numbers, not what they are,
   and are not split. A percentile, a definition in law, a key: split.
10. **Places recoded, listed or dropped are a Change a year** (limits),
    with a `#### Places` table (`Change_Places`: Place, Was, Now, What),
    rather than a Change a place: 13 years, 70 rows. The CT re-keying is
    its own record. Undo: `foundChanges()` in import.js.

## The vectors (SPEC V)

11. **V1 is exact for the limits, a range for the rents.** Each limits
    file is a year's and should not change once read: its heads, rows and
    medians are kept per file in `shape.json`, exactly. The rents' one
    file grows a year at a time: its columns exactly, its rows 4,700 to
    4,850, its percentiles by era. A new year is a new shape, on purpose:
    the importer stops, and the year is read before it is written.
12. **V2 vectors were made by the importer and checked by eye against
    the source**, cell by cell for the rules they hold (Autauga's 1994
    and 1995 rents, DC's 50th-percentile years, Onondaga's FY2014 in
    both files, Andover's county row), not written by hand before the
    code. They hold the rules now; a change to the output must be a
    change to a vector.
13. **V3 checks what proper gathers against `counts.json`**, which each
    importer writes from the source as it writes the pages; and runs
    every README query. The old repos' counts are checked once (NOTES),
    not in target.sql, so the check does not lean on another repo.
