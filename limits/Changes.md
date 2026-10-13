# Changes in the Income Limits

Where HUD's files change a definition or a key during their years: the latest form is kept in the cards, the older only in tables or records of their own, and nothing runs across a change.

### Change: HUD's nonmetropolitan mark, 2003

- Dataset: Income Limits
- Boundary: 2003
- Was: MSA 0 for a county outside a metropolitan area
- Now: MSA 10000
- Crosswalk: None needed: a code, not a move. The County before 2006 records count both as one (nonmetro).
- Places: 2302
- Source: HUD's FY2002 and FY2003 income limits

### Change: New England keyed by town, 2006

- Dataset: Income Limits
- Boundary: 2006
- Was: New England's limits by county, a row a county's part in one MSA (123 rows in FY2005)
- Now: by town, as HUD draws New England's areas (1604 towns in FY2006)
- Crosswalk: FY2006's msa column gives each town the MSA it lay in, and so its county's row before: `- County before 2006:` on 1604 towns (0 not tied). The county rows are records of their own (County before 2006), 125 of them; a town's own cards are empty before FY2006.
- Places: 1604
- Source: HUD's FY2005 and FY2006 income limits (Section8FY2005.xls, Section8FY2006.xls)

### Change: Areas renumbered, 2006

- Dataset: Income Limits
- Boundary: 2006
- Was: HUD's MSA numbers (5240), areas as OMB drew them in the 1990s
- Now: HUD's area codes (METRO33860M33860, NCNTY…), areas from OMB's 2003 definitions and the 2000 Census
- Crosswalk: FY2006 and FY2007 give each place's old MSA number beside its new code (msa, CBSASub); each place's Areas runs end at FY2005 under an MSA number and begin at FY2006 under a Metro code.
- Places: 4764
- Source: HUD's FY2006 income limits, the CBSASub and msa columns

### Change: Places recoded, listed or dropped, 2010

- Dataset: Income Limits
- Boundary: 2010
- Was: the places as HUD listed them in FY2009
- Now: 5 first listed, 3 no longer listed in FY2010
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 8
- Source: HUD's FY2009 and FY2010 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Hoonah-Angoon Census Area, AK |  | 0210599999 | first listed |
| Petersburg Borough, AK |  | 0219599999 | first listed |
| Prince of Wales-Hyder Census Area, AK |  | 0219899999 | first listed |
| Prince of Wales-Outer Ketchikan Census Area, AK | 0220199999 |  | no longer listed |
| Skagway Municipality, AK |  | 0223099999 | first listed |
| Skagway-Hoonah-Angoon Census Area, AK | 0223299999 |  | no longer listed |
| Wrangell City and Borough, AK |  | 0227599999 | first listed |
| Wrangell-Petersburg Census Area, AK | 0228099999 |  | no longer listed |

### Change: Places recoded, listed or dropped, 2013

- Dataset: Income Limits
- Boundary: 2013
- Was: the places as HUD listed them in FY2012
- Now: 15 under a new code, 1 first listed in FY2013
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 16
- Source: HUD's FY2012 and FY2013 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Agawam Town city, MA | 2501300765 | 2501300840 | new code |
| Amesbury city, MA | 2500901185 | 2500901260 | new code |
| Barnstable Town city, MA | 2500103600 | 2500103690 | new code |
| Braintree Town city, MA | 2502107665 | 2502107740 | new code |
| Chebeague Island town, ME |  | 2300512300 | first listed |
| Easthampton city, MA | 2501519330 | 2501519370 | new code |
| Ferrisburgh town, VT | 5000126275 | 5000126300 | new code |
| Franklin Town city, MA | 2502125100 | 2502125172 | new code |
| Greenfield city, MA | 2501127025 | 2501127100 | new code |
| Palmer Town city, MA | 2501352105 | 2501352144 | new code |
| Southbridge Town city, MA | 2502763270 | 2502763345 | new code |
| Verona Island town, ME | 2300978920 | 2300978925 | new code |
| West Springfield Town city, MA | 2501377850 | 2501377890 | new code |
| Westport Island town, ME | 2301584135 | 2301584140 | new code |
| Weymouth Town city, MA | 2502178865 | 2502178972 | new code |
| Winthrop Town city, MA | 2502580930 | 2502581005 | new code |

### Change: Extremely low income redefined, 2014

- Dataset: Income Limits
- Boundary: 2014
- Was: the 30% limit: 30/50ths of the very low income limit
- Now: the greater of that and the federal poverty guideline for the household size, never above the very low income limit
- Crosswalk: FY2014 carries both: HUD's Section8.xls, the old 30% limit, is in each place's table "30% limit, 1999 to 2014"; its Poverty.xls, the new, begins the card "Extremely low income (30%)". The new differs from the old in 4629 of 4767 places in FY2014.
- Places: 4629
- Source: HUD's FY2014 income limits, Section8.xls and Poverty.xls; the Consolidated Appropriations Act, 2014

### Change: Places recoded, listed or dropped, 2016

- Dataset: Income Limits
- Boundary: 2016
- Was: the places as HUD listed them in FY2015
- Now: 1 under a new code, 5 first listed, 1 no longer listed in FY2016
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 7
- Source: HUD's FY2015 and FY2016 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Alburgh town, VT | 5001300700 | 5001300860 | new code |
| American Samoa, AS |  | 6099999999 | first listed |
| Clifton Forge city, VA | 5156099999 |  | no longer listed |
| Louds Island UT, ME |  | 2301541280 | first listed |
| Marshall Island UT, ME |  | 2300943475 | first listed |
| Muscle Ridge Island UT, ME |  | 2301347962 | first listed |
| Northern Mariana Islands, MP |  | 6999999999 | first listed |

### Change: Places recoded, listed or dropped, 2017

- Dataset: Income Limits
- Boundary: 2017
- Was: the places as HUD listed them in FY2016
- Now: 4 under a new code in FY2017
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 4
- Source: HUD's FY2016 and FY2017 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Enosburgh town, VT | 5001123875 | 5001124050 | new code |
| Marshall Island UT, ME | 2300943475 | 2300947962 | new code |
| Penobscot Indian Island Reservation (2301957936), ME | 2301957937 | 2301957936 | new code |
| Sanford city, ME | 2303165760 | 2303165725 | new code |

### Change: Places recoded, listed or dropped, 2018

- Dataset: Income Limits
- Boundary: 2018
- Was: the places as HUD listed them in FY2017
- Now: 2 under a new code in FY2018
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 2
- Source: HUD's FY2017 and FY2018 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Kusilvak Census Area, AK | 0227099999 | 0215899999 | new code |
| Oglala Lakota County, SD | 4611399999 | 4610299999 | new code |

### Change: Places recoded, listed or dropped, 2019

- Dataset: Income Limits
- Boundary: 2019
- Was: the places as HUD listed them in FY2018
- Now: 1 under a new code, 2 no longer listed in FY2019
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 3
- Source: HUD's FY2018 and FY2019 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Centerville town, ME | 2302911755 |  | no longer listed |
| Madrid town, ME | 2300742765 |  | no longer listed |
| Marshall Island UT, ME | 2300947962 | 2300943578 | new code |

### Change: Places recoded, listed or dropped, 2020

- Dataset: Income Limits
- Boundary: 2020
- Was: the places as HUD listed them in FY2019
- Now: 1 no longer listed in FY2020
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 1
- Source: HUD's FY2019 and FY2020 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Bedford city, VA | 5151599999 |  | no longer listed |

### Change: Places recoded, listed or dropped, 2021

- Dataset: Income Limits
- Boundary: 2021
- Was: the places as HUD listed them in FY2020
- Now: 2 no longer listed in FY2021
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 2
- Source: HUD's FY2020 and FY2021 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Rockland County (3608799998), NY | 3608799998 |  | no longer listed |
| Westchester County (3611999998), NY | 3611999998 |  | no longer listed |

### Change: Places recoded, listed or dropped, 2022

- Dataset: Income Limits
- Boundary: 2022
- Was: the places as HUD listed them in FY2021
- Now: 3 under a new code, 1 no longer listed in FY2022
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 4
- Source: HUD's FY2021 and FY2022 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Bridgewater city, MA | 2502308085 | 2502308130 | new code |
| Framingham city, MA | 2501724925 | 2501724960 | new code |
| Oxbow plantation, ME | 2300356205 |  | no longer listed |
| Randolph city, MA | 2502155955 | 2502156000 | new code |

### Change: Places recoded, listed or dropped, 2023

- Dataset: Income Limits
- Boundary: 2023
- Was: the places as HUD listed them in FY2022
- Now: 4 under a new code, 2 first listed, 3 no longer listed in FY2023
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 9
- Source: HUD's FY2022 and FY2023 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Amherst Town city, MA | 2501501325 | 2501501370 | new code |
| Atkinson town, ME | 2302101920 |  | no longer listed |
| Bancroft UT, ME | 2300302760 | 2300302762 | new code |
| Cary plantation, ME | 2300311020 |  | no longer listed |
| Chugach Census Area, AK |  | 0206399999 | first listed |
| Copper River Census Area, AK |  | 0206699999 | first listed |
| Greenfield city, MA | 2501127100 | 2501127060 | new code |
| North Attleborough Town city, MA | 2500546575 | 2500546598 | new code |
| Valdez-Cordova Census Area, AK | 0226199999 |  | no longer listed |

### Change: Connecticut's planning regions, 2025

- Dataset: Income Limits
- Boundary: 2025
- Was: towns keyed by Connecticut's eight counties (090xx)
- Now: towns keyed by its nine planning regions (0911x to 0919x)
- Crosswalk: Each town: `- FIPS 2024:` holds its old code (169 towns). The rents made the same change in FY2026.
- Places: 169
- Source: HUD's FY2024 and FY2025 income limits

### Change: Places recoded, listed or dropped, 2025

- Dataset: Income Limits
- Boundary: 2025
- Was: the places as HUD listed them in FY2024
- Now: 1 first listed, 1 no longer listed in FY2025
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 2
- Source: HUD's FY2024 and FY2025 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Essex Junction city, VT |  | 5000724400 | first listed |
| Magalloway plantation, ME | 2301742835 |  | no longer listed |

### Change: Places recoded, listed or dropped, 2026

- Dataset: Income Limits
- Boundary: 2026
- Was: the places as HUD listed them in FY2025
- Now: 6 under a new code in FY2026
- Crosswalk: A place under a new code is followed by code, a table of renames, or name (never a guess); its old code is `- FIPS before:`. A place no longer listed is on the Gone page, with `- Last year:`.
- Places: 6
- Source: HUD's FY2025 and FY2026 income limits

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Amesbury city, MA | 2500901260 | 2500901185 | new code |
| Codyville UT, ME | 2302913610 | 2302913612 | new code |
| Drew UT, ME | 2301918580 | 2301918582 | new code |
| Easthampton city, MA | 2501519370 | 2501519365 | new code |
| Methuen city, MA | 2500940710 | 2500940675 | new code |
| Watertown city, MA | 2501773440 | 2501773405 | new code |
