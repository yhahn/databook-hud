# Notes: the Income Limits databook, first written

**Asked.** An importer from HUD's Section 8 income limits, FY1998 on,
writing every county's limits into this repo, keyed to join the Fair
Market Rents databook; on branch `import`, the merge left to the seat.

**Made.** Branch `import`: `.import/` (import.js, sources.js,
readme.js, ledger.json, DECISIONS.md, this), README.md and 56 state
files: 4,782 records (4,764 places HUD lists in FY2026, 3,161 counties
and 1,603 New England towns, and 18 it no longer lists), FY1998-2026,
29 years. Each record: median family income and three limit cards (a
row a household size 1-8, years across) and its areas as runs. 36 MB
of markdown.

**Counts.** From FY2006 every row of every year's file is written to
one record (exact code, or followed by name or rename; none twice),
and proper gathers each year's column with exactly as many filled
rows as written (`count("2010")` on `County_Very_low_income_50`,
Persons 1: 4,766 = 4,766 rows in the file). Before FY2006 each file's
rows (3,189 to 3,194) are a county's row (3,095-3,103), a split New
England county's part (89-91, not written) or a county gone (2-5);
the county rows fan out to 3,843-3,848 records (a county's row to each
town in it), and proper gathers the same. Each level is one table:
`County_Extremely_low_income_30`, `_Very_low_income_50`,
`_Low_income_80`, 38,256 rows each (4,782 × 8);
`County_Median_family_income` 4,782.

Read against the source: Onondaga County, NY (1998 median 44,500, VLI
4 persons 22,250; 2000 30%, 1 person 9,850; 2026 median 106,800, ELI
4 persons 33,000) and New York County (1998 VLI 4 persons 25,100; 2014
ELI 17,650 to 40,090; 2026 VLI 84,800). All agree. All 4,764 places
join the rents by FIPS, and the 169 Connecticut towns by `FIPS 2024`
too.

`proper check`: nothing to mend. Under `crew run 4G`: 14.9 s, 1.48 GB
peak (1,481,028 kB), 119% CPU.

**Decisions** (DECISIONS.md): the rents' key and shape; CT's planning
regions from FY2023 (the rents: FY2026); places followed through code
changes by code, a rename table, name, and name less its kind; places
HUD dropped kept as records with `- Last year:`; the history to FY1998
by county, New England's 33 split counties left empty before 2006; the
30% card holds the plain 30% limit before FY2014; Areas runs in two
columns (MSA, Metro code).

**Learnings.**
- For proper: a card's table directly under a record heading is named
  `County_table` (the rents have one); under its own `####` heading it
  is `County_<heading>`. Giving each card a heading is what makes "one
  table a level" here. Not a fault; worth a line in the rules for
  databooks with more than one card a record.
- For proper: the 1.48 GB peak for 36 MB of markdown (154k card rows)
  is about 40 times the text. One case; a note.
- For the importer (and the next HUD book): HUD's files hold quiet
  traps: FY2026 cuts names at 26 letters; Rockland and Westchester, NY
  have a second row (`…99998`) for fifteen years that, matched by
  name, took the county's own year until rows with their own code
  went first; Census renames change code and name together; CT's
  re-keying year differs between the rents (FY2026) and the limits
  (FY2023).
- For the seat: two deputies on one session share one scratchpad. The
  rents deputy and I both made `t1/` there; I wrote one file into its
  folder before seeing it, and removed it. A deputy's brief could name
  its own scratch folder.

**Unsure of.** Whether the 30% card's pre-2014 years belong in it
(decision 9; easily left out). Whether a town in a county wholly in one
pre-2006 area should take the county's row (decision 6): honest, I
think, but a reader may read it as town data HUD never wrote. Whether
the eighteen dropped places belong in the book.

**Against the Expected** ("an hour; the source the hard part; will
come back on how to key the years before 2006 and on the eight
programs"). About fifteen minutes to the first whole run, perhaps half
an hour in all. The source was the work, as predicted, but less than
feared: the 28 files are three formats, and one reader with a column
finder took them all; ELI from 2014 as predicted (and the plain 30%
from 1999, not predicted). The years before 2006 did not need the
seat: outside New England they key honestly by county, and only New
England's split counties stop at 2006. The eight programs are later,
as asked; seven share the shape, URA has no table. Not predicted: the
FIPS changes after 2006 (CT, renames, deorganized towns, the NY
`99998` rows), which were most of the matching work.

**The brief lacked.** Little. It might have said the rents would keep
CT's old code as `FIPS 2024` (the seat's message mid-way did), and
given each deputy its own scratch folder.

One line: the Income Limits databook is written on `import`, 4,782
places FY1998-2026, one table a level, every place joining the rents by
FIPS, nothing to mend.
