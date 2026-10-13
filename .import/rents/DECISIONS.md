# Decisions

Each: what, why, how to undo it.

## The key (for the Income Limits databook, and any that joins)

- **The key is `- FIPS:`, HUD's `fips2027` as written: ten digits,
  `SSCCCTTTTT`** — state (2), county (3), county subdivision (5), with
  `99999` for a whole county. New England towns (CT, ME, MA, NH, RI, VT)
  are rows of their own with a real subdivision code; every other place
  is a county ending `99999`. Examples: Onondaga County, NY is
  `3606799999`; New York County (Manhattan) `3606199999`; Andover town,
  CT `0911001080`.
- **proper gathers it as a number (BIGINT)**, so the leading zero goes:
  Autauga County, AL is written `0100199999` and gathered `100199999`.
  Two databooks that both write the ten digits still join on it as
  gathered (`using ("FIPS")`); to show it as written,
  `lpad(cast("FIPS" as varchar), 10, '0')`. A learning for proper.
- **Connecticut**: `fips2027` uses the planning regions that replaced
  CT's counties in Census use (`091xx`); HUD's file also gives
  `fips2024`, the old county codes (`090xx`). The key is the 2027 one;
  the old one is written as `- FIPS 2024:` where it differs (175 CT
  towns). Six towns in ME and MA also had their subdivision code
  changed (`fips`, written as `- FIPS before:` where it differs).
  The Read Me: `fips2024` holds "FIPS codes used prior to the FY 2026
  FMRs, which adopted new planning district county-equivalent codes in
  the State of Connecticut".
- Undo: the `- FIPS:` line in `record()`, import.py.

## Shape

- **A file a state**, `rents/<State name>.md` (`District of Columbia.md`,
  `Puerto Rico.md`, the territories too), headed `# Fair Market Rents:
  <State>`, a record a county or town: `### Rents: <name>, <ST>` (was
  `### County:` until the join with the limits, 10-13: SPEC B5). Towns
  are the same kind, so the whole country is one table; a row
  `- Level: County` or `- Level: Town` tells them apart. Undo: kind per
  level in `record()`.
- **Rows**: `FIPS`, `FIPS 2024`, `FIPS before`, `Level`, `FMR area`
  (this year's name, FY2027), `Metro code` (FY2027's), `State`,
  `Census region`, `Area changes`; every one in every record, blank
  where none (SPEC B3, since 10-13).
- **Census region** is HUD's 1–4 in words. Eight ME and VT towns have
  none in HUD's file: they take their state's (regions are by state).
  American Samoa and the Northern Mariana Islands have none, and are
  written `none` (HUD puts Guam in the West, PR and VI in the South;
  not guessed for the other two). Undo: `region()`.
- **Area changes** counts the years a place's area code differed from
  the year before, leaving out what is not a move: FY2006, when HUD
  renumbered every area (old MSA numbers to `METRO…`/`NCNTY…` codes);
  FY2005, when HUD's nonmetro mark went from `10000` to `9999`; and
  `NCTNY`, HUD's misspelling of `NCNTY` in FY2023–24. What is left is
  real reclassing (a county drawn into or out of a metro area, an area
  split), 677 places of 4,764. Undo: `same()` and `changes()`.
- **The rents, one card at the 40th percentile** (since 10-13, SPEC
  D1-D6): `#### Fair Market Rents`, `> [!CARD:line] Fair Market Rents
  (40th percentile)`, a row a bedroom count 0–4, a column a fiscal year,
  FY1995–2027, the years of the current definition. The 45th-percentile
  years, FY1983 and 1985–1994, are a plain table `#### 45th percentile,
  1983 to 1994`; a place-year HUD set at the 50th (FY2001–2019) is empty
  in the card and written in `#### 50th percentile, 2001 to 2019`,
  present only for the 368 places that had one. HUD's file has no
  FY1984, so there is no 1984 column. Dollars as numbers; empty where
  HUD gives none. Undo: `P40` and `record()`.
- **Areas each year, cheaply, as runs**: a table `#### Areas` under each
  record, `| From | To | MSA | Metro code | Area | Percentile |`, a row for
  each run of years the place sat under one area code at one
  percentile. Area names are given by HUD only for FY2022 on; a run
  with none has its Area empty. Why runs: 44 codes a place, most
  unchanged, read badly; runs read as a history. A change of code is
  not always a move: HUD renumbered every area in FY2006 (old MSA
  codes like `5240` to `METRO33860M33860`). The old numbers go in `MSA`
  and the new codes in `Metro code`, two columns: in one, proper warned
  that a column was a number in 13,174 rows and text in 6,120. A run
  never crosses 2006. Undo: `areas()` and the table in `record()`.
- **Percentile** is HUD's `fmrNN` column: 45 for FY1983–1994, 40 since,
  with some areas at 50 (FY2001–2019). It sits in the Areas runs, not
  the rents card, which stays a bedroom a row. HUD's file has no
  percentile column from FY2024: those years are written 40, as the
  Read Me says the 50th-percentile program ended with FY2019 and
  FY2020–23 are 40 everywhere (and 24 CFR 888.113 sets the 40th).
  Undo: the `y >= 2024` line in `areas()`.
- **Record names** are HUD's `name` and the state's postal code.
  `Penobscot Indian Island Reservation` is two rows of HUD (it lies in
  Penobscot and Aroostook counties): each gets its FIPS after its name.
  One Vermont row (`5000724400`, Burlington area, only FY2026 on) has
  no name in HUD's file: it is written `Unnamed (5000724400), VT`, and
  not guessed at.
- **The importer** is Python, stdlib only (`.import/rents/import.py`):
  the source is one CSV, and no packages are needed. It reads latin-1,
  and checks the file's shape first (`shape.json`, SPEC V1).
- **Connecticut and the six towns** (10-13): `- FIPS 2024:` is written
  for Connecticut only (its county codes before FY2026); the six Maine
  and Massachusetts towns recoded in FY2027 have their old code as
  `- FIPS before:` alone (it was written as both, the same code twice).
