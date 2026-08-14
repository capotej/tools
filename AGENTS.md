# @capotej/tools

A personal CLI of subcommands for things I do commonly. Run via `npx @capotej/tools`.

## Architecture

Single-binary TypeScript CLI (`tsc`-compiled, no babel/swc) built on **citty** for argument parsing and command dispatch. citty handles `--help`/`-h`, `--version`/`-v`, auto-generated usage, and subcommand routing.

- Entry point: `src/cli.ts` → `dist/cli.js` (the `bin` target). Uses `defineCommand` + `runMain` from citty.
- Commands live in `src/commands/`, each exports a citty `defineCommand` as default.
- Subcommands are **lazy-loaded** via dynamic `import()` in `src/cli.ts` so only the invoked command's code is parsed at runtime.
- Shared utilities live in `src/utils/` (e.g. `version.ts`, the package-version resolver used by both the root `--version` flag and the `version` subcommand).

### Adding a subcommand

1. Create `src/commands/<name>.ts` with a `defineCommand` default export.
2. Add a lazy entry to the `subCommands` map in `src/cli.ts`:

   ```ts
   mycmd: () => import("./commands/mycmd.js").then((m) => m.default),
   ```

3. Run `pnpm build` to verify. citty auto-discovers the new command for help output — no registry to edit.

## Package Manager

This project uses **pnpm**, declared via the `packageManager` field in `package.json`. Do not use npm or yarn.

- Install dependencies: `pnpm install`
- Add a dependency: `pnpm add <pkg>` (this updates `pnpm-lock.yaml`)
- Add a dev dependency: `pnpm add -D <pkg>`
- Run a script: `pnpm <script>` or `pnpm run <script>`
- Run a local binary: `pnpm exec <bin>` (e.g. `pnpm exec tsc --noEmit`)
- In CI or to enforce the lockfile: `pnpm install --frozen-lockfile`

The pnpm version is pinned in `package.json` (`"packageManager": "pnpm@11.21.0"`) and read automatically by corepack. Do not change it unless asked. `pnpm-lock.yaml` is committed and is the source of truth for the dependency tree; `.pnpm-store/` is a cache and is gitignored.

Project-level pnpm settings live in `pnpm-workspace.yaml` (in pnpm 11+, `.npmrc` only handles auth/registry — everything else goes here). It sets `supportedArchitectures` for `os: [current, darwin, linux]` and `cpu: [current, arm64, x64]` so the per-platform native binaries shipped as `optionalDependencies` (TypeScript 7, oxlint, oxfmt) are resolved for every developer OS and CI platform from the single committed lockfile. Without this, a lockfile generated on Linux is missing the darwin packages and `pnpm build` fails on macOS with `Unable to resolve @typescript/typescript-darwin-arm64`.

## Tool Versions

This project uses `mise.toml` as the single source of truth for all tool and language versions. Do not install tools globally or via ad-hoc commands — use mise instead.

- Activate mise before running commands: `eval "$(mise activate bash)"`
- Install all declared tools: `mise install`
- Run one-off commands with correct versions: `mise exec -- <command>`
- Run defined tasks: `mise run <task>`

If you change a tool version, update `mise.toml` and run `mise install` to apply.

## TypeScript

This project is written in TypeScript and compiled with `tsc` (no babel/swc). Configuration lives in `tsconfig.json`; `strict` mode is on — do not disable it or weaken individual strict flags.

- Build (compile + emit declarations): `pnpm build`
- Typecheck only, no emit: `pnpm typecheck` (runs `tsc --noEmit`)
- Source lives in `src/` and compiles to `dist/`; do not add TypeScript outside `src/`.

When adding a dependency, also add its `@types/*` package if the dependency doesn't ship its own types. When changing compiler options, keep `module` and `moduleResolution` consistent with each other, and do not lower `target` below what the runtime supports.

## Formatting

This project formats JS/TS/JSON with **oxfmt**. Do not introduce prettier, biome, or editor-specific config.

