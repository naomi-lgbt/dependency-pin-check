/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const pythonDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) => {
        const trimmed = version.trim();
        if (trimmed.startsWith("==")) {
          return false;
        }
        return (
          trimmed.includes(">=") ||
          trimmed.includes("~=") ||
          trimmed.includes(">") ||
          trimmed.includes("<") ||
          trimmed.includes("!=") ||
          trimmed === "*" ||
          trimmed === ""
        );
      }
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });

  const requirementsPath = join(process.cwd(), "requirements.txt");
  const requirementsDevPath = join(process.cwd(), "requirements-dev.txt");
  const pyprojectPath = join(process.cwd(), "pyproject.toml");

  let dependencies = [];
  let devDependencies = [];

  if (existsSync(requirementsPath)) {
    const requirementsFile = readFileSync(requirementsPath, "utf8");
    const lines = requirementsFile.split("\n");
    dependencies = lines
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-");
      })
      .map((line) => {
        const trimmed = line.trim();
        const match = trimmed.match(/^([a-zA-Z0-9_.-]+)(.*)$/);
        if (match) {
          const name = match[1];
          const version = match[2].trim();
          return [name, version];
        }
        return [trimmed, ""];
      });
  }

  if (existsSync(requirementsDevPath)) {
    const requirementsDevFile = readFileSync(requirementsDevPath, "utf8");
    const lines = requirementsDevFile.split("\n");
    devDependencies = lines
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-");
      })
      .map((line) => {
        const trimmed = line.trim();
        const match = trimmed.match(/^([a-zA-Z0-9_.-]+)(.*)$/);
        if (match) {
          const name = match[1];
          const version = match[2].trim();
          return [name, version];
        }
        return [trimmed, ""];
      });
  }

  if (existsSync(pyprojectPath)) {
    const pyprojectFile = readFileSync(pyprojectPath, "utf8");
    const lines = pyprojectFile.split("\n");
    let inDependencies = false;
    let inDevDependencies = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "[tool.poetry.dependencies]") {
        inDependencies = true;
        inDevDependencies = false;
      } else if (trimmed === "[tool.poetry.dev-dependencies]") {
        inDependencies = false;
        inDevDependencies = true;
      } else if (trimmed.startsWith("[")) {
        inDependencies = false;
        inDevDependencies = false;
      } else if (trimmed && !trimmed.startsWith("#") && (inDependencies || inDevDependencies)) {
        const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*=\s*(.+)$/);
        if (match) {
          const name = match[1];
          if (name === "python") {
            continue;
          }
          const version = match[2].replace(/^["']|["']$/g, "").trim();
          if (inDependencies) {
            dependencies.push([name, version]);
          } else if (inDevDependencies) {
            devDependencies.push([name, version]);
          }
        }
      }
    }
  }

  if (dependencies.length === 0 && devDependencies.length === 0) {
    core.setFailed(
      `Package file not found at ${requirementsPath}, ${requirementsDevPath}, or ${pyprojectPath}`
    );
    process.exit(1);
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

