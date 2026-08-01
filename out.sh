#!/bin/sh

DST="out${BASE_PATH}"  # More descriptive name

rm -rf out

for example_path in examples/*; do
  example_name=$(basename "$example_path")

  vite_dist_dir="$example_path/dist"
  out_example_dir="$DST/$example_name"

  # Redirect stub: pre-#152 example pages lived at /demos/<name>. A 0s meta
  # refresh is treated as a permanent redirect by search engines; the script
  # additionally preserves query string and hash. No trailing slash on the
  # target: Next exports flat <name>.html files, so the slash form 404s on
  # GitHub Pages.
  redirect_path="${BASE_PATH}/examples/${example_name}"
  mkdir -p "$DST/demos/$example_name"
  cat > "$DST/demos/$example_name/index.html" <<EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${redirect_path}">
    <link rel="canonical" href="${BASE_URL}/examples/${example_name}">
    <script>location.replace("${redirect_path}" + location.search + location.hash)</script>
    <title>Redirecting to ${example_name}</title>
  </head>
  <body></body>
</html>
EOF
  echo "Wrote redirect stub $DST/demos/$example_name/index.html"

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

# Bare /demos never served a page pre-#152 (the grid was the home page), but
# it's a natural URL to trim to -- send it home.
cat > "$DST/demos/index.html" <<EOF
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${BASE_PATH}/">
    <link rel="canonical" href="${BASE_URL}/">
    <script>location.replace("${BASE_PATH}/" + location.search + location.hash)</script>
    <title>Redirecting to pmndrs examples</title>
  </head>
  <body></body>
</html>
EOF
echo "Wrote redirect stub $DST/demos/index.html"

cp -r apps/website/out/* "$DST/"
echo "Copied apps/website/out to $DST"
