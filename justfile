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
dev: install
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

# `npm run build`
build-ci: generate-ci
    npm run build

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
