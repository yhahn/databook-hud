# Changes in the Fair Market Rents

Where HUD's file changes a definition or a key during its years: the latest form is kept in the cards, the older only in tables of their own, and nothing runs across a change. A setting HUD made place by place, the 50th percentile, is the rent's own: in the cards as set, marked beside it (SPEC D8).

### Change: Percentile, 45th to 40th, 1995

- Dataset: Fair Market Rents
- Boundary: 1995
- Was: FMRs set at the 45th percentile of gross rents (4731 places in FY1994)
- Now: FMRs set at the 40th percentile (4731 places in FY1995)
- Crosswalk: None in this file: HUD says the FY1995 proposed FMRs were published at both, but this file holds the 40th only. The years to FY1994 are in each place's table "45th percentile, 1983 to 1994", never in its card.
- Places: 4731
- Source: HUD's Read Me for the FMR history (READ_ME_FMRHIST_FY2025), note 2; the fmr94 and fmr95 columns

### Change: Some areas at the 50th percentile, 2001

- Dataset: Fair Market Rents
- Boundary: 2001
- Was: every FMR at the 40th percentile
- Now: FMRs of selected costly areas at the 50th percentile (221 places in FY2001)
- Crosswalk: None: a place-year has one FMR in this file, the one HUD set, and the legal rent that year. A setting made place by place, not a change of definition (SPEC D8): the rents are in each place's card as set, marked by its Areas runs, Percentile 50.
- Places: 221
- Source: HUD's Read Me for the FMR history (READ_ME_FMRHIST_FY2025), note 4; the fmr01 column

### Change: HUD's nonmetropolitan mark, 2005

- Dataset: Fair Market Rents
- Boundary: 2005
- Was: MSA 10000 for a county outside a metropolitan area
- Now: MSA 9999
- Crosswalk: None needed: a code, not a move; each place's Areas runs show both.
- Places: 3287
- Source: HUD's file, the msa04 and msa05 columns

### Change: Areas renumbered, 2006

- Dataset: Fair Market Rents
- Boundary: 2006
- Was: HUD's MSA numbers (5240), areas as OMB drew them in the 1990s
- Now: HUD Metro FMR Area codes (METRO33860M33860, NCNTY…), areas from OMB's 2003 definitions and the 2000 Census
- Crosswalk: Each place: its Areas runs end at 2005 under an MSA number and begin at 2006 under a Metro code.
- Places: 4764
- Source: HUD's Read Me for the FMR history (READ_ME_FMRHIST_FY2025), fields msa_83 to msa_06, and note 4

### Change: The 50th percentile ended, 2020

- Dataset: Fair Market Rents
- Boundary: 2020
- Was: FMRs of 4 places at the 50th percentile in FY2019
- Now: every FMR at the 40th percentile (the Small Area FMR rule, 81 FR 80567)
- Crosswalk: None, as in 2001: the rents of those places are in their cards as set, marked by their Areas runs' Percentile (SPEC D8).
- Places: 4
- Source: HUD's Read Me for the FMR history (READ_ME_FMRHIST_FY2025), note 4; the fmr19 and fmr20 columns

### Change: Connecticut's planning regions, 2026

- Dataset: Fair Market Rents
- Boundary: 2026
- Was: towns keyed by Connecticut's eight counties (090xx)
- Now: towns keyed by its nine planning regions (0911x to 0919x)
- Crosswalk: Each town: `- FIPS 2024:` holds its old code (169 towns).
- Places: 169
- Source: HUD's Read Me for the FMR history (READ_ME_FMRHIST_FY2025), field fips2024

### Change: New England town codes, 2027

- Dataset: Fair Market Rents
- Boundary: 2027
- Was: 6 towns under the codes they had to FY2026
- Now: the same towns under new codes
- Crosswalk: Each town: `- FIPS before:` holds its old code (6 towns).
- Places: 6
- Source: HUD's file, fips and fips2024 against fips2027

#### Places

| Place | Was | Now | What |
|---|---|---|---|
| Amesbury Town city, MA | 2500901260 | 2500901185 | new code |
| Codyville plantation, ME | 2302913610 | 2302913612 | new code |
| Drew plantation, ME | 2301918580 | 2301918582 | new code |
| Easthampton Town city, MA | 2501519370 | 2501519365 | new code |
| Methuen city, MA | 2500940710 | 2500940675 | new code |
| Watertown city, MA | 2501773440 | 2501773405 | new code |
