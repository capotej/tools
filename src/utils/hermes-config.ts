import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { dump, load } from "js-yaml";

/** Resolve the Hermes config path: --config arg, $HERMES_HOME, or ~/.hermes. */
export function resolveHermesConfigPath(argOverride?: string): string {
  if (argOverride) return argOverride;
  const home = process.env.HERMES_HOME ?? join(homedir(), ".hermes");
  return join(home, "config.yaml");
}

/**
 * Load the Hermes config.yaml as a mutable object. A missing or empty file
 * yields an empty object, so callers can merge their keys in at the root and
 * let saveHermesConfig create the file on first write.
 */
export function loadHermesConfig(configPath: string): Record<string, unknown> {
  try {
    return (load(readFileSync(configPath, "utf8")) as Record<string, unknown> | null) ?? {};
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw err;
  }
}

/** Serialize the config back to YAML, preserving key order. */
export function saveHermesConfig(configPath: string, config: Record<string, unknown>): void {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, dump(config), "utf8");
}
