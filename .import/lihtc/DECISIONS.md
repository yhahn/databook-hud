# Decisions: the tax credits (lihtc/)

Taken by the databooks seat's deputy, 2026-10-13, branch `lihtc`. Each:
what, why, how to undo it.

## The source

1. **LIHTCPUB.xlsx, April 2026's release**, from `lihtcpub.zip` (HUD
   User, fetched with a browser's user agent; kept in
   `~/.cache/proper/hud/lihtc/`, unzipped in `src/`, its dictionary
   beside it, `dictionary.txt` its text). The zip's `LIHTCPUB.accdb` is
   dated May 2025, a release older than the spreadsheet (April 2026), so
   the spreadsheet is read. `LIHTCPUB_BIN.xlsx`, a row a building
   (161,715), is not written: the brief asked a record a project. Undo:
   `FILE` in import.js.
2. **Node, as the limits**, SheetJS from `.import/limits/node_modules`;
   `safe`, `link` and `unique` (B7's file names) are the limits' own,
   required, so the three folders name and link alike.

## The record (B3, B5, K)

3. **A record a project, `# Project: <name> (<HUD ID>)`**, the name as
   HUD writes it (mostly capitals; not title-cased, as "YWCA" and "LLC"
   would suffer), the id after it so every name is one project's. Kind
   `Project`, its keys unlike the rents' and limits' (B5).
4. **Every column of HUD's row is a key**, 82 in all, blank where HUD
   gives nothing. The brief left open what a project page shows beyond
   its keys; all of it, as a databook is the source cooked, not chosen
   from. Undo: `KEYS`.
5. **Keys of 24 characters at most.** proper reads a list whose keys
   pass 24 characters as items, not a record: the first gather made no
   `Project` table, and 4.4 million item rows that proper could not
   write (below, learnings). So `Placed in service note`, `Units
   reported`, `Low-income reported`, `Rents below ceiling`, `Units below
   ceiling`, `Affordable over 30 years`, `HUD multifamily aid`. Undo:
   `KEYS`.
6. **Codes spelled out** in the dictionary's words (Yes, No; 50% AMGI,
   60% AMGI, Income average, Not reported; and the rest); a code the
   dictionary does not give is written bare (FHA 4, twice; a reason no
   longer monitored 4, 55 times): not guessed. TRGT_* 0 is "Not
   indicated", as the dictionary says; blank stays blank. Undo: `CODES`.
7. **8888 and 9999 are not years.** `Year placed in service` and
   `Allocation year` are blank there, and `Placed in service note` /
   `Allocation year note` say which: "Not confirmed (8888)",
   "Confirmed, year not given (9999)". 2,765 and 2,709 projects. The
   67 placed in service in 2025 and 2027 are written as HUD has them.
8. **The county: five digits of the latest tract that names one**
   (2020, else 2010, 2000, 1990), `County FIPS`, with `County from` the
   census it came from (44,435 from 2020, 8,726 from 2010, 1,843 from
   2000, 1 from 1990, 340 none). HUD gives no county column but these.
   A county of an older census may be one since changed (Wade Hampton,
   AK, now Kusilvak; Valdez-Cordova): written as HUD gives it, not moved
   to its successor (K3 asks a table of renames; none is kept here).
   Undo: `countyOf()`.
9. **Tracts blank where HUD writes X** (`06XXXXXXXXX`, a missing tract;
   `06001XXXXXX`, a county without its tract): proper read the X's as
   text in a column of numbers and warned. The county of an older
   census whose tract is missing is not kept apart (the latest county
   is). Undo: `tract()`.
10. **Place codes padded**: five digits for 2000, 2010 and 2020 (FIPS
    place codes), four for 1990 (Census place codes, at most 9070 here).
    HUD's spreadsheet stores them as numbers, the leading zero lost; its
    dictionary calls them alphanumeric. Undo: `pad()` in `KEYS`.
11. **ZIP and ZIP extension**: `94579-2157` (and seven written without
    the dash) as `94579` and `2157`. Eight South Carolina rows hold a
    person's name in the ZIP (SCA19920165, SCA19930006, SCA19950035,
    SCA19980080, SCA20070072, SCA20090012, SCA20110025, SCA20110047):
    their ZIP is blank, the names not written. Undo: `zipOf()`.
12. **`HUD ID before`** from HUD's own note, where it says `PREV HUD_ID
    IS`, `=` or `:` (138 projects; K1). The notes that name a *new* id
    after a resyndication are left in `Data note`.
13. **Units**: `Units` and `Low-income units` are HUD's own reckoning
    (N_UNITSR, LI_UNITR), the ones its tables use; `Units reported` and
    `Low-income reported` the agency's.
14. **RAD** is written as HUD names the column. The dictionary
    describes it as "Housing Trust Fund funds 2018", a copying slip it
    seems (HTF is its own column); the README says so, and names nothing.

## The pages (B7)

15. **A page a project, always**, in its county's folder:
    `lihtc/<State>/<County>/<name> (<HUD ID>).md`, the county's page
    beside it listing its projects (`## Projects`), the state's listing
    its counties (`## Counties`). Not only where a county passes ten:
    B7's "a kind that any folder splits is a page in every folder", as
    the rents and limits do. Los Angeles County lists 1,224 on one page;
    its page is about one thing, the county. Undo: `build()`.
16. **Filed under the state HUD addresses the project in** (`PROJ_ST`),
    and the county its tract names where that county is in the same
    state. 350 projects have none: 340 no tract at all, and 10 a tract
    in another state (four Kentucky projects tracted in Hamilton County,
    OH, one of them, KYA19960070, a Nicholasville address with its 1990
    tract in Jessamine County, KY: HUD's file disagrees with itself).
    They go under the state's `County not given`, their `County FIPS`
    still what the tract says. Undo: the `byState` loop.
17. **County names from `.import/counties.json`**, now every county
    HUD's limits have named since FY1998 (3,250), not New England's
    alone, made by `node .import/counties.js` from the limits' files
    (B8); FY2026's names cut at 26 letters give way to the whole name an
    earlier year gave ("Fairbanks North Star Borou"). Two counties no
    limits file names, 60010 (American Samoa) and 69110 (Northern
    Mariana Islands), are folders by code, `County 69110`: no name from
    elsewhere. Undo: `counties.js`; the New England names are unchanged.
18. **The listing pages are records**, `# Tax Credit Projects: <name>`,
    keys Level, Postal code, State FIPS, County FIPS, Counties, Projects,
    Units, Low-income units, as the rents' and limits' are. In a link's
    text `[` and `]` are written `(` `)` and `|` a dash (23 values hold
    brackets).

## The changes (D5)

19. **Four Change records**, from the dictionary: the HUD ID's eighth
    digit (2015); QCT on the 2000 tracts (2004) and the 2010 tracts
    (2013); income averaging (2018, the first project electing it placed
    in service in 2017). A project is one record of one year, not a
    series, so D1-D4 split nothing: each is said, and its column read
    with it. The dictionary's later questions (2003, 2006, 2012, 2018:
    blank before) are not changes of meaning; the README says them.

## The checks (V)

20. **V1 exact**: the heads, 55,345 rows, eleven-character unique ids,
    eleven-character tracts, known states, and every coded column's
    values as read (a new code may be a new meaning: the import stops).
    The shape was written by `--shape` and read before it was trusted.
    A new release stops by design.
21. **V2 one vector of eleven rows**, each a case (its `about` names
    them), written by the importer, checked by eye against HUD's rows,
    then frozen.
