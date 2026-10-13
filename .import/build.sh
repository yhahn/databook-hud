#!/bin/sh
# Writes every page of databook-hud: each importer (rents, limits, tax credits) (its source's shape
# checked first), then the front page; then plays every vector, and
# checks what proper gathers (target.sql; run it under crew run 6G).
#   sh .import/build.sh
set -e
cd "$(dirname "$0")/.."
python3 -I .import/rents/import.py
node .import/limits/import.js
node .import/lihtc/import.js
python3 -I .import/readme.py
python3 -I -m unittest discover -s .import/rents -p 'test_*.py'
node --test .import/limits/import.test.js
node --test .import/lihtc/import.test.js
python3 -I .import/target.py
