# Income Limits, 1998 to 2026

HUD's Section 8 income limits for every county, fiscal years 1998 to 2026: the area median family income, and the household incomes under which a family counts as extremely low, very low and low income, for households of one to eight. 4764 places as HUD lists them in FY2026 (3161 counties and 1603 New England towns), 16 more that HUD has since stopped listing ([Gone](./Gone.md)), 125 New England county rows from before FY2006, and 2 second listings of a county inside another area (Rockland and Westchester, NY, FY2006 to 2020), each on its county's page. Part of databook-hud: data only, printable as a book and queryable as tables.

## What the limits are

Each year HUD sets, for each metropolitan area and each county outside one, the incomes that decide who may have help with housing: a voucher (Section 8), public housing, and the many programs that borrow the same lines.

- **Very low income (50%)** starts from half the area's median family income for a family of four, adjusted for high or low housing costs, and for household size.
- **Low income (80%)** starts from 80% of the median, likewise adjusted, and is capped near the national median.
- **Extremely low income (30%)**, since FY2014: the greater of 30/50ths of the very low income limit and the federal poverty guideline for the household size, never above the very low income limit (the Consolidated Appropriations Act, 2014). That is why the larger households' figures jump.
- **30% limit**, FY1999 to FY2014: the plain 30/50ths of the very low income limit, as HUD set it before the Act; FY1998 has none.
- **Median family income** is HUD's estimate of the area's median, the figure the limits start from.

A county takes the limits of its area, so all the counties of one metropolitan area have the same limits. Until FY2010 HUD held an area's limits at the year before's where they would have fallen ("hold harmless"); since FY2009 it caps a year's rise.

## How it is written

A page a place, as a reader finds it: `Alabama/Autauga County.md`; in New England, where HUD's places are towns, `Maine/Penobscot County/Bangor city.md` (Connecticut's under its planning regions). A state's page (`Alabama.md`) lists its places, or in New England its counties, and a New England county's page its towns, linked, in a table gathered as `Income_Limits_Places`. The places HUD no longer lists are a page each in `Gone/`, listed in [Gone](./Gone.md); the changes, in `Changes/`, listed in [Changes](./Changes.md). A page is named for its place, a slash a dash; a name two pages of one folder would share takes its FIPS.

