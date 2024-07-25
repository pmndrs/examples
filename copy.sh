#!/bin/bash

DST="out/examples"

for app in demos/*; do
  if [ -d "$app/dist" ]; then
    app_name=$(basename "$app")
    mkdir -p "$DST/$app_name"
    cp -r "$app/dist/"* "$DST/$app_name/"
    
    echo "Copied $app/dist to $DST/$app_name"
  fi
done