# Notes: Gone mended, and the tax credits (deputy, 2026-10-13)

## What was asked

1. Gone first, in a commit of its own: the limits' Gone held 18, but
   Rockland and Westchester, NY's `…99998` rows are second listings, not
   dropped places: 16. Decide where their data lives; mend the checks,
   then the importer. Mend the limits' NOTES (Connecticut, FY2025).
2. LIHTC: HUD's tax credit database, a new folder `lihtc/` with its own
   importer, held to SPEC from the start (V1, V2, V3, B7, B5, K2, D5),
   and a README whose queries run, one joining a county's projects to its
   rents.
3. The whole build, every check held, `proper check` with nothing to
   mend, and the cold gather of the whole book timed.

Branch `lihtc`, worktree `.claude/worktrees/lihtc`; the merge is the seat's.

## What I made

| Commit | What | Files |
|---|---|---|
| 72a3006 | Gone 16: the second listings their counties' (checks, vector `rockland-ny.json`, importer, pages); the CT year | 29 |
| the next | the tax credits' importer, shape, vector, tests, checks, decisions, this note; `counties.json` for every county; the front page | (see `--stat`) |
| the last | the tax credits' pages, `lihtc/` | 58,315 |

### 1. Gone

The `…99998` rows are now records of a kind of their own, `### Second
listing: Rockland County, NY (3608799998)`, under `## Second listings` on
the county's page after its record, with the New York area's limits in
plain tables (`Second_listing_Very_low_income_50` and the like) and its
Areas. Not out: HUD published those limits, and every limit in its files
is written once. Their end in FY2021 is a row, `second listing ended`, in
that year's Places change. The counties take their plain names
(`Rockland County, NY`, was `Rockland County (3608799999), NY`). Gone:
16, as the bench (hud-analysis-3). Limits decision 4a, repo decision 22.

### 2. The tax credits

