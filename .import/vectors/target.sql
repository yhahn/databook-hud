-- V3: what proper gathers, checked against what the importers wrote
-- (.import/<dataset>/counts.json) and against the rules (SPEC B, K, D).
-- Each check: a name, what it should give ({rents.x} and {limits.x} are
-- read from counts.json), and one query giving one value. Played by
-- .import/target.py, which runs each with `proper query`.

-- name: B3 the keys of Rents
-- want: FIPS, FIPS 2024, FIPS before, Level, FMR area, Metro code, State, Census region, Area changes
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Rents' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B3 the keys of Limits
-- want: FIPS, FIPS 2024, FIPS before, FIPS earlier, Level, State, Area, Metro code, MSA, County before 2006, Last year
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Limits' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B3 the keys of County before 2006
-- want: County FIPS, State, MSA, Area, Towns
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'County before 2006' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B3 the keys of Second listing
-- want: FIPS, Listing of, State, Area, Metro code, First year, Last year
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Second listing' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B3 the keys of Change
-- want: Dataset, Boundary, Was, Now, Crosswalk, Places, Source
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Change' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B3 the keys of the listing pages, a state's or a New England county's, in both
-- want: Level, Postal code, State FIPS, County FIPS, Counties, Towns / Level, Postal code, State FIPS, County FIPS, Counties, Towns
select string_agg(k, ' / ' order by t) from (select table_name t, string_agg(column_name, ', ' order by ordinal_position) k
from information_schema.columns where table_name in ('Fair Market Rents', 'Income Limits')
and column_name not in ('name', '_file', '_line', '_end_line') group by t);

-- name: B3 the keys of Project (the tax credits)
-- want: HUD ID, HUD ID before, Project, Address, City, State, ZIP, ZIP extension, State project ID, Latitude, Longitude, County FIPS, County from, Tract 2020, Tract 2010, Tract 2000, Tract 1990, Place 2020, Place 2010, Place 2000, Place 1990, Year placed in service, Placed in service note, Allocation year, Allocation year note, Allocation amount, Units, Low-income units, Units reported, Low-income reported, Efficiencies, 1-bedroom units, 2-bedroom units, 3-bedroom units, 4-bedroom units, Construction, Credit, Income ceiling, Rents below ceiling, Units below ceiling, Affordable over 30 years, Affordability years, Non-profit sponsor, Increased basis, Tax-exempt bond, HUD multifamily aid, RHS 514 loan, RHS 515 loan, RHS 538 loan, HOME, HOME amount, CDBG, CDBG amount, TCAP, TCAP amount, TCEP, TCEP amount, HTF, HTF amount, FHA, HOPE VI, HOPE VI amount, RAD, QOZF, QOZF amount, Rental assistance, Targets a population, Families, Elderly, Disabled, Homeless, Other population, Other population named, Scattered site, Resyndicated, Metro, DDA, QCT, No longer monitored, Why no longer monitored, Why, other, Data note, Record status
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Project' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B3 the keys of the tax credits' listing pages, a state's or a county's
-- want: Level, Postal code, State FIPS, County FIPS, Counties, Projects, Units, Low-income units
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Tax Credit Projects' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B5 the kinds, each dataset its own
-- want: Change, County before 2006, Fair Market Rents, Income Limits, Limits, Project, Rents, Second listing, Tax Credit Projects
select string_agg(distinct table_name, ', ' order by table_name) from information_schema.columns
where column_name = '_end_line';

-- name: Rents records
-- want: {rents.records}
select count(*) from Rents;

-- name: Rents, one a FIPS
-- want: {rents.records}
select count(distinct FIPS) from Rents;

-- name: Limits records
-- want: {limits.records}
select count(*) from Limits;

-- name: Limits listed now, one a FIPS
-- want: {limits.current}
select count(distinct FIPS) from Limits where "Last year" is null;

-- name: County before 2006 records
-- want: {limits.era}
select count(*) from "County before 2006";

-- name: Second listing records (Rockland and Westchester, NY, listed again inside the New York area, FY2006-2020)
-- want: {limits.second}
select count(*) from "Second listing";

-- name: D7 a second listing is no place: none a Limits record, each on its county's page, after its record
-- want: 0 2
select (select count(*) from Limits where cast(FIPS as varchar) like '%99998') || ' ' ||
  (select count(*) from "Second listing" s join Limits l on l.FIPS = s."Listing of" and l._file = s._file and l._line < s._line);

