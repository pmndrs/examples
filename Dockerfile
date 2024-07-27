FROM node:20-bookworm AS base

RUN npm i -g turbo@2

# ██████  ██████  ██    ██ ███    ██ ███████ ██████  
# ██   ██ ██   ██ ██    ██ ████   ██ ██      ██   ██ 
# ██████  ██████  ██    ██ ██ ██  ██ █████   ██████  
# ██      ██   ██ ██    ██ ██  ██ ██ ██      ██   ██ 
# ██      ██   ██  ██████  ██   ████ ███████ ██   ██ 
# see: https://turbo.build/repo/docs/handbook/deploying-with-docker#the-solution

FROM base AS pruner

RUN apt-get update && apt-get install -y jq

WORKDIR /app

COPY . .
RUN package_names=$(jq -r '.workspaces[]' package.json | xargs -I{} sh -c 'for d in {}; do [ -f "$d/package.json" ] && jq -r ".name" "$d/package.json"; done' | tr "\n" " ") \
  && npx turbo prune --docker --out-dir=pruned $package_names
RUN ls -al pruned

#
# /app/pruned
#
# ├── json (only pacakge.json files)
# │   ├── apps
# │   │   └── website
# │   │       └── package.json
# │   ├── demos
# │   │   ├── aquarium
# │   │   │   └── package.json
# │   │   ├── ...
# │   │   │   └── package.json
# │   │   └── zustand-site
# │   │       └── package.json
# │   ├── packages
# │   │   └── examples
# │   │       └── package.json
# │   └── package.json
# ├── full (all workspace files)
# │   ├── apps
# │   │   └── web
# │   │       ├── ...<other_files>
# │   │       └── package.json
# │   ├── demos
# │   │   ├── aquarium
# │   │   │   ├── ...<other_files>
# │   │   │   └── package.json
# │   │   ├── ...
# │   │   │   ├── ...<other_files>
# │   │   │   └── package.json
# │   │   └── zustand-site
# │   │       ├── ...<other_files>
# │   │       └── package.json
# │   ├── packages
# │   │   └── examples
# │   │       ├── ...<other_files>
# │   │       └── package.json
# │   ├── package.json
# │   └── turbo.json
# └── package-lock.json

# ██████  ██    ██ ██ ██      ██████  ███████ ██████  
# ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██ 
# ██████  ██    ██ ██ ██      ██   ██ █████   ██████  
# ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██ 
# ██████   ██████  ██ ███████ ██████  ███████ ██   ██ 
# Rebuild the source code only when needed

FROM base AS builder

WORKDIR /app

# node_modules
COPY --from=pruner /app/pruned/json/ .
COPY --from=pruner /app/pruned/package-lock.json ./package-lock.json
RUN npm ci
RUN npx -y playwright@1.45.3 install --with-deps

COPY --from=pruner /app/pruned/full/ .
RUN npm i --no-lockfile
RUN ls -al node_modules/.bin

