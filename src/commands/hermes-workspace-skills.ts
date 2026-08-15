import { existsSync } from "node:fs";
import { defineCommand } from "citty";
import {
  loadHermesConfig,
  resolveHermesConfigPath,
  saveHermesConfig,
} from "../utils/hermes-config.js";

// Where in-repo skills live; overridable for testing or unusual layouts.
const DEFAULT_DIR = "/workspace/.agents/skills";

export default defineCommand({
  meta: {
    name: "hermes-workspace-skills",
    description: "Merge skills.external_dirs into $HERMES_HOME/config.yaml",
  },
  args: {
    config: {
      type: "string",
      description: "Path to the Hermes config (default: $HERMES_HOME or ~/.hermes)/config.yaml",
    },
    dir: {
      type: "string",
      description: "Skills dir to register (default: /workspace/.agents/skills)",
    },
  },
  run({ args }) {
    const configPath = resolveHermesConfigPath(args.config);
    const dir = args.dir ?? DEFAULT_DIR;

    if (!existsSync(dir)) {
      console.error(`${dir}: does not exist — nothing to register`);
      process.exitCode = 1;
      return;
    }

    const existing = loadHermesConfig(configPath);
    if (!existing) {
      process.exitCode = 1;
      return;
    }

    const skills = (existing.skills ?? {}) as Record<string, unknown>;

    // Hermes accepts a scalar or a list for external_dirs; normalize to a
    // list, append if missing, and never duplicate. Idempotent: unchanged
    // configs are not rewritten.
    const raw = skills.external_dirs;
    const dirs: string[] =
      raw === undefined ? [] : typeof raw === "string" ? [raw] : (raw as string[]);

    if (dirs.includes(dir)) {
      console.log(`${configPath}: already up to date`);
      return;
    }

    dirs.push(dir);
    skills.external_dirs = dirs;
    existing.skills = skills;
    saveHermesConfig(configPath, existing);
    console.log(`${configPath}: registered ${dir}`);
  },
});
