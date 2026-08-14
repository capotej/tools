import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Command } from "../types.js";

// __dirname/__filename are reconstructed via fileURLToPath (Node ESM idiom),
// not author-chosen dangling-underscore names.
const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveVersion(): string {
  // dist/commands/version.js → project root is two levels up.
  const pkgPath = join(__dirname, "..", "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
  return pkg.version;
}

export const version: Command = {
  name: "version",
  description: "Print the installed version",
  run() {
    console.log(resolveVersion());
  },
};
