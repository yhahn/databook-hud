#!/bin/sh
# Writes every page of databook-hud: each importer (limits, rents, tax credits) (its source's shape
# checked first; the limits first, as they write .import/incomes.json, which the
# rents' state pages set rent against), then the front page (its reading, SPEC R,
# from .import/reading.md), then FAQ.md (its answers from the
# source, SPEC B9); then plays every vector, and
# checks what proper gathers (target.sql; run it under crew run 6G).
#   sh .import/build.sh
set -e
cd "$(dirname "$0")/.."
node .import/limits/import.js
python3 -I .import/rents/import.py
node .import/lihtc/import.js
python3 -I .import/readme.py
node .import/faq.js
python3 -I -m unittest discover -s .import/rents -p 'test_*.py'
node --test .import/limits/import.test.js
node --test .import/lihtc/import.test.js
node --test .import/faq.test.js
python3 -I .import/target.py
