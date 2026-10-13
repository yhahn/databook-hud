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

-- name: B3 the keys of Change
-- want: Dataset, Boundary, Was, Now, Crosswalk, Places, Source
select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns
where table_name = 'Change' and column_name not in ('name', '_file', '_line', '_end_line');

-- name: B5 the kinds, each dataset its own
-- want: Change, County before 2006, Fair Market Rents, Income Limits, Limits, Rents
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

-- name: Change records
-- want: {changes}
select count(*) from Change;

-- name: rows of Rents_Fair_Market_Rents
-- want: {rents.tables.Rents_Fair_Market_Rents.rows}
select count(*) from Rents_Fair_Market_Rents;

-- name: rows of Rents_45th_percentile_1983_to_1994
-- want: {rents.tables.Rents_45th_percentile_1983_to_1994.rows}
select count(*) from Rents_45th_percentile_1983_to_1994;

-- name: rows of Rents_50th_percentile_2001_to_2019
-- want: {rents.tables.Rents_50th_percentile_2001_to_2019.rows}
select count(*) from Rents_50th_percentile_2001_to_2019;

-- name: rows of Rents_Areas
-- want: {rents.tables.Rents_Areas.rows}
select count(*) from Rents_Areas;

-- name: rents in Rents_Fair_Market_Rents, and their sum
-- want: {rents.tables.Rents_Fair_Market_Rents.cells} {rents.tables.Rents_Fair_Market_Rents.sum}
select count(v) || ' ' || sum(v) from (unpivot Rents_Fair_Market_Rents on columns('^[0-9]+$') into name y value v);

-- name: rents in Rents_45th_percentile_1983_to_1994, and their sum
-- want: {rents.tables.Rents_45th_percentile_1983_to_1994.cells} {rents.tables.Rents_45th_percentile_1983_to_1994.sum}
select count(v) || ' ' || sum(v) from (unpivot Rents_45th_percentile_1983_to_1994 on columns('^[0-9]+$') into name y value v);

-- name: rents in Rents_50th_percentile_2001_to_2019, and their sum
-- want: {rents.tables.Rents_50th_percentile_2001_to_2019.cells} {rents.tables.Rents_50th_percentile_2001_to_2019.sum}
select count(v) || ' ' || sum(v) from (unpivot Rents_50th_percentile_2001_to_2019 on columns('^[0-9]+$') into name y value v);

-- name: every rent in HUD's file, in one of the three tables (and as the old databook-hud-rents gathered: 1042795 766869876)
-- want: {rents.source.cells} {rents.source.sum}
select sum(n) || ' ' || sum(s) from (
  select count(v) n, sum(v) s from (unpivot Rents_Fair_Market_Rents on columns('^[0-9]+$') into name y value v)
  union all select count(v), sum(v) from (unpivot Rents_45th_percentile_1983_to_1994 on columns('^[0-9]+$') into name y value v)
  union all select count(v), sum(v) from (unpivot Rents_50th_percentile_2001_to_2019 on columns('^[0-9]+$') into name y value v));

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

-- name: limits in "County before 2006_Very_low_income_50"
-- want: {limits.tables.County before 2006_Very_low_income_50.cells}
select count(v) from (unpivot "County before 2006_Very_low_income_50" on columns('^[0-9]+$') into name y value v);

-- name: rows of Limits_Areas
-- want: {limits.tables.Limits_Areas.rows}
select count(*) from Limits_Areas;

-- name: each year's very low income limits, a row of HUD's file a place (Persons 1, FY2006 on)
-- want: {limits.rows_2006_on}
select string_agg(n, ' ' order by y) from (select y, cast(count(v) as varchar) n
  from (unpivot (select * from Limits_Very_low_income_50 where Persons = 1) on columns('^[0-9]+$') into name y value v)
  where y >= '2006' group by y);

-- name: D1/D4 the extremely low income card begins at FY2014, the definition's year
-- want: 2014
select min(column_name) from information_schema.columns
where table_name = 'Limits_Extremely_low_income_30' and regexp_matches(column_name, '^[0-9]+$');

-- name: D1/D4 the rents card begins at FY1995, the 40th percentile's year
-- want: 1995
select min(column_name) from information_schema.columns
where table_name = 'Rents_Fair_Market_Rents' and regexp_matches(column_name, '^[0-9]+$');

-- name: D2 FY2014 in both: the old 30% limit and the new, a place each
-- want: 4767 4767
select count(o."2014") || ' ' || count(n."2014") from Limits_30_limit_1999_to_2014 o
full join Limits_Extremely_low_income_30 n using (record, Persons) where Persons = 1;

-- name: D4 no 50th-percentile rent in a 40th-percentile card (place-years at the 50th, empty in the card)
-- want: 0
select count(*) from (unpivot (select * exclude (_file, _line) from Rents_50th_percentile_2001_to_2019) on columns('^[0-9]+$') into name y value v) h
join (unpivot (select * exclude (_file, _line) from Rents_Fair_Market_Rents) on columns('^[0-9]+$') into name y value v) m
using (record, Bedrooms, y) where m.v is not null;

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
select count(*) from Limits where ("Last year" is not null) <> (_file = 'limits/Gone.md');

-- name: D7 the places HUD no longer lists, each with its last year
-- want: {limits.gone}
select count("Last year") from Limits where _file = 'limits/Gone.md';

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
