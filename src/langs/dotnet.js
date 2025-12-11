/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { readdirSync } from "node:fs";

export const dotnetDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.includes(">=") ||
        version.startsWith("^") ||
        version.startsWith("~") ||
        version.includes(">") ||
        version.includes("<") ||
        version === "*"
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });

  const isTestProject = (filePath) => {
    const fileName = filePath.toLowerCase();
    return (
      fileName.includes(".test") ||
      fileName.includes(".tests") ||
      fileName.includes(".spec")
    );
  };

  const findCsprojFiles = (dir) => {
    const files = [];
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules") {
          files.push(...findCsprojFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith(".csproj")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
    }
    return files;
  };

  const packagesConfigPath = join(process.cwd(), "packages.config");
  const directoryBuildPropsPath = join(
    process.cwd(),
    "Directory.Build.props"
  );
  const csprojFiles = findCsprojFiles(process.cwd());

  let dependencies = [];
  let devDependencies = [];

  if (existsSync(packagesConfigPath)) {
    const packagesConfigFile = readFileSync(packagesConfigPath, "utf8");
    const packageMatches = [
      ...packagesConfigFile.matchAll(
        /<package\s+id="([^"]+)"\s+version="([^"]+)"[\s\S]*?\/>/g
      ),
    ];

    dependencies = packageMatches.map((match) => {
      const name = match[1].trim();
      const version = match[2].trim();
      return [name, version];
    });
  } else if (csprojFiles.length > 0) {
    for (const csprojPath of csprojFiles) {
      const csprojFile = readFileSync(csprojPath, "utf8");
      const isTest = isTestProject(csprojPath);
      const packageMatches = [
        ...csprojFile.matchAll(
          /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"([^>]*?)(?:\/>|>)/g
        ),
      ];

      for (const match of packageMatches) {
        const name = match[1].trim();
        const version = match[2].trim();
        const attributes = match[3] || "";
        const hasPrivateAssets = attributes.includes('PrivateAssets');

        if (isTest || hasPrivateAssets) {
          devDependencies.push([name, version]);
        } else {
          dependencies.push([name, version]);
        }
      }
    }
  } else if (existsSync(directoryBuildPropsPath)) {
    const directoryBuildPropsFile = readFileSync(
      directoryBuildPropsPath,
      "utf8"
    );
    const packageMatches = [
      ...directoryBuildPropsFile.matchAll(
        /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"([^>]*?)(?:\/>|>)/g
      ),
    ];

    dependencies = packageMatches.map((match) => {
      const name = match[1].trim();
      const version = match[2].trim();
      return [name, version];
    });
  } else {
    core.setFailed(
      `Package file not found. Checked for packages.config, Directory.Build.props, or .csproj files`
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

