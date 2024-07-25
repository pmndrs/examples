#!/bin/bash

DST="out${BASE_PATH}"

for app in demos/*; do
  if [ -d "$app/dist" ]; then
    app_name=$(basename "$app")
    mkdir -p "$DST/$app_name"
    cp -r "$app/dist/"* "$DST/$app_name/"
    
    echo "Copied $app/dist to $DST/$app_name"
  fi
done

cp -r apps/website/out/* $DST/
echo "Copied apps/website/out to $DST"