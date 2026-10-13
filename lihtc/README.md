# Low-Income Housing Tax Credit projects, 1987 to 2024

HUD's National Low-Income Housing Tax Credit database: 55345 projects placed in service from 1987 to 2024, a project a record, as the state housing finance agencies that allocate the credits reported them to HUD (its release of April 2026). Each project: its name, address and place on the map, its county and census tracts, the year it was placed in service and its credits allocated, its units by bedroom count and how many are for low-income households, the income ceiling it elected, and the other help it had (HOME, CDBG, tax-exempt bonds, rural loans, rental assistance). Part of databook-hud: data only, printable as a book and queryable as tables.

## What the credits are

Since the Tax Reform Act of 1986 the federal government has given each state tax credits to allocate to developers of rental housing, who sell them to investors for the money to build or rehabilitate. In return a project keeps some or all of its units for households under an income ceiling (50% or 60% of the area median gross income, or since 2018 an average of its units' ceilings), at rents capped to match, for at least 30 years. The ceilings are reckoned from HUD's income limits, which this databook also holds (`limits/`).

## How it is written

A page a project, as a reader finds it: a state's page (`Ohio.md`) lists its counties; a county's page (`Ohio/Franklin County.md`) its projects; and a folder beside it a project's page each (`Ohio/Franklin County/<project> (<HUD ID>).md`). The listing pages are records of their own, `# Tax Credit Projects: <name>`, with their counts; their tables are gathered as `Tax_Credit_Projects_Counties` and `Tax_Credit_Projects_Projects`.

A project is filed under the state HUD addresses it in and the county its tract names. 350 projects have no county in their state: HUD gives no tract for 340, and for 10 a tract in another state; they are under each state's `County not given`.

Each project is a record, `# Project: <name> (<HUD ID>)`, keyed by `- HUD ID:`, HUD's eleven-character id (the allocating agency, the year placed in service, the years late it was reported, a record number). Where HUD's own note on the record names the id it had before, it is `- HUD ID before:` (138). Every column of HUD's row is a key, blank where HUD gives nothing, in words its dictionary gives:

- **County FIPS**, five digits, from the latest census tract HUD gives that names a county: 2020's, else 2010's, 2000's or 1990's (`- County from:`; none: 340, 2020: 44435, 2010: 8726, 2000: 1843, 1990: 1). A county code of an older census may be one since changed (Valdez-Cordova, AK; Bedford city, VA).
- **Tract** 2020, 2010, 2000 and 1990, eleven digits as HUD writes them, blank where HUD writes `X` for one missing (the county of a census whose tract is missing is not kept apart; the latest is `County FIPS`); **ZIP**, five digits, and **ZIP extension**, the four HUD gives after a dash for some; **Place**, the Census place codes, written five digits (four for 1990's), as HUD's spreadsheet stores them as numbers.
- **Year placed in service** and **Allocation year**: blank where HUD writes 8888 (placed in service not confirmed) or 9999 (confirmed, year not given), and said so in `- Placed in service note:` and `- Allocation year note:`. A few projects are placed in service after 2024, as HUD has them.
- **Units** and **Low-income units** are HUD's own reckoning (`N_UNITSR`, `LI_UNITR`: the total, or the low-income count where the total is missing or inconsistent); **Units reported** and **Low-income reported**, what the agency reported.
- The codes, spelled: Yes and No; Income ceiling (50% AMGI, 60% AMGI, Income average, Not reported); Construction; Credit (30 or 70 percent present value); Metro; DDA (difficult development area); QCT (qualified census tract, in the census tracts of the year placed in service); Rental assistance; Record status (New, Updated, or Existing, unchanged, since HUD's last release). A code the dictionary does not give is left as HUD writes it: 57 such (FHA 4; a reason no longer monitored, 4). HUD's dictionary describes `RAD` as "Housing Trust Fund funds", a slip it seems; the column is written as RAD, as HUD names it.

Questions HUD began to ask later are blank before: HOME, CDBG, FHA, HOPE VI and the population targeted from the 2003 projects; the income ceiling, units below it, the HOME and CDBG amounts and rental assistance from 2006; TCAP and TCEP from 2012; scattered sites, resyndication, HTF, RAD and opportunity zone funds from 2018.

## How to ask

`Project` is one table, a row a project; `Tax Credit Projects` the states and counties.

```sql
-- the largest projects, by low-income units
select Project, City, State, "Year placed in service", "Low-income units"
from Project order by "Low-income units" desc limit 10
```

```sql
-- projects and low-income units placed in service each year, and how many elected income averaging
select "Year placed in service" as year, count(*) as projects, sum("Low-income units") as "Low-income units",
  count(*) filter (where "Income ceiling" = 'Income average') as "Income average"
from Project where "Year placed in service" is not null group by year order by year desc limit 12
```

```sql
-- a county's projects against its rents: Onondaga County, NY, each project with the county's two-bedroom
-- Fair Market Rent in the year it was placed in service (the rents joined on the county's FIPS)
with rent as (
  select record, cast(y as int) as y, v from (unpivot (select * exclude (_file, _line) from Rents_Fair_Market_Rents
    where Bedrooms = 2) on columns('^[0-9]+$') into name y value v))
select p.Project, p."Year placed in service", p."Low-income units", rent.v as "Two-bedroom rent that year"
from Project p
join Rents r on r.FIPS = p."County FIPS" * 100000 + 99999
join rent on rent.record = r.name and rent.y = p."Year placed in service"
where p."County FIPS" = 36067
order by p."Year placed in service" desc limit 10
```

```sql
-- the counties with the most low-income units, with their very low income limit for four, FY2026
select r.name, count(*) as projects, sum(p."Low-income units") as "Low-income units", v."2026" as "Very low income, 4"
from Project p
join Limits r on r.FIPS = p."County FIPS" * 100000 + 99999
join Limits_Very_low_income_50 v on v.record = r.name and v.Persons = 4
group by all order by "Low-income units" desc limit 10
```

`County FIPS` is gathered as a number, so its leading zero goes; the rents and the limits key a county as its five digits and `99999`, so `"County FIPS" * 100000 + 99999` is their `FIPS`. In New England HUD keys its rents and limits by town, not county, and HUD's tax credit file names no town: a New England project joins its county's listing page in the rents (`"Fair Market Rents"."County FIPS"`), and its towns. Connecticut's projects carry the county codes of the 2020 Census (09001 and the like), as the rents' and limits' towns keep them in `FIPS 2024`.

## Changes

Where HUD's dictionary changes what a column or the key means, in full in [Changes](./Changes.md):

- 2004: Qualified census tracts on the 2000 tracts
- 2013: Qualified census tracts on the 2010 tracts
- 2015: HUD ID gains a digit
- 2018: Income averaging

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: *Low-Income Housing Tax Credit (LIHTC): Property Level Data*, <https://www.huduser.gov/portal/datasets/lihtc/property.html>, `lihtcpub.zip` (`LIHTCPUB.xlsx`, 55345 projects, and `LIHTC Data Dictionary 2024.pdf`). Its multi-address file (`LIHTCPUB_BIN.xlsx`, a row a building) is not written here. Written by the importer (`.import/lihtc/`); nothing here is edited by hand.

Notice of use: HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). HUD gathers them from the allocating agencies and says they may be incomplete; HUD's own figures are those it publishes, not these copies. This databook is not HUD's, nor endorsed by it.

## The states

- [Alabama](./Alabama.md): 834 projects, 67 counties
- [Alaska](./Alaska.md): 187 projects, 19 counties
- [American Samoa](./American%20Samoa.md): 119 projects, 1 county
- [Arizona](./Arizona.md): 593 projects, 14 counties
- [Arkansas](./Arkansas.md): 738 projects, 75 counties
- [California](./California.md): 5185 projects, 57 counties
- [Colorado](./Colorado.md): 872 projects, 48 counties
- [Connecticut](./Connecticut.md): 455 projects, 8 counties
- [Delaware](./Delaware.md): 180 projects, 3 counties
- [District of Columbia](./District%20of%20Columbia.md): 268 projects, 1 county
- [Florida](./Florida.md): 1571 projects, 63 counties
- [Georgia](./Georgia.md): 1666 projects, 148 counties
- [Guam](./Guam.md): 15 projects, 1 county
- [Hawaii](./Hawaii.md): 144 projects, 4 counties
- [Idaho](./Idaho.md): 288 projects, 36 counties
- [Illinois](./Illinois.md): 1556 projects, 93 counties
- [Indiana](./Indiana.md): 1353 projects, 91 counties
- [Iowa](./Iowa.md): 757 projects, 85 counties
- [Kansas](./Kansas.md): 738 projects, 88 counties
- [Kentucky](./Kentucky.md): 913 projects, 114 counties
- [Louisiana](./Louisiana.md): 1117 projects, 63 counties
- [Maine](./Maine.md): 380 projects, 16 counties
- [Maryland](./Maryland.md): 948 projects, 24 counties
- [Massachusetts](./Massachusetts.md): 1057 projects, 13 counties
- [Michigan](./Michigan.md): 1720 projects, 78 counties
- [Minnesota](./Minnesota.md): 1144 projects, 75 counties
- [Mississippi](./Mississippi.md): 926 projects, 80 counties
- [Missouri](./Missouri.md): 1930 projects, 104 counties
- [Montana](./Montana.md): 321 projects, 41 counties
- [Nebraska](./Nebraska.md): 593 projects, 64 counties
- [Nevada](./Nevada.md): 353 projects, 14 counties
- [New Hampshire](./New%20Hampshire.md): 284 projects, 10 counties
- [New Jersey](./New%20Jersey.md): 1760 projects, 21 counties
- [New Mexico](./New%20Mexico.md): 318 projects, 28 counties
- [New York](./New%20York.md): 4144 projects, 61 counties
- [North Carolina](./North%20Carolina.md): 2900 projects, 97 counties
- [North Dakota](./North%20Dakota.md): 254 projects, 25 counties
- [Northern Mariana Islands](./Northern%20Mariana%20Islands.md): 5 projects, 1 county
- [Ohio](./Ohio.md): 2142 projects, 88 counties
- [Oklahoma](./Oklahoma.md): 622 projects, 75 counties
- [Oregon](./Oregon.md): 754 projects, 32 counties
- [Pennsylvania](./Pennsylvania.md): 2025 projects, 66 counties
- [Puerto Rico](./Puerto%20Rico.md): 245 projects, 63 counties
- [Rhode Island](./Rhode%20Island.md): 205 projects, 5 counties
- [South Carolina](./South%20Carolina.md): 890 projects, 46 counties
- [South Dakota](./South%20Dakota.md): 313 projects, 36 counties
- [Tennessee](./Tennessee.md): 1176 projects, 95 counties
- [Texas](./Texas.md): 2999 projects, 196 counties
- [U.S. Virgin Islands](./U.S.%20Virgin%20Islands.md): 33 projects, 3 counties
- [Utah](./Utah.md): 561 projects, 25 counties
- [Vermont](./Vermont.md): 355 projects, 13 counties
- [Virginia](./Virginia.md): 1266 projects, 116 counties
- [Washington](./Washington.md): 1430 projects, 37 counties
- [West Virginia](./West%20Virginia.md): 376 projects, 51 counties
- [Wisconsin](./Wisconsin.md): 1234 projects, 69 counties
- [Wyoming](./Wyoming.md): 133 projects, 18 counties
