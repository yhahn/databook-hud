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
   income limits from **FY2025** (the rents: FY2026). (Written FY2023
   at first; the files say FY2025: FY2024's still has `0900x`/`0901x`.
   Mended 10-13.) Its towns are
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
   John/St. Thomas; Skagway-Yakutat-Angoon, AK). Since 10-13 (SPEC D7)
   they are out of the state pages, on `limits/Gone.md`, still of kind
   Limits so a count of earlier years finds them; the four pre-2006
   ones have `- Metro code:` blank and `- MSA:` their last number.

## Before FY2006

5. **The history reaches to FY1998, by county.** Before FY2006 HUD's
   rows are a county's part in one MSA, keyed by state and county, not
   FIPS-10. Outside New England every county is one row a year, and
   county codes are stable, so a county's row is its own: kept. A
   record takes the row of the county it lay in in FY2006. Since 10-13
   only a county's own record (`…99999`) does: Rockland and
   Westchester's second listings (`…99998`, FY2006-2020) took their
   county's rows FY1998-2005 too, a year they were never listed; no
   more. New England: decision 6. Undo: the `endsWith('99999')` test.

6. **New England before FY2006 is kept by county, apart** (10-13, the
   person: SPEC D2, D3, D6). HUD drew New England's areas by town but
   keyed these years by county and MSA. A town's own cards are empty
   before FY2006, even where its county lay wholly in one area (it was
   filled then; no more). Every New England row of FY1998-2005, 123 a
   year, is a record of its own, `### County before 2006: <county>,
   <ST> (MSA <n>)` (or `(nonmetro)`: HUD's mark was 0 to FY2002, 10000
   after, one part), on the state's page under `## Counties before
   2006`, with plain tables, not cards. The crosswalk is HUD's own:
   FY2006's file gives each town its old MSA (`msa`, beside `CBSASub`),
   so each town names its county's row as `- County before 2006:`; all
   1,604 towns of FY2006 tie. Crawford County, MO, split between two
   areas in FY2003-2004, is kept the same way (its own record's two
   years empty). Undo: the `NEW_ENGLAND` branch of the pre-2006 loop.

## Shape

7. (Since B7, 10-13: a page a place, `.import/DECISIONS.md` 14-21.)
   **As the rents**: a file a state (`limits/<State name>.md`,
   `# Income Limits: <State>`), a record a place, `### Limits: <name>,
   <ST>` (was `### County:` until 10-13: SPEC B5), towns the same kind
   with `- Level: Town`; rows `FIPS`, `FIPS 2024`, `FIPS before`,
   `FIPS earlier`, `Level`, `State`, `Area` (the latest area's name),
   `Metro code` (its code), `MSA`, `County before 2006`, `Last year`,
   every one in every record, blank where none. Names are HUD's;
   FY2026 cuts them at 26 letters, so a cut name takes the whole one an
   earlier year gave (`Penobscot Indian Island Reservation`); one with
   none stays cut (`North Attleborough Town ci`). The two Penobscot
   Indian Island rows, in two counties, get their FIPS after the name.
   Undo: `recordText`, `fullName`.

8. **Four cards a place, each under its own heading**, so each is one
   table across the country: `#### Median family income` (a row,
   `Measure | Median`), and `#### Extremely low income (30%)`,
   `#### Very low income (50%)`, `#### Low income (80%)`, a row a
   household size (`Persons` 1-8). The median and the 50% and 80% cards
   have 29 year columns, 1998-2026; the extremely low income card 13,
   2014-2026 (decision 9). Gathered: `Limits_Median_family_income`,
   `Limits_Extremely_low_income_30`, `Limits_Very_low_income_50`,
   `Limits_Low_income_80`. Undo: `card()`.

9. **The 30% limit, split at its redefinition** (10-13, the person:
   SPEC D1-D4). The card "Extremely low income (30%)" holds FY2014 on,
   the definition of the Act of 2014 (the greater of 30/50ths of very
   low income and the poverty guideline, never above very low income),
   FY2014 from `Poverty.xls`. The plain 30% limit, FY1999-2014, is a
   plain table `#### 30% limit, 1999 to 2014`, FY2014 from
   `Section8.xls`: both in the year HUD published both. The importer
   stops if the two FY2014 files differ in anything but the 30% limit.
   FY1998 has no 30% limit. Undo: `LEVELS`, `OLD30`.

10. **`#### Areas`, as runs**, `| From | To | MSA | Metro code | Area |`:
    a run is one area code over unbroken years, named as last written.
    HUD's MSA numbers (before FY2006) and its area codes (since) in two
    columns, as the rents, so neither is a column of numbers and text.
    A run never crosses 2006. Undo: `areas()`.

11. **The importer is Node**, with SheetJS (`xlsx` 0.18.5) to read the
    `.xls` years DuckDB cannot. It reads every year in about 6 s. Undo:
    none wanted.

12. **The README is the importer's** (`readme.js`): what the limits
    are, how they are keyed, four queries, the changes, the source and
    its notice, the states. The join with the rents is the repo's front
    page now. Undo: `readme.js`.

## Later

13. **The eight programs beside Section 8 are not here.** Their FY2026
    files (kept in `~/.cache/proper/hud/il/programs/`) are each 4,764
    rows, a row a place on the same FIPS, limits by household size 1-8:
    HOME (30/50/60/80/120%), CDBG and HOPWA (30/50/60/80%), NSP
    (50/120%), HAF (100/150% and a median), HTF (one 30%-or-poverty
    limit), MTSP (50/60%, with HERA's special limits and a type). All
    share Section 8's shape and would be more cards on the same
    records. URA publishes no table, only documents and PDF maps.
