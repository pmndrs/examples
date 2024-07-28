#!/bin/sh

set -ex

UPDATE_FLAG=""
if [ "$1" = "--update" ]; then
  UPDATE_FLAG="-- -- --update-snapshots"
fi

npm install
npm test $UPDATE_FLAG

echo 'ok' || echo 'failed'