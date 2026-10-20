# Questions and answers

33 questions a careful reader of this book can answer, from the plainest (one rent, one place, one year) to the hardest (what changed, and why), each with its answer and the page to look in. Read a question, open the page, and find the answer yourself; or put the questions to a reader or an agent with this page hidden, and mark what comes back. Where the book cannot answer, the right answer is to say so. The answers are worked out afresh from HUD's own files at every release, not copied from the pages: where the two disagree, one is wrong.

### Question: hud-lookup-1

- Tier: Lookup
- Ask: What was the extremely low income limit for a household of four in Holmes County, Mississippi, in FY2020?
- Answer: 26200
- Type: number
- Tolerance: 0
- Look in: [limits/Mississippi/Holmes County](./limits/Mississippi/Holmes%20County.md)

Section8-FY20.xlsx, fips 2805199999, ELI_4 (the extremely low income limit as defined since FY2014).

### Question: hud-lookup-2

- Tier: Lookup
- Ask: What is the two-bedroom Fair Market Rent for New York County (Manhattan), New York, in FY2027?
- Answer: 2971
- Type: number
- Tolerance: 0
- Look in: [rents/New York/New York County](./rents/New%20York/New%20York%20County.md)

FMR history, fips2027 3606199999, fmr27_2.

### Question: hud-lookup-3

- Tier: Lookup
- Ask: What was HUD's median family income for Onondaga County, New York, in FY2026?
- Answer: 106800
- Type: number
- Tolerance: 0
- Look in: [limits/New York/Onondaga County](./limits/New%20York/Onondaga%20County.md)

Section8-FY26.xlsx, fips 3606799999, median2026.

### Question: hud-lookup-4

- Tier: Lookup
- Ask: What was the one-bedroom Fair Market Rent for Los Angeles County, California, in FY2010?
- Answer: 1137
- Type: number
- Tolerance: 0
- Look in: [rents/California/Los Angeles County](./rents/California/Los%20Angeles%20County.md)

FMR history, fips2027 0603799999, fmr10_1 (percentile column fmr10: 40).

### Question: hud-page-1

- Tier: Page
- Ask: What is the two-bedroom Fair Market Rent for Bangor, Maine, in FY2027?
- Answer: 1722
- Type: number
- Tolerance: 0
- Look in: [rents/Maine/Penobscot County/Bangor city](./rents/Maine/Penobscot%20County/Bangor%20city.md)

FMR history, Bangor city, ME (2301902795, Penobscot County), fmr27_2.

### Question: hud-page-2

- Tier: Page
- Ask: What is the very low income limit for a household of three in Burlington, Vermont, in FY2026?
- Answer: 56150
- Type: number
- Tolerance: 0
- Look in: [limits/Vermont/Chittenden County/Burlington city](./limits/Vermont/Chittenden%20County/Burlington%20city.md)

Section8-FY26.xlsx, Burlington city, VT (5000710675, Chittenden County), l50_3. South Burlington city has the same value; Burlington town, CT 56050 and Burlington town, MA 77150 do not.

### Question: hud-page-3

- Tier: Page
- Ask: Which FMR area did Autauga County, Alabama belong to in FY2015? Give HUD's area code.
- Answer: METRO33860M33860
- Type: set
- Tolerance:
- Look in: [rents/Alabama/Autauga County](./rents/Alabama/Autauga%20County.md)

FMR history msa15 for 0100199999; the FY2015 income limits' cbsasub agrees (METRO33860M33860). Its old MSA number, in the limits' msa column, is 5240 (Montgomery, AL).

### Question: hud-across-1

- Tier: Across
- Ask: Which counties (not New England towns) have a two-bedroom Fair Market Rent in FY2027 at or above the tenth highest, highest first?
- Answer: Santa Cruz County, CA 4254; Marin County, CA 3697; San Francisco County, CA 3697; San Mateo County, CA 3697; Napa County, CA 3375; Santa Clara County, CA 3272; Santa Barbara County, CA 3106; Orange County, CA 3057; San Benito County, CA 3004; Bronx County, NY 2971; Kings County, NY 2971; New York County, NY 2971; Putnam County, NY 2971; Queens County, NY 2971; Richmond County, NY 2971; Rockland County, NY 2971; Westchester County, NY 2971
- Type: list
- Tolerance:
- Look in: [rents/README](./rents/README.md)

Counties are rows with cousub 99999 (New England has none: its rows are towns). The tenth value, 2971, is shared by 8 counties of the New York HUD Metro FMR Area, so the "ten" are nine and a tie of 8; 17 counties in all. Next below: 2964 (Los Angeles County).

### Question: hud-across-2

- Tier: Across
- Ask: Of the counties with a two-bedroom Fair Market Rent in both FY2010 and FY2027, which rose most, in percent?
- Answer: Divide County, ND
- Type: set
- Tolerance:
- Look in: [rents/README](./rents/README.md)

3154 counties (cousub 99999) have both. Divide County (3802399999): 518 to 1858, +258.7%; next McKenzie County +204.4%. Both years at the 40th percentile (fmr10 = 40); 108 counties were at the 50th in FY2010, none near the top, so as set or at the 40th only, the answer is the same. A row of the FMR history carries its place's years, so a county recoded (Oglala Lakota, Kusilvak) is followed by its row.

### Question: hud-across-3

- Tier: Across
- Ask: How many places HUD lists in FY2026 have a low income limit of more than $100,000 for a household of four?
- Answer: 720
- Type: number
- Tolerance: 0
- Look in: [limits/README](./limits/README.md)

Section8-FY26.xlsx, 4764 rows, l80_4 > 100000. 16 more rows are exactly 100,000 (at or above: 736). A row is a county, or a New England town.

### Question: hud-across-4

- Tier: Across
- Ask: How many New England places below the county (towns, cities, plantations and the like) does HUD's FY2026 income limits file list?
- Answer: 1603
- Type: number
- Tolerance: 0
- Look in: [limits/README](./limits/README.md)

Section8-FY26.xlsx, rows of CT ME MA NH RI VT, all 1603 with a county subdivision (none 99999): towns, cities, plantations, unorganized territories, reservations and the like, by state 09:169 23:529 25:351 33:259 44:39 50:256.

### Question: hud-join-1

- Tier: Join
- Ask: In FY2026, twelve months of the two-bedroom Fair Market Rent are what percent of the low income limit for a household of four, in Manhattan and in Onondaga County, New York?
- Answer: New York County (Manhattan) 25.73% (12 × 2910 / 135700); Onondaga County 19.55% (12 × 1392 / 85450)
- Type: list
- Tolerance: 0.1
- Look in: [rents/New York/New York County](./rents/New%20York/New%20York%20County.md), [limits/New York/New York County](./limits/New%20York/New%20York%20County.md), [rents/New York/Onondaga County](./rents/New%20York/Onondaga%20County.md), [limits/New York/Onondaga County](./limits/New%20York/Onondaga%20County.md)

12 × fmr26_2 (FMR history) / l80_4 (Section8-FY26.xlsx), by FIPS, in percent.

### Question: hud-join-2

- Tier: Join
- Ask: In which county are twelve months of the FY2026 two-bedroom Fair Market Rent the largest share of the very low income limit for a household of four?
- Answer: Kalawao County, HI
- Type: set
- Tolerance:
- Look in: [README](./README.md)

3161 counties (cousub 99999) joined by FIPS. Kalawao County: 12 × 2492 / 60950 = 49.1%; next Gulf County 47.4%, San Benito County 47.4%. Kalawao (the Kalaupapa settlement, a few score people) is a county in HUD's files; an answer leaving it out names Gulf County, FL.

### Question: hud-change-1

- Tier: Change
- Ask: By how much did Holmes County, Mississippi's extremely low income limit for a household of four rise from FY2013 to FY2014?
- Answer: Not like for like: HUD redefined the limit in FY2014 (the greater of 30% of the median and the poverty guideline). The old 30% limit rose 150, from 12600 to 12750; the new limit was 21250 in FY2014, so 8650 is a splice of two definitions, not a rise.
- Type: judge
- Tolerance:
- Look in: [limits/Mississippi/Holmes County](./limits/Mississippi/Holmes%20County.md), [limits/Changes/Extremely low income redefined, 2014](./limits/Changes/Extremely%20low%20income%20redefined,%202014.md)

FY2013 Section8.xls l30_4 12600; FY2014 Section8.xls (the plain 30% limit) l30_4 12750; FY2014 Poverty.xls ELI_4 21250 (the greater of 30% of median and the poverty guideline, capped at the 50% limit, which it equals here: l50_4 21250). Right only if it says the definition changed; 8650 spliced is wrong.

