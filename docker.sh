#!/bin/sh

set -ex

# Check if BASE_PATH is set and prepare the argument
BASE_PATH_ARG=""
if [ -n "$BASE_PATH" ]; then
  BASE_PATH_ARG="-e BASE_PATH=$BASE_PATH"
fi

# Check for the --update flag
UPDATE_FLAG=""
if [ "$1" = "--update" ]; then
  UPDATE_FLAG="-- -- --update-snapshots"
fi

docker run -it --rm --init -v "$(pwd)":/app -w /app $BASE_PATH_ARG node:20-bookworm /bin/bash -c "npm install && npx -y playwright@1.45.3 install --with-deps chromium && npm run test $UPDATE_FLAG"
