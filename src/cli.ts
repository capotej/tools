#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { resolveVersion } from "./utils/version.js";

// The root command. citty handles --help/-h and --version/-v automatically.
//
// To add a new subcommand:
//   1. Create src/commands/<name>.ts exporting a citty defineCommand as default
//   2. Add a lazy entry to subCommands below
// The lazy import keeps large commands out of the initial load.
const main = defineCommand({
  meta: {
    name: "@capotej/tools",
    version: resolveVersion(),
    description: "A personal CLI of subcommands for things I do commonly.",
  },
  subCommands: {
    version: () => import("./commands/version.js").then((m) => m.default),
    doctor: () => import("./commands/doctor.js").then((m) => m.default),
    transcribe: () => import("./commands/transcribe.js").then((m) => m.default),
  },
});

runMain(main);
