#!/bin/sh

DST="out${BASE_PATH}"  # More descriptive name

rm -rf out

for demo_path in demos/*; do
  demo_name=$(basename "$demo_path")

  vite_dist_dir="$demo_path/dist"
  out_demo_dir="$DST/$demo_name"

  if [ -d "$vite_dist_dir" ]; then
    mkdir -p "$out_demo_dir"
    cp -r "$vite_dist_dir"/* "$out_demo_dir"
    
    thumbnail_file=$(find "$demo_path" -name 'thumbnail.png' -print -quit)  # Lower case for local variable
    snapshot_file=$(find packages/e2e/snapshot.test.js-snapshots -name "${demo_name}-*-linux.png" -print -quit)  # Lower case for local variable
    
    if [ -n "$snapshot_file" ]; then
      cp "$snapshot_file" "$out_demo_dir/thumbnail.png"
      echo "Copied snapshot_file $snapshot_file to $out_demo_dir"
    elif [ -n "$thumbnail_file" ]; then
      cp "$thumbnail_file" "$out_demo_dir/thumbnail.png"
      echo "Copied thumbnail_file $thumbnail_file to $out_demo_dir"
    fi
    
    echo "Copied $vite_dist_dir to $out_demo_dir"
  fi
done

cp -r apps/website/out/* "$DST/"
echo "Copied apps/website/out to $DST"
