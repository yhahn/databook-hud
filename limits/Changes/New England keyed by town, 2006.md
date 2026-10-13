# Change: New England keyed by town, 2006

- Dataset: Income Limits
- Boundary: 2006
- Was: New England's limits by county, a row a county's part in one MSA (123 rows in FY2005)
- Now: by town, as HUD draws New England's areas (1604 towns in FY2006)
- Crosswalk: FY2006's msa column gives each town the MSA it lay in, and so its county's row before: `- County before 2006:` on 1604 towns (0 not tied). The county rows are records of their own (County before 2006), 125 of them; a town's own cards are empty before FY2006.
- Places: 1604
- Source: HUD's FY2005 and FY2006 income limits (Section8FY2005.xls, Section8FY2006.xls)