Each place is a record, `# Limits: <name>, <ST>` (towns too, with `- Level: Town`), keyed by `- FIPS:`, the ten digits HUD writes (state, county, county subdivision; `99999` for a whole county): the rents' key, so a place's rents and its income limits join. Its cards, a column a fiscal year and, for the limits, a row a household size: Median family income, Extremely low income (30%) from FY2014, Very low income (50%), Low income (80%); empty where HUD gives none. Beside them, never in them, the table `30% limit, 1999 to 2014`, the old definition; FY2014 is in both, the year HUD published both. Its `## Areas` are the runs of years it sat in one HUD area (HUD's MSA numbers before FY2006, its area codes since).

Where a place's FIPS changed, it is followed by code, a table of renames, or name: Connecticut's towns moved to planning-region codes in FY2025 (`- FIPS 2024:` keeps the old county code, as the rents do); some Maine, Massachusetts and Vermont towns and three counties were renamed with new codes (`- FIPS before:`, and `- FIPS earlier:` for a place with two).

**Second listings.** In FY2006 to 2020 HUD listed Rockland and Westchester counties, NY, twice: under their own code (`…99999`), with their own area's limits, and again under `…99998` inside the New York area, with its limits. The second is no place of its own: it is a record, `### Second listing: <county>, NY (<FIPS>)`, keyed `- Listing of:` its county's FIPS, under `## Second listings` on the county's page; its tables are `Second_listing_Very_low_income_50` and the like.

**Before FY2006** HUD keyed its limits by county and MSA, though it drew New England's areas by town, so a New England county could lie in several areas. Outside New England a county's row is its own record's. In New England a town's cards are empty before FY2006: its county's rows (123 to 125 a year) are records of their own, `### County before 2006: <county>, <ST> (MSA <number>)`, on the county's page (Connecticut's old counties have pages of their own), and each town names the one it lay in, from FY2006's own crosswalk, as `- County before 2006:`.

## How to ask

Each card or table is one across the country, a row a place and household size: `Limits_Extremely_low_income_30`, `Limits_Very_low_income_50`, `Limits_Low_income_80`, `Limits_30_limit_1999_to_2014`; `Limits_Median_family_income`, a row a place; `Limits_Areas`, a row a run; and the county rows before 2006, `County_before_2006_Very_low_income_50` and the like.

```sql
-- a family of four's very low income limit, then and now, in Manhattan and Onondaga County
select record, "1998", "2006", "2026" from Limits_Very_low_income_50
where Persons = 4 and record in ('New York County, NY', 'Onondaga County, NY')
```

```sql
-- the highest area median family incomes this year
select record, "2026" from Limits_Median_family_income order by "2026" desc limit 10
```

```sql
-- the two definitions of the 30% limit in FY2014, for a family of eight, where they differ most
select o.record, o."2014" as "30% limit", n."2014" as "Extremely low income"
from Limits_30_limit_1999_to_2014 o join Limits_Extremely_low_income_30 n using (record, Persons)
where o.Persons = 8 order by n."2014" - o."2014" desc limit 10
```

```sql
-- a Connecticut town's very low income limit for four, before and after 2006, through its county's row
select t.name, c."2005" as "its county row, 2005", v."2006" as "the town, 2006"
from Limits t
join County_before_2006_Very_low_income_50 c on c.record = t."County before 2006" and c.Persons = 4
join Limits_Very_low_income_50 v on v.record = t.name and v.Persons = 4
where t.State = 'Connecticut' order by t.name limit 10
```

`FIPS` is gathered as text, its leading zero kept (SPEC K2). The join with the rents is in the repo's README.

## Changes

Where HUD's files change a definition or a key, in full in [Changes](./Changes.md):

- 2003: HUD's nonmetropolitan mark
- 2006: New England keyed by town
- 2006: Areas renumbered
- 2010: Places recoded, listed or dropped (8)
- 2013: Places recoded, listed or dropped (16)
- 2014: Extremely low income redefined
- 2016: Places recoded, listed or dropped (7)
- 2017: Places recoded, listed or dropped (4)
- 2018: Places recoded, listed or dropped (2)
- 2019: Places recoded, listed or dropped (3)
- 2020: Places recoded, listed or dropped (1)
- 2021: Places recoded, listed or dropped (2)
- 2022: Places recoded, listed or dropped (4)
- 2023: Places recoded, listed or dropped (9)
- 2025: Connecticut's planning regions
- 2025: Places recoded, listed or dropped (2)
- 2026: Places recoded, listed or dropped (6)

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: *Income Limits*, <https://www.huduser.gov/portal/datasets/il.html>, the Section 8 file of each year (FY1998–2000 text; FY2001–2013 `.xls`; FY2014 `Poverty.xls` and `Section8.xls`; FY2015 on `.xlsx`). Written here by the importer (`.import/limits/`); nothing here is edited by hand.

Notice of use: HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). The limits in force for any program are those HUD publishes, not these copies. This databook is not HUD's, nor endorsed by it.

## The states

- [Alabama](./Alabama.md): 67 counties
- [Alaska](./Alaska.md): 30 counties
- [Arizona](./Arizona.md): 15 counties
- [Arkansas](./Arkansas.md): 75 counties
- [California](./California.md): 58 counties
- [Colorado](./Colorado.md): 64 counties
- [Connecticut](./Connecticut.md): 169 towns
- [Delaware](./Delaware.md): 3 counties
- [District of Columbia](./District%20of%20Columbia.md): 1 county
- [Florida](./Florida.md): 67 counties
- [Georgia](./Georgia.md): 159 counties
- [Hawaii](./Hawaii.md): 5 counties
- [Idaho](./Idaho.md): 44 counties
- [Illinois](./Illinois.md): 102 counties
- [Indiana](./Indiana.md): 92 counties
- [Iowa](./Iowa.md): 99 counties
- [Kansas](./Kansas.md): 105 counties
- [Kentucky](./Kentucky.md): 120 counties
- [Louisiana](./Louisiana.md): 64 counties
- [Maine](./Maine.md): 529 towns
- [Maryland](./Maryland.md): 24 counties
- [Massachusetts](./Massachusetts.md): 351 towns
- [Michigan](./Michigan.md): 83 counties
- [Minnesota](./Minnesota.md): 87 counties
- [Mississippi](./Mississippi.md): 82 counties
- [Missouri](./Missouri.md): 116 counties
- [Montana](./Montana.md): 56 counties
- [Nebraska](./Nebraska.md): 93 counties
- [Nevada](./Nevada.md): 17 counties
- [New Hampshire](./New%20Hampshire.md): 259 towns
- [New Jersey](./New%20Jersey.md): 21 counties
- [New Mexico](./New%20Mexico.md): 33 counties
- [New York](./New%20York.md): 62 counties
- [North Carolina](./North%20Carolina.md): 100 counties
- [North Dakota](./North%20Dakota.md): 53 counties
- [Ohio](./Ohio.md): 88 counties
- [Oklahoma](./Oklahoma.md): 77 counties
- [Oregon](./Oregon.md): 36 counties
- [Pennsylvania](./Pennsylvania.md): 67 counties
- [Rhode Island](./Rhode%20Island.md): 39 towns
- [South Carolina](./South%20Carolina.md): 46 counties
- [South Dakota](./South%20Dakota.md): 66 counties
- [Tennessee](./Tennessee.md): 95 counties
- [Texas](./Texas.md): 254 counties
- [Utah](./Utah.md): 29 counties
- [Vermont](./Vermont.md): 256 towns
- [Virginia](./Virginia.md): 133 counties
- [Washington](./Washington.md): 39 counties
- [West Virginia](./West%20Virginia.md): 55 counties
- [Wisconsin](./Wisconsin.md): 72 counties
- [Wyoming](./Wyoming.md): 23 counties
- [American Samoa](./American%20Samoa.md): 1 county
- [Guam](./Guam.md): 1 county
- [Northern Mariana Islands](./Northern%20Mariana%20Islands.md): 1 county
- [Puerto Rico](./Puerto%20Rico.md): 78 counties
- [U.S. Virgin Islands](./U.S.%20Virgin%20Islands.md): 3 counties
- [Gone](./Gone.md): 16 places HUD no longer lists
