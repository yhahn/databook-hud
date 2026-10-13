# Notes: databook-hud, the two HUD books made one and held to SPEC (deputy, 2026-10-13)

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
