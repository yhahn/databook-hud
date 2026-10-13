# Notes: the first migration (deputy, 2026-10-13)

## What was asked

The Fair Market Rents databook: an importer from HUD's FMR history
(`~/.cache/proper/hud/fmr/FMR_All_1983_2027.csv`) writing every
county's rents since FY1983, on the seat's leans: a file a state, a
record a county or town, its rents a line card, a README by the
importer, and counties that moved between areas said plainly.

## What was made

Branch `import`: `.import/import.py` (Python, stdlib), `.import/DECISIONS.md`,
this note, and the pages it writes: 56 state files (50 states, DC, PR,
GU, VI, AS, MP) and README.md.

Counts, the CSV against what proper gathered:

| | CSV | written | gathered |
|---|---|---|---|
| rows / County records | 4,764 | 4,764 | 4,764 (4,764 distinct FIPS) |
| counties / towns | 3,161 / 1,603 | same | same |
| rent cells (non-empty) | 1,042,795 | | 1,042,795 |
| sum of every rent | 766,869,876 | | 766,869,876 |
| place-years with an area code | 208,563 | | 208,563 (in 19,294 Areas runs) |
| State records | 56 | 56 | 56 |

`County_table` is one table, 23,820 rows (4,764 × 5 bedrooms), 44 year
columns; `County_Areas` one table. Read against the CSV: Manhattan
(New York County, NY) 2-bedroom 420 in 1983, 2,971 in 2027; Onondaga
350 and 1,493. Both right. cards.md draws the Onondaga card as five
lines of 44 points.

`proper check`: nothing to mend. Two warnings came on the way, both
mended in the importer (DECISIONS.md): area codes mixed numbers and
text (now two columns, `MSA` and `Metro code`), and ten records with
no census region (now their state's, or `none`).

Gather, `crew run 4G -- /usr/bin/time -v proper check`: cold (no
cache) 4.9 s wall, 824 MB peak; again with nothing changed, 0.8 s,
336 MB; after a rewrite of every file, 5.1 s, 856 MB. 12 MB of
markdown; Maine the biggest file, 1.3 MB.

## Decisions (in full in DECISIONS.md)

- The key: `- FIPS:`, HUD's `fips2027` as written, ten digits; written
  down first for the Income Limits deputy.
- One kind, `County`, for counties and New England towns
  (`- Level: Town`), so the country is one table.
- Area history as runs, `#### Areas`: `| From | To | MSA | Metro code |
  Area | Percentile |`; names only FY2022 on.
- `- Area changes:` counts real code changes, leaving out HUD's
  renumbering of 2006, its nonmetro recode of 2005, and a misspelling
  in 2023–24: 677 places have moved at least once.
- No 1984 column (HUD set no FY1984 FMRs).
- Percentile for FY2024–27 written 40 (HUD's file stops giving it).
- One nameless Vermont row and a doubly-listed Maine reservation named
  by their FIPS, not guessed at.

## Learnings

For proper:

1. **A code with a leading zero is gathered as a number, and loses
   the zero.** `- FIPS: 0100199999` is `County.FIPS` BIGINT
   `100199999`. FIPS, ZIP codes, docket numbers: a code is not a
   number. The mend proper offers for a key (a doctype) lives in
   `.proper/`, which a databook keeps out of git as the reader's, so a
   databook cannot carry it. Either a value written with a leading
   zero stays text, or a databook needs a place for its doctypes that
   is the data's. Evidence: this repo, `proper query "select typeof(FIPS)
   from County limit 1"`. One case; the Income Limits book will be a
   second on the same key.
2. **The mixed-values warning earned its keep**: it found HUD's two
   code schemes (old MSA numbers, new METRO codes) in one column, a
   thing worth a column of its own. Its fix words ("a unit … goes in the
   key") did not fit a code; the cure was a second column.
3. The missing-key warning's fix, again, is a doctype: same as 1.
4. Size: 4,764 records with a 44-column card each gathers cold in
   under 5 s and 0.85 GB. No trouble.

For cards.md:

5. A line card's x is the head's words, evenly spaced: 1983 and 1985
   sit side by side as if a year apart. A year axis would leave a gap.
   Small; the card still reads.

## What I was unsure of

- Whether `Area changes` is the plain word the seat wants for "moved":
  some changes are OMB redrawing a metro, not a county's own move.
- Percentile 40 for FY2024–27 rests on the Read Me, not the file.
- American Samoa and the Northern Mariana Islands' census region left
  `none`.

## Against the Expected

The seat's Expected: 30 minutes; the work the shape, not the reading;
area names only in recent years; counties moving; Puerto Rico and the
territories; New England towns beside counties; some years missing;
perhaps back on county or area as the record.

- Time: about 40 minutes, most of it the shape and the area history,
  as foreseen.
- All five named things came, and were small. Not foreseen: HUD's
  recodes that look like moves (3,286 places "moved" in 2005 and 4,735 in 2006
  until they were left out); Connecticut's new county codes in FY2026
  (`fips2027` against `fips2024`), which matters for the join with
  Income Limits; FIPS losing its zero in proper; a percentile column
  that comes and goes; no FY1984 at all; one row with no name.
- Did not come back on county or area: the lean (county) held, and an
  area's rents are any of its counties'.

## What the brief lacked

- The state codes: the CSV has state numbers only; the names and
  postal codes are a table in the importer.
- The percentile (`fmrNN`) and the old FIPS columns, and what to do
  with them; and that "this year" is FY2027.
- That the Read Me
  (<https://www.huduser.gov/portal/datasets/FMR/READ_ME_FMRHIST_FY2025.docx>)
  is the documentation worth reading: it answered the 1984, percentile
  and Connecticut questions in a page.

In one line: the FMR databook is written whole, 4,764 places gathered
to the dollar, clean under `proper check`, with FIPS's lost zero the
one finding for proper.