-- name: D7 the places HUD no longer lists: 16 (the bench, hud-analysis-3)
-- want: 16
select count(*) from Limits where "Last year" is not null;

-- name: Change records
-- want: {changes}
select count(*) from Change;

-- name: rows of Rents_Fair_Market_Rents
-- want: {rents.tables.Rents_Fair_Market_Rents.rows}
select count(*) from Rents_Fair_Market_Rents;

-- name: rows of Rents_45th_percentile_1983_to_1994
-- want: {rents.tables.Rents_45th_percentile_1983_to_1994.rows}
select count(*) from Rents_45th_percentile_1983_to_1994;

-- name: rows of Rents_Areas
-- want: {rents.tables.Rents_Areas.rows}
select count(*) from Rents_Areas;

-- name: rents in Rents_Fair_Market_Rents, and their sum
-- want: {rents.tables.Rents_Fair_Market_Rents.cells} {rents.tables.Rents_Fair_Market_Rents.sum}
select count(v) || ' ' || sum(v) from (unpivot Rents_Fair_Market_Rents on columns('^[0-9]+$') into name y value v);

-- name: rents in Rents_45th_percentile_1983_to_1994, and their sum
-- want: {rents.tables.Rents_45th_percentile_1983_to_1994.cells} {rents.tables.Rents_45th_percentile_1983_to_1994.sum}
select count(v) || ' ' || sum(v) from (unpivot Rents_45th_percentile_1983_to_1994 on columns('^[0-9]+$') into name y value v);

-- name: every rent in HUD's file, written and gathered once, in the card or the 45th's table (and as the old databook-hud-rents gathered: 1042795 766869876)
-- want: {rents.source.cells} {rents.source.sum}
select sum(n) || ' ' || sum(s) from (
  select count(v) n, sum(v) s from (unpivot Rents_Fair_Market_Rents on columns('^[0-9]+$') into name y value v)
  union all select count(v), sum(v) from (unpivot Rents_45th_percentile_1983_to_1994 on columns('^[0-9]+$') into name y value v));

-- name: no table of the 50th percentile (D8: its rents are in the card)
-- want: 0
select count(*) from information_schema.tables where table_name ilike 'Rents_50th%';

-- name: rows of Limits_Very_low_income_50
-- want: {limits.tables.Limits_Very_low_income_50.rows}
select count(*) from Limits_Very_low_income_50;

-- name: limits in Limits_Very_low_income_50
-- want: {limits.tables.Limits_Very_low_income_50.cells}
select count(v) from (unpivot Limits_Very_low_income_50 on columns('^[0-9]+$') into name y value v);

-- name: limits in Limits_Low_income_80
-- want: {limits.tables.Limits_Low_income_80.cells}
select count(v) from (unpivot Limits_Low_income_80 on columns('^[0-9]+$') into name y value v);

-- name: limits in Limits_Extremely_low_income_30
-- want: {limits.tables.Limits_Extremely_low_income_30.cells}
select count(v) from (unpivot Limits_Extremely_low_income_30 on columns('^[0-9]+$') into name y value v);

-- name: limits in Limits_30_limit_1999_to_2014
-- want: {limits.tables.Limits_30_limit_1999_to_2014.cells}
select count(v) from (unpivot Limits_30_limit_1999_to_2014 on columns('^[0-9]+$') into name y value v);

-- name: medians in Limits_Median_family_income
-- want: {limits.tables.Limits_Median_family_income.cells}
select count(v) from (unpivot Limits_Median_family_income on columns('^[0-9]+$') into name y value v);

-- name: limits in County_before_2006_Very_low_income_50
-- want: {limits.tables.County before 2006_Very_low_income_50.cells}
select count(v) from (unpivot County_before_2006_Very_low_income_50 on columns('^[0-9]+$') into name y value v);

-- name: rows of Limits_Areas
-- want: {limits.tables.Limits_Areas.rows}
select count(*) from Limits_Areas;

