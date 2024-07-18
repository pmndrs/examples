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

# build+start+playwright
npx serve out -p $PORT &
npx playwright test snapshot.test.js
kill_app

#
# Teardown
#

echo "✅ e2e ok"
