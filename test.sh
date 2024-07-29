#!/bin/sh

set -ex

UPDATE_FLAG=""
if [ "$1" = "--update" ]; then
  UPDATE_FLAG="-- -- --update-snapshots"
fi


docker run --rm  \
  -w /app -v "$(pwd)":/app \
  -e BASE_PATH \
  ghcr.io/pmndrs/playwright:main sh -c "npm i && npm test $UPDATE_FLAG" && echo "ok" || echo "failed"