# @capotej/tools

A personal CLI of subcommands for things I do commonly.

## Usage

```sh
npx @capotej/tools <command> [args]
```

## Tools

| Tool                                                                   | Description                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`doctor`](./src/commands/doctor.ts)                                   | Check that required tools (mise, uv, ffmpeg) are installed       |
| [`transcribe`](./src/commands/transcribe.ts)                           | Record from the microphone and transcribe it with whisper        |
| [`hermes-zai-config`](./src/commands/hermes-zai-config.ts)             | Merge the z.ai MCP server stanza into `$HERMES_HOME/config.yaml` |
| [`hermes-workspace-skills`](./src/commands/hermes-workspace-skills.ts) | Register the workspace `.agents/skills` dir in Hermes config     |
| [`version`](./src/commands/version.ts)                                 | Print the installed version                                      |

## Development

```sh
pnpm install      # install dependencies
pnpm build        # compile src/ to dist/
pnpm lint         # run the full lint suite (oxlint + markdownlint + actionlint)
pnpm format       # format in place
pnpm typecheck    # tsc --noEmit
```

Requires Node >= 24 and pnpm. Tool versions (Node, actionlint) are pinned in `mise.toml`.

## License

BSD-3-Clause
