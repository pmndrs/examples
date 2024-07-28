#!/bin/sh

set -ex

# Check if BASE_PATH is set and prepare the argument
BASE_PATH_ARG=""
if [ -n "$BASE_PATH" ]; then
  BASE_PATH_ARG="-e BASE_PATH=$BASE_PATH"
fi

UPDATE_FLAG=""
if [ "$1" = "--update" ]; then
  UPDATE_FLAG="--update"
fi

docker run --rm -v "$(pwd)":/app -w /app $BASE_PATH_ARG ghcr.io/pmndrs/playwright:main sh -c "./test.sh $UPDATE_FLAG"