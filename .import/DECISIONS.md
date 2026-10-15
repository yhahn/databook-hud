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

4. **`### Rents: <place>` and `### Limits: <place>`**, the seat's lean
   (since B7, `# Rents:` and `# Limits:`, a page each: 19 below).
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
8. **The rents' main card is the rent as HUD set it, FY1995 on** (D1,
   D8): at the 40th percentile, or the 50th where HUD set a place there
   in FY2001-2019 (3,270 place-years, 16,330 rents, 368 places), marked
   by the place's Areas runs (`Percentile`). The 50th was a setting made
   place by place, on and off, and the rent set was the legal rent that
   year: the person, 10-13, now SPEC D8. Until 10-13 (branch `import`)
   those years were empty in the card and kept in a table `50th
   percentile, 2001 to 2019`. The 45th-percentile years, FY1983-1994, a
   change for every place at once (D3), stay a table of their own
   (`45th percentile, 1983 to 1994`). Undo: `AS_SET` in import.py, and
   the 50th table from git (fb7ad77).
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
    and 1995 rents, DC's 50th-percentile years (moved into its card for D8, 10-13), Onondaga's FY2014 in
    both files, Andover's county row), not written by hand before the
    code. They hold the rules now; a change to the output must be a
    change to a vector.
13. **V3 checks what proper gathers against `counts.json`**, which each
    importer writes from the source as it writes the pages; and runs
    every README query. The old repos' counts are checked once (NOTES),
    not in target.sql, so the check does not lean on another repo.

## The pages (SPEC B7), 10-13, branch `b7`

14. **A page a place, always, in every state**: `rents/Alabama/Autauga
    County.md`, not only past ten. B7 lets a page hold a few, but a reader
    and an agent find any place at one path whatever the state's size
    (DC's one county too). Undo: `state_pages()` in import.py and the
    pages block of `build()` in import.js.
15. **New England nested by county**: `<State>/<County>.md` lists its
    towns, `<State>/<County>/<town>.md` a town each; Connecticut's by
    planning region, its key since FY2025/26. HUD's rents give no county
    row in New England, so a county's page there holds no Rents record,
    only its listing (the brief had "the county's record"; there is none
    to write). The limits' county page also holds its `County before
    2006` records. Undo: as 14.
16. **County names from HUD's limits files**: the rents' file names no
    county, so `.import/counties.json` (76 New England counties and
    planning regions, made by `node .import/counties.js` from the limits'
    `County_Name`, FY2006 on, latest name kept) names the folders of both
    datasets alike. Run again when a limits year is added; either importer
    stops if a code is not in it. Undo: delete both files.
17. **County before 2006 records go with their county**: in New England
    on the county's page; Connecticut's old counties (gone as keys) on a
    page of their own each, `Connecticut/Tolland County.md`, listed on the
    state's page as Level `County before 2006`; Crawford, MO's two on its
    own record's page, after it. At most 5 on a page (Rockingham, NH).
18. **The listing pages are records**, of the kinds the state pages
    already were (`# Fair Market Rents: <name>`, `# Income Limits:
    <name>`), keys `Level` (State, County), `Postal code`, `State FIPS`,
    `County FIPS` (5 digits, a New England county's), `Counties`, `Towns`;
    their `## Places` table (Place linked, FIPS, Level, Towns) is gathered
    as `"Fair Market Rents_Places"` and `"Income Limits_Places"`. A
    state's `Counties` is now the counties listed: Maine's 16, not the
    0 county records it said before. Undo: `keys()` in both importers.
19. **A place's record heads its page**: `# Rents:` and `# Limits:` (were
    `###`), its tables `##` (were `####`); the table names are unchanged
    (`Rents_Fair_Market_Rents`, …). `County before 2006` records stay
    `###` under `## Counties before 2006`. Every record vector shifted
    likewise, nothing else in them changed. Undo: the heading strings.
20. **File names**: a page is named as its record, less `, <ST>` (`Gone/`
    keeps it, as places of every state meet there); NFC; `/` and `\` a
    dash; `: * ? " < > |` and control characters dropped; spaces single;
    no leading dot. Accents kept (`Añasco Municipio.md`). Two pages of one
    folder whose names match, case aside, each take ` (<FIPS>)`; none do
    today (the names HUD repeats in a state already carry their FIPS).
    Links: every character but letters, digits, `-_.~` and the comma as
    `%XX` (UTF-8); the comma left bare because proper reads `%2C` in a
    link as itself and the link leads nowhere. Undo: `safe()`, `link()`,
    `unique()` in both importers (kept alike; a test each).