### Question: hud-change-2

- Tier: Change
- Ask: In which fiscal years was the District of Columbia's Fair Market Rent set at the 50th percentile?
- Answer: 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2010, 2011, 2012, 2016, 2017, 2018
- Type: set
- Tolerance:
- Look in: [rents/District of Columbia/District of Columbia](./rents/District%20of%20Columbia/District%20of%20Columbia.md)

FMR history, fips2027 1100199999, the years whose fmrNN column is 50; FY2009 and FY2013-2015, 2019 are 40. HUD's file has no percentile column from FY2024.

### Question: hud-change-3

- Tier: Change
- Ask: What is the FY2027 two-bedroom Fair Market Rent for Hartford County, Connecticut?
- Answer: There is no one rent: Hartford County is no longer a unit in HUD's files, its towns keyed from FY2026 by Connecticut's planning regions. Of the county's 29 towns, 26 are in the Capitol Planning Region (Hartford-West Hartford-East Hartford, CT MSA), at 1933; Burlington and Hartland in the Northwest Hills Planning Region (Northwest Hills Planning Region, CT), at 1560; Bristol in the Naugatuck Valley Planning Region (Waterbury-Shelton, CT MSA), at 1745.
- Type: judge
- Tolerance:
- Look in: [rents/Changes/Connecticut's planning regions, 2026](./rents/Changes/Connecticut's%20planning%20regions,%202026.md), [rents/Connecticut/Capitol Planning Region](./rents/Connecticut/Capitol%20Planning%20Region.md)

Hartford County's 29 towns by fips2024 0900 3xxxxx, and fmr27_2 by fips2027. In FY2025 all were 1653. A single figure is right only if it says it is the Hartford MSA's and that three former Hartford County towns differ.

### Question: hud-gap-1

- Tier: Gap
- Ask: What was the two-bedroom Fair Market Rent for Cook County, Illinois, in FY1984?
- Answer: The book does not say.
- Type: none
- Tolerance:
- Look in:

The FMR history has no FY1984 columns (fmr83_* then fmr85_*); HUD published no FY1984 FMRs. Cook County FY1983 2BR is 498 and FY1985 521: neither is the answer.

### Question: hud-gap-2

- Tier: Gap
- Ask: What was the extremely low income limit for a household of four in Holmes County, Mississippi, in FY1998?
- Answer: The book does not say.
- Type: none
- Tolerance:
- Look in:

allstate.txt (FY1998) has no L30 lines for any county (MED, L50, L80, FMR only); the 30% limit begins FY1999 (allst99.txt). Holmes County, MS is there with L50_4 14900 and L80_4 23850; 30% of the median (17100) is not HUD's limit.

### Question: hud-gap-3

- Tier: Gap
- Ask: What was the two-bedroom Fair Market Rent for Broomfield County, Colorado, in FY2003?
- Answer: The book does not say.
- Type: none
- Tolerance:
- Look in:

FMR history, Broomfield County (0801499999): fmr03 = 50 (marked at the 50th) and fmr03_2 empty; empty FY2001-2004, first rent FY2005 (888). Denver's or Boulder's rent is not Broomfield's.

### Question: hud-gap-4

- Tier: Change
- Ask: What was the very low income limit for a household of four in Ashby, Massachusetts, in FY2003?
- Answer: 31050
- Type: number
- Tolerance: 0
- Look in: [limits/Massachusetts/Middlesex County/Ashby town](./limits/Massachusetts/Middlesex%20County/Ashby%20town.md), [limits/Massachusetts/Middlesex County](./limits/Massachusetts/Middlesex%20County.md)

Not a gap, though first written as one: the source answers it. FY2006's msa column puts Ashby (2501701955) in old MSA 2600 (Fitchburg--Leominster, MA PMSA), and FY2003's Section8.xls has Middlesex County's part in it: l50_4 31050. Middlesex's other parts: Boston, MA--NH PMSA 40400; Lowell, MA--NH PMSA 39850.

### Question: hud-analysis-1

- Tier: Analysis
- Ask: In Mississippi, in how many counties did the two-bedroom Fair Market Rent grow faster than the median family income, FY2006 to FY2026, and in how many slower?
- Answer: 57 faster, 25 slower
- Type: list
- Tolerance: 0
- Look in: [rents/Mississippi](./rents/Mississippi.md), [limits/Mississippi](./limits/Mississippi.md)

