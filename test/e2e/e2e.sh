#!/bin/sh
set -ex

PORT=5188

kill_app() {
  kill -9 $(lsof -ti:$PORT) || echo "ok, no previous running process on port $PORT"
}

cleanup() {
  kill_app
}
cleanup || true
trap cleanup EXIT INT TERM HUP

if [ ! -d "out" ]; then
  echo "Missing out directory. Run 'npm run build' first."
  exit 1
fi
npx serve out -p $PORT &

npx playwright test snapshot.test.js


#
# Teardown
#

cleanup || true

echo "✅ e2e ok"
