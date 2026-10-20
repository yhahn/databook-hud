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

## A reader's way in (SPEC R), 10-20, branch `r-pass`

The R pass, the reading trial's after arm: the deputy given SPEC B and
R, the book, and cards.md's pictures, and nothing else.

32. **The spine is place (R1)**: the nation on the front page
    (README.md); a state on its rents page (`rents/<State>.md`); a county,
    or in New England a town, on its own pages. Time is the second axis,
    drawn on each. Why: a stranger comes to HUD's yardsticks asking "what
    does it cost here?", and every dataset is already keyed and foldered
    by place (B7); by time would split a place's 44 years across pages,
    by entity is place again, and by question would leave the 4,764
    places without a home. The seat's lean, taken. Undo: reading.md's
    Page keys, and the reading parts of readme.py and rents/import.py.
33. **The rents' state page is the state's way in**, not a new page:
    the book has three state pages a state (rents, limits, tax credits),
    and R1 wants one spine. The rents are the book's lead and its
    comparisons are rent's, set against income; the limits' and the tax
    credits' state pages each gain one sentence linking to it, and the
    rents' page links back to both (R1: the other datasets are links
    across the spine). A New England county's rents page compares its
    towns too (its Places), but asks no questions: R2 names "every folder
    page on the spine", and its towns are already compared on the state's
    page. Undo: the `said` sentences in limits/import.js and
    lihtc/import.js; `state_reading()` in rents/import.py.
34. **What a place is, counted**: the nation's figures are its counties',
    the rows HUD keys `…99999` (3,161, Puerto Rico's and the territories'
    among them); New England, whose rents HUD sets by town, is left out
    of them, as faq.md's analysis questions already do. Its 1,603 towns
    would weigh as half again as many counties if put in, and HUD gives
    no county rent there to stand for them. A state's figures are its
    own places', counties or in New England towns. A median is of places,
    not people: the book holds no population. Said on the page and in
    reading.md. Undo: `reckon()`.
35. **A picture of 3,000 counties (the seat's lean)**: on the front page,
    a line of the median county's two-bedroom rent each year with its
    middle half as a band (the lower and upper quartile), not every
    county; and a grid of the states, a row each, each a median of its
    places. On a state's page, its median and middle half beside the
    nation's median county, then every place a row of a grid (Brinton's
    shape, R4): every fourth year to the latest (FY1995, 1999, … 2027,
    nine columns), shaded against the dearest on that card, with the
    rent's and the income's rise from FY2006 and the burden written at
    the right (gutters). Every fourth year, not every year, so a state of
    254 counties is still a page and not a wall; the place's own page
    holds every year. Undo: GRID_YEARS.
36. **The 50th percentile, said and never hidden (D8)**: the line is the
    rent as HUD set it, the legal rent, as the cards are; the front
    page's answer says how many counties were at the 50th at most in a
    year (221, FY2001) and how far the median of the counties at the
    40th alone ever strays from the line ($9), and the line is marked
    at FY2001 and FY2020. A state's line is marked so where any of its
    places was ever at the 50th. Undo: the Mark rows.
37. **Its numbers, reckoned at every build**: the limits' importer
    writes `.import/incomes.json` (each place's median family income and
    very low income limit for four, FY2006 on, by its FIPS now): a table
    two importers share, made by a script from the source (B8), but
    written at each run and gitignored (2.8 MB), so build.sh runs the
    limits before the rents. The rents' importer stops if it is missing.
    Undo: the incomes block in limits/import.js, `.gitignore`.
38. **The words are reading.md's, the numbers the importer's (R3)**:
    each question's answer and each finding's words are written in
    reading.md with `{name}` holes, filled by `.import/reading.py`
    (shared by readme.py and rents/import.py); a value HUD gives none of
    leaves the answer as the book not saying. A state of one place (the
    District, Guam, …) has its own words, `Alone`. Ties are kept and
    named (New York's dearest is eight counties of one FMR area); past
    six, three and the count. Undo: reading.md and reading.py.
39. **`finding-turned`**: what each page was filled with is kept,
    `.import/reading.json` (the front page) and `.import/rents/reading.json`
    (the states, and the nation's figures the front page draws), in git,
    so a rerun compares with the last release and warns for each value a
    record names in `Turns on` that changed (a rise now a fall, a leader
    replaced). It warns; it does not stop. faq.js had no `answer-changed`
    to copy (the brief thought it had): this is the first of its kind
    here. Undo: `reading.turned()`.
40. **The R2 questions in faq.md, and drift stops the build**: seven
    new questions (hud-reading-1 to 7, Across and Analysis), and two old
    ones serve (hud-analysis-4 for the front page's rent against income,
    hud-analysis-1 for a state's, asked of Mississippi). A state's
    questions are asked of New York. Each reading question names its FAQ
    question and the values that must agree (`Holds`); faq.js, after it
    writes FAQ.md, compares them and stops with `page-drifted` where they
    do not. It found one at once: FY2026's limits cut "Northern Mariana
    Islands" to twenty letters, so faq.js names it whole, as it names the
    Virgin Islands as the book does. Undo: `drifted()` in faq.js.
41. **A state's Places table compares (R4)**: the listing keeps its
    links and keys, and gains the latest two-bedroom rent, the rent's
    and the median family income's rise FY2006-2026, and the burden,
    sorted dearest first, not by code; a New England county's listing of
    its towns the same; a New England state's listing of its counties
    blank in them (HUD sets no county rent there). Same columns in every
    file (B4), gathered as `Fair_Market_Rents_Places`. Undo: `PLACES`
    and `place_cells()`.
42. **A picture's table is the card's own (R5)**: cards.md draws a
    card from the table inside it, and that table is in the file, read
    on GitHub as a table and gathered by proper; no second copy is
    written beneath a card. Where the reader needs links (the states on
    the front page, the places on a state's), a linked table follows the
    picture (`### The states, linked`; `## Places`). A grid's labels are
    places' names less their kind (`Bronx`, not `Bronx County`) where
    that leaves them their own, as cards.md cuts a label past twelve
    letters; its FIPS is a hidden column (`- Hide: FIPS`).
43. **A state's line has every year, blank where none** (B4): the
    Northern Mariana Islands and American Samoa have no rents before
    FY2016; a card of fewer years was gathered as a second
    table (`…_2`). A target check now finds any such.
44. **proper keeps codes as text now** (SPEC K2's ask, met): `FIPS` and
    `County FIPS` are gathered as VARCHAR with their leading zeros, so
    the queries that joined `"County FIPS" * 100000 + 99999` failed before
    this pass touched them (the lihtc README's 3 and 4, the front page's
    3, a target check). They join `"County FIPS" || '99999'` now, and the
    READMEs say FIPS is text. And proper gathers a table of its own with
    `_end_line`, `footnotes` (G17): the B5 check of kinds leaves it out.
    Neither is a change of data. Undo: git.