`lihtc/<State>.md` lists its counties; `lihtc/<State>/<County>.md` its
projects; `lihtc/<State>/<County>/<name> (<HUD ID>).md` a project each,
`# Project:` with all 82 keys (every column of HUD's row, its codes in
the dictionary's words). Four Change records. The README's four queries
run, one a county's projects against its rents the year each was placed
in service, one the counties' projects against their income limits; the
front page joins projects to the dearest rents.

### Counts: source, written, gathered

| | HUD's file | Written | Gathered |
|---|---|---|---|
| projects | 55,345 rows, 55,345 ids | 55,345 pages | 55,345 `Project`, 55,345 ids |
| units, low-income units (HUD's) | 3,860,546; 3,611,592 | the same | the same |
| as reported | 3,847,045; 3,404,162 | the same | the same |
| year placed in service 8888 or 9999 | 2,765 | blank, noted | 2,765 notes |
| allocation year 8888 or 9999 | 2,709 | blank, noted | 2,709 |
| county from tract 2020 / 2010 / 2000 / 1990 / none | 44,435 / 8,726 / 1,843 / 1 / 340 | the same | the same |
| projects in no county of their state | 340 + 10 tracted elsewhere | `County not given` | |
| outside New England with a county | 52,281 | | 52,273 join the rents and the limits; 8 do not (below) |
| codes the dictionary does not give | 57 | bare | 57 |
| HUD ID before (HUD's notes) | 138 | 138 | 138 |
| pages | | 58,315 (55,345 projects, 2,908 county, 56 state, 4 changes, Changes.md, README) | 58,315 |

The 8 that do not join: Wade Hampton, AK (02270) and Shannon, SD (46113),
renamed in 2015 and read from older tracts; American Samoa (60010) and
the Northern Mariana Islands (69110, five), which have no HUD rents.

Limits after the Gone mend: 4,780 Limits records (4,764 listed, 16 gone),
2 second listings; every limit in HUD's files still written once (the
check now counts the second listings' tables too).

`sh .import/build.sh` under `crew run 6G`: 11 Python tests, 13 + 9 node
tests, 80 target checks and every README query held, 235 s wall (the
budget's wait in it), 2.75 GB peak. `proper check`: nothing to mend.

### The gather, cold (no `.proper/`), the whole book

| | proper's own time | peak memory |
|---|---|---|
| main before (B7 note) | 17 s | 0.87 GB |
| lihtc branch: rents, limits, tax credits (68,145 pages, 152 MB) | 42.7 s | 2.53 GB |

(The wall clock under `crew run` was 10 min 39 s, nearly all of it
waiting for the budget behind other seats.) Warm: under a second.

## Decisions

`.import/lihtc/DECISIONS.md` 1-21 and `.import/DECISIONS.md` 22-24. The
ones that matter: every column a key (4); keys at most 24 characters (5);
8888 and 9999 blank and noted (7); the county from the latest tract HUD
gives (8); tracts blank where HUD writes X (9); place codes padded (10);
ZIP split, eight names in the ZIP blanked (11); a page a project always,
filed by HUD's address state, `County not given` where the tract names
none in it (15, 16); every county named from the limits' files, two by
code (17); second listings their county's (22).

## Learnings

For proper (for engine, with evidence):
1. **A list whose keys pass 24 characters is not a record.** My first
   project pages had keys of 25-30 characters ("Year placed in service
   missing"); proper read every project's list as items: no `Project`
   table, and 55,345 × 82 item rows. It did warn (once, on one page), but
   the warning read like a style note. A record with one long key could
   still be a record, the long key kept; or the limit said in the rules.
2. **A big gather dies writing a table as one string.** With those 4.5
   million item rows, `proper check` failed: first the JS heap (2 GB, at
   88 s), then, with a 4.5 GB heap, `RangeError: Invalid string length`
   at `lib/node/host.js:95`, where `insert` joins all a table's rows into
   one JSON string. Writing the rows in chunks (or streaming the file)
   would lift it. Once the keys were short the gather held: 42.7 s, 2.53
   GB for 68,145 pages.
3. **A blank key in a text column gathers as `''`, in a number column as
   null.** `count("HUD ID before")` gave 55,345, not 138;
   `count("FIPS 2024")` in the rents gives 169. One rule for blank would
   spare every check a `nullif`.
4. **Codes with an X** (`06XXXXXXXXX`, HUD's missing tract) make a
   column of numbers mixed, and proper warns: rightly. Written blank.

For cards.md: not looked at on the bench this time (a county of 1,224
projects is the page to try).

For the seat (CATALOG, LEARNINGS):
5. **The LIHTC file has no county column**: the county is the first five
   digits of a tract, of whichever census HUD geocoded (2020 for 80%).
   Older tracts give counties since renamed. And HUD's file disagrees
   with itself: KYA19960070, a Nicholasville, KY address, has its 1990
   tract in Kentucky and its 2000-2020 tracts in Ohio.
6. **The zip holds an older release**: `LIHTCPUB.accdb` is May 2025's,
   the spreadsheet April 2026's.
7. **HUD's dictionary has slips**: RAD described as "Housing Trust Fund
   funds"; QCT's tract year silent on 2003 and on 2024; two codes not
   given (FHA 4, a reason 4). V1's code check is what finds a new one.
8. **New England does not join by county**: the rents and limits are by
   town, and the tax credits give no town. Said in the README.

## SPEC, where it did not fit a gazetteer

1. **D is for series.** D1-D4 speak of cards across years; a project is
   one record of one year, so a change of meaning (income averaging, the
   QCT's tract maps) splits nothing. D could say: in a gazetteer, a change
   is said (D5), and the column read with it.
2. **D7's mirror, again**: questions first asked later (2003, 2006,
   2012, 2018) leave blanks before; not a change of meaning, not said in
   D. I said them in the README.
3. **B3 and proper's 24 characters**: B3 should say a key is at most 24
   characters, or whatever proper reads.
4. **B7 and size**: a page a project is 58,315 pages, 102 MB, and the
   one listing page of Los Angeles County holds 1,224 rows. B7 holds; the
   cost is the gather (above). Whether a reader wants a county's 1,224
   in one table, or by city, is for the person.
5. **K2 and codes stored as numbers by the source**: HUD's spreadsheet
   stores place codes as numbers; I padded them back (the dictionary
   says alphanumeric). K2 could say: a code the source's own format lost
   zeros from is padded to its definition, and said.
6. **B8 shared tables grow**: `counties.json` now serves three
   importers; whose it is (the repo's) could be said.

## What I was unsure of

- Writing all 82 keys on every project page (most blank before 2003).
  A reader may want the help and targets as a small table instead.
- Filing the ten projects tracted in another state under `County not
  given` rather than under the tract's county.
- Folders named `County 60010` and `County 69110`.
- The Change "Income averaging, 2018" when the first project electing it
  was placed in service in 2017.

## Against the brief's Predicted

Predicted: 45 minutes; Gone a few minutes; one zip (CSV or dbf and a
codebook), ~55,000 projects keyed by HUD's id, with county FIPS; will
find no county or bad FIPS, codes to spell out, years blank or
8888/9999, duplicate ids; a county of 1,000+ needs a folder; may come
back on what a project page shows.

Turned out: Gone took 5 minutes (13:32 to its commit at 13:37). The zip
was an xlsx, an accdb and a PDF, 55,345 projects, no duplicate ids. **No
county column at all**: counties come from tracts of four censuses.
8888/9999 and codes as predicted, plus slips in the dictionary, names in
the ZIP, and X's in tracts. The 1,000+ county is one listing page (B7's
"a page a project, always" gives every project a folder). I did not come
back on what a page shows: I wrote everything. What the prediction
missed was proper: the 24-character key limit, and the gather's
string-length ceiling, which cost about 25 minutes of failed gathers
(most of it the budget's wait). In all, 13:32 to about 14:55, some 85
minutes, about 25 of them waiting for `crew run`.

## What the brief lacked

- That the file gives no county, only tracts.
- That the book would be 58,000 pages and the gather wait for budget
  behind other seats (10 minutes a cold gather, of which 43 s work).
- Where the county names come from (the limits' files, B8).

In one line: Gone is 16, the second listings now their counties'; the
tax credits are written, 55,345 projects a page each by state and county,
every check held and nothing to mend, the whole book gathered cold in 43
s and 2.5 GB, once proper's 24-character key limit was found.

---

# Notes: B7, a page a place (deputy, 2026-10-13)

## What was asked

SPEC B7 (the person, 10-13): a page holds no more than ten records of
the kind it is about; past that, a folder nested as a reader finds the
thing, a page each, and the folder's own page beside it listing what is
in it. Before, a state page held up to 551 records (limits/Maine.md).
Test first; file names safe and unique; every count unchanged; the
README queries run; the layout said; cold gather measured; the bench
looked at. Branch `b7` from main; the merge left to the seat.

## What I made

Branch `b7`, two commits (each `--stat` read):

| Commit | What | Files |
|---|---|---|
| b7 first, as tests | the B7 vectors (`b7-pages.json`, one an importer), every record vector shifted to head its page, file-name tests, the B7 checks in target.sql, `.import/counties.js` and `counties.json`. Against the old writers: rents 7 failures and 3 errors of 11 tests, limits 6 of 12 | 17 |
| the pages written | both importers, both READMEs and the front page, the decisions, this note, and every page | about 9,900 |

The tree:

```
rents/Alabama.md                         the state: its 67 places, a table, linked
rents/Alabama/Autauga County.md          # Rents: Autauga County, AL
rents/Maine.md                           its 16 counties, linked, with their towns counted
rents/Maine/Penobscot County.md          its 67 towns listed (HUD gives no county row: no record)
rents/Maine/Penobscot County/Bangor city.md
rents/Changes.md, rents/Changes/<title>, <year>.md      7
limits/... the same; limits/Maine/Penobscot County.md also holds its 2 County before 2006 records
limits/Connecticut/Tolland County.md     an old county's rows before 2006 (8 such pages)
limits/Missouri/Crawford County.md       its record, then its 2 rows before 2006
limits/Gone.md, limits/Gone/<name>, <ST>.md             18
limits/Changes.md, limits/Changes/…                     17
```

Pages: 4,897 in rents (4,764 places, 56 states, 68 New England
counties and planning regions, 7 changes, Changes.md, README.md), 4,934 in limits
(4,764 + 18 gone, 56 states, 76 county pages (68 and Connecticut's 8 old counties), 17 changes, Gone.md,
Changes.md, README.md): 9,831, and the front page. Before: 128.

### Counts, before and after

| | main | b7 |
|---|---|---|
| Rents / Limits / County before 2006 / Change records | 4,764 / 4,782 / 125 / 24 | the same |
| Rents_Fair_Market_Rents rows; rents, sum | 23,820; 783,560, 653,227,353 | the same |
| every rent in HUD's file, written and gathered once | 1,042,795; 766,869,876 | the same |
| every limit and median (l50, l80, l30, eli, median) | as counted from HUD's files | the same (checked) |
| Rents_Areas, Limits_Areas, Change_Places | as before | the same |
| `counts.json` tables and source sections, both | | identical, compared key by key |
| most records of a kind on one page | 551 (limits/Maine.md) | 1 (Rents, Limits, Change); 5 County before 2006 (Rockingham, NH) |

`sh .import/build.sh` under `crew run 6G`: 11 Python tests, 12 node
tests, 50 target checks (41 before; 7 new for B7, 1 for the listing
pages' keys, the 2 D7 checks mended to `Gone/`) and the 9 README
queries: all held. `proper check`: nothing to mend.

### The gather, cold (no `.proper/`), `crew run 6G -- /usr/bin/time -v proper check`

Measured back to back with main (exported by `git archive` to scratch),
the machine busy with other seats (load 6 to 8):

| | wall | peak memory |
|---|---|---|
| main, the brief's figure | 20.3 s | 1.22 GB |
| main, today, twice | 19.5 s, 24.0 s | 1.18 GB, 1.60 GB |
| b7, twice | 17.2 s, 16.6 s | 0.89 GB, 0.87 GB |

So 9,800 small files gather no slower than 128 large ones, and in less
memory. (A first b7 run, 41.5 s, was taken while another seat's 6G job
ran beside it; not counted.) Warm: about 6 s.

## Decisions

`.import/DECISIONS.md` 14-21, the old ones pointed at them. In short:
a page a place in every state, not only past ten (14); New England by
county, Connecticut by planning region (15); county names from HUD's
limits files, one table for both (16); County before 2006 with its county
(17); the listing pages are records of the kinds the state pages were,
with a `## Places` table (18); a place's record heads its page, `#` not
`###` (19); the file-name and link rule (20); Gone and the changes a
page each (21).

## Learnings

For proper (for engine, with evidence):
1. **`%2C` in a link is not read as a comma.** proper decodes `%20`,
   `%27`, `%28`, `%C3%B1` in a link's path but not `%2C`:
   `./Gone/Bedford%20city%2C%20VA.md` gathered as path `Gone/Bedford
   city%2C VA.md` and warned "no file here" (42 such warnings on the first
   gather). It acts like `decodeURI`, which leaves reserved characters;
   `decodeURIComponent` per segment would read it. Worked round here by
   leaving the comma bare.
2. **A list of `- 1995: [title](link)` under a title is a near-record**:
   "# Changes in the Fair Market Rents is nearly a Rents record". Fair
   enough (the rows are key-shaped); worked round by `- [title, 1995](link)`.
   One case; perhaps the warning could leave a row whose value is only a
   link.
3. **A link cell gathers as its markdown**: `"Fair Market Rents_Places".Place`
   is `[Autauga County, AL](./Alabama/Autauga%20County.md)`; the text and
   path are in `links`, joined on `_file, _line`. A cell that is one link
   could gather as its text (the path beside it). One case.
4. **Many small files gather faster and leaner than few large ones**
   (above): 9,800 pages, 16.6 s and 0.87 GB, against 128 pages, 19.5 s
   and 1.18 GB. No trouble from B7.

For cards.md (from the bench, port 4419, headless Chromium, 1280 and 390
wide; the server stopped after):
5. **The bench does not follow a link to a page of its folder.** A
   state's listing draws its 254 links well, but a tap goes to
   `/Texas/Anderson%20County.md` (relative to `/`, not to the open file's
   folder) and is a 404. The bench should open a `.md` link in itself,
   read from the open file's folder, as proper reads it; the folder's own
   check already refuses links that lead out. With B7 the book is walked
   by these links, so this is the thing it most wants.
6. **A folder's page is not beside its folder in the tree**: folders come
   first, so `Penobscot County/` and `Penobscot County.md` sit 16 rows
   apart. A folder with a page of its name could be one row: the name
   opens the page, the arrow the folder (as a Term's page and its folder
   in scotus).
7. A listing of 254 rows reads well (Place, FIPS, Level, Towns), and a
   folder of 254 opens at once (330 ms a file). On a phone the tree fills
   the top half of the screen and the page below is short: a phone wants
   the tree to close once a file is opened.

For the seat:
8. **The rents have no county in New England**, so a New England county
   page holds no Rents record, only the list (the brief expected "the
   county's record").
9. **Connecticut's old counties need pages of their own** in the limits:
   their County before 2006 records belong to counties that are no longer
   folders (the planning regions are).

## SPEC, where it did not quite fit (proposals, not edits)

1. **B7 and predictability.** B7 allows "a few" on one page; I put every
   place on a page of its own in every state, so a place is always at
   `<state>/<place>.md`. Proposal: "A thing of a kind that any folder
   splits is a page in every folder, so it is always found at one path."
2. **B7, the folder's page as a record.** Say what a folder's page is: a
   record of the dataset's listing kind, its table of what is in the
   folder linked, gathered as `<Kind>_Places`. And that a link cell's
   text is the thing's name.
3. **B7, file names.** Add: a page is named for its record, made safe
   (a slash a dash; `:*?"<>|` dropped), a name two pages of a folder
   would share taking the key; links written so proper and the bench
   read them back (today: leave the comma bare).
4. **B2/B6, a table the importers share** (`counties.json`): where two
   datasets' folders must agree and only one source names the thing,
   the table is made by a script in `.import/`, from a source, not by
   hand.

## What I was unsure of

- `Counties` on a state page now counts the counties listed (Maine 16),
  not county records (0): its meaning changed. Decision 18.
- Whether `Counties` and `Towns` belong on a county's listing page at all
  (`Counties` is blank there).
- Old Connecticut county pages list no towns: the towns tie to them only
  through each town's `County before 2006`. A list could be written.

## Against the brief

No Predicted in the brief. The five steps went as written; the surprises
were proper's `%2C` (found by the B7 "no link leads nowhere" check on the
first gather) and the near-record warning on the Changes list. Time,
measured: branch made at 11:59:52, last build held at about 12:24, note
and commits done by 12:31: 31 minutes in all.

## What the brief lacked

- That HUD's rents have no county rows in New England, nor county names
  anywhere (the folders' names had to come from the limits' files).
- Where Connecticut's County before 2006 records go, its counties being
  no longer its keys.
- How a listing page is a record (its kind and keys, B3) and how its
  table is named (B4).

In one line: databook-hud is now a page a place, 9,831 pages, nested state,
county, town, each listing page linked, every count unchanged and every
check held, gathered cold in 17 s and 0.87 GB against main's 20-24 s and
1.2-1.6 GB; the bench draws it well but cannot follow its links yet.

---

# Notes: D8, the 50th percentile in the rents' card (deputy, 2026-10-13)

## What was asked

SPEC D8 (the person, 10-13): a setting HUD made place by place, on and
off, is the value's own. So the rents' card holds every year FY1995-2027
as HUD set it, at the 40th or the 50th, marked by the Areas runs'
Percentile; the table "50th percentile, 2001 to 2019" goes; the 45th
(FY1983-94, a change for all, D3) stays a table. Test first, on branch
`d8` from main; the merge left to the seat.

## What I made

Branch `d8`, two commits (each `--stat` read):

| Commit | What | Files |
|---|---|---|
| 9cfabf3 | the vectors first: DC's (rule D8) and Andover's 50th years moved into the card, the table gone; every card titled anew. 6 of 8 tests then failed | 6 |
| the next (b66fd26 or after) | import.py, target.sql, readme.py, the decisions, this note, every rents page and the front page rewritten | 66 |

The card's title is now **"Fair Market Rents, as HUD set them"** (it
holds two percentiles, so it names neither). In import.py one tuple,
`AS_SET = ('40', '50')`, is what the card takes. The Change records of
2001 and 2020 now say the rents are in each place's card as set, marked
by its Areas runs' Percentile (SPEC D8). The rents README, its table
list, and the query "the places set at the 50th percentile longest" (now
`sum("To" - "From" + 1)` over `Rents_Areas where Percentile = 50`), and
the front page's words are rewritten; every README query runs.

### Counts

| | Before (import) | Now (d8) |
|---|---|---|
| Rents_Fair_Market_Rents rows | 23,820 | 23,820 |
| its rents, sum | 767,230; 635,834,938 | 783,560; 653,227,353 |
| of them at the 50th (Areas run says 50) | (in the 50th table: 16,330; 17,392,415) | 16,330; 17,392,415 |
| Rents_45th_percentile_1983_to_1994 | 23,720 rows; 259,235 rents | the same |
| Rents_50th_percentile_2001_to_2019 | 1,840 rows; 16,330 rents | gone (checked: no such table) |
| every rent in HUD's file, written and gathered once | 1,042,795; 766,869,876 | 1,042,795; 766,869,876 |
| place-years marked 50 / with a rent in the card | 3,270 / (3,270 had a row) | 3,270 / 3,266 |
| Rents_Areas | 19,294 | 19,294 |

`sh .import/build.sh` under `crew run 6G`: 8 Python tests, 10 node
tests, 42 target checks and 9 README queries, all held; 36 s wall,
1.8 GB peak. `proper check`: nothing to mend.

## Decisions (mended in place)

- `.import/DECISIONS.md` 8 and 12, `.import/rents/DECISIONS.md`
  ("The rents, one card as HUD set them", "Percentile"): what, why,
  undo (`AS_SET`; the 50th table is in git at fb7ad77).
- The card's title: "Fair Market Rents, as HUD set them". Mine; undo in
  `record()`.
- **Broomfield County, CO** is marked at the 50th in FY2001-04 (area
  2080) but HUD's file gives it no rents those years (it became a county
  in 2001; rents from FY2005). Its card is empty there, as the source is;
  its Areas run still says 50. The D8 check counts place-years marked
  50 (3,270) against those with a rent in the card (3,266), the
  difference these four, named in the check. So "the places set at the
  50th longest" gives Broomfield 14 years, four of them without rents.

## Learnings

For the seat:
1. **A mark without a value.** HUD marks a percentile where it set no
   rent (Broomfield, FY2001-04). D8's "the value as set, the setting
   beside it" needs a word for a setting with no value: kept, as the
   source has it. The first D8 check, written as "every place-year
   marked 50 has its rents", failed on exactly these four; one case.
2. **The old split was all bookkeeping.** Moving the 50th back into the
   card changed no number: the same 16,330 rents, the same sum, and
   every rent in the source still written once. The holes were the only
   thing D4 had made.
3. **The mark as a run, not a column**, is checkable but costs a range
   join (`cast(y as int) between "From" and "To"`) against an unpivoted
   card. It reads well on the page; in SQL a per-year column would be
   simpler. Fine as it is; worth knowing for the next D8 case.

For proper: none new. For cards.md: DC's line no longer has holes; a
line that carries two percentiles might want the mark drawn (a dot or a
band where the Areas say 50). A thought for cards.md, not asked.

## SPEC, where it did not quite fit (proposals, not edits)

1. **D1 and D8 together.** D1: "the main card shows the current
   definition". Under D8 it shows the current definition and the
   settings made place by place within it. Proposal, D1: "...the current
   definition, with any setting made place by place (D8); its title
   names what it holds, not one setting."
2. **D5 and D8.** D8 says a place-by-place setting is not a change of
   definition, but its start and end (2001, 2020) are still worth a
   Change record. Proposal, D8 add: "Its start and end are still said
   (D5), the Crosswalk saying where the mark is."
3. **A mark with no value** (learning 1). Proposal, D8 add: "Where the
   source marks a setting and gives no value, the mark is kept and the
   value empty (D6)."

## What I was unsure of

- The title's words; "as HUD set them" was the plainest I found.
- Whether Broomfield's empty marked years should be dropped from the
  Areas run's 50; I kept HUD's mark, as written.

## Against the brief

The brief's six steps went as written, with Broomfield the one surprise
(found by the D8 check on the first full build). Time: 330 s to the
build all held, about 6 minutes, measured from the branch made to the
last build; with the note and commits, under 10 minutes.

## What the brief lacked

- That every card's title changes, so every vector and every state
  page changes (69 pages), not DC's alone.
- That Andover's vector also held a 50th table.

In one line: the rents' card now holds every rent as HUD set it, 40th or
50th, marked by its Areas runs, the 50th table gone, every rent in HUD's
file still written and gathered once, every test and check held.

---

# The earlier note: the two HUD books made one and held to SPEC (deputy, 2026-10-13)

## What was asked

Join databook-hud-rents and databook-hud-limits into one repo, both
histories kept; give each dataset its own record kind; hold both to
SPEC.md (B, K, D, V), the first databook to be: vectors first, the
limits mended to D1-D7 case by case, the rents checked the same way.
Branch `import`; the old repos left as they are.

## What I made

Repo `~/Projects/databook-hud`, branch `import` (also `rents` and
`limits`, each old repo's main moved into its folder). No `main`, no
remote. Commits, each `--stat` read:

| Commit | What | Files |
|---|---|---|
| 598b0f4 | rents moved into `rents/`, `.import/rents/` (renames only) | 60 |
| e5e55d9 | limits moved into `limits/`, `.import/limits/` (renames only) | 65 |
| 78c0f3c | joined, `--allow-unrelated-histories`; `.gitignore` | 66 |
| fb7ad77 | the rents held to SPEC: importer, shape, 6 vectors, tests, pages | 70 |
| c75f59d | the limits held to SPEC: importer, shape, 4 vectors, tests, pages | 70 |
| d1330bd | front page README, target.sql (V3) and its player, build.sh, DECISIONS | 6 |
| 65a2f3b | a county's pre-2006 row its own record's alone; every limit counted once | 5 |

`git log --follow` reaches each old repo's first commits. Run it all:
`crew run 6G -- sh .import/build.sh` (both importers, the front page, 8
Python tests, 10 node tests, 41 target checks and the 9 README queries).

### Counts: source, written, gathered

| Table | Source | Written | Gathered |
|---|---|---|---|
| Rents (records) | 4,764 rows | 4,764 | 4,764, 4,764 FIPS |
| Rents_Fair_Market_Rents (40th, 1995-2027) | | 23,820 rows, 767,230 rents | same |
| Rents_45th_percentile_1983_to_1994 | | 23,720 rows, 259,235 rents | same |
| Rents_50th_percentile_2001_to_2019 | 3,270 place-years at the 50th | 1,840 rows (368 places), 16,330 rents | same |
| all rents | 1,042,795, sum 766,869,876 | the same, once | the same; as the old repo gathered |
| Rents_Areas | | 19,294 runs | 19,294; old repo 19,294 |
| Limits (records) | 4,764 listed in FY2026 | 4,782 (18 gone, on Gone.md) | 4,782; old repo 4,782, every name and FIPS the same |
| Limits_Very_low_income_50 / _Low_income_80 | | 38,256 rows each | same |
| Limits_Extremely_low_income_30 (2014-2026) | 495,768 limits | 495,768 | same |
| Limits_30_limit_1999_to_2014 | 521,792 (with FY2014's Section8.xls) | 38,192 rows | same |
| County before 2006 (records) | 123 New England rows a year, 2 Crawford, MO | 125 | 125 |
| very low / low income limits, all tables | 1,004,936 each | once each | once each |
| medians, all tables | 125,617 | once | once |
| Change | | 7 rents + 17 limits | 24; Change_Places 70 |

Against the old limits repo: FY2006-2026 every cell the same (counts a
year, and sums, alike). FY1998-2005: 777 place-years a year fewer in the
cards: 775 New England towns that had taken a whole county's row, and
Rockland and Westchester's second listings; all of those rows are now in
`County before 2006` or in the county's own record.

`proper check`: nothing to mend (`mend.warnings` empty). Gather under
`crew run 6G`: cold (no `.proper/`) 20.3 s wall, 1.22 GB peak; warm
2.7 s, 0.73 GB. 50 MB of markdown (rents 13, limits 37). The old repos
apart: 4.9 s/0.82 GB and 14.9 s/1.48 GB.

### The Change records found

Rents (rents/Changes.md):
1. 1995, Percentile, 45th to 40th: every place. No crosswalk in this file.
2. 2001, Some areas at the 50th percentile: 221 places (39 areas).
3. 2005, HUD's nonmetropolitan mark, 10000 to 9999.
4. 2006, Areas renumbered (MSA numbers to Metro codes; OMB 2003 areas).
5. 2020, The 50th percentile ended (4 places in FY2019).
6. 2026, Connecticut's planning regions (169 towns, FIPS 2024).
7. 2027, New England town codes: six ME and MA towns (FIPS before).

Limits (limits/Changes.md):
1. 2003, HUD's nonmetropolitan mark, 0 to 10000.
2. 2006, New England keyed by town: crosswalk FY2006's `msa` column; all
   1,604 towns tied.
3. 2006, Areas renumbered.
4. 2014, Extremely low income redefined: FY2014 in both files; the new
   differs from the old in 4,629 of 4,767 places.
5. 2025, Connecticut's planning regions (169 towns).
6. Places recoded, listed or dropped: 2010, 2013, 2016, 2017, 2018,
   2019, 2020, 2021, 2022, 2023, 2025, 2026 (a record a year, a table of
   the places: 70 rows in all).

## Decisions

In `.import/DECISIONS.md` (the join), and mended in place in
`.import/rents/DECISIONS.md` and `.import/limits/DECISIONS.md`. The ones
that matter:

- Kinds `Rents`, `Limits`, `County before 2006`, `Change`; state pages
  `# Fair Market Rents: <State>`, `# Income Limits: <State>`.
- **The rents' card is the 40th percentile, FY1995 on.** The 45th
  (FY1983-94) and the 50th (place-years in FY2001-19) are tables of
  their own, and the 50th years are empty in the card. DC's card is
  empty in 15 of its years from 2001 to 2018.
- New England before FY2006 kept as county records, tied to each town by
  HUD's own FY2006 `msa` column, not by guess.
- A method is not a definition: HUD's changes of method (ACS base,
  hold-harmless, caps, recent movers) are not split.
- V1 exact per file for the limits, a range for the rents' growing file.

## Learnings

For the seat (CATALOG, LEARNINGS):
1. **Connecticut re-keyed in the limits in FY2025, not FY2023.** FY2024's
   file still has `0900x`/`0901x` codes; FY2025's has `0911x`-`0919x`.
   The first limits deputy wrote FY2023, and CATALOG.md (line 72) and
   LEARNINGS.md (line 142) carry it. Mended in the limits' decisions
   and README.
2. **The first limits import filled across a change in two places**: New
   England towns took a whole county's pre-2006 row, and New York's
   `99998` second listings took their county's pre-2006 rows. SPEC D6
   found both. A rule written down finds what one migration's judgement
   let through.
3. **The source carries its own crosswalk more often than you think**:
   HUD's FY2006 limits give each town its old MSA beside its new code;
   FY2014 published both definitions. Look for the boundary year's file
   before calling a crosswalk impossible.

For proper (for engine, with evidence):
4. **A kind with a space makes table names with a space**:
   `"County before 2006_Very_low_income_50"`, which must be quoted, while
   the heading part is made safe (`Very_low_income_50`). One case; `proper
   map` in this repo shows it.
5. **An all-empty column of a card gathers as text beside numeric
   siblings**, so `unpivot` over the year columns fails ("Cannot unpivot
   columns of types VARCHAR and BIGINT"). Evidence: the old limits repo,
   `County_Extremely_low_income_30."1998"`. A blank column in a card of
   numbers could take its siblings' type. Here it is avoided by not
   writing columns of nothing.
6. FIPS still a number (K2): unchanged, already asked.
7. Size: 50 MB of markdown, 165k card rows, cold 20.3 s, 1.22 GB:
   less memory than the limits alone took (1.48 GB). No trouble.

For cards.md:
8. Not looked at on the bench. Worth a look: how a line card draws a
   series with holes (DC's rents, 2001-2018), and whether plain tables
   beside a card read well in print.

## What SPEC got wrong or lacked

1. **D1-D4 assume a change happens to everyone at one boundary.** FMR's
   50th percentile was set place by place, year by year, on and off (DC
   went 40, 50, 40, 50, 40, 50, 40). Never splicing means holes in the
   main card wherever a place was at the 50th. I kept the rule; whether
   a reader of DC's rents should see those years empty is the person's
   to say (it changes what the card says, not only how).
2. **D2 assumes a crosswalk year exists.** For the 45th to 40th (1995)
   HUD's Read Me says both were published, but not in this file; for the
   50th, never in this file. SPEC could say: where no year carries both,
   the Change says so (`Crosswalk: none`), and nothing is made up.
3. **SPEC does not say what a definition is.** HUD changes methods every
   few years. I split on a change of percentile, of legal definition, or
   of key, not of method. Worth a line in D.
4. **D3 speaks of a table, but New England's old form needed a kind of
   its own**: the old rows are keyed differently (county and MSA), so
   they are records, `County before 2006`, not a table under a town.
5. **D5's grain is not said**: a Change a place (70 here) or a Change a
   year with a table of places (13). I took the second.
6. **D7 has no mirror**: a place first listed later (Alaska's new
   census areas, FY2010) is not gone, nor a change of form; I wrote it
   in the year's Change table as "first listed". Nor does D7 say what a
   second listing is (New York's `99998` rows): not a place, but kept
   as one, as before.
7. **B6 with two datasets**: the README is "the importer's", but a repo
   of two needs a front page neither importer owns. Here a third small
   writer, `.import/readme.py`, reads each importer's `counts.json`.
8. **V1 and a growing file**: the rents' one CSV gains a year's columns
   each release, so V1 stops every release by design. Right, I think (a
   year is read before it is written), but SPEC might say so.
9. **V2 "test first"** on cards 30 to 44 years wide is slow by hand. The
   vectors here were written by the importer, checked by eye cell by
   cell against the source for the rules they hold, then frozen. SPEC
   could allow it, saying so.
10. **SPEC's vectors path** (`.import/vectors/`) and the brief's
    (`.import/<dataset>/vectors/`) differ; with two datasets I used both:
    the importers' vectors in each dataset's folder, target.sql (which
    spans both) in `.import/vectors/`.

## What I was unsure of

- The 50th percentile holes (above, SPEC 1).
- FY2024-27 rents written as the 40th: the file stops saying; the Read
  Me says the 50th ended with FY2019.
- That HUD's 50th-percentile areas had no 40th-percentile FMR published
  beside: this file has none; HUD's yearly files I did not read.
- Methods not split (decision 9 in `.import/DECISIONS.md`).
- `County before 2006` holds Crawford County, MO's two split years
  besides New England: the same rule, a small stretch of the name.

## Against the brief

No Predicted was given in the brief. The work took 26 minutes of
wall time (10:47 to 11:13), measured. Every D rule was kept without
guessing what the data means; the one place it bites (the 50th) is
above for the person.

## What the brief lacked

- That the FMR Read Me (READ_ME_FMRHIST_FY2025.docx) is the source for
  the percentile eras; fetched with a browser agent, not kept in
  ~/.cache.
- Where target.sql lives when it spans two datasets.
- Whether the old repos' `.proper/` caches count as "as they are": a
  `proper map` I ran in databook-hud-rents may have rewritten its
  gitignored cache, and the cross-repo comparisons read both.

In one line: databook-hud is one repo of two datasets, both histories
kept, held to SPEC with 41 target checks and 18 tests all passing,
nothing to mend, every rent and limit in HUD's files written once; the
50th-percentile holes in the rents' card are the one thing for the
person.
