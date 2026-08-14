import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// __dirname/__filename are reconstructed via fileURLToPath (Node ESM idiom),
// not author-chosen dangling-underscore names.
const __dirname = dirname(fileURLToPath(import.meta.url));

/** Resolve the package version from package.json at runtime. */
export function resolveVersion(): string {
  // dist/utils/version.js → project root is two levels up.
  const pkgPath = join(__dirname, "..", "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
  return pkg.version;
}