21. **Gone and the changes, a page each**: `limits/Gone/<name>, <ST>.md`
    (16; 18 until Rockland and Westchester's second listings were made
    their counties', 22), `Gone.md` a list of links; `rents/Changes/<title>, <year>.md` (7)
    and `limits/Changes/…` (17), `Changes.md` a list. The lists are not
    written `- 1995: [...]`: proper reads key-like rows under a title as a
    near-record. Rents' 7 changes would fit one page; split for the same
    shape in both. Undo: `changes_pages()`, `changesPages()`.

## Gone mended, 10-13, branch `lihtc`

22. **Gone holds 16, not 18.** Rockland and Westchester, NY's `…99998`
    rows (FY2006-2020, beside each county's own `…99999` row the same
    years) are second listings, not dropped places: the bench found it
    (hud-analysis-3). They are kept with their county, a record of kind
    `Second listing` on the county's page, never a place and never gone;
    limits decision 4a has the whole. Checks first (target.sql: the kind
    and its keys, 2 records each on its county's page, Gone 16, the
    year-rows check counting them), then vector `rockland-ny.json`, then
    the importer. Undo: as 4a.

## The tax credits, 10-13, branch `lihtc`

23. **A third dataset, `lihtc/`**: HUD's Low-Income Housing Tax Credit
    database, a record a project (`# Project:`), its importer in
    `.import/lihtc/` (Node, as the limits), its decisions in
    `.import/lihtc/DECISIONS.md`. Its checks join the shared
    `target.sql`; `build.sh` runs it and its tests; the front page names
    it and joins its projects to the rents. Undo: delete `lihtc/` and
    `.import/lihtc/`, and the lines naming them.
24. **`counties.json` names every county**, 3,250, not New England's
    76 alone, from the limits' files FY1998 on, whole names over
    FY2026's cut ones. The rents and limits read only New England's,
    which are unchanged. Undo: `counties.js` from git.

## The questions (SPEC B9), 10-15, branch `faq`

25. **`.import/faq.md`, the 26 questions of the databooks bench
    (`bench/hud.md`), carried over by a script, ids and words unchanged**,
    each with `- Look in:` added: one page or several, split by `; `
    (a path may hold a comma), blank for the four of Type `none`. Where a
    question is over every place (Across), Look in names the dataset's
    README, whose tables and queries answer it; where a join, the pages
    of both datasets, or the front page whose query is the join (hud-join-2).
    Undo: edit Look in by a new question, as B9 says.
26. **A Gap question is one of Type `none`** (four: hud-gap-1, 2, 3, 5).
    hud-gap-4 keeps its id but is Tier Change, Type number: the source
    answers it (31050), so its answer is given and it has a Look in.
27. **Answers in FAQ.md are one line of words**, a number bare as the
    pages write it (`26200`); a set or list joined by `, ` (or `; ` where
    an item holds a comma); a join, analysis or judge in a sentence with
    its figures. How each was found in HUD's files is the record's body,
    below its keys. The bench's structured answers (`answer`) stay in
    `faq.js`, and are what the test holds. Undo: `words()` and each
    answer's `text`.
28. **FAQ.md's records have six keys** (Tier, Ask, Answer, Type,
    Tolerance, Look in), as the brief asked; Rules and How stay in
    faq.md, for the hand. An empty key is written `- Tolerance:`, no
    trailing space (proper gathers it null). Look in's links are named
    by their path, less `.md`.
29. **faq.js names Connecticut's planning regions from
    `.import/counties.json`** (written from HUD's limits files, not the
    book's pages): the FMR history names none. hud-change-3's groups are
    now ordered by towns, most first; the bench's hud.js ordered them as
    met. Its answer otherwise the same.
30. **SheetJS from the limits' importer**, by `createRequire` on
    `.import/limits/package.json`, as hud.js borrowed it by an absolute
    path. Undo: a package.json of its own in `.import/`.
31. **The checks** (target.sql): Question a kind (B5's list grows by
    one); its keys (B3); as many Question records as faq.md has (read by
    target.py), one an id; no blank answer, and `The book does not say.`
    exactly for Type none; every link from FAQ.md to a page gathered, and
    every question not a Gap with one. faq.js also refuses a Look in to a
    page not there, before it writes.
