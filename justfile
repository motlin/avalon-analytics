# `just --list --unsorted`
default:
    @just --list --unsorted

# `pnpm install`
install:
    pnpm install

# `pnpm install --frozen-lockfile`
install-ci:
    pnpm install --frozen-lockfile

# `npm run route:generate`
route-generate: install
    npm run route:generate

# `npm run route:generate`
route-generate-ci: install-ci
    npm run route:generate

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
test-ci: install-ci
    npm run generate
    npm run test:run

# `uv tool run pre-commit run --all-files`
hooks:
    uv tool run pre-commit run --all-files

# `op run -- npm run build`
build: install
    op run -- npm run build

# `npm run build`
build-ci: install-ci
    npm run build


# `npm run format`
format: install
    npm run format

# `npm run ci:format`
format-ci: install-ci
    npm run ci:format

# `npm run ci:typecheck`
typecheck-ci: install-ci
    npm run generate
    npm run ci:typecheck

# Run install, build, test, lint, and pre-commit hooks in sequence
precommit: lint format hooks build test
