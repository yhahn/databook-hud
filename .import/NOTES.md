# Notes: the book's questions, FAQ.md (deputy, 2026-10-15)

The notes before these (Gone mended, the tax credits, 10-13) are in git:
`git show c9ce2726c:.import/NOTES.md`.

## What was asked

Give databook-hud an FAQ.md by SPEC B9: the bench's 26 questions
carried into `.import/faq.md` with a Look in each; the bench's answer
script moved in as `.import/faq.js`, writing FAQ.md from the source;
run in build.sh after readme.py; target checks (26 records, every Look
in resolves, no blank answer); a frozen test, one question of each Type,
test first; a line in the README from readme.py.

## What I made

Branch `faq` (worktree `.claude/worktrees/faq`), one commit.

- `.import/faq.md`: 26 questions, ids and words as in bench/hud.md,
  each with `- Look in:` (22 with pages, 30 links in all; the 4 of Type
  none blank).
- `.import/faq.js`: hud.js's readers and answers, each answer a function
  giving the bench's structured answer, a line of words, and its note.
  Refuses a question with no answer, an answer with no question, and a
  Look in to a page not there. Writes `FAQ.md`: an opening paragraph, then
  26 `### Question:` records, keys Tier, Ask, Answer, Type, Tolerance,
  Look in, the note as body.
- `.import/faq.test.js`: lookup-1 (number), page-3 (set), join-1 (list),
  gap-2 (none), change-1 (judge): answers and whole records frozen; and
  a Look in to nowhere, or none on a question not a Gap, refused. Written
  first and seen failing. 10 pass.
- `build.sh` runs faq.js after readme.py, and the test; `readme.py`
  writes "Questions and answers" to FAQ.md, counting faq.md's questions.
- target.sql: four checks (records = faq.md's count, one an id; keys;
  no blank answer and the Gap answer exactly for Type none; no link from
  FAQ.md leading nowhere and none missing), and Question in B5's kinds.

Counts: 26 questions in faq.md, 26 records written, 26 gathered;
4 answered "The book does not say."; 30 links, 0 leading nowhere. The
whole build under `crew run 6G`: 1 min 43 s, every check held, no page
but README.md and FAQ.md changed. All 26 answers agree with hud.js's
hud.json, save hud-change-3, whose groups are now ordered (decision 29).

## Answers against the pages Look in names

Each answer was checked by `proper query` against the page or tables
Look in names: lookup 1-4, page 1-3, across 1-4, join 1-2, change 1-3,
gap-4 (Middlesex's MSA 2600 part, 31050), analysis 1-5, and the four
Gaps found absent. **None disagrees.**

Near-findings:

1. **hud-across-1's How (in bench/hud.md, carried into faq.md) says 16
   counties; the answer is 17** (nine and an eight-way tie at 2971).
   The How is wrong, the answer right. faq.md is only added to, so I
   left it; the seat's bench/hud.md has the same line.
2. **rents/README.md's "dearest two-bedroom FMRs" query** (the page
   across-1 points to) takes every place, New England towns among them
   (Nantucket is fifth), and `limit 10` cuts the tie: a reader who copies
   it answers across-1 wrongly. The tables are right; the query is a
   lure. For the importer, if the seat wants it: `where r.Level =
   'County'` and a tie-aware cut.
3. Two counties in the FMR history have no Census region (median 965).
   The answer to analysis-2 (Northeast) does not turn on them.

## Learnings

- For proper: an empty key written `- Tolerance:` (no trailing space)
  gathers as null, as the pages' `- FIPS 2024: ` does; Tolerance came
  through as DOUBLE. Nothing to tell.
- For the bench (the seat): FAQ.md's Answer is words, not JSON; numbers
  bare, sets joined. make.js should grade `number` by the bare number,
  `set` by splitting on `, ` or `; `, and `list`/`judge` with the note.
  The structured answers are in faq.js (`compute(ids)`) if make.js would
  sooner call it than parse.

## Unsure

- Look in for Across and Analysis questions names a README (the
  dataset's, or the front page's join), not a page holding the answer:
  there is none. A Gap question (gap-3, Broomfield) could also point to
  the page that shows the absence; the brief said blank, so blank.
- `counties.json` is read by faq.js for Connecticut's region names: it is
  the importers' table, made from HUD's files, not a page; but it is the
  book's own, where B9 says "from the source".

## Against the brief

All five made. The brief lacked a branch name (I took `faq`) and how
FAQ.md's answers should be shaped for make.js (decision 27). Time: 11:35
to 11:48, about twelve minutes, the build itself under two.

Summary: FAQ.md written from the source at every build, 26 questions,
every check held, no answer disagrees with its page.