82 Mississippi counties; fmr26_2/fmr06_2 against median2026/median2006 (Section8-FY26.xlsx, Section8FY2006.xls), by FIPS; 0 ties.

### Question: hud-analysis-2

- Tier: Analysis
- Ask: Which Census region has the highest median two-bedroom Fair Market Rent across its counties in FY2027?
- Answer: Northeast
- Type: set
- Tolerance:
- Look in: [rents/README](./rents/README.md)

FMR history, census_region, counties (cousub 99999), median fmr27_2: Northeast 1376 (150), West 1324 (450), South 1020 (1503), Midwest 1014 (1056). The Northeast's counties are NY, NJ and PA only; with New England's towns too: Northeast 1659, Midwest 1014, South 1020, West 1324.

### Question: hud-analysis-3

- Tier: Analysis
- Ask: How many counties and New England towns has HUD stopped listing in its income limits since FY1998 (a place renamed, recoded or made an unorganized territory of its own name still counts as listed; a second row for a place still listed is not a place), and which was the last to go?
- Answer: 16 places; the last to go, Magalloway plantation, ME, last listed FY2024
- Type: judge
- Tolerance:
- Look in: [limits/Gone](./limits/Gone.md)

Followed by code, a table of Census renames, then name less its kind, within the county or else the state where it is one place's alone (K3; Connecticut's towns, recoded to planning regions in FY2025), so towns that changed form (Agawam city to Agawam Town city) or were deorganized into an unorganized territory of the same name (Drew plantation to Drew UT, FY2026) are not gone. Gone: Skagway-Yakutat-Angoon, AK FY2002; W.PACIFIC ISLANDS, GU FY2004; PR Non-Metro counties, PR FY2005; VI ST.JOHN/ST.THOMAS, VI FY2005; Prince of Wales-Outer Ketchikan Census Area, AK FY2009; Skagway-Hoonah-Angoon Census Area, AK FY2009; Wrangell-Petersburg Census Area, AK FY2009; Clifton Forge city, VA FY2015; Centerville town, ME FY2018; Madrid town, ME FY2018; Bedford city, VA FY2019; Oxbow plantation, ME FY2021; Atkinson town, ME FY2022; Cary plantation, ME FY2022; Valdez-Cordova Census Area, AK FY2022; Magalloway plantation, ME FY2024. Not counted: the second rows HUD gave Rockland and Westchester, NY (…99998, FY2006-2020), each a county still listed; counted, the total is 18. Connecticut's eight counties, keyed before FY2006 and by their towns' codes to FY2024, are followed through their towns, not counted.

### Question: hud-analysis-4

- Tier: Analysis
- Ask: Across the whole country, has the two-bedroom Fair Market Rent grown faster than the median family income since FY2006? Give the median growth of each across counties, in percent.
- Answer: Yes, faster: across 3152 counties, FY2006 to FY2026, the median growth of the two-bedroom rent was 97.8%, of the median family income 78.4%; the rent grew faster in 2498 of them.
- Type: judge
- Tolerance:
- Look in: [README](./README.md)

Counties (cousub 99999) with both years in both files, by FIPS (Oglala Lakota and Kusilvak by their old codes in FY2006). Rents as HUD set them (FY2006 includes 128 counties at the 50th). The two readings of "by how much" differ by more than the point allowed: the medians' gap 19.4 points, the median of each county's gap 21.9. States and DC only: rent 98.2%, income 77.9%. At the 40th only in FY2006: rent 97.7%.

### Question: hud-analysis-5

- Tier: Analysis
- Ask: For a family of four earning the very low income limit in Holmes County, Mississippi, what share of income would the two-bedroom Fair Market Rent take in FY2006 and in FY2026?
- Answer: FY2006 32.42% (12 × 493 / 18250); FY2026 28.07% (12 × 842 / 36000)
- Type: list
- Tolerance: 0.1
- Look in: [rents/Mississippi/Holmes County](./rents/Mississippi/Holmes%20County.md), [limits/Mississippi/Holmes County](./limits/Mississippi/Holmes%20County.md)

12 × fmr06_2 / l50_4 (FY2006) and 12 × fmr26_2 / l50_4 (FY2026), Holmes County, MS, 2805199999.

### Question: hud-gap-5

