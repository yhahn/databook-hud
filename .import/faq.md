# The book's questions: databook-hud

The questions a good reader of this book can answer (SPEC B9), written by
hand and only ever added to: a question changed is a new question, under a
new id. Each: its Tier (BENCH.md's ladder), Ask, Type (number, set, list,
none, judge), Tolerance, the Rules it probes, How its answer is worked out
from HUD's files, and Look in, the pages where a reader finds it (several
split by "; "; none for a Gap question). `.import/faq.js` works out each
answer from the source, never from the book, and writes FAQ.md. Carried
over from the bench's first questions (databooks bench/hud.md), 2026-10-15,
their ids unchanged.

### Question: hud-lookup-1
- Tier: Lookup
- Ask: What was the extremely low income limit for a household of four in Holmes County, Mississippi, in FY2020?
- Type: number
- Tolerance: 0
- Rules: D1
- How: Income Limits FY2020, Holmes County MS (FIPS 2805199999), ELI 4 persons
- Look in: limits/Mississippi/Holmes County.md

### Question: hud-lookup-2
- Tier: Lookup
- Ask: What is the two-bedroom Fair Market Rent for New York County (Manhattan), New York, in FY2027?
- Type: number
- Tolerance: 0
- Rules:
- How: FMR history, fips 3606199999, fmr27_2
- Look in: rents/New York/New York County.md

### Question: hud-lookup-3
- Tier: Lookup
- Ask: What was HUD's median family income for Onondaga County, New York, in FY2026?
- Type: number
- Tolerance: 0
- Rules:
- How: Income Limits FY2026, Onondaga County NY, median
- Look in: limits/New York/Onondaga County.md

### Question: hud-lookup-4
- Tier: Lookup
- Ask: What was the one-bedroom Fair Market Rent for Los Angeles County, California, in FY2010?
- Type: number
- Tolerance: 0
- Rules:
- How: FMR history, Los Angeles County, fmr10_1
- Look in: rents/California/Los Angeles County.md

### Question: hud-page-1
- Tier: Page
- Ask: What is the two-bedroom Fair Market Rent for Bangor, Maine, in FY2027?
- Type: number
- Tolerance: 0
- Rules: B7
- How: FMR history, Bangor city, Penobscot County ME, fmr27_2
- Look in: rents/Maine/Penobscot County/Bangor city.md

### Question: hud-page-2
- Tier: Page
- Ask: What is the very low income limit for a household of three in Burlington, Vermont, in FY2026?
- Type: number
- Tolerance: 0
- Rules: B7
- How: Income Limits FY2026, Burlington city, Chittenden County VT, VLI 3 persons
- Look in: limits/Vermont/Chittenden County/Burlington city.md

### Question: hud-page-3
- Tier: Page
- Ask: Which FMR area did Autauga County, Alabama belong to in FY2015? Give HUD's area code.
- Type: set
- Tolerance:
- Rules: B7, K1
- How: FMR history, Autauga County AL, msa15
- Look in: rents/Alabama/Autauga County.md

### Question: hud-across-1
- Tier: Across
- Ask: Which counties (not New England towns) have a two-bedroom Fair Market Rent in FY2027 at or above the tenth highest, highest first?
- Type: list
- Tolerance:
- Rules: B3
- How: FMR history, cousub 99999, fmr27_2, every county at or above the tenth highest (16, an eight-way tie at 2,971)
- Look in: rents/README.md

### Question: hud-across-2
- Tier: Across
- Ask: Of the counties with a two-bedroom Fair Market Rent in both FY2010 and FY2027, which rose most, in percent?
- Type: set
- Tolerance:
- Rules: D4, K3
- How: FMR history, cousub 99999, fmr10_2 and fmr27_2, followed across code changes, at the 40th percentile or as set (D8: say which)
- Look in: rents/README.md

### Question: hud-across-3
- Tier: Across
- Ask: How many places HUD lists in FY2026 have a low income limit of more than $100,000 for a household of four?
- Type: number
- Tolerance: 0
- Rules: D7
- How: Income Limits FY2026, l80_4 > 100000, count of rows
- Look in: limits/README.md

### Question: hud-across-4
- Tier: Across
- Ask: How many New England places below the county (towns, cities, plantations and the like) does HUD's FY2026 income limits file list?
- Type: number
- Tolerance: 0
- Rules: B7
- How: Income Limits FY2026, CT ME MA NH RI VT, cousub not 99999
- Look in: limits/README.md

### Question: hud-join-1
- Tier: Join
- Ask: In FY2026, twelve months of the two-bedroom Fair Market Rent are what percent of the low income limit for a household of four, in Manhattan and in Onondaga County, New York?
- Type: list
- Tolerance: 0.1
- Rules: B5
- How: 12 × fmr26_2 / l80_4, FY2026, both by FIPS
- Look in: rents/New York/New York County.md; limits/New York/New York County.md; rents/New York/Onondaga County.md; limits/New York/Onondaga County.md

### Question: hud-join-2
- Tier: Join
- Ask: In which county are twelve months of the FY2026 two-bedroom Fair Market Rent the largest share of the very low income limit for a household of four?
- Type: set
- Tolerance:
- Rules: B5
- How: 12 × fmr26_2 / l50_4, FY2026, counties only, the greatest
- Look in: README.md

