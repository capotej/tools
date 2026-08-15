# Changelog

## [0.3.2] - 2026-08-14

### Summary

Adds `hermes-zai-config`, which merges the z.ai MCP server stanza
(`web-search-prime`, `web-reader`) into `$HERMES_HOME/config.yaml`
idempotently, keeping the `Bearer ${ZAI_API_KEY}` placeholder literal for
Hermes to interpolate at runtime. Run it with
`npx @capotej/tools hermes-zai-config`.

### Changes

- 0aef667 feat: add hermes-zai-config command
- 9df92bc release v0.3.2

## [0.3.1] - 2026-08-14

### Summary

`transcribe` now passes `--language English` to whisper (configurable via a
new `--language` flag), skipping language detection and pinning the
transcription language.

### Changes

- 903a19d feat: pass --language English to whisper
- e049955 release v0.3.1

## [0.3.0] - 2026-08-14

### Summary

First two real tools. `doctor` checks that mise, uv, and ffmpeg are
installed and working, reporting every failure with an install hint
(`npx @capotej/tools doctor`). `transcribe` records from the mic via ffmpeg
avfoundation and runs whisper on the result via uv, using a real temp dir
cleaned up on exit (`npx @capotej/tools transcribe`).

Also replaces the hand-rolled dispatcher with citty for argument parsing
and command routing, with lazy-loaded subcommands.

### Changes

- cc8a292 docs: update AGENTS.md for citty architecture and pnpm-workspace.yaml
- 4d41e24 refactor: replace hand-rolled dispatcher with citty
- 32d253d feat: add doctor and transcribe commands
- fb312d3 release v0.3.0

## [0.2.0] - 2026-08-14

### Summary

Publishing fixes: the scoped package is marked public for npm, and
provenance settings that broke manual publishing were dropped. The project
also gained cross-platform native binary support (TypeScript 7, oxlint,
oxfmt) via `pnpm-workspace.yaml` `supportedArchitectures`, so a single
committed lockfile serves macOS and Linux developers alike.

### Changes

- 9d189bc fix: support cross-platform native binaries (TS7, oxc) via .npmrc
- 4595c1e fix: use pnpm-workspace.yaml for supportedArchitectures (pnpm 11)
- 6291ef7 fix: mark scoped package as public for npm publishing
- 93fd78d fix: drop provenance from publishConfig (manual publish)
- 56ae83e release v0.2.0

## [0.1.0] - 2026-08-14

### Summary

Initial release of `@capotej/tools`, a personal CLI of subcommands built on
citty with strict TypeScript, pinned tooling (mise, pnpm, oxlint, oxfmt,
markdownlint, actionlint), and OIDC trusted publishing to npm.

### Changes

- 455bfb2 feat: bootstrap @capotej/tools CLI with patterns P002-P016
- 3f34216 release v0.1.0
