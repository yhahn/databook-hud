# HUD: rents, income limits and tax credit housing

Two of HUD's yardsticks for housing help, for every county and New England town, year by year: what a modest home costs to rent (the Fair Market Rents) and the incomes under which a household may have help (the Income Limits). Data only, printable as a book and queryable as tables: a folder a dataset, and in it a page a place, as a reader finds it: a state's page listing its places (`rents/Alabama.md`), a folder of them beside it (`rents/Alabama/Autauga County.md`), and in New England a county's page and folder between (`rents/Maine/Penobscot County/Bangor city.md`); proper gathers them into DuckDB. Both are keyed by the same ten-digit FIPS, so a place's rent and its limits join. Beside them, the housing those yardsticks govern: every project built or kept with the Low-Income Housing Tax Credit, a page a project, filed by state and county, its county's FIPS joining the rents and the limits.

## What the data points to

Rent goes one way: the median county's two-bedroom rent rose in 31 of the 32 years from FY1995 to FY2027. Its rise has quickened: 6.2% a year over the last 5 years, against 2.9% a year from FY1995 to FY2022. It has outrun income: from FY2006 to FY2026 the median county's rent rose 97.8%, its median family income 78.4%. A low income is stretched most in [Guam](./rents/Guam.md), [Hawaii](./rents/Hawaii.md) and the [Northern Mariana Islands](./rents/Northern%20Mariana%20Islands.md) and least in [North Dakota](./rents/North%20Dakota.md), where a two-bedroom rent is 19.6% of it.

## Rent over the years

**How is rent trending across the US?** The median two-bedroom Fair Market Rent across HUD's 3,161 counties rose from $363 a month in FY1995 to $1,056 in FY2027, 190.9% in all, and 34.9% in the last 5 years alone; its steepest year was FY2024, 9.8%. From FY2001 to FY2019 HUD set some costly areas at the 50th percentile, not the 40th: at most 221 counties in a year (FY2001). The line is the rent as HUD set it, the legal rent; the median of the counties at the 40th alone is never more than $9 from it. Each place's rents, every year and bedroom count, are on its page: see [Fair Market Rents](./rents/README.md).

The median county's two-bedroom rent each year, as HUD set it, and its middle half (the band, from a quarter of the way up to three quarters).

> [!CARD:line] Two-bedroom rent, the median county
> |  | stat | 1995 | 1996 | 1997 | 1998 | 1999 | 2000 | 2001 | 2002 | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 |
> |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
> | Counties | line | 363 | 393 | 401 | 410 | 416 | 419 | 421 | 438 | 446 | 448 | 492 | 512 | 527 | 562 | 583 | 597 | 609 | 597 | 633 | 642 | 646 | 669 | 695 | 713 | 723 | 737 | 757 | 783 | 854 | 938 | 965 | 1015 | 1056 |
> | Counties | low | 319 | 367 | 370 | 378 | 383 | 383 | 386 | 402 | 412 | 412 | 444 | 484 | 504 | 527 | 546 | 558 | 567 | 555 | 610 | 622 | 627 | 645 | 665 | 680 | 688 | 698 | 718 | 739 | 795 | 882 | 907 | 933 | 995 |
> | Counties | high | 445 | 459 | 475 | 485 | 495 | 499 | 504 | 522 | 537 | 543 | 575 | 594 | 617 | 666 | 689 | 710 | 717 | 709 | 750 | 747 | 768 | 796 | 817 | 842 | 862 | 872 | 903 | 933 | 1016 | 1141 | 1208 | 1261 | 1289 |
> - Mark: 2001 Some at the 50th
> - Mark: 2020 All at the 40th
> - Unit: dollars a month, two bedrooms, as HUD set them

## Rent and income

**Has rent outrun income?** Yes: across the 3,152 counties with a rent and a median family income in both FY2006 and FY2026, the median county's two-bedroom rent rose 97.8% and its median family income 78.4%; rent rose faster in 2,498 of them. Each place's median family income and limits are on its page: see [Income Limits](./limits/README.md).

The median county's rise since FY2006, in percent, each year: its two-bedroom rent, and its median family income, over the counties with both in FY2006 and FY2026.

