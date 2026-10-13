// lihtc/README.md, written by the importer: what the database is, how it is
// written and keyed, how to ask (with the join to the rents), the changes,
// the source and its notice, the states.

exports.text = ({ counts, states, changes }) => `# Low-Income Housing Tax Credit projects, 1987 to 2024

HUD's National Low-Income Housing Tax Credit database: ${counts.projects} projects placed in service from 1987 to 2024, a project a record, as the state housing finance agencies that allocate the credits reported them to HUD (its release of April 2026). Each project: its name, address and place on the map, its county and census tracts, the year it was placed in service and its credits allocated, its units by bedroom count and how many are for low-income households, the income ceiling it elected, and the other help it had (HOME, CDBG, tax-exempt bonds, rural loans, rental assistance). Part of databook-hud: data only, printable as a book and queryable as tables.

## What the credits are

Since the Tax Reform Act of 1986 the federal government has given each state tax credits to allocate to developers of rental housing, who sell them to investors for the money to build or rehabilitate. In return a project keeps some or all of its units for households under an income ceiling (50% or 60% of the area median gross income, or since 2018 an average of its units' ceilings), at rents capped to match, for at least 30 years. The ceilings are reckoned from HUD's income limits, which this databook also holds (\`limits/\`).

## How it is written

A page a project, as a reader finds it: a state's page (\`Ohio.md\`) lists its counties; a county's page (\`Ohio/Franklin County.md\`) its projects; and a folder beside it a project's page each (\`Ohio/Franklin County/<project> (<HUD ID>).md\`). The listing pages are records of their own, \`# Tax Credit Projects: <name>\`, with their counts; their tables are gathered as \`Tax_Credit_Projects_Counties\` and \`Tax_Credit_Projects_Projects\`.

A project is filed under the state HUD addresses it in and the county its tract names. ${counts.unplaced} projects have no county in their state: HUD gives no tract for ${counts.unplaced - counts.elsewhere}, and for ${counts.elsewhere} a tract in another state; they are under each state's \`County not given\`.

Each project is a record, \`# Project: <name> (<HUD ID>)\`, keyed by \`- HUD ID:\`, HUD's eleven-character id (the allocating agency, the year placed in service, the years late it was reported, a record number). Where HUD's own note on the record names the id it had before, it is \`- HUD ID before:\` (${counts.ids_before}). Every column of HUD's row is a key, blank where HUD gives nothing, in words its dictionary gives:

- **County FIPS**, five digits, from the latest census tract HUD gives that names a county: 2020's, else 2010's, 2000's or 1990's (\`- County from:\`; ${counts.county_from.replace(/:/g, ': ').replace(/ (?=\d{4}:|none:)/g, ', ')}). A county code of an older census may be one since changed (Valdez-Cordova, AK; Bedford city, VA).
- **Tract** 2020, 2010, 2000 and 1990, eleven digits as HUD writes them, blank where HUD writes \`X\` for one missing (the county of a census whose tract is missing is not kept apart; the latest is \`County FIPS\`); **ZIP**, five digits, and **ZIP extension**, the four HUD gives after a dash for some; **Place**, the Census place codes, written five digits (four for 1990's), as HUD's spreadsheet stores them as numbers.
- **Year placed in service** and **Allocation year**: blank where HUD writes 8888 (placed in service not confirmed) or 9999 (confirmed, year not given), and said so in \`- Placed in service note:\` and \`- Allocation year note:\`. A few projects are placed in service after 2024, as HUD has them.
- **Units** and **Low-income units** are HUD's own reckoning (\`N_UNITSR\`, \`LI_UNITR\`: the total, or the low-income count where the total is missing or inconsistent); **Units reported** and **Low-income reported**, what the agency reported.
- The codes, spelled: Yes and No; Income ceiling (50% AMGI, 60% AMGI, Income average, Not reported); Construction; Credit (30 or 70 percent present value); Metro; DDA (difficult development area); QCT (qualified census tract, in the census tracts of the year placed in service); Rental assistance; Record status (New, Updated, or Existing, unchanged, since HUD's last release). A code the dictionary does not give is left as HUD writes it: ${counts.bare_codes} such (FHA 4; a reason no longer monitored, 4). HUD's dictionary describes \`RAD\` as "Housing Trust Fund funds", a slip it seems; the column is written as RAD, as HUD names it.

Questions HUD began to ask later are blank before: HOME, CDBG, FHA, HOPE VI and the population targeted from the 2003 projects; the income ceiling, units below it, the HOME and CDBG amounts and rental assistance from 2006; TCAP and TCEP from 2012; scattered sites, resyndication, HTF, RAD and opportunity zone funds from 2018.

## How to ask

\`Project\` is one table, a row a project; \`Tax Credit Projects\` the states and counties.

\`\`\`sql
-- the largest projects, by low-income units
select Project, City, State, "Year placed in service", "Low-income units"
from Project order by "Low-income units" desc limit 10
\`\`\`

\`\`\`sql
-- projects and low-income units placed in service each year, and how many elected income averaging
select "Year placed in service" as year, count(*) as projects, sum("Low-income units") as "Low-income units",
  count(*) filter (where "Income ceiling" = 'Income average') as "Income average"
from Project where "Year placed in service" is not null group by year order by year desc limit 12
\`\`\`

\`\`\`sql
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
\`\`\`

\`\`\`sql
-- the counties with the most low-income units, with their very low income limit for four, FY2026
select r.name, count(*) as projects, sum(p."Low-income units") as "Low-income units", v."2026" as "Very low income, 4"
from Project p
join Limits r on r.FIPS = p."County FIPS" * 100000 + 99999
join Limits_Very_low_income_50 v on v.record = r.name and v.Persons = 4
group by all order by "Low-income units" desc limit 10
\`\`\`

\`County FIPS\` is gathered as a number, so its leading zero goes; the rents and the limits key a county as its five digits and \`99999\`, so \`"County FIPS" * 100000 + 99999\` is their \`FIPS\`. In New England HUD keys its rents and limits by town, not county, and HUD's tax credit file names no town: a New England project joins its county's listing page in the rents (\`"Fair Market Rents"."County FIPS"\`), and its towns. Connecticut's projects carry the county codes of the 2020 Census (09001 and the like), as the rents' and limits' towns keep them in \`FIPS 2024\`.

## Changes

Where HUD's dictionary changes what a column or the key means, in full in [Changes](./Changes.md):

${changes.map((c) => `- ${c.year}: ${c.title}`).join('\n')}

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: *Low-Income Housing Tax Credit (LIHTC): Property Level Data*, <https://www.huduser.gov/portal/datasets/lihtc/property.html>, \`lihtcpub.zip\` (\`LIHTCPUB.xlsx\`, ${counts.source.rows} projects, and \`LIHTC Data Dictionary 2024.pdf\`). Its multi-address file (\`LIHTCPUB_BIN.xlsx\`, a row a building) is not written here. Written by the importer (\`.import/lihtc/\`); nothing here is edited by hand.

Notice of use: HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). HUD gathers them from the allocating agencies and says they may be incomplete; HUD's own figures are those it publishes, not these copies. This databook is not HUD's, nor endorsed by it.

## The states

${states.map(([name, p, c]) => `- [${name}](./${encodeURIComponent(name)}.md): ${p} projects, ${c} ${c === 1 ? 'county' : 'counties'}`).join('\n')}
`;
