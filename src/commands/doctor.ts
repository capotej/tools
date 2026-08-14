import { spawnSync } from "node:child_process";
import { defineCommand } from "citty";

const TOOLS = [
  { name: "mise", installUrl: "https://mise.jdx.dev/install.html" },
  { name: "uv", installUrl: "https://docs.astral.sh/uv/getting-started/installation/" },
  { name: "ffmpeg", installUrl: "https://ffmpeg.org/download.html" },
];

export default defineCommand({
  meta: {
    name: "doctor",
    description: "Check that required tools (mise, uv, ffmpeg) are installed",
  },
  run() {
    let ok = true;

    for (const tool of TOOLS) {
      // `<tool> --version` doubles as an existence and a health check:
      // ENOENT means not on PATH, a non-zero exit means broken.
      const result = spawnSync(tool.name, ["--version"], { encoding: "utf8" });

      if (result.error || result.status !== 0) {
        console.error(`${tool.name}: not found or not working`);
        console.error(`install it: ${tool.installUrl}`);
        ok = false;
        continue;
      }

      const version = result.stdout.trim().split("\n")[0] ?? "";
      console.log(`${tool.name}: ok (${version})`);
    }

    if (!ok) process.exitCode = 1;
  },
});
