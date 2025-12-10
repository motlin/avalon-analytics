# `just --list --unsorted`
default:
    @just --list --unsorted

# `pnpm install`
install:
    pnpm install

# `pnpm install --frozen-lockfile`
install-ci:
    pnpm install --frozen-lockfile

# `pnpm run generate`
generate: install
    pnpm run generate

# `pnpm run generate`
generate-ci: install-ci
    pnpm run generate

# Clean build artifacts and caches
clean:
    rm -rf dist .wrangler node_modules/.vite node_modules/.cache

# `pnpm run dev`
dev: install import-games-local
    pnpm run dev

# `pnpm run format`
lint: install
    pnpm run format

# `pnpm run ci:eslint`
lint-ci: install-ci
    pnpm run ci:eslint

# `pnpm run test:run`
test: install
    pnpm run test:run

# `pnpm run test:run`
test-ci: generate-ci
    pnpm run test:run

# `uv tool run pre-commit run --all-files`
hooks:
    uv tool run pre-commit run --all-files

# `pnpm run build`
build: install
    pnpm run build

# `pnpm run build`
build-ci: install-ci
    pnpm run build

# `pnpm run format`
format: install
    pnpm run format

# `pnpm run ci:format`
format-ci: install-ci
    pnpm run ci:format

# `pnpm run ci:typecheck`
typecheck: install generate
    pnpm run ci:typecheck

# `pnpm run ci:typecheck`
typecheck-ci: install-ci generate-ci
    pnpm run ci:typecheck

# Run install, build, test, lint, and pre-commit hooks in sequence
precommit: generate lint format hooks typecheck build-ci test storybook-tests

# `pnpm run storybook`
storybook: install
    pnpm run storybook

# `pnpm run storybook:test`
storybook-tests: install
    pnpm run storybook:test

# `pnpm exec wrangler deploy --config dist/worker/wrangler.json`
deploy: build
    pnpm exec wrangler deploy --config dist/worker/wrangler.json

# `pnpm exec wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --remote`
migrate-remote:
    pnpm exec wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --remote

# `pnpm exec wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --local`
migrate-local:
    pnpm exec wrangler d1 migrations apply avalon-analytics-juicy-tyrannosaurus --local

# Build and deploy with migrations
deploy-full: build migrate-remote
    pnpm exec wrangler deploy --config dist/worker/wrangler.json

# Analyze predicate frequency across all historical games
analyze-predicates:
    pnpm exec tsx src/scripts/analyze-predicates.ts

# Import game files from local disk into remote D1 database
import-games *args: migrate-remote
    pnpm exec tsx src/scripts/import-games.ts {{ args }}

# Import game files from local disk into local D1 database
import-games-local *args: migrate-local
    pnpm exec tsx src/scripts/import-games.ts --local {{ args }}

# Ingest new games from Firestore into remote D1 database
ingest-firestore *args: migrate-remote
    pnpm exec tsx src/scripts/ingest-firestore.ts {{ args }}

# Ingest new games from Firestore into local D1 database
ingest-firestore-local *args: migrate-local
    pnpm exec tsx src/scripts/ingest-firestore.ts --local {{ args }}
