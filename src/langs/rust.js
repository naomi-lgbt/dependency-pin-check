/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const rustDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.startsWith("^") ||
        version.startsWith("~") ||
        version.startsWith(">") ||
        version.startsWith("<") ||
        version === "*" ||
        version.includes("||")
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });

  const cargoPath = join(process.cwd(), "Cargo.toml");

  if (!existsSync(cargoPath)) {
    core.setFailed(`Package file not found at ${cargoPath}`);
    process.exit(1);
  }

  const cargoFile = readFileSync(cargoPath, "utf8");
  const lines = cargoFile.split("\n");

  const dependencies = [];
  const devDependencies = [];
  let inDependencies = false;
  let inDevDependencies = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "[dependencies]") {
      inDependencies = true;
      inDevDependencies = false;
    } else if (trimmed === "[dev-dependencies]") {
      inDependencies = false;
      inDevDependencies = true;
    } else if (trimmed.startsWith("[")) {
      inDependencies = false;
      inDevDependencies = false;
    } else if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
      if (match) {
        const name = match[1];
        const version = match[2].replace(/^["']|["']$/g, "").trim();
        if (inDependencies) {
          dependencies.push([name, version]);
        } else if (inDevDependencies) {
          devDependencies.push([name, version]);
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

