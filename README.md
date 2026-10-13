# HUD: rents and income limits

Two of HUD's yardsticks for housing help, for every county and New England town, year by year: what a modest home costs to rent (the Fair Market Rents) and the incomes under which a household may have help (the Income Limits). Data only, printable as a book and queryable as tables: a folder a dataset, a file a state, a record a place, and proper gathers them into DuckDB. Both are keyed by the same ten-digit FIPS, so a place's rent and its limits join.

## The datasets

- [Fair Market Rents](./rents/README.md), FY1983 to FY2027: 4764 places (3161 counties, 1603 New England towns), `### Rents:`, their rents by bedroom count.
- [Income Limits](./limits/README.md), FY1998 to FY2026: 4764 places as HUD lists them now and 18 it no longer lists, `### Limits:`, their median family income and limits by household size; and 125 county rows from before FY2006 that no place's record can hold (New England's, keyed by county then, and one Missouri county split in two), `### County before 2006:`.

Each dataset is written by its own importer, in `.import/rents/` (Python) and `.import/limits/` (Node); nothing here is edited by hand.

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

## Changes

Where HUD changed a definition or a key during a dataset's years, the latest form is in the cards and the older only in tables of their own, never spliced; each change is a record, `### Change:`, in the dataset's Changes page ([rents](./rents/Changes.md), [limits](./limits/Changes.md)).

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

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: <https://www.huduser.gov/portal/datasets/fmr.html> and <https://www.huduser.gov/portal/datasets/il.html>. HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). This databook is not HUD's, nor endorsed by it.
