import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineCommand } from "citty";

// Live children so a Ctrl+C can be forwarded before we clean up.
const children: ChildProcess[] = [];
process.on("SIGINT", () => {
  for (const child of children) child.kill("SIGINT");
});

/** Run a command with inherited stdio; reject on failure or spawn error. */
function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    children.push(child);
    child.on("error", (err) => reject(new Error(`${cmd}: ${err.message}`)));
    child.on("close", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(signal ? `${cmd} killed by ${signal}` : `${cmd} exited with code ${code}`),
        );
    });
  });
}

export default defineCommand({
  meta: {
    name: "transcribe",
    description: "Record from the microphone and transcribe it with whisper",
  },
  args: {
    model: {
      type: "string",
      description: "Whisper model size",
      default: "large-v3",
    },
    device: {
      type: "string",
      description: "avfoundation audio device to record from",
      default: ":0",
    },
    language: {
      type: "string",
      description: "Spoken language in the recording (ISO 639-1, e.g. English)",
      default: "English",
    },
  },
  async run({ args }) {
    const dir = await mkdtemp(join(tmpdir(), "tools-transcribe-"));
    const recPath = join(dir, "rec.m4a");

    try {
      console.error(`recording to ${recPath} — press q in ffmpeg to stop`);
      await run("ffmpeg", ["-f", "avfoundation", "-i", args.device, recPath]);
      await run("uv", [
        "run",
        "--with",
        "openai-whisper",
        "whisper",
        recPath,
        "--model",
        args.model,
        "--language",
        args.language,
        // Keep transcript files out of the temp dir we delete below.
        "--output_dir",
        process.cwd(),
      ]);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
});
