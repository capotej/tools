import { defineCommand } from "citty";
import {
  loadHermesConfig,
  resolveHermesConfigPath,
  saveHermesConfig,
} from "../utils/hermes-config.js";

// ${ZAI_API_KEY} is a literal Hermes-side interpolation placeholder — the
// template below must not accidentally expand it.
const STANZA = {
  "web-search-prime": {
    type: "streamable-http",
    url: "https://api.z.ai/api/mcp/web_search_prime/mcp",
    headers: { Authorization: "Bearer ${ZAI_API_KEY}" },
  },
  "web-reader": {
    type: "streamable-http",
    url: "https://api.z.ai/api/mcp/web_reader/mcp",
    headers: { Authorization: "Bearer ${ZAI_API_KEY}" },
  },
} as const;

export default defineCommand({
  meta: {
    name: "hermes-zai-config",
    description: "Merge the z.ai MCP server stanza into $HERMES_HOME/config.yaml",
  },
  args: {
    config: {
      type: "string",
      description: "Path to the Hermes config (default: $HERMES_HOME or ~/.hermes)/config.yaml",
    },
  },
  run({ args }) {
    const configPath = resolveHermesConfigPath(args.config);

    const existing = loadHermesConfig(configPath);
    if (!existing) {
      process.exitCode = 1;
      return;
    }

    const servers = (existing.mcp_servers ?? {}) as Record<string, unknown>;

    // Idempotent merge: only rewrite when something actually changes, and
    // deep-merge so pre-existing keys on these servers are preserved.
    let changed = false;
    for (const [name, def] of Object.entries(STANZA)) {
      const prev = servers[name];
      const next = { ...(prev as object), ...def };
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        servers[name] = next;
        changed = true;
      }
    }

    if (!changed) {
      console.log(`${configPath}: already up to date`);
      return;
    }

    existing.mcp_servers = servers;
    saveHermesConfig(configPath, existing);
    console.log(`${configPath}: merged z.ai MCP servers`);
  },
});
