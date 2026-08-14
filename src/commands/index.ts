import type { Command } from "../types.js";
import { help } from "./help.js";
import { version } from "./version.js";

// The command registry. Add a new subcommand by implementing the Command
// interface and appending it here — the dispatcher picks it up automatically.
export const commands: Command[] = [help, version];

export const commandsByName: Map<string, Command> = new Map(commands.map((cmd) => [cmd.name, cmd]));