-- name: each year's very low income limits, a row of HUD's file a place or a second listing (Persons 1, FY2006 on)
-- want: {limits.rows_2006_on}
select string_agg(n, ' ' order by y) from (select y, cast(count(v) as varchar) n from (
  select y, v from (unpivot (select * exclude (_file, _line) from Limits_Very_low_income_50 where Persons = 1) on columns('^[0-9]+$') into name y value v)
  union all select y, v from (unpivot (select * exclude (_file, _line) from Second_listing_Very_low_income_50 where Persons = 1) on columns('^[0-9]+$') into name y value v))
  where y >= '2006' group by y);

-- name: D1/D4 the extremely low income card begins at FY2014, the definition's year
-- want: 2014
select min(column_name) from information_schema.columns
where table_name = 'Limits_Extremely_low_income_30' and regexp_matches(column_name, '^[0-9]+$');

-- name: D1/D4 the rents card begins at FY1995, the 40th percentile's year
-- want: 1995
select min(column_name) from information_schema.columns
where table_name = 'Rents_Fair_Market_Rents' and regexp_matches(column_name, '^[0-9]+$');

-- name: D2 FY2014 in both: the old 30% limit and the new, a row of HUD's file each (a place's, or a second listing's)
-- want: 4767 4767
select (count(o."2014") + (select count("2014") from Second_listing_30_limit_2006_to_2014 where Persons = 1)) || ' ' ||
  (count(n."2014") + (select count("2014") from Second_listing_Extremely_low_income_30 where Persons = 1))
from Limits_30_limit_1999_to_2014 o
full join Limits_Extremely_low_income_30 n using (record, Persons) where Persons = 1;

-- name: D8 the card's rents in the years its Areas run says 50, and their sum (as HUD's file set at the 50th)
-- want: {rents.tables.Rents_Fair_Market_Rents.at_50th.cells} {rents.tables.Rents_Fair_Market_Rents.at_50th.sum}
select count(m.v) || ' ' || sum(m.v)
from (unpivot (select * exclude (_file, _line) from Rents_Fair_Market_Rents) on columns('^[0-9]+$') into name y value v) m
join Rents_Areas a on a.record = m.record and cast(m.y as int) between a."From" and a."To"
where a.Percentile = 50;

-- name: D8 every place-year at the 50th has its rents in the card, where HUD gives any: place-years marked 50, and those with a rent (HUD gives Broomfield County, CO none in FY2001-04)
-- want: {rents.place_years_at_50th} {rents.place_years_at_50th_with_rents}
select count(*) || ' ' || count(r.record) from (
  select a.record, y from Rents_Areas a, range(2001, 2020) t(y)
  where a.Percentile = 50 and y between a."From" and a."To") p
left join (select distinct record, cast(y as int) y
  from (unpivot (select * exclude (_file, _line) from Rents_Fair_Market_Rents) on columns('^[0-9]+$') into name y value v)) r
using (record, y);

-- name: D8 every rent in the card under one Areas run, at the 40th or the 50th
-- want: {rents.tables.Rents_Fair_Market_Rents.cells}
select count(m.v)
from (unpivot (select * exclude (_file, _line) from Rents_Fair_Market_Rents) on columns('^[0-9]+$') into name y value v) m
join Rents_Areas a on a.record = m.record and cast(m.y as int) between a."From" and a."To"
where a.Percentile in (40, 50);

-- name: D6 no New England town has a limit of its own before FY2006
-- want: 0
select count(*) from Limits_Very_low_income_50 v join Limits l on l.name = v.record
where l.State in ('Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont') and l.Level = 'Town'
  and coalesce("1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005") is not null;

-- name: D2 every New England town listed in FY2006 tied to its county's row before
-- want: 1604
select count(*) from Limits l join "County before 2006" c on c.name = l."County before 2006";

-- name: D7 no place HUD no longer lists on a state's page
-- want: 0
select count(*) from Limits where ("Last year" is not null) <> (_file like 'limits/Gone/%');

-- name: D7 the places HUD no longer lists, each with its last year
-- want: {limits.gone}
select count("Last year") from Limits where _file like 'limits/Gone/%';

-- name: K1 every Connecticut town with its code before the planning regions, in both
-- want: 169 169
select count(l."FIPS 2024") || ' ' || count(r."FIPS 2024") from Limits l join Rents r using (FIPS) where l.State = 'Connecticut';

-- name: K1 the old Connecticut codes agree between the rents and the limits
-- want: 0
select count(*) from Limits l join Rents r using (FIPS) where l."FIPS 2024" <> r."FIPS 2024";

-- name: the join: every place HUD lists in both, joined on FIPS
-- want: 4764
select count(*) from Limits l join Rents r using (FIPS) where l."Last year" is null;

-- name: D5 every change with its boundary, was, now and source
-- want: 0
select count(*) from Change where Boundary is null or Was is null or Now is null or Source is null or Crosswalk is null;

-- name: every limit and median in HUD's files, written once (50%, 80%, the old 30%, extremely low, median)
-- want: {limits.source.l50} {limits.source.l80} {limits.source.l30} {limits.source.eli} {limits.source.median}
with n as (
  select 'l50' k, count(v) c from (unpivot Limits_Very_low_income_50 on columns('^[0-9]+$') into name y value v)
  union all select 'l50', count(v) from (unpivot County_before_2006_Very_low_income_50 on columns('^[0-9]+$') into name y value v)
  union all select 'l80', count(v) from (unpivot Limits_Low_income_80 on columns('^[0-9]+$') into name y value v)
  union all select 'l80', count(v) from (unpivot County_before_2006_Low_income_80 on columns('^[0-9]+$') into name y value v)
  union all select 'l30', count(v) from (unpivot Limits_30_limit_1999_to_2014 on columns('^[0-9]+$') into name y value v)
  union all select 'l30', count(v) from (unpivot County_before_2006_30_limit on columns('^[0-9]+$') into name y value v)
  union all select 'eli', count(v) from (unpivot Limits_Extremely_low_income_30 on columns('^[0-9]+$') into name y value v)
  union all select 'med', count(v) from (unpivot Limits_Median_family_income on columns('^[0-9]+$') into name y value v)
  union all select 'med', count(v) from (unpivot County_before_2006_Median_family_income on columns('^[0-9]+$') into name y value v)
  union all select 'l50', count(v) from (unpivot Second_listing_Very_low_income_50 on columns('^[0-9]+$') into name y value v)
  union all select 'l80', count(v) from (unpivot Second_listing_Low_income_80 on columns('^[0-9]+$') into name y value v)
  union all select 'l30', count(v) from (unpivot Second_listing_30_limit_2006_to_2014 on columns('^[0-9]+$') into name y value v)
  union all select 'eli', count(v) from (unpivot Second_listing_Extremely_low_income_30 on columns('^[0-9]+$') into name y value v)
  union all select 'med', count(v) from (unpivot Second_listing_Median_family_income on columns('^[0-9]+$') into name y value v))
select string_agg(c, ' ' order by o) from (select k, sum(c) c, case k when 'l50' then 1 when 'l80' then 2 when 'l30' then 3 when 'eli' then 4 else 5 end o from n group by k);

-- name: B7 no page holds more than ten records of a kind (pages over ten)
-- want: 0
select count(*) from (
  select _file, count(*) n from Rents group by _file union all
  select _file, count(*) from Limits group by _file union all
  select _file, count(*) from "County before 2006" group by _file union all
  select _file, count(*) from "Second listing" group by _file union all
  select _file, count(*) from Change group by _file union all
  select _file, count(*) from "Fair Market Rents" group by _file union all
  select _file, count(*) from "Income Limits" group by _file) where n > 10;

-- name: B7 a place a page, a change a page: the most records of each on one page (Rents, Limits, Change)
-- want: 1 1 1
select (select max(n) from (select count(*) n from Rents group by _file)) || ' ' ||
  (select max(n) from (select count(*) n from Limits group by _file)) || ' ' ||
  (select max(n) from (select count(*) n from Change group by _file));

-- name: B7 the pages written, rents and limits, every one gathered
-- want: {rents.pages} {limits.pages}
select count(*) filter (where path like 'rents/%') || ' ' || count(*) filter (where path like 'limits/%') from files;

-- name: B7 every place's page linked from the page that lists it (Rents, Limits)
-- want: {rents.records} {limits.records}
select (select count(*) from Rents where _file in (select path from links)) || ' ' ||
  (select count(*) from Limits where _file in (select path from links));

-- name: B7 every change's page, and every page of county rows before 2006, linked
-- want: {changes} 0
select (select count(*) from Change where _file in (select path from links)) || ' ' ||
  (select count(distinct _file) from "County before 2006" where _file not in (select path from links));