- Format in place: `pnpm format` (runs `oxfmt --write .`)
- Check only (CI gate): `pnpm format:check` (runs `oxfmt --check .`)

Configuration lives in `.oxfmtrc.jsonc`. `oxfmt` is installed as a pnpm devDependency; invoke it by bare name through pnpm. The config disables `experimentalSortPackageJson` to preserve `package.json` field order, and ignores the hand-curated `.jsonc` config files.

## Linting

This project lints JS/TS with **oxlint**. Do not introduce eslint, biome, or editor-specific config.

- Lint (CI gate): `pnpm lint` (runs the full lint suite)
- Auto-fix: `pnpm lint:fix`
- JS/TS only: `pnpm lint:ts` (runs `oxlint .`)

Configuration lives in `.oxlintrc.json`. `oxlint` is installed as a pnpm devDependency; invoke it by bare name through pnpm. The `correctness`, `suspicious`, and `perf` categories are all hard errors; suppress a specific rule only with an inline named reason, never by turning a category off.

## Markdown Linting

This project lints Markdown with **markdownlint-cli2**. Configuration lives in `.markdownlint-cli2.jsonc`.

- Lint all Markdown: `pnpm lint:md`
- Lint everything (Markdown + all other file types): `pnpm lint`

The config enables all default rules (`default: true`) and disables a few specific ones — each with an inline comment explaining why. Do not disable a rule to silence a violation; either fix the Markdown or, if the disable is genuinely justified, add it with a comment naming the concrete reason. Generated/vendored Markdown (`CHANGELOG.md`, `.claude/`, `.harness/`) is in the `ignores` array — add generated paths there rather than letting them fail lint.

## GitHub Actions Linting

This project lints `.github/workflows/*.yml` with **actionlint**. The tool is installed via mise (`"github:rhysd/actionlint" = "v1.7.7"` in `mise.toml`), not via pnpm — activate mise before running it. actionlint also runs shellcheck on every `run:` block, so workflow shell gets checked even though it's not in the repo's shell scripts.

Configuration lives in `.actionlint.yaml`. New workflow files are discovered automatically — no file arguments needed. When changing the actionlint version, update `mise.toml` first and the CI install step second.

## GitHub Actions

All third-party action references in `.github/workflows/` must be pinned to their full 40-character commit SHA with a version tag in a trailing comment:

```yaml
uses: owner/repo@<sha> # <tag>
```

Never use tag-only references (e.g. `actions/checkout@v5`). When adding or updating an action, resolve the tag to a SHA using `gh api repos/OWNER/REPO/commits/TAG --jq '.sha'`. Local composite actions (`./.github/actions/*`) are exempt.

## CI tool versions

CI installs its tools with `jdx/mise-action`, which reads `mise.toml` and puts every declared tool on PATH for the job. There are no per-tool `curl` or `setup-*` steps for mise-managed tools.

- To change a tool version in CI, change it in `mise.toml` and push — there is no separate CI version to update.
- The action is SHA-pinned with a version comment, like every other action (P002).
- Do not add a hand-rolled install step for a tool that is already in `mise.toml` — it becomes a second source of truth that drifts.

## Releases

Releases are tag-triggered and publish to npm via **OIDC trusted publishing** — there is no long-lived `NPM_TOKEN` secret in this repo.

- The release workflow is `.github/workflows/release.yml`, triggered by pushing a `v*` tag.
- npm trusted publishing requires the workflow filename registered on npmjs.com to match exactly (`release.yml`) and `package.json`'s `repository.url` to point at `capotej/tools`.
- The workflow needs `permissions: id-token: write` (for OIDC) and `setup-node` with `registry-url`. `npm publish` auto-detects the OIDC environment — no token, no `NODE_AUTH_TOKEN`. Provenance is generated automatically for public packages.
- Bump `version` in `package.json` by hand, commit, tag `v<version>`, and push the tag. Never use `npm version` (it commits and can fight the VCS workflow).
- The release is not complete until the `Release` workflow is fully green. Check with `gh run list --workflow=release.yml`.
