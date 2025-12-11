/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const rubyDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.includes("~>") ||
        version.includes(">=") ||
        version.includes(">") ||
        version.includes("<") ||
        version === "*" ||
        version.trim() === ""
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });

  const gemfilePath = join(process.cwd(), "Gemfile");

  if (!existsSync(gemfilePath)) {
    core.setFailed(`Package file not found at ${gemfilePath}`);
    process.exit(1);
  }

  const gemfile = readFileSync(gemfilePath, "utf8");
  const lines = gemfile.split("\n");

  const dependencies = [];
  const devDependencies = [];
  let inGroup = false;
  let isDevGroup = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("group")) {
      inGroup = true;
      isDevGroup =
        trimmed.includes(":development") ||
        trimmed.includes(":test") ||
        trimmed.includes(":development, :test");
    } else if (trimmed === "end") {
      inGroup = false;
      isDevGroup = false;
    } else if (trimmed.startsWith("gem ")) {
      const match = trimmed.match(/gem\s+['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/);
      if (match) {
        const name = match[1];
        const version = match[2] || "";
        if (inGroup && isDevGroup) {
          devDependencies.push([name, version]);
        } else {
          dependencies.push([name, version]);
        }
      }
    }
  }

  const unpinnedDependencies = checkForUnpinned(dependencies);
  const unpinnedDevDependencies = checkDevDependencies
    ? checkForUnpinned(devDependencies)
    : [];

  const failures = {
    dependencies: unpinnedDependencies,
  };

  if (checkDevDependencies) {
    failures.devDependencies = unpinnedDevDependencies;
  }

  if (Object.values(failures).every((array) => array.length === 0)) {
    core.setOutput("success", true);
    process.exit(0);
  } else {
    core.setFailed(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
};

