import { defineCommand } from "citty";
import { resolveVersion } from "../utils/version.js";

export default defineCommand({
  meta: {
    name: "version",
    description: "Print the installed version",
  },
  run() {
    console.log(resolveVersion());
  },
});
