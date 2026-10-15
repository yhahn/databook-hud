# Fair Market Rents, 1983 to 2027

Every county's Fair Market Rents from HUD, fiscal years 1983 to 2027 (44 years; there was no FY1984), by bedroom count: 4764 places, 3161 counties and 1603 New England towns, in the states, the District of Columbia, Puerto Rico and the territories. Part of databook-hud: data only, printable as a book and queryable as tables.

## What a Fair Market Rent is

A Fair Market Rent (FMR) is what HUD reckons a modest, decent home costs to rent in an area: the 40th percentile gross rent (rent and utilities) of standard-quality units, set each fiscal year for each metropolitan area and each county outside one. It is the yardstick for Housing Choice Vouchers (Section 8) and other HUD programs. A county takes the rents of its FMR area, so all the counties of one metro area have the same rents. In New England HUD draws its areas by town, not county, so there each town is a place of its own.

## How it is written

A page a place, as a reader finds it: `Alabama/Autauga County.md`; in New England, where HUD's places are towns, `Maine/Penobscot County/Bangor city.md` (Connecticut's under its planning regions). A state's page (`Alabama.md`) lists its places, or in New England its counties, and a New England county's page its towns, linked, in a table gathered as `Fair_Market_Rents_Places`. A page is named for its place, a slash a dash; a name two pages of one folder would share takes its FIPS. The changes are a page each, in `Changes/`, listed in [Changes](./Changes.md).

Each place is a record, `# Rents: <name>, <ST>` (towns too, with `- Level: Town`), keyed by `- FIPS:`, the ten digits HUD writes (state, county, county subdivision; `99999` for a whole county). Its card, **Fair Market Rents**, holds its rents as HUD set them from FY1995, a row a bedroom count and a column a year: at the 40th percentile, the definition since FY1995, or, for some costly areas in some years from FY2001 to FY2019, at the 50th. The rent HUD set was the legal rent that year, so it is in the card, and the percentile is marked beside it, in the place's `#### Areas`. The years before FY1995, at the 45th percentile for every place, are kept beside the card, never in it: `#### 45th percentile, 1983 to 1994`. Its `#### Areas` are the runs of years it sat in one FMR area at one percentile: HUD names areas only from FY2022, so older runs give the code alone. `- Area changes:` counts the years its code changed, leaving out 2006.

## How to ask

Each table is one across the country, a row a place and bedroom count: `Rents_Fair_Market_Rents` and `Rents_45th_percentile_1983_to_1994`; and `Rents_Areas`, a row a run, with its `Percentile`.

```sql
-- two-bedroom rents in Manhattan and Onondaga County, 1995 and now
select record, "1995", "2010", "2027" from Rents_Fair_Market_Rents
where Bedrooms = 2 and record in ('New York County, NY', 'Onondaga County, NY')
```

```sql
-- the counties with the dearest two-bedroom FMRs this year, ties kept, with each one's area
select t.record, r."FMR area", t."2027" from Rents_Fair_Market_Rents t join Rents r on r.name = t.record
where t.Bedrooms = 2 and r.Level = 'County'
qualify rank() over (order by t."2027" desc) <= 10 order by t."2027" desc, t.record
```

```sql
-- the places set at the 50th percentile longest
select record, sum("To" - "From" + 1) as years
from Rents_Areas where Percentile = 50
group by record order by years desc, record limit 10
```

`FIPS` is gathered as a number, so its leading zero goes; `lpad(cast("FIPS" as varchar), 10, '0')` gives it back.

## Changes

Where HUD's file changes a definition or a key, in full in [Changes](./Changes.md):

- 1995: Percentile, 45th to 40th
- 2001: Some areas at the 50th percentile
- 2005: HUD's nonmetropolitan mark
- 2006: Areas renumbered
- 2020: The 50th percentile ended
- 2026: Connecticut's planning regions
- 2027: New England town codes

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: *FMR History 1983 - Present: All Bedroom Unit data*, `FMR_All_1983_2027.csv`, from <https://www.huduser.gov/portal/datasets/fmr.html>, with its Read Me (updated August 2025). Written here by the importer (`.import/rents/`); nothing here is edited by hand.

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
