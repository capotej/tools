import type { Command } from "../types.js";

export const help: Command = {
  name: "help",
  description: "Show available commands",
  run() {
    console.log(`@capotej/tools

Usage: npx @capotej/tools <command> [args]

Commands:
  help     Show this help message
  version  Print the installed version

Run "npx @capotej/tools <command> help" for command-specific help.`);
  },
};
