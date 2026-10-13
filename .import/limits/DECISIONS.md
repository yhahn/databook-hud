# Decisions

Small things decided in the migration, each with how to undo it. Taken
by the databooks seat's deputy, 2026-10-13, on branch `import`.

## The key

1. **The rents' key, as they write it.** `- FIPS:` is the ten digits
   HUD writes (state, county, county subdivision; `99999` a whole
   county), FY2026's `fips`. HUD's FY2026 income limits and the rents'
   `fips2027` are the same 4,764 keys, and all 4,764 join
   (`"repo_databook-hud-rents".County using FIPS`). Gathered as a
   number, as the rents' is. Undo: none wanted.

2. **Connecticut** went to planning-region codes (`091xx`) in HUD's
   income limits from **FY2023** (the rents: FY2026). Its towns are
   followed back by name; the old county code is written
   `- FIPS 2024:`, as the rents write it (169 towns; all join the
   rents' `FIPS 2024`). Undo: `fipsBefore` in import.js.

3. **A place whose code changed is followed**, in this order: the code
   itself; a short table of Census renames no name would find
   (`RENAMED`: Dade to Miami-Dade, Shannon to Oglala Lakota, Wade
   Hampton to Kusilvak, Ferrisburg to Ferrisburgh and the like); the
   name, where one place in the state has it; the name less its kind
   (`town`, `city`, `plantation`, `UT`) within the county, for towns
   that became cities or were deorganized into an unorganized
   territory ("Amesbury town" to "Amesbury Town city" to "Amesbury
   city"). A match never takes a year a place's own row holds: rows
   with a record's own code go first. The earlier code is written
   `- FIPS before:` (and `- FIPS earlier:` for the three that have had
   two). Undo: the matching loop in import.js.

4. **A place HUD stopped listing is a record of its own**, under its
   last code, with `- Last year:`. Eighteen: Alaska's split census
   areas, Bedford city and Clifton Forge, VA (merged), six deorganized
   Maine towns, Rockland and Westchester, NY's second rows
   (`…99998`: listed again inside the New York area, FY2006-2020, with
   that area's limits), and four pre-2006 rows that are no county
   today (W. Pacific Islands, GU; PR Non-Metro counties; VI St.
   John/St. Thomas; Skagway-Yakutat-Angoon, AK). These have
   `- Metro code: none` and `- MSA:` their last number. Undo: drop
   records with `gone` in import.js.

## Before FY2006

5. **The history reaches to FY1998, by county.** Before FY2006 HUD's
   rows are a county's part in one MSA, keyed by state and county, not
   FIPS-10. Outside New England every county is one row a year, and
   county codes are stable, so a county's row is its own: kept. A
   record takes the row of the county it lay in in FY2006 (so a
   Connecticut town takes its old county's row). Undo: `--from 2006`.

6. **New England's split counties are left empty before FY2006.**
   HUD drew New England's areas by town but keyed these years by
   county, so 33 counties (CT, ME, MA, NH, RI, VT) lie in two to
   several areas, 89 to 91 rows a year. A town in such a county cannot
   be told its part, so its years before 2006 are empty, not guessed.
   A town in a county wholly in one area takes that county's row:
   every part of it had those limits. Undo: `p.length === 1` in the
   pre-2006 loop.

## Shape

7. **As the rents**: a file a state (`<State name>.md`, `# State:`),
   a record a place, `### County: <name>, <ST>`, towns the same kind
   with `- Level: Town`; rows `FIPS`, `Level`, `State`, `Area` (the
   latest area's name), `Metro code` (its code). Names are HUD's;
   FY2026 cuts them at 26 letters, so a cut name takes the whole one an
   earlier year gave (`Penobscot Indian Island Reservation`); one with
   none stays cut (`North Attleborough Town ci`). The two Penobscot
   Indian Island rows, in two counties, get their FIPS after the name.
   Undo: `recordText`, `fullName`.

8. **Four cards a place, each under its own heading**, so each is one
   table across the country: `#### Median family income` (a row,
   `Measure | Median`), and `#### Extremely low income (30%)`,
   `#### Very low income (50%)`, `#### Low income (80%)`, a row a
   household size (`Persons` 1-8). Every card has the same 29 year
   columns, 1998-2026, empty where HUD gives nothing. Gathered:
   `County_Median_family_income`, `County_Extremely_low_income_30`,
   `County_Very_low_income_50`, `County_Low_income_80`. Line cards,
   as the rents. Undo: `card()`.

9. **The 30% card holds the plain 30% limit before FY2014**, and the
   extremely low income limit (the greater of it and the poverty
   guideline, capped at very low income) from FY2014. HUD named the
   30% limits "extremely low income" since the 1998 Act; the 2014 Act
   redefined them. One card keeps the series a reader looks for; the
   README says where it changes. FY2014's file is `Poverty.xls` (the
   redefined limits), not `Section8.xls` (the old 30%); the 50% and 80%
   limits are the same in both. FY1998 has no 30% limit. Undo: read
   `Section8.xls` for FY2014, or leave pre-2014 out of the card.

10. **`#### Areas`, as runs**, `| From | To | MSA | Metro code | Area |`:
    a run is one area code over unbroken years, named as last written.
    HUD's MSA numbers (before FY2006) and its area codes (since) in two
    columns, as the rents, so neither is a column of numbers and text.
    A run never crosses 2006. Undo: `areas()`.

11. **The importer is Node**, with SheetJS (`xlsx` 0.18.5) to read the
    `.xls` years DuckDB cannot. It reads every year in about 6 s. Undo:
    none wanted.

12. **The README is the importer's** (`readme.js`): what the limits
    are, how they are keyed, three queries (one joining the rents),
    the source and its notice, the states. Undo: `readme.js`.

## Later

13. **The eight programs beside Section 8 are not here.** Their FY2026
    files (kept in `~/.cache/proper/hud/il/programs/`) are each 4,764
    rows, a row a place on the same FIPS, limits by household size 1-8:
    HOME (30/50/60/80/120%), CDBG and HOPWA (30/50/60/80%), NSP
    (50/120%), HAF (100/150% and a median), HTF (one 30%-or-poverty
    limit), MTSP (50/60%, with HERA's special limits and a type). All
    share Section 8's shape and would be more cards on the same
    records. URA publishes no table, only documents and PDF maps.
