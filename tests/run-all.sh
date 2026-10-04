#!/bin/sh
# Tüm testler: birim (Code.gs, data.js, zaman.js) + uçtan uca (Playwright + Chromium).
set -e
cd "$(dirname "$0")/.."
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
node tests/test-gas.cjs
node tests/test-gas-edge.cjs
node tests/test-gas-salon.cjs
node tests/test-data.mjs
node tests/test-ref.mjs
node tests/test-duzen.mjs
node tests/test-salon.mjs
node tests/test-zaman.mjs
node tests/test-cekirdek.mjs
node tests/e2e-senaryolar.cjs
node tests/test-e2e.cjs
echo "TÜM TESTLER GEÇTİ"
