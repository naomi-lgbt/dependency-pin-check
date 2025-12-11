/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const goDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.includes(">=") ||
        version.includes("^") ||
        version.includes("~") ||
        version.includes(">") ||
        version.includes("<") ||
        version === "latest"
    );
  };

  const goModPath = join(process.cwd(), "go.mod");

  if (!existsSync(goModPath)) {
    core.setFailed(`Package file not found at ${goModPath}`);
    process.exit(1);
  }

  const goModFile = readFileSync(goModPath, "utf8");
  const lines = goModFile.split("\n");

  const dependencies = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("require ")) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3) {
        const name = parts[1];
        const version = parts[2];
        dependencies.push([name, version]);
      }
    }
  }

  const unpinnedDependencies = checkForUnpinned(dependencies);

  const failures = {
    dependencies: unpinnedDependencies,
  };

  if (Object.values(failures).every((array) => array.length === 0)) {
    core.setOutput("success", true);
    process.exit(0);
  } else {
    core.setFailed(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
};

