/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const phpDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.startsWith("^") ||
        version.startsWith("~") ||
        version.startsWith(">") ||
        version.startsWith("<") ||
        version === "*" ||
        version.includes("||") ||
        version.includes("-")
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });

  const composerPath = join(process.cwd(), "composer.json");

  if (!existsSync(composerPath)) {
    core.setFailed(`Package file not found at ${composerPath}`);
    process.exit(1);
  }

  const composerFile = readFileSync(composerPath, "utf8");
  const composerJson = JSON.parse(composerFile);

  const dependencies = composerJson.require || {};
  const devDependencies = composerJson["require-dev"] || {};

  const unpinnedDependencies = checkForUnpinned(
    Object.entries(dependencies)
  );
  const unpinnedDevDependencies = checkDevDependencies
    ? checkForUnpinned(Object.entries(devDependencies))
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