### Question: hud-change-1
- Tier: Change
- Ask: By how much did Holmes County, Mississippi's extremely low income limit for a household of four rise from FY2013 to FY2014?
- Type: judge
- Tolerance:
- Rules: D1, D2, D3, D5
- How: Rubric: right only if it says the limit was redefined in FY2014 (the greater of 30% of median and the poverty guideline), so the two years are not like for like; the old 30% limit rose 12,600 to 12,750, the new one was 21,250
- Look in: limits/Mississippi/Holmes County.md; limits/Changes/Extremely low income redefined, 2014.md

### Question: hud-change-2
- Tier: Change
- Ask: In which fiscal years was the District of Columbia's Fair Market Rent set at the 50th percentile?
- Type: set
- Tolerance:
- Rules: D8
- How: FMR history, DC, the years whose percentile column says 50
- Look in: rents/District of Columbia/District of Columbia.md

### Question: hud-change-3
- Tier: Change
- Ask: What is the FY2027 two-bedroom Fair Market Rent for Hartford County, Connecticut?
- Type: judge
- Tolerance:
- Rules: K1, D5
- How: Rubric: right only if it says Connecticut's counties gave way to planning regions in HUD's files (FY2026 in the rents) and answers for the region or towns that hold Hartford's places (most at 1,933 in the Capitol region; Bristol, Burlington and Hartland otherwise), not for a county code HUD no longer uses
- Look in: rents/Changes/Connecticut's planning regions, 2026.md; rents/Connecticut/Capitol Planning Region.md

### Question: hud-gap-1
- Tier: Gap
- Ask: What was the two-bedroom Fair Market Rent for Cook County, Illinois, in FY1984?
- Type: none
- Tolerance:
- Rules: D6
- How: FMR history has no FY1984 columns
- Look in:

### Question: hud-gap-2
- Tier: Gap
- Ask: What was the extremely low income limit for a household of four in Holmes County, Mississippi, in FY1998?
- Type: none
- Tolerance:
- Rules: D6
- How: FY1998's file has no 30% limit
- Look in:

### Question: hud-gap-3
- Tier: Gap
- Ask: What was the two-bedroom Fair Market Rent for Broomfield County, Colorado, in FY2003?
- Type: none
- Tolerance:
- Rules: D8, D6
- How: FMR history, Broomfield (a county from 2001), marked at the 50th, no rents before FY2005
- Look in:

### Question: hud-gap-4
- Tier: Change
- Ask: What was the very low income limit for a household of four in Ashby, Massachusetts, in FY2003?
- Type: number
- Tolerance: 0
- Rules: D2, D3
- How: Before FY2006 HUD keyed New England by county; FY2006's msa column ties Ashby to its part of Middlesex County (31,050; the Boston and Lowell parts were 40,400 and 39,850). Not a gap: the crosswalk answers it
- Look in: limits/Massachusetts/Middlesex County/Ashby town.md; limits/Massachusetts/Middlesex County.md

### Question: hud-analysis-1
- Tier: Analysis
- Ask: In Mississippi, in how many counties did the two-bedroom Fair Market Rent grow faster than the median family income, FY2006 to FY2026, and in how many slower?
- Type: list
- Tolerance: 0
- Rules: B5
- How: per county, fmr26_2/fmr06_2 against median26/median06; counts of greater and lesser
- Look in: rents/Mississippi.md; limits/Mississippi.md

### Question: hud-analysis-2
- Tier: Analysis
- Ask: Which Census region has the highest median two-bedroom Fair Market Rent across its counties in FY2027?
- Type: set
- Tolerance:
- Rules:
- How: FMR history, census_region, counties only, median of fmr27_2 by region
- Look in: rents/README.md

### Question: hud-analysis-3
- Tier: Analysis
- Ask: How many counties and New England towns has HUD stopped listing in its income limits since FY1998 (a place renamed, recoded or made an unorganized territory of its own name still counts as listed; a second row for a place still listed is not a place), and which was the last to go?
- Type: judge
- Tolerance:
- Rules: D7
- How: Rubric: 16 places, the last Magalloway plantation, ME, last listed FY2024 (the book counted 18 at first, two of them second listings)
- Look in: limits/Gone.md

### Question: hud-analysis-4
- Tier: Analysis
- Ask: Across the whole country, has the two-bedroom Fair Market Rent grown faster than the median family income since FY2006? Give the median growth of each across counties, in percent.
- Type: judge
- Tolerance:
- Rules: B5, D8
- How: Rubric: the median across counties of fmr26_2/fmr06_2 against median26/median06, within a point; says which way
- Look in: README.md

### Question: hud-analysis-5
- Tier: Analysis
- Ask: For a family of four earning the very low income limit in Holmes County, Mississippi, what share of income would the two-bedroom Fair Market Rent take in FY2006 and in FY2026?
- Type: list
- Tolerance: 0.1
- Rules: B5
- How: 12 × fmr_2 / l50_4, FY2006 and FY2026
- Look in: rents/Mississippi/Holmes County.md; limits/Mississippi/Holmes County.md

### Question: hud-gap-5
- Tier: Gap
- Ask: What is the two-bedroom Fair Market Rent for Valdez-Cordova Census Area, Alaska, in FY2027?
- Type: none
- Tolerance:
- Rules: D7, D6
- How: the census area was split in two; HUD's FY2027 file has no row for it
- Look in:
