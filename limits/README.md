# Income Limits, 1998 to 2026

HUD's Section 8 income limits for every county, fiscal years 1998 to 2026: the area median family income, and the household incomes under which a family counts as extremely low, very low and low income, for households of one to eight. 4764 places as HUD keys them in FY2026 (counties, and New England towns), and 18 more that HUD has since stopped listing. Data only, printable as a book and queryable as tables: a file a state, a record a place, and proper gathers them into DuckDB.

## What the limits are

Each year HUD sets, for each metropolitan area and each county outside one, the incomes that decide who may have help with housing: a voucher (Section 8), public housing, and the many programs that borrow the same lines.

- **Very low income (50%)** starts from half the area's median family income for a family of four, adjusted for high or low housing costs, and for household size.
- **Low income (80%)** starts from 80% of the median, likewise adjusted, and is capped near the national median.
- **Extremely low income (30%)** is 30/50ths of the very low income limit. From FY2014 the law (the Consolidated Appropriations Act, 2014) made it the greater of that and the federal poverty guideline for the household size, but never above the very low income limit: that is why from 2014 the larger households' figures jump. Before FY2014 the column holds the plain 30% limit, which HUD has published since FY1999 (after the Quality Housing and Work Responsibility Act of 1998); FY1998 has none.
- **Median family income** is HUD's estimate of the area's median, the figure the limits start from.

A county takes the limits of its area, so all the counties of one metropolitan area have the same limits. Until FY2010 HUD held an area's limits at the year before's where they would have fallen ("hold harmless"); since FY2009 it caps a year's rise.

## How it is written

Each place is a record, `### County: <name>, <ST>` (towns too, with `- Level: Town`), keyed by `- FIPS:`, the ten digits HUD writes (state, county, county subdivision; `99999` for a whole county): the same key as the Fair Market Rents databook, so a place's rents and its income limits join. Each record has four cards, a column a fiscal year and, for the limits, a row a household size, one to eight; empty where HUD gives none. Its `#### Areas` are the runs of years it sat in one HUD area (HUD's MSA numbers before FY2006, its area codes since).

Where a place's FIPS changed, it is followed: Connecticut's towns moved to planning-region codes in FY2023 (`- FIPS 2024:` keeps the old county code, as the rents do), and some Maine, Massachusetts and Vermont towns and three counties were renamed with new codes (`- FIPS before:`). Places HUD stopped listing (a county split or merged, a town deorganized, a part listed twice) are records of their own, with `- Last year:`.

**Before FY2006** HUD keyed its limits by county and MSA, not by town, though it drew New England's areas by town, so a New England county could lie in several areas. A place before FY2006 takes its county's limits where the county lay wholly in one area. Where it was split (89 to 91 of HUD's rows a year, all in 33 New England counties), its years before 2006 are empty: the source cannot say which part a town was in.

## How to ask

Each card is one table across the country, a row a place and household size: `County_Extremely_low_income_30`, `County_Very_low_income_50`, `County_Low_income_80`; and `County_Median_family_income`, a row a place.

```sql
-- a family of four's very low income limit, then and now, in Manhattan and Onondaga County
select record, "1998", "2006", "2026" from County_Very_low_income_50
where Persons = 4 and record in ('New York County, NY', 'Onondaga County, NY')
```

```sql
-- the highest area median family incomes this year
select record, "2026" from County_Median_family_income order by "2026" desc limit 10
```

With the Fair Market Rents databook beside it: a family of four at the very low income limit, and what a two-bedroom rent takes of its income.

```sql
select l.record, l."2026" as "Very low income, 4", r."2026" as "Two-bedroom rent",
  round(100 * 12 * r."2026" / l."2026") as "Rent, % of income"
from County_Very_low_income_50 l
join County c on c.name = l.record
join "repo_databook-hud-rents".County rc on rc.FIPS = c.FIPS
join "repo_databook-hud-rents".County_table r on r.record = rc.name and r.Bedrooms = 2
where l.Persons = 4
order by "Rent, % of income" desc limit 10
```

`FIPS` is gathered as a number, so its leading zero goes (in both databooks alike, so the join holds); `lpad(cast("FIPS" as varchar), 10, '0')` gives it back.

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: *Income Limits*, <https://www.huduser.gov/portal/datasets/il.html>, the Section 8 file of each year (FY1998–2000 text; FY2001–2013 `.xls`; FY2014 `Poverty.xls`, the extremely low income limits; FY2015 on `.xlsx`). Written here by the importer (`.import/`); nothing here is edited by hand.

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
- [Virgin Islands](./Virgin%20Islands.md): 3 counties
