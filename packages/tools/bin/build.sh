#!/bin/sh

# Extract the project name from package.json
NAME=$1
if [ -z "$NAME" ]; then
  echo "Please provide the app name as the first argument."
  exit 1
fi

# Get the base path from the command line arguments
# BASE=""
# for arg in "$@"; do
#   case $arg in
#     --base=*)
#       BASE="${arg#*=}"
#       shift
#       ;;
#   esac
# done

vite build --base="/examples/$NAME"