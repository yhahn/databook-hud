# A reader's way in: databook-hud

The questions a stranger asks first of this book, and what its data
points to (SPEC R2, R3). Written by hand, and only added to, as faq.md
is: a question or finding changed is a new one, under a new id.

The spine is place (DECISIONS.md, 32): the nation on the front page,
README.md; a state on its rents page, `rents/<State>.md`; a county, or
in New England a town, on its own pages. Time is the second axis, drawn
on each.

Each record names its page and how it is worked out (Measure). Its
words (Answer, or Says for a finding) are filled by the importer from
HUD's files at every release: `{name}` is a value it reckons, `{name:$}`
written as dollars, `{name:%}` as a percent, `{name:,}` with its thousands marked. `{state}` is the page's
state. Alone is the answer for a state of one place, where there is
nothing to compare. Turns on names the values whose change on a rerun
warns `finding-turned` (a rise now a fall, a leader replaced): news, or
a fault. FAQ names the question in faq.md that asks the same of the
source, and Holds which values must agree with its answer (`value=key`
of faq.js's answer); faq.js stops the build where they do not. A
state's question is asked of one state in faq.md, on FAQ page.

Places are counted alike everywhere: a county is a row HUD keys
`…99999`, so the nation's figures are its counties' (New England,
whose rents HUD sets by town, is left out of them, as in faq.md); a
state's figures are its places', its counties or in New England its
towns. A median is of places, each counted once, not of people.

## The front page (the nation)

### Question: front-trend
- Page: README.md
- Ask: How is rent trending across the US?
- Answer: The median two-bedroom Fair Market Rent across HUD's {counties:,} counties {rose} from {r1995:$} a month in FY1995 to {r2027:$} in FY{latest}, {rise_pct:%} in all, and {recent_pct:%} in the last {recent_n} years alone; its steepest year was FY{step_year}, {step_pct:%}. From FY2001 to FY2019 HUD set some costly areas at the 50th percentile, not the 40th: at most {n50_max} counties in a year (FY{n50_year}). The line is the rent as HUD set it, the legal rent; the median of the counties at the 40th alone is never more than {d50:$} from it.
- Alone:
- Measure: each year FY1995 on, the median, lower and upper quartile across counties of the two-bedroom rent as HUD set it; rise_pct from FY1995 to the latest; recent_pct over the last five years; step the greatest rise of the median from one year to the next
- Picture: line, the median with its middle half, FY1995 to the latest, the 50th percentile's first and last years marked
- Turns on: rose, step_year
- FAQ: hud-reading-1
- FAQ page: README.md
- Holds: r1995=fy1995, r2027=latest, rise_pct=rise_pct

### Question: front-income
- Page: README.md
- Ask: Has rent outrun income?
- Answer: {yes}: across the {growth_n:,} counties with a rent and a median family income in both FY2006 and FY2026, the median county's two-bedroom rent rose {rent_growth:%} and its median family income {inc_growth:%}; rent rose faster in {n_faster:,} of them.
- Alone:
- Measure: for each county with both years in both files, FY2026 over FY2006 of the two-bedroom rent and of HUD's median family income; the median of each across counties; the picture, the same each year from FY2006
- Picture: line, the median county's rise since FY2006, rent and income, each year
- Turns on: yes
- FAQ: hud-analysis-4
- FAQ page: README.md
- Holds: growth_n=counties, rent_growth=median_rent_growth_pct, inc_growth=median_income_growth_pct, n_faster=counties_faster

### Question: front-burden
- Page: README.md
- Ask: Where does rent take the most of a low income?
- Answer: In the median county, twelve months of the FY2026 two-bedroom rent are {nation_share:%} of the very low income limit for a family of four (about half the area's median income). By the median of its places, it takes most in {share_top} ({share_top_v:%}) and least in {share_bottom} ({share_bottom_v:%}). The one county where it takes most is {share_top_county} ({share_top_county_v:%}).
- Alone:
- Measure: for each place listed in both, 12 × the FY2026 two-bedroom rent / the FY2026 very low income limit for four, in percent; the median across counties for the nation, across a state's places for a state
- Picture: the states compared, a grid (with front-dear)
- Turns on: share_top, share_bottom
- FAQ: hud-reading-2
- FAQ page: README.md
- Holds: share_top=top, share_top_v=top_share, share_bottom=bottom, share_bottom_v=bottom_share

### Question: front-dear
- Page: README.md
- Ask: Where is rent dearest, and where cheapest?
- Answer: By the median of its places in FY{latest}, {dear_top} is dearest ({dear_top_v:$} for two bedrooms) and {dear_bottom} cheapest ({dear_bottom_v:$}). The dearest county: {dear_county}, at {dear_county_v:$}.
- Alone:
- Measure: the median across each state's places of the latest two-bedroom rent; the county with the greatest, ties kept
- Picture: a grid, a state a row and a year a column (every fourth year to the latest), shaded by the median two-bedroom rent, its rises and burden beside; the table of states beneath, linked
- Turns on: dear_top, dear_bottom
- FAQ: hud-reading-3
- FAQ page: README.md
- Holds: dear_top=top, dear_top_v=top_rent, dear_bottom=bottom, dear_bottom_v=bottom_rent

### Question: front-credits
- Page: README.md
- Ask: How much tax credit housing has been built, and when?
- Answer: HUD's database holds {projects:,} projects, with {li_units:,} low-income units: placed in service from {lihtc_first} to {lihtc_last}, but for {lihtc_after} it dates later and {lihtc_none:,} it gives no year. The busiest year was {peak_year}, with {peak_projects:,} projects; the median project placed in service after it has {late_size} low-income units, against {early_size} up to it.
- Alone:
- Measure: the projects and low-income units (as HUD reckons them, li_unitr) by year placed in service; projects with no year left out of the years; the median low-income units of a project placed in service up to the busiest year, and after it
- Picture: bars, a year a bar: projects, and low-income units
- Turns on: peak_year
- FAQ: hud-reading-4
- FAQ page: README.md
- Holds: peak_year=year, peak_projects=projects

## What the data points to (the front page)

### Finding: rent-yearly
- Page: README.md
- Says: Rent goes one way: the median county's two-bedroom rent {mostly} in {up_years} of the {n_steps} years from FY1995 to FY{latest}.
- Measure: the years in which the median across counties rose from the year before, and those in which it fell
- Turns on: mostly

### Finding: rent-quickened
- Page: README.md
- Says: Its rise has {quickened}: {recent_rate:%} a year over the last {recent_n} years, against {before_rate:%} a year from FY1995 to FY{recent_from}.
- Measure: the median county's rent, its yearly rate compounded over FY{recent_from} to the latest, and over FY1995 to FY{recent_from}
- Turns on: quickened

### Finding: rent-income
- Page: README.md
- Says: It has {outran} income: from FY2006 to FY2026 the median county's rent rose {rent_growth:%}, its median family income {inc_growth:%}.
- Measure: as front-income
- Turns on: outran

### Finding: burden-where
- Page: README.md
- Says: A low income is stretched most in {burden_three} and least in {share_bottom}, where a two-bedroom rent is {share_bottom_v:%} of it.
- Measure: as front-burden, the three states of the greatest median share
- Turns on: share_top

## A state's page (rents/<State>.md)

### Question: state-trend
- Page: rents/<State>.md
- Ask: How has rent moved in {state}?
- Answer: The median two-bedroom rent of {state}'s {n_places} {places_word} {rose} from {s_first:$} in FY{first_year} to {s_latest:$} in FY{latest}, {s_rise:%}; the nation's median county's rose {n_rise:%} in the same years.
- Alone: {state}'s two-bedroom rent {rose} from {s_first:$} in FY{first_year} to {s_latest:$} in FY{latest}, {s_rise:%}; the nation's median county's rose {n_rise:%} in the same years.
- Measure: as front-trend, over the state's places, FY1995 (or its first year with a rent) to the latest
- Picture: line, the state's median with its middle half, and the nation's median county
- Turns on: rose
- FAQ: hud-reading-5
- FAQ page: rents/New York.md
- Holds: s_first=fy1995, s_latest=latest

### Question: state-dear
- Page: rents/<State>.md
- Ask: Where in {state} is rent dearest, and where cheapest?
- Answer: In FY{latest} a two-bedroom home rents dearest in {dear}, at {dear_v:$} a month, and cheapest in {cheap}, at {cheap_v:$}. Every place is a row of the grid below, dearest first, its rent every fourth year since FY1995.
- Alone: {state} is one place, at {s_latest:$} for two bedrooms in FY{latest}.
- Measure: the places of the greatest and the least latest two-bedroom rent, ties kept
- Picture: a grid, a place a row (dearest first) and every fourth year a column, shaded against the state's dearest; its rises and burden beside; the places listed beneath, linked, in the same order
- Turns on: dear, cheap
- FAQ: hud-reading-6
- FAQ page: rents/New York.md
- Holds: dear=dearest, dear_v=dearest_rent, cheap=cheapest, cheap_v=cheapest_rent

### Question: state-burden
- Page: rents/<State>.md
- Ask: Where in {state} does rent take most of a low income?
- Answer: Twelve months of the FY2026 two-bedroom rent are {s_share:%} of the very low income limit for four in the median of {state}'s {places_word} ({nation_share:%} in the nation's median county); most in {burden_top} ({burden_top_v:%}), least in {burden_bottom} ({burden_bottom_v:%}).
- Alone: Twelve months of {state}'s FY2026 two-bedroom rent are {s_share:%} of its very low income limit for four ({nation_share:%} in the nation's median county).
- Measure: as front-burden, over the state's places; the greatest and least, ties kept
- Picture: the grid's Burden column
- Turns on: burden_top
- FAQ: hud-reading-7
- FAQ page: rents/New York.md
- Holds: s_share=median_share, burden_top=top, burden_top_v=top_share

### Question: state-income
- Page: rents/<State>.md
- Ask: Has rent outrun income in {state}?
- Answer: From FY2006 to FY2026 the two-bedroom rent rose faster than the median family income in {faster} of {state}'s {growth_n} {places_word} with both, and slower in {slower}.
- Alone: From FY2006 to FY2026 {state}'s two-bedroom rent rose {rent_growth:%} and its median family income {inc_growth:%}.
- Measure: as front-income, place by place; the places where FY2026 over FY2006 of rent is greater than of income, and less
- Picture: the grid's two rises, side by side
- Turns on: more
- FAQ: hud-analysis-1
- FAQ page: rents/Mississippi.md
- Holds: faster=faster, slower=slower