- Tier: Gap
- Ask: What is the two-bedroom Fair Market Rent for Valdez-Cordova Census Area, Alaska, in FY2027?
- Answer: The book does not say.
- Type: none
- Tolerance:
- Look in:

No row for Valdez-Cordova Census Area (0226199999) in the FMR history: it was split into Chugach and Copper River census areas, which have FY2027 2BR rents (Chugach Census Area 1575; Copper River Census Area 1157). Neither is Valdez-Cordova's.

### Question: hud-reading-1

- Tier: Across
- Ask: Across HUD's counties (its rows keyed …99999; New England's towns aside), what was the median two-bedroom Fair Market Rent in FY1995 and in FY2027, and by what percent did it rise?
- Answer: FY1995 363; FY2027 1056; up 190.9%
- Type: list
- Tolerance: 0.1
- Look in: [README](./README.md), [rents/README](./rents/README.md)

FMR history, the 3161 rows with cousub 99999, the median of fmr95_2 and of fmr27_2, each over the counties that have one. FY1995 is all at the 40th percentile, FY2027 too (the 50th ended in FY2020).

### Question: hud-reading-2

- Tier: Analysis
- Ask: Taking each state's places (its counties, or in New England its towns), in which state is the median share of the FY2026 very low income limit for four taken by twelve months of the FY2026 two-bedroom Fair Market Rent greatest, and in which least (in percent, to one place)?
- Answer: greatest Hawaii, Guam, Northern Mariana Islands 41.2%; least North Dakota 19.6%
- Type: list
- Tolerance: 0.1
- Look in: [README](./README.md)

56 states and territories, each the median over its rows of the FMR history joined by FIPS to Section8-FY26.xlsx of 100 × 12 × fmr26_2 / l50_4, to one place; ties at one place kept. A territory of one county is its county.

### Question: hud-reading-3

- Tier: Across
- Ask: Taking each state's places (its counties, or in New England its towns), which state has the dearest median two-bedroom Fair Market Rent in FY2027, and which the cheapest?
- Answer: dearest District of Columbia 2438; cheapest Puerto Rico 613
- Type: list
- Tolerance: 0
- Look in: [README](./README.md)

56 states and territories, the median of fmr27_2 over each one's rows of the FMR history (counties, or in New England towns).

### Question: hud-reading-4

- Tier: Across
- Ask: In which year were the most low-income housing tax credit projects placed in service, and how many?
- Answer: 2007, 1806 projects
- Type: list
- Tolerance: 0
- Look in: [README](./README.md), [lihtc/README](./lihtc/README.md)

LIHTCPUB.xlsx, 55345 projects, by yr_pis (8888 and 9999 are no year: 2765).

### Question: hud-reading-5

- Tier: Analysis
- Ask: Across New York's counties, what was the median two-bedroom Fair Market Rent in FY1995 and in FY2027?
- Answer: FY1995 536; FY2027 1385
- Type: list
- Tolerance: 0
- Look in: [rents/New York](./rents/New%20York.md)

FMR history, the 62 rows of state 36, the median of fmr95_2 and of fmr27_2.

### Question: hud-reading-6

- Tier: Across
- Ask: Which New York counties have the dearest two-bedroom Fair Market Rent in FY2027, and which the cheapest (ties kept)?
- Answer: dearest Bronx County, Kings County, New York County, Putnam County, Queens County, Richmond County, Rockland County, Westchester County (2971); cheapest Allegany County, Cattaraugus County, Chautauqua County, Chenango County, Franklin County, Lewis County, Wyoming County (1014)
- Type: list
- Tolerance: 0
- Look in: [rents/New York](./rents/New%20York.md)

FMR history, state 36, fmr27_2: 8 counties at 2971, 7 at 1014. A county takes its FMR area's rents, so the counties of one area tie.

### Question: hud-reading-7

- Tier: Analysis
- Ask: Across New York's counties, what is the median share of the FY2026 very low income limit for four taken by twelve months of the FY2026 two-bedroom Fair Market Rent, and in which counties is it greatest?
- Answer: median 32.1%; greatest Bronx County, Kings County, New York County, Putnam County, Queens County, Richmond County, Rockland County, Westchester County (41.2%)
- Type: list
- Tolerance: 0.1
- Look in: [rents/New York](./rents/New%20York.md)

FMR history, the 62 rows of state 36, joined by FIPS to Section8-FY26.xlsx: 100 × 12 × fmr26_2 / l50_4, 62 with both.
