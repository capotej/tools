#!/usr/bin/env node
import { commandsByName } from "./commands/index.js";
import { help } from "./commands/help.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const name = args[0];

  if (!name) {
    help.run([]);
    return;
  }

  const cmd = commandsByName.get(name);
  if (!cmd) {
    console.error(`Unknown command: ${name}`);
    console.error();
    help.run([]);
    process.exit(1);
  }

  await cmd.run(args.slice(1));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
