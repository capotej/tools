# @capotej/tools

A personal CLI of subcommands for things I do commonly.

## Usage

```sh
npx @capotej/tools <command> [args]
```

### Commands

- `help` — Show available commands
- `version` — Print the installed version

## Development

```sh
pnpm install      # install dependencies
pnpm build        # compile src/ to dist/
pnpm test         # run tests
pnpm lint         # run the full lint suite (oxlint + markdownlint + actionlint)
pnpm format       # format in place
pnpm typecheck    # tsc --noEmit
```

Requires Node >= 24 and pnpm. Tool versions (Node, actionlint) are pinned in `mise.toml`.

## License

BSD-3-Clause
