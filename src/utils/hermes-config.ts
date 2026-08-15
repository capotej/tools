import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { dump, load } from "js-yaml";

/** Resolve the Hermes config path: --config arg, $HERMES_HOME, or ~/.hermes. */
export function resolveHermesConfigPath(argOverride?: string): string {
  if (argOverride) return argOverride;
  const home = process.env.HERMES_HOME ?? join(homedir(), ".hermes");
  return join(home, "config.yaml");
}

/**
 * Load the Hermes config.yaml as a mutable object.
 * Returns null (and prints an error) when the file doesn't exist yet.
 */
export function loadHermesConfig(configPath: string): Record<string, unknown> | null {
  try {
    return load(readFileSync(configPath, "utf8")) as Record<string, unknown>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`${configPath}: not found — run Hermes once first or pass --config`);
      return null;
    }
    throw err;
  }
}

/** Serialize the config back to YAML, preserving key order. */
export function saveHermesConfig(configPath: string, config: Record<string, unknown>): void {
  writeFileSync(configPath, dump(config), "utf8");
}
