#!/bin/sh

set -ex

# "type": "module" upsert

jq '.type = "module"' package.json > tmp.json && mv tmp.json package.json

# "main" removal

jq 'del(.main)' package.json > tmp.json && mv tmp.json package.json

# New dev deps

yarn add -D @types/react@18.2.0 @types/react-dom@18.2.0 @types/three@0.144.0 vite@^5.3.1 @vitejs/plugin-react@^4.3.1 typescript@^5.5.2

# Remove scripts: start, build, test, eject

jq '.scripts += {"dev": "vite --host", "build": "tsc && vite build", "preview": "vite preview"}' package.json > tmp.json && mv tmp.json package.json

# TS config

## tsconfig.json

cat <<EOF >tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF


## tsconfig.node.json

cat <<EOF >tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Vite config

cat <<EOF >vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()]
})
EOF

cat <<EOF >src/vite-env.d.ts
/// <reference types="vite/client" />
EOF

# favicon

cat <<EOF >public/vite.svg
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
EOF

# index.html

rm public/index.html

rn() {
  if [ -f "$1" ]; then
    mv "$1" "$2"
  fi
}
# Rename .js to .jsx
rn src/index.js src/index.jsx
rn src/App.js src/App.jsx
# Rename .ts to .tsx
rn src/index.ts src/index.tsx
rn src/App.ts src/App.tsx

# Determine which src file to use in the script tag
if [ -f src/index.jsx ]; then
  src_file="/src/index.jsx"
elif [ -f src/index.tsx ]; then
  src_file="/src/index.tsx"
else
  echo "Neither src/index.jsx nor src/index.tsx found."
fi

cat <<EOF >index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="$src_file"></script>
  </body>
</html>
EOF

echo "donee"