#!/bin/sh

DST="out${BASE_PATH}"  # More descriptive name

rm -rf out

for example_path in examples/*; do
  example_name=$(basename "$example_path")

  vite_dist_dir="$example_path/dist"
  out_example_dir="$DST/$example_name"

  if [ -d "$vite_dist_dir" ]; then
    mkdir -p "$out_example_dir"
    cp -r "$vite_dist_dir"/* "$out_example_dir"
    
    thumbnail_file=$(find "$example_path" -name 'thumbnail.webp' -print -quit)  # Lower case for local variable
    snapshot_file=$(find packages/e2e/snapshot.test.js-snapshots -name "${example_name}-*-linux.png" -print -quit)  # Lower case for local variable
    
    if [ -n "$snapshot_file" ]; then
      cp "$snapshot_file" "$out_example_dir/thumbnail.webp"
      echo "Copied snapshot_file $snapshot_file to $out_example_dir"
    elif [ -n "$thumbnail_file" ]; then
      cp "$thumbnail_file" "$out_example_dir/thumbnail.webp"
      echo "Copied thumbnail_file $thumbnail_file to $out_example_dir"
    fi
    
    echo "Copied $vite_dist_dir to $out_example_dir"
  fi
done

cp -r apps/website/out/* "$DST/"
echo "Copied apps/website/out to $DST"