> [!CARD:line] Rise since FY2006, the median county
> |  | 2006 | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
> |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
> | Rent | 0 | 3.6 | 10.3 | 14.6 | 17 | 18.3 | 16.1 | 25.2 | 26.4 | 27.8 | 31.1 | 35.4 | 38.6 | 41 | 42.4 | 46.2 | 52.3 | 66.2 | 85.7 | 91 | 97.8 |
> | Income | 0 | -1.3 | 2.1 | 6.6 | 7.6 | 9.9 | 11.4 | 12 | 12.4 | 15.1 | 13.9 | 16.6 | 21.2 | 26.2 | 30.7 | 33.2 | 47.7 | 60.5 | 64.6 | 75.8 | 78.4 |
> - Unit: percent

## The states compared

**Where does rent take the most of a low income?** In the median county, twelve months of the FY2026 two-bedroom rent are 28.8% of the very low income limit for a family of four (about half the area's median income). By the median of its places, it takes most in [Hawaii](./rents/Hawaii.md), [Guam](./rents/Guam.md) and the [Northern Mariana Islands](./rents/Northern%20Mariana%20Islands.md) (41.2%) and least in [North Dakota](./rents/North%20Dakota.md) (19.6%). The one county where it takes most is [Kalawao County, HI](./rents/Hawaii/Kalawao%20County.md) (49.1%).

**Where is rent dearest, and where cheapest?** By the median of its places in FY2027, the [District of Columbia](./rents/District%20of%20Columbia.md) is dearest ($2,438 for two bedrooms) and [Puerto Rico](./rents/Puerto%20Rico.md) cheapest ($613). The dearest county: [Santa Cruz County, CA](./rents/California/Santa%20Cruz%20County.md), at $4,254. Each state's page compares its own places.

Each state, dearest first by the median two-bedroom rent of its places (its counties, or in New England its towns), every fourth year, shaded against the dearest; then, at the right, the median place's rise in rent and in median family income from FY2006 to FY2026, in percent, and its burden: twelve months of the FY2026 two-bedroom rent as a share of the very low income limit for four. Beneath, the same, each state linked to its page, with its tax credit housing.

> [!CARD:grid] Two-bedroom rent, a state a row
> | State | 1995 | 1999 | 2003 | 2007 | 2011 | 2015 | 2019 | 2023 | 2027 | Rent up, % | Income up, % | Burden, % |
> |---|---|---|---|---|---|---|---|---|---|---|---|---|
> | District of Columbia | 834 | 820 | 1154 | 1286 | 1461 | 1458 | 1665 | 1838 | 2438 | 83.3 | 83.9 | 32.5 |
> | Massachusetts | 683 | 708 | 923 | 1014 | 1135 | 1076 | 1244 | 1663 | 2367 | 122.1 | 82.4 | 37.5 |
> | Hawaii | 1051 | 986 | 964 | 1134 | 1454 | 1222 | 1675 | 1986 | 2326 | 121.1 | 87.1 | 41.2 |
> | New Jersey | 828 | 820 | 949 | 1063 | 1233 | 1269 | 1447 | 1606 | 2233 | 109.4 | 64 | 38.2 |
> | Connecticut | 697 | 723 | 813 | 1029 | 1113 | 1144 | 1194 | 1499 | 1933 | 90.5 | 61.1 | 34.6 |
> | Rhode Island | 638 | 662 | 667 | 1014 | 977 | 944 | 1060 | 1409 | 1879 | 79.2 | 75.2 | 37 |
> | Maryland | 592 | 628 | 817 | 941 | 1209 | 1232 | 1334 | 1548 | 1875 | 95.5 | 84.1 | 32.5 |
> | New Hampshire | 615 | 659 | 719 | 820 | 970 | 1048 | 1096 | 1343 | 1734 | 145.1 | 78.1 | 36.8 |
> | California | 578 | 595 | 676 | 809 | 989 | 969 | 1088 | 1322 | 1725 | 135.1 | 86.4 | 38.8 |
> | Delaware | 509 | 613 | 659 | 709 | 812 | 987 | 1053 | 1182 | 1629 | 115.5 | 90.4 | 32.7 |
> | Vermont | 540 | 595 | 657 | 719 | 901 | 935 | 988 | 1129 | 1558 | 106.6 | 75 | 30.8 |
> | Alaska | 678 | 736 | 785 | 1004 | 1143 | 1019 | 1228 | 1278 | 1513 | 54.1 | 60.8 | 30.1 |
> | U.S. Virgin Islands | 682 | 875 | 934 | 864 | 998 | 1052 | 1123 | 1350 | 1509 | 108.2 | 111.7 | 39.5 |
> | Florida | 439 | 500 | 540 | 618 | 824 | 830 | 955 | 1168 | 1474 | 138.5 | 80.3 | 37.9 |
> | Washington | 455 | 495 | 529 | 649 | 738 | 767 | 950 | 1181 | 1467 | 121.4 | 92.4 | 33.1 |
> | Guam | 907 | 968 | 1052 | 929 | 1023 | 1064 | 1051 | 1578 | 1449 | 76.9 | 69.6 | 41.2 |
> | New York | 536 | 569 | 599 | 644 | 794 | 842 | 858 | 1108 | 1385 | 114.6 | 75.5 | 32.1 |
> | Colorado | 412 | 495 | 537 | 688 | 728 | 777 | 876 | 1109 | 1375 | 105 | 89.2 | 28.9 |
> | Maine | 435 | 480 | 524 | 589 | 682 | 746 | 856 | 971 | 1367 | 136 | 80.8 | 35.4 |
> | Nevada | 562 | 601 | 653 | 717 | 802 | 786 | 884 | 1116 | 1327 | 99.5 | 85.5 | 32.3 |
> | Oregon | 440 | 494 | 527 | 618 | 703 | 771 | 875 | 1165 | 1325 | 126.2 | 82 | 36 |
> | Montana | 370 | 450 | 489 | 526 | 609 | 643 | 700 | 848 | 1310 | 147.1 | 102.8 | 32.9 |
> | Virginia | 433 | 475 | 512 | 610 | 719 | 806 | 875 | 990 | 1262 | 107.5 | 73.7 | 30.7 |
> | Arizona | 462 | 494 | 538 | 676 | 812 | 763 | 823 | 1073 | 1244 | 111.8 | 86.7 | 41 |
> | Utah | 374 | 453 | 492 | 612 | 672 | 735 | 776 | 932 | 1158 | 109 | 106.5 | 26 |
> | North Carolina | 390 | 421 | 470 | 573 | 641 | 659 | 729 | 890 | 1145 | 97.2 | 74.6 | 30 |
> | Pennsylvania | 413 | 447 | 481 | 575 | 655 | 696 | 780 | 947 | 1136 | 98.6 | 72.1 | 28.7 |
> | Idaho | 317 | 416 | 443 | 560 | 644 | 643 | 725 | 930 | 1127 | 104.1 | 92.5 | 28.9 |
> | Texas | 344 | 383 | 412 | 505 | 598 | 653 | 754 | 912 | 1105 | 108.2 | 87.1 | 29.1 |
> | South Carolina | 365 | 407 | 434 | 522 | 594 | 636 | 746 | 885 | 1098 | 101.9 | 67.7 | 30.2 |
> | Indiana | 391 | 427 | 465 | 580 | 652 | 676 | 733 | 862 | 1086 | 89.7 | 64.3 | 27.3 |
> | Michigan | 392 | 418 | 447 | 546 | 608 | 660 | 729 | 864 | 1085 | 93.4 | 66.5 | 28.5 |
> | New Mexico | 353 | 398 | 428 | 497 | 557 | 631 | 784 | 795 | 1063 | 113.4 | 88.7 | 32.4 |
> | Georgia | 352 | 412 | 439 | 537 | 612 | 640 | 697 | 859 | 1058 | 112.4 | 73.2 | 31.2 |
> | Minnesota | 369 | 409 | 438 | 531 | 611 | 651 | 737 | 874 | 1048 | 93.4 | 78.1 | 23.8 |
> | Ohio | 402 | 436 | 472 | 558 | 628 | 655 | 701 | 828 | 1048 | 93.4 | 71 | 26.6 |
> | Tennessee | 325 | 352 | 375 | 493 | 562 | 595 | 649 | 780 | 1048 | 104.8 | 81.5 | 29 |
> | Wisconsin | 367 | 408 | 437 | 552 | 627 | 678 | 732 | 908 | 1041 | 93.4 | 73.1 | 24.4 |
> | South Dakota | 346 | 419 | 455 | 499 | 545 | 640 | 700 | 826 | 1033 | 91.9 | 108.1 | 23.4 |
> | Wyoming | 356 | 428 | 465 | 512 | 635 | 679 | 818 | 872 | 1016 | 94.5 | 79.4 | 23.3 |
> | Nebraska | 337 | 389 | 416 | 517 | 558 | 607 | 700 | 826 | 1014 | 91.4 | 85.7 | 24.5 |
> | North Dakota | 291 | 368 | 399 | 489 | 545 | 600 | 700 | 826 | 1014 | 83.8 | 100.8 | 19.6 |
> | Louisiana | 326 | 370 | 397 | 501 | 635 | 675 | 741 | 873 | 995 | 98.1 | 69.4 | 30.5 |
> | Northern Mariana Islands |  |  |  |  |  |  | 712 | 852 | 988 |  |  | 41.2 |
> | Alabama | 303 | 347 | 370 | 465 | 550 | 609 | 662 | 790 | 975 | 91 | 72.8 | 26.7 |
> | Missouri | 315 | 352 | 377 | 481 | 550 | 608 | 652 | 748 | 962 | 91.4 | 72.5 | 27.5 |
> | Kansas | 319 | 391 | 418 | 512 | 578 | 634 | 672 | 788 | 961 | 76.5 | 75 | 24.6 |
> | Illinois | 337 | 374 | 400 | 523 | 592 | 636 | 713 | 811 | 958 | 86.2 | 71.3 | 24.5 |
> | West Virginia | 327 | 360 | 389 | 505 | 554 | 638 | 643 | 783 | 955 | 89.3 | 72.8 | 27.8 |
> | American Samoa |  |  |  |  |  |  | 723 | 865 | 942 |  |  | 39.3 |
> | Iowa | 363 | 409 | 437 | 513 | 555 | 593 | 664 | 795 | 927 | 84.5 | 78.4 | 23.4 |
> | Kentucky | 319 | 359 | 383 | 482 | 544 | 566 | 629 | 747 | 925 | 101.9 | 74.9 | 28.9 |
> | Oklahoma | 311 | 354 | 381 | 469 | 564 | 623 | 700 | 797 | 916 | 107.8 | 80.5 | 29.6 |
> | Arkansas | 325 | 361 | 388 | 480 | 540 | 584 | 650 | 720 | 909 | 93 | 81.9 | 29.7 |
> | Mississippi | 300 | 364 | 389 | 473 | 576 | 620 | 651 | 766 | 905 | 85.1 | 80.6 | 28.1 |
> | Puerto Rico | 446 | 361 | 389 | 416 | 498 | 530 | 462 | 498 | 613 | 42.6 | 92.6 | 38.4 |
> - Gutter: Rent up, %
> - Gutter: Income up, %
> - Gutter: Burden, %
> - Unit: dollars a month, two bedrooms

### The states, linked

| State | Places | Two-bedroom rent | Rent up since 2006, % | Income up since 2006, % | Burden, % | Tax credit projects | Low-income units |
|---|---|---|---|---|---|---|---|
| [District of Columbia](./rents/District%20of%20Columbia.md) | 1 | 2438 | 83.3 | 83.9 | 32.5 | 268 | 30290 |
| [Massachusetts](./rents/Massachusetts.md) | 351 | 2367 | 122.1 | 82.4 | 37.5 | 1057 | 74028 |
| [Hawaii](./rents/Hawaii.md) | 5 | 2326 | 121.1 | 87.1 | 41.2 | 144 | 12481 |
| [New Jersey](./rents/New%20Jersey.md) | 21 | 2233 | 109.4 | 64 | 38.2 | 1760 | 132086 |
| [Connecticut](./rents/Connecticut.md) | 169 | 1933 | 90.5 | 61.1 | 34.6 | 455 | 25312 |
| [Rhode Island](./rents/Rhode%20Island.md) | 39 | 1879 | 79.2 | 75.2 | 37 | 205 | 13662 |
| [Maryland](./rents/Maryland.md) | 24 | 1875 | 95.5 | 84.1 | 32.5 | 948 | 77604 |
| [New Hampshire](./rents/New%20Hampshire.md) | 259 | 1734 | 145.1 | 78.1 | 36.8 | 284 | 11513 |
| [California](./rents/California.md) | 58 | 1725 | 135.1 | 86.4 | 38.8 | 5185 | 406387 |
| [Delaware](./rents/Delaware.md) | 3 | 1629 | 115.5 | 90.4 | 32.7 | 180 | 10927 |
| [Vermont](./rents/Vermont.md) | 256 | 1558 | 106.6 | 75 | 30.8 | 355 | 8604 |
| [Alaska](./rents/Alaska.md) | 30 | 1513 | 54.1 | 60.8 | 30.1 | 187 | 6970 |
| [U.S. Virgin Islands](./rents/U.S.%20Virgin%20Islands.md) | 3 | 1509 | 108.2 | 111.7 | 39.5 | 33 | 1471 |
| [Florida](./rents/Florida.md) | 67 | 1474 | 138.5 | 80.3 | 37.9 | 1571 | 205676 |
| [Washington](./rents/Washington.md) | 39 | 1467 | 121.4 | 92.4 | 33.1 | 1430 | 119615 |
| [Guam](./rents/Guam.md) | 1 | 1449 | 76.9 | 69.6 | 41.2 | 15 | 1349 |
| [New York](./rents/New%20York.md) | 62 | 1385 | 114.6 | 75.5 | 32.1 | 4144 | 290170 |
| [Colorado](./rents/Colorado.md) | 64 | 1375 | 105 | 89.2 | 28.9 | 872 | 65961 |
| [Maine](./rents/Maine.md) | 529 | 1367 | 136 | 80.8 | 35.4 | 380 | 13466 |
| [Nevada](./rents/Nevada.md) | 17 | 1327 | 99.5 | 85.5 | 32.3 | 353 | 33876 |
| [Oregon](./rents/Oregon.md) | 36 | 1325 | 126.2 | 82 | 36 | 754 | 44746 |
| [Montana](./rents/Montana.md) | 56 | 1310 | 147.1 | 102.8 | 32.9 | 321 | 11555 |
| [Virginia](./rents/Virginia.md) | 133 | 1262 | 107.5 | 73.7 | 30.7 | 1266 | 110025 |
| [Arizona](./rents/Arizona.md) | 15 | 1244 | 111.8 | 86.7 | 41 | 593 | 46629 |
| [Utah](./rents/Utah.md) | 29 | 1158 | 109 | 106.5 | 26 | 561 | 30736 |
| [North Carolina](./rents/North%20Carolina.md) | 100 | 1145 | 97.2 | 74.6 | 30 | 2900 | 116416 |
| [Pennsylvania](./rents/Pennsylvania.md) | 67 | 1136 | 98.6 | 72.1 | 28.7 | 2025 | 78518 |
| [Idaho](./rents/Idaho.md) | 44 | 1127 | 104.1 | 92.5 | 28.9 | 288 | 11928 |
| [Texas](./rents/Texas.md) | 254 | 1105 | 108.2 | 87.1 | 29.1 | 2999 | 316745 |
| [South Carolina](./rents/South%20Carolina.md) | 46 | 1098 | 101.9 | 67.7 | 30.2 | 890 | 47827 |
| [Indiana](./rents/Indiana.md) | 92 | 1086 | 89.7 | 64.3 | 27.3 | 1353 | 84374 |
| [Michigan](./rents/Michigan.md) | 83 | 1085 | 93.4 | 66.5 | 28.5 | 1720 | 103552 |
| [New Mexico](./rents/New%20Mexico.md) | 33 | 1063 | 113.4 | 88.7 | 32.4 | 318 | 20245 |
| [Georgia](./rents/Georgia.md) | 159 | 1058 | 112.4 | 73.2 | 31.2 | 1666 | 153086 |
| [Minnesota](./rents/Minnesota.md) | 87 | 1048 | 93.4 | 78.1 | 23.8 | 1144 | 65405 |
| [Ohio](./rents/Ohio.md) | 88 | 1048 | 93.4 | 71 | 26.6 | 2142 | 131397 |
| [Tennessee](./rents/Tennessee.md) | 95 | 1048 | 104.8 | 81.5 | 29 | 1176 | 78307 |
| [Wisconsin](./rents/Wisconsin.md) | 72 | 1041 | 93.4 | 73.1 | 24.4 | 1234 | 35760 |
| [South Dakota](./rents/South%20Dakota.md) | 66 | 1033 | 91.9 | 108.1 | 23.4 | 313 | 10570 |
| [Wyoming](./rents/Wyoming.md) | 23 | 1016 | 94.5 | 79.4 | 23.3 | 133 | 5606 |
| [Nebraska](./rents/Nebraska.md) | 93 | 1014 | 91.4 | 85.7 | 24.5 | 593 | 19040 |
| [North Dakota](./rents/North%20Dakota.md) | 53 | 1014 | 83.8 | 100.8 | 19.6 | 254 | 8795 |
| [Louisiana](./rents/Louisiana.md) | 64 | 995 | 98.1 | 69.4 | 30.5 | 1117 | 59068 |
| [Northern Mariana Islands](./rents/Northern%20Mariana%20Islands.md) | 1 | 988 |  |  | 41.2 | 5 | 272 |
| [Alabama](./rents/Alabama.md) | 67 | 975 | 91 | 72.8 | 26.7 | 834 | 43317 |
| [Missouri](./rents/Missouri.md) | 116 | 962 | 91.4 | 72.5 | 27.5 | 1930 | 73357 |
| [Kansas](./rents/Kansas.md) | 105 | 961 | 76.5 | 75 | 24.6 | 738 | 34165 |
| [Illinois](./rents/Illinois.md) | 102 | 958 | 86.2 | 71.3 | 24.5 | 1556 | 111974 |
| [West Virginia](./rents/West%20Virginia.md) | 55 | 955 | 89.3 | 72.8 | 27.8 | 376 | 16484 |
| [American Samoa](./rents/American%20Samoa.md) | 1 | 942 |  |  | 39.3 | 119 | 428 |
| [Iowa](./rents/Iowa.md) | 99 | 927 | 84.5 | 78.4 | 23.4 | 757 | 30179 |
| [Kentucky](./rents/Kentucky.md) | 120 | 925 | 101.9 | 74.9 | 28.9 | 913 | 32448 |
| [Oklahoma](./rents/Oklahoma.md) | 77 | 916 | 107.8 | 80.5 | 29.6 | 622 | 32259 |
| [Arkansas](./rents/Arkansas.md) | 75 | 909 | 93 | 81.9 | 29.7 | 738 | 37739 |
| [Mississippi](./rents/Mississippi.md) | 82 | 905 | 85.1 | 80.6 | 28.1 | 926 | 44274 |
| [Puerto Rico](./rents/Puerto%20Rico.md) | 78 | 613 | 42.6 | 92.6 | 38.4 | 245 | 22918 |

## Tax credit housing, year by year

**How much tax credit housing has been built, and when?** HUD's database holds 55,345 projects, with 3,611,592 low-income units: placed in service from 1987 to 2024, but for 67 it dates later and 2,765 it gives no year. The busiest year was 2007, with 1,806 projects; the median project placed in service after it has 56 low-income units, against 36 up to it. Each project is a page: see [Low-Income Housing Tax Credit projects](./lihtc/README.md).

The projects placed in service each year, and their low-income units, each on its own scale.

> [!CARD:bars] Tax credit housing placed in service
> |  | 1987 | 1988 | 1989 | 1990 | 1991 | 1992 | 1993 | 1994 | 1995 | 1996 | 1997 | 1998 | 1999 | 2000 | 2001 | 2002 | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2027 |
> |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
> | Projects | 749 | 1686 | 1632 | 1334 | 1451 | 1347 | 1395 | 1416 | 1641 | 1484 | 1405 | 1381 | 1596 | 1441 | 1519 | 1450 | 1655 | 1660 | 1716 | 1757 | 1806 | 1628 | 1272 | 1316 | 1772 | 1642 | 1362 | 1175 | 1215 | 1271 | 1095 | 1124 | 1112 | 1193 | 1079 | 1020 | 929 | 787 | 66 | 1 |
> | Low-income units | 16409 | 36605 | 43463 | 41925 | 46753 | 42175 | 54742 | 62176 | 87592 | 86881 | 83405 | 88351 | 110718 | 102752 | 104804 | 110682 | 129550 | 130432 | 133119 | 135504 | 140341 | 115307 | 91645 | 89807 | 128276 | 113919 | 89220 | 88362 | 86906 | 97344 | 90305 | 90772 | 95364 | 97625 | 92639 | 93224 | 79391 | 62318 | 5678 | 81 |

## The datasets

- [Fair Market Rents](./rents/README.md), FY1983 to FY2027: 4764 places (3161 counties, 1603 New England towns), `### Rents:`, their rents by bedroom count as HUD set them: at the 40th percentile, or, for some costly areas in FY2001 to FY2019, the 50th, marked in each place's Areas.
- [Income Limits](./limits/README.md), FY1998 to FY2026: 4764 places as HUD lists them now and 16 it no longer lists, `### Limits:`, their median family income and limits by household size; and 125 county rows from before FY2006 that no place's record can hold (New England's, keyed by county then, and one Missouri county split in two), `### County before 2006:`; and 2 second listings of a county inside another area (Rockland and Westchester, NY, FY2006 to 2020), `### Second listing:`, each on its county's page.
- [Low-Income Housing Tax Credit projects](./lihtc/README.md), placed in service 1987 to 2024: 55345 projects in 2865 counties, `# Project:`, keyed by HUD's id: each its address, tracts, units by bedroom count, income ceiling and other help, and its county's five-digit FIPS.

Each dataset is written by its own importer, in `.import/rents/` (Python), `.import/limits/` and `.import/lihtc/` (Node); nothing here is edited by hand.

[Questions and answers](./FAQ.md): 33 questions a reader of this book can answer, from one rent in one place to what changed and why, each with its answer and the page to look in.

The questions and findings above, and those that open each state's rents page, are written by hand in `.import/reading.md`; their numbers are worked out from HUD's files at every release, never written in, and the same questions are asked again of the source in FAQ.md, so a page that has drifted from it stops the build.

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

`FIPS` is gathered as text in both, its leading zero kept (SPEC K2), so the join holds.

## Tax credit housing against rents

The counties with the dearest two-bedroom Fair Market Rent, FY2027, and the tax credit housing in each: the projects joined to the rents on the county's FIPS (its five digits and `99999`, the rents' key for a county).

```sql
select r.name, f."2027" as "Two-bedroom rent", count(p."HUD ID") as projects,
  sum(p."Low-income units") as "Low-income units"
from Rents r
join Rents_Fair_Market_Rents f on f.record = r.name and f.Bedrooms = 2
left join Project p on p."County FIPS" || '99999' = r.FIPS
where r.Level = 'County'
group by all order by "Two-bedroom rent" desc limit 10
```

## Changes

Where HUD changed a definition or a key during a dataset's years, the latest form is in the cards and the older only in tables of their own, never spliced. A setting HUD made place by place, on and off (the rents' 50th percentile, FY2001 to FY2019), is the value's own: the rents are in the card as set, the setting marked beside them, and its start and end are said as changes. Every change is a record, `### Change:`, in the dataset's Changes page ([rents](./rents/Changes.md), [limits](./limits/Changes.md), [tax credits](./lihtc/Changes.md)). A tax credit project is one record of one year, so nothing in it is split: its changes are said, and its columns read with them.

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
- Tax Credit Projects, 2004: Qualified census tracts on the 2000 tracts
- Tax Credit Projects, 2013: Qualified census tracts on the 2010 tracts
- Tax Credit Projects, 2015: HUD ID gains a digit
- Tax Credit Projects, 2018: Income averaging

## The source

HUD User, the Office of Policy Development and Research of the U.S. Department of Housing and Urban Development: <https://www.huduser.gov/portal/datasets/fmr.html> <https://www.huduser.gov/portal/datasets/il.html> and <https://www.huduser.gov/portal/datasets/lihtc/property.html>. HUD's data are a work of the United States Government, and so free of copyright in the United States (17 U.S.C. 105). This databook is not HUD's, nor endorsed by it.

## Licence

This book, its pages and its importer, is given to the public domain
under CC0 1.0 ([LICENSE](LICENSE)): copy it, change it and use it as you
like, without asking. Its sources are free of copyright too, as above;
citing them is still the courteous thing.
