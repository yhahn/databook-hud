# Fair Market Rents, 1983 to 2027

Every county's Fair Market Rents from HUD, fiscal years 1983 to 2027 (44 years; there was no FY1984), by bedroom count: 4764 places, 3161 counties and 1603 New England towns, in the states, the District of Columbia, Puerto Rico and the territories. Data only, printable as a book and queryable as tables: a file a state, a record a place, and proper gathers them into DuckDB.

## What a Fair Market Rent is

A Fair Market Rent (FMR) is what HUD reckons a modest, decent home costs to rent in an area: the 40th percentile gross rent (rent and utilities) of standard-quality units, set each fiscal year for each metropolitan area and each county outside one. It is the yardstick for Housing Choice Vouchers (Section 8) and other HUD programs. It was the 45th percentile until FY1995; from FY2001 to FY2019 some costly areas were set at the 50th. A county takes the rents of its FMR area, so all the counties of one metro area have the same rents. In New England HUD draws its areas by town, not county, so there each town is a place of its own.

## How it is written

Each place is a record, `### County: <name>, <ST>` (towns too, with `- Level: Town`), keyed by `- FIPS:`, the ten digits HUD writes (state, county, county subdivision; `99999` for a whole county). Its rents are a card, a row a bedroom count and a column a year; empty where HUD gives none. Its `#### Areas` are the runs of years it sat in one FMR area: HUD names areas only from FY2022, so older runs give the code alone, and a new code is not always a move (HUD renumbered every area in FY2006). `- Area changes:` counts the years its code changed, leaving out 2006.

## How to ask

Every place's rents are one table, `County_table`, a row a place and bedroom count:

```sql
-- two-bedroom rents in Manhattan and Onondaga County, then and now
select record, "1983", "2000", "2027" from County_table
where Bedrooms = 2 and record in ('New York County, NY', 'Onondaga County, NY')
```

```sql
-- the dearest two-bedroom FMRs this year, with each place's area
select t.record, c."FMR area", t."2027" from County_table t join County c on c.name = t.record
where t.Bedrooms = 2 order by t."2027" desc limit 10
```

```sql
-- the places that have sat in the most FMR areas
select name, "Area changes" from County order by "Area changes" desc limit 10
```

`FIPS` is gathered as a number, so its leading zero goes; `lpad(cast("FIPS" as varchar), 10, '0')` gives it back.

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: *FMR History 1983 - Present: All Bedroom Unit data*, `FMR_All_1983_2027.csv`, from <https://www.huduser.gov/portal/datasets/fmr.html>, with its Read Me (updated August 2025). Written here by the importer (`.import/`); nothing here is edited by hand.

Notice of use: HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). HUD User's notice: reference to a product or firm is not endorsement by HUD. This databook is not HUD's, nor endorsed by it.

## The states

- [Alabama](./Alabama.md): 67 counties
- [Alaska](./Alaska.md): 30 counties
- [American Samoa](./American%20Samoa.md): 1 county
- [Arizona](./Arizona.md): 15 counties
- [Arkansas](./Arkansas.md): 75 counties
- [California](./California.md): 58 counties
- [Colorado](./Colorado.md): 64 counties
- [Connecticut](./Connecticut.md): 169 towns
- [Delaware](./Delaware.md): 3 counties
- [District of Columbia](./District%20of%20Columbia.md): 1 county
- [Florida](./Florida.md): 67 counties
- [Georgia](./Georgia.md): 159 counties
- [Guam](./Guam.md): 1 county
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
- [Northern Mariana Islands](./Northern%20Mariana%20Islands.md): 1 county
- [Ohio](./Ohio.md): 88 counties
- [Oklahoma](./Oklahoma.md): 77 counties
- [Oregon](./Oregon.md): 36 counties
- [Pennsylvania](./Pennsylvania.md): 67 counties
- [Puerto Rico](./Puerto%20Rico.md): 78 counties
- [Rhode Island](./Rhode%20Island.md): 39 towns
- [South Carolina](./South%20Carolina.md): 46 counties
- [South Dakota](./South%20Dakota.md): 66 counties
- [Tennessee](./Tennessee.md): 95 counties
- [Texas](./Texas.md): 254 counties
- [U.S. Virgin Islands](./U.S.%20Virgin%20Islands.md): 3 counties
- [Utah](./Utah.md): 29 counties
- [Vermont](./Vermont.md): 256 towns
- [Virginia](./Virginia.md): 133 counties
- [Washington](./Washington.md): 39 counties
- [West Virginia](./West%20Virginia.md): 55 counties
- [Wisconsin](./Wisconsin.md): 72 counties
- [Wyoming](./Wyoming.md): 23 counties
