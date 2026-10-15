# HUD: rents, income limits and tax credit housing

Two of HUD's yardsticks for housing help, for every county and New England town, year by year: what a modest home costs to rent (the Fair Market Rents) and the incomes under which a household may have help (the Income Limits). Data only, printable as a book and queryable as tables: a folder a dataset, and in it a page a place, as a reader finds it: a state's page listing its places (`rents/Alabama.md`), a folder of them beside it (`rents/Alabama/Autauga County.md`), and in New England a county's page and folder between (`rents/Maine/Penobscot County/Bangor city.md`); proper gathers them into DuckDB. Both are keyed by the same ten-digit FIPS, so a place's rent and its limits join. Beside them, the housing those yardsticks govern: every project built or kept with the Low-Income Housing Tax Credit, a page a project, filed by state and county, its county's FIPS joining the rents and the limits.

## The datasets

- [Fair Market Rents](./rents/README.md), FY1983 to FY2027: 4764 places (3161 counties, 1603 New England towns), `### Rents:`, their rents by bedroom count as HUD set them: at the 40th percentile, or, for some costly areas in FY2001 to FY2019, the 50th, marked in each place's Areas.
- [Income Limits](./limits/README.md), FY1998 to FY2026: 4764 places as HUD lists them now and 16 it no longer lists, `### Limits:`, their median family income and limits by household size; and 125 county rows from before FY2006 that no place's record can hold (New England's, keyed by county then, and one Missouri county split in two), `### County before 2006:`; and 2 second listings of a county inside another area (Rockland and Westchester, NY, FY2006 to 2020), `### Second listing:`, each on its county's page.
- [Low-Income Housing Tax Credit projects](./lihtc/README.md), placed in service 1987 to 2024: 55345 projects in 2865 counties, `# Project:`, keyed by HUD's id: each its address, tracts, units by bedroom count, income ceiling and other help, and its county's five-digit FIPS.

Each dataset is written by its own importer, in `.import/rents/` (Python), `.import/limits/` and `.import/lihtc/` (Node); nothing here is edited by hand.

[Questions and answers](./FAQ.md): 26 questions a reader of this book can answer, from one rent in one place to what changed and why, each with its answer and the page to look in.

## Rent against income

A family of four at the very low income limit, and what a two-bedroom Fair Market Rent takes of its income, FY2026: the rents and the limits joined on FIPS.

```sql
select l.name, v."2026" as "Very low income, 4", r."2026" as "Two-bedroom rent",
  round(100 * 12 * r."2026" / v."2026") as "Rent, % of income"
from Limits l
join Limits_Very_low_income_50 v on v.record = l.name and v.Persons = 4
join Rents rp on rp.FIPS = l.FIPS
join Rents_Fair_Market_Rents r on r.record = rp.name and r.Bedrooms = 2
order by "Rent, % of income" desc limit 10
```

```sql
-- the same, a state at a time: the median share across its places
select l.State, count(*) as places,
  round(median(100 * 12 * r."2026" / v."2026")) as "Median rent, % of income"
from Limits l
join Limits_Very_low_income_50 v on v.record = l.name and v.Persons = 4
join Rents rp on rp.FIPS = l.FIPS
join Rents_Fair_Market_Rents r on r.record = rp.name and r.Bedrooms = 2
group by l.State order by "Median rent, % of income" desc limit 10
```

`FIPS` is gathered as a number in both, so the leading zero goes alike and the join holds; `lpad(cast("FIPS" as varchar), 10, '0')` gives it back.

## Tax credit housing against rents

The counties with the dearest two-bedroom Fair Market Rent, FY2027, and the tax credit housing in each: the projects joined to the rents on the county's FIPS (its five digits and `99999`, the rents' key for a county).

```sql
select r.name, f."2027" as "Two-bedroom rent", count(p."HUD ID") as projects,
  sum(p."Low-income units") as "Low-income units"
from Rents r
join Rents_Fair_Market_Rents f on f.record = r.name and f.Bedrooms = 2
left join Project p on p."County FIPS" * 100000 + 99999 = r.FIPS
where r.Level = 'County'
group by all order by "Two-bedroom rent" desc limit 10
```

## Changes

Where HUD changed a definition or a key during a dataset's years, the latest form is in the cards and the older only in tables of their own, never spliced. A setting HUD made place by place, on and off (the rents' 50th percentile, FY2001 to FY2019), is the value's own: the rents are in the card as set, the setting marked beside them, and its start and end are said as changes. Every change is a record, `### Change:`, in the dataset's Changes page ([rents](./rents/Changes.md), [limits](./limits/Changes.md), [tax credits](./lihtc/Changes.md)). A tax credit project is one record of one year, so nothing in it is split: its changes are said, and its columns read with them.

- Fair Market Rents, 1995: Percentile, 45th to 40th
- Fair Market Rents, 2001: Some areas at the 50th percentile
- Fair Market Rents, 2005: HUD's nonmetropolitan mark
- Fair Market Rents, 2006: Areas renumbered
- Fair Market Rents, 2020: The 50th percentile ended
- Fair Market Rents, 2026: Connecticut's planning regions
- Fair Market Rents, 2027: New England town codes
- Income Limits, 2003: HUD's nonmetropolitan mark
- Income Limits, 2006: New England keyed by town
- Income Limits, 2006: Areas renumbered
- Income Limits, 2010: Places recoded, listed or dropped
- Income Limits, 2013: Places recoded, listed or dropped
- Income Limits, 2014: Extremely low income redefined
- Income Limits, 2016: Places recoded, listed or dropped
- Income Limits, 2017: Places recoded, listed or dropped
- Income Limits, 2018: Places recoded, listed or dropped
- Income Limits, 2019: Places recoded, listed or dropped
- Income Limits, 2020: Places recoded, listed or dropped
- Income Limits, 2021: Places recoded, listed or dropped
- Income Limits, 2022: Places recoded, listed or dropped
- Income Limits, 2023: Places recoded, listed or dropped
- Income Limits, 2025: Connecticut's planning regions
- Income Limits, 2025: Places recoded, listed or dropped
- Income Limits, 2026: Places recoded, listed or dropped
- Tax Credit Projects, 2004: Qualified census tracts on the 2000 tracts
- Tax Credit Projects, 2013: Qualified census tracts on the 2010 tracts
- Tax Credit Projects, 2015: HUD ID gains a digit
- Tax Credit Projects, 2018: Income averaging

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: <https://www.huduser.gov/portal/datasets/fmr.html> <https://www.huduser.gov/portal/datasets/il.html> and <https://www.huduser.gov/portal/datasets/lihtc/property.html>. HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). This databook is not HUD's, nor endorsed by it.
