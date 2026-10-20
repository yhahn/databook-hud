# Notes: the R pass, a reader's way in (deputy, 2026-10-20)

The notes before these (the book's questions, FAQ.md, 10-15) are in git:
`git show 5205fb8b3:.import/NOTES.md`.

## What was asked

The reading trial's after arm: given only SPEC B and R, the book, and
cards.md's pictures, pick the book's spine (R1); write
`.import/reading.md`, the questions a stranger asks first of the front
page and of each level of the spine, and the findings (R3), their
numbers left to the importer; change the importers so the README and
each state's page answer them, compare their places (R4) and draw them
(R5), every number from the data at build, with a `finding-turned`
warning on rerun; put the R2 questions in faq.md, answered by faq.js;
rebuild with every test and target holding; count words and pictures,
before and after.

## What I made

Branch `r-pass` (worktree `.claude/worktrees/r-pass`), two commits: the
importers, then the pages they wrote.

- The spine is place (DECISIONS 32): the nation on README.md, a state on
  its rents page; time the second axis.
- `.import/reading.md`: 5 questions for the front page, 4 findings, and
  4 questions for a state's page; each with its words (holes for the
  numbers), measure, picture, the values whose change is a turn, and
  the FAQ question that asks it again of the source.
- `.import/reading.py`: reads reading.md, fills the words, keeps the
  values, warns `finding-turned` (tried: a leader changed by hand in the
  kept file warned once, and the next run was quiet).
- The limits' importer writes `.import/incomes.json` (gitignored); the
  rents' importer reckons the nation's and each state's figures from it
  and HUD's rents, writes each state's page with its questions answered,
  a line of its rent over the years beside the nation's, a grid of its
  places (a row each, every fourth year, three gutters), and its Places
  listing ranked with four new columns; keeps what it filled in
  `.import/rents/reading.json`. readme.py writes the front page's
  findings, five questions and four pictures, and a linked table of the
  states, keeping `.import/reading.json`. The limits' and tax credits'
  state pages each link to the rents page.
- faq.md: 7 questions added (hud-reading-1 to 7); faq.js answers them
  from HUD's files and then compares 28 values the pages were filled
  with against its answers, stopping the build on `page-drifted`.
- target.sql: 5 new checks (R4 twice, R5 twice, B4 for the reading's
  tables). Every check holds (the full build under `crew run 6G`).

Counts: 4764 places compared on 56 state pages, gathered 4764 rows in
`Fair_Market_Rents_Places_compared`, one a FIPS; 56 lines gathered; 33
questions in faq.md, 33 records; 28 values agree. Place pages unchanged
(the B7 vector's place pages held unmoved; only listing pages changed).

Words and pictures (prose: lines that are not table rows, card rows or
code), against tag `trial-before-2026-10-20`:

| Page | Words before | Words now | Prose before | Prose now | Pictures before | Pictures now |
|---|---|---|---|---|---|---|
| README.md | 1165 | 5216 | 961 | 1642 | 0 | 4 |
| rents/Alabama.md | 754 | 4116 | 73 | 414 | 0 | 2 |
| rents/New York.md | 707 | 3925 | 75 | 441 | 0 | 2 |
| rents/Massachusetts.md | 243 | 11692 | 79 | 414 | 0 | 2 |

The words grow mostly in the cards' tables (a line of 33 years, a grid
of every place); Massachusetts's grid is 351 towns.

## What the data points to (as the pages now say)

Rent rose in 31 of 32 years; its rise has quickened (6.2% a year over
the last five, 2.9% before); since FY2006 the median county's rent rose
97.8%, its median family income 78.4%, rent faster in 2,498 of 3,152
counties; a low income is stretched most in Guam, Hawaii and the
Northern Mariana Islands (41.2%), least in North Dakota (19.6%).

## Learnings

For proper (engine), each with its evidence:

1. **Codes are gathered as text now** (SPEC K2's ask, met), but **a
   column's type still turns on its values**: `Rents.FIPS` is VARCHAR
   (some start with 0) while `"Second listing".FIPS` is BIGINT
   (3608799998, 3611999998: none starts with 0). The same key, two
   types, in one book; a join between them would need a cast. The
   lihtc README's queries (3, 4), the front page's (3) and a target
   check multiplied `"County FIPS"` and failed before this pass touched
   them (decision 44).
2. **`footnotes` (G17) is a table with `_end_line`**, so a book's check
   of its own kinds by `_end_line` finds it. A kind of proper's own
   might be told apart (a schema, or no `_end_line`).
3. A card's table under a heading is named `<Kind>_<heading>`, and two
   tables under one heading `_2`: a grid and a linked table after it
   need headings of their own (`### The states, linked`). Worked as
   told; the `_2` was what found a card of fewer years (B4).

For cards.md:

4. **A drawn card hides its table**: R5 says "the picture for the eye,
   the table for the agent and the citation", "its table beneath"; on
   the bench a drawn card shows no table at all, so a reader who wants
   a number reads the markdown. A way to open the table under a picture
   would serve R5 (the book does not draw a second copy: decision 42).
5. **A link in a grid's label is drawn raw** (`[Alabama](.…`): a grid of
   places cannot link its rows, so a state's page needs its Places
   listing after the grid as well. A label that is a link, drawn as its
   words and followed on a tap, is the ask.
6. **Labels cut at twelve letters**: "North Caroli…", "Rent, % of …"; the
   book shortens place names (Bronx, not Bronx County) and gutter heads
   (`Rent up, %`) to fit. A bars card names only its first and last x,
   so 56 states as bars cannot be read; the states became a grid.

For the seat (SPEC R):

7. **R presumes one folder page a level; this book has three a state**
   (rents, limits, tax credits). R1 says one spine, the rest links; it
   does not say which of a book's datasets carries the spine's pages.
8. **R2's "every folder page on the spine"** would put questions on 76
   New England county pages too; I asked them only of states (decision
   33). R could name the levels that ask.
9. **R2's "each is also an FAQ question"** fits the front page; a
   state's questions are 56 × 4, so one state stands for all (New York,
   and Mississippi for the one faq.md already had). R could say so.
10. **R3 asks for a warning "as faq.js's answer-changed does"**: faq.js
    has none. `finding-turned` is the first of its kind here; it warns,
    it does not stop.
11. **R4 "a table sorted by what matters"**: sorting the B7 listing by
    rent costs the alphabetical finding of a place; I took R4 (decision
    41). B7 and R4 might say which wins.
12. **SPEC K2's note** ("proper gathers an all-digit code as a number
    today") is out of date (learning 1).

## Unsure

- The burden's measure (12 × two-bedroom FMR / very low income limit for
  four) mixes nothing: both FY2026, as faq.md's join questions are; the
  rents run a year further, to FY2027, and the dearest is said of 2027.
- Territories lead the burden (Guam, the Northern Mariana Islands) and
  Kalawao (a county of a few score people) leads the counties; said as
  the data has them.
- Grid shades are each card's own top, so Alabama's darkest and
  Massachusetts's darkest are not the same rent; the key says the top.

## Against the brief and its Predicted

All five made. Leans taken: the picture of 3,000 counties a median and
its middle half (and the states a grid); the 50th percentile said with
its numbers and marked. The brief lacked: which of three state pages is
the spine's; whether New England's county pages ask; the FIPS-as-text
change in proper that broke four queries before any of this; and
faq.js's answer-changed, which is not there. Time: 00:11 to 00:45,
about thirty-five minutes; each full build under `crew run 6G` about
two minutes.

Summary: the front page and every state's rents page now open with the
questions a stranger asks, answered from HUD's files at every build,
drawn, compared and checked against the FAQ; every check holds.