-- name: B7 every place listed once, in its state's or county's table (the rents' and the limits' listed now)
-- want: {rents.records} {limits.current}
select (select count(distinct l.path) from Fair_Market_Rents_Places p join links l on l._file = p._file and l._line = p._line
         join Rents r on r._file = l.path) || ' ' ||
  (select count(distinct l.path) from Income_Limits_Places p join links l on l._file = p._file and l._line = p._line
         join Limits r on r._file = l.path);

-- name: B7 no link that leads nowhere
-- want: 0
select count(*) from mend.warnings where kind = 'links';

-- The tax credits (lihtc/)

-- name: LIHTC every row of HUD's file a Project, one a HUD ID
-- want: {lihtc.source.rows} {lihtc.source.rows}
select count(*) || ' ' || count(distinct "HUD ID") from Project;

-- name: LIHTC units and low-income units, as HUD reckons them, and as reported: their sums against the file's
-- want: {lihtc.source.units} {lihtc.source.li_units} {lihtc.source.units_reported} {lihtc.source.li_units_reported}
select sum("Units") || ' ' || sum("Low-income units") || ' ' || sum("Units reported") || ' ' || sum("Low-income reported") from Project;

-- name: LIHTC a county for every project HUD geocoded, by the latest tract it gives (2020, 2010, 2000, 1990)
-- want: {lihtc.county_from}
select string_agg("County from" || ':' || n, ' ' order by "County from" desc) from (
  select coalesce(cast("County from" as varchar), 'none') "County from", count(*) n from Project group by all);

-- name: LIHTC no year that is a code: placed in service, and allocated, blank where HUD writes 8888 or 9999, and said why
-- want: 0 {lihtc.source.pis_missing} {lihtc.source.alloc_missing}
select (select count(*) from Project where "Year placed in service" in (8888, 9999) or "Allocation year" in (8888, 9999)) || ' ' ||
  (select count("Placed in service note") from Project where "Year placed in service" is null) || ' ' ||
  (select count("Allocation year note") from Project where "Allocation year" is null);

-- name: LIHTC codes spelled out: values left as HUD's bare code, which its dictionary does not give (FHA 4, a reason 4)
-- want: {lihtc.bare_codes}
select count(*) from Project where cast("FHA" as varchar) = '4' or cast("Why no longer monitored" as varchar) = '4';

-- name: LIHTC K1 a HUD ID before, where HUD's own note gives one
-- want: {lihtc.ids_before}
select count(nullif("HUD ID before", '')) from Project;

-- name: LIHTC B7 a project a page, each in its state's and county's folder, linked from its county's page
-- want: 1 {lihtc.source.rows} {lihtc.source.rows}
select (select max(n) from (select count(*) n from Project group by _file)) || ' ' ||
  (select count(*) from Project where _file in (select path from links)) || ' ' ||
  (select count(distinct l.path) from Tax_Credit_Projects_Projects p join links l on l._file = p._file and l._line = p._line join Project r on r._file = l.path);

-- name: LIHTC B7 the pages written, every one gathered; the listing pages, states and counties
-- want: {lihtc.pages} {lihtc.states} {lihtc.counties}
select (select count(*) from files where path like 'lihtc/%') || ' ' ||
  (select count(*) from "Tax Credit Projects" where Level = 'State') || ' ' ||
  (select count(*) from "Tax Credit Projects" where Level = 'County' and "County FIPS" is not null);

-- name: LIHTC B5/K2 every project with a county outside New England joins the rents' and the limits' county record (code and 99999); the 8 that do not are a county no more (Wade Hampton, AK, 02270; Shannon, SD, 46113: renamed in 2015, from older tracts) and the two territories HUD sets no rents for (60010, AS; 69110, MP, five)
-- want: {lihtc.join_county} 8
select count(*) || ' ' || count(*) filter (where l.FIPS is null) from Project p
  left join Rents r on r.FIPS = p."County FIPS" * 100000 + 99999 left join Limits l on l.FIPS = r.FIPS
  where p."County FIPS" is not null and p."County FIPS" // 1000 not in (9, 23, 25, 33, 44, 50);
-- (the want's first: counted from HUD's file, the projects with a county outside New England)

-- name: LIHTC every change with its boundary, was, now and source
-- want: {lihtc.changes_n}
select count(*) from Change where Dataset = 'Tax Credit Projects' and Boundary is not null and Was is not null and Now is not null and Source is not null and Crosswalk is not null;

