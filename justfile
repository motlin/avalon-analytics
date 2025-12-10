# `just --list --unsorted`
default:
    @just --list --unsorted

# `pnpm install`
install:
    pnpm install

# `pnpm install --frozen-lockfile`
install-ci:
    pnpm install --frozen-lockfile

# `npm run generate`
generate: install
    npm run generate

# `npm run generate`
generate-ci: install-ci
    npm run generate

# Clean build artifacts and caches
clean:
    rm -rf dist .wrangler node_modules/.vite node_modules/.cache

# `npm run dev`
dev: install import-games-local
    npm run dev

# `npm run format`
lint: install
    npm run format

# `npm run ci:eslint`
lint-ci: install-ci
    npm run ci:eslint

# `npm run test:run`
test: install
    npm run test:run

# `npm run test:run`
test-ci: generate-ci
    npm run test:run

# `uv tool run pre-commit run --all-files`
hooks:
    uv tool run pre-commit run --all-files

# `op run -- npm run build`
build: install
    op run -- npm run build

# `RWSDK_DEPLOY=1 npm run build`
build-ci: generate-ci
    RWSDK_DEPLOY=1 npm run build

# `npm run format`
format: install
    npm run format

# `npm run ci:format`
format-ci: install-ci
    npm run ci:format

# `npm run ci:typecheck`
typecheck: install generate
    npm run ci:typecheck

# `npm run ci:typecheck`
typecheck-ci: install-ci generate-ci
    npm run ci:typecheck

# Run install, build, test, lint, and pre-commit hooks in sequence
precommit: generate lint format hooks typecheck build-ci test storybook-tests

# `npm run storybook`
storybook: install
    npm run storybook

# `npm run storybook:test`
storybook-tests: install
    npm run storybook:test

# `npx wrangler deploy --config dist/worker/wrangler.json`
deploy: build
    npx wrangler deploy --config dist/worker/wrangler.json

# `npx wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --remote`
migrate-remote:
    npx wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --remote

# `npx wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --local`
migrate-local:
    npx wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --local

# Build and deploy with migrations
deploy-full: build migrate-remote
    npx wrangler deploy --config dist/worker/wrangler.json

# Analyze predicate frequency across all historical games
analyze-predicates:
    npx tsx src/scripts/analyze-predicates.ts

# Import game files from local disk into remote D1 database
import-games *args: migrate-remote
    npx tsx src/scripts/import-games.ts {{ args }}

# Import game files from local disk into local D1 database
import-games-local *args: migrate-local
    npx tsx src/scripts/import-games.ts --local {{ args }}

# Ingest new games from Firestore into remote D1 database
ingest-firestore *args: migrate-remote
    npx tsx src/scripts/ingest-firestore.ts {{ args }}

# Ingest new games from Firestore into local D1 database
ingest-firestore-local *args: migrate-local
    npx tsx src/scripts/ingest-firestore.ts --local {{ args }}

# Populate PlayerGame table from existing games in remote D1 database
populate-player-games *args: migrate-remote
    npx tsx src/scripts/populate-player-games.ts {{ args }}
