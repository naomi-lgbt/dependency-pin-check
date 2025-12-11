import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const javascriptDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.startsWith("^") ||
        version.startsWith("~") ||
        version.startsWith(">") ||
        version.startsWith("=")
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });
  const checkPeerDependencies = core.getBooleanInput("peer-dependencies", {
    required: true,
  });
  const checkOptionalDependencies = core.getBooleanInput(
    "optional-dependencies",
    { required: true }
  );

  const packageFilePath = join(process.cwd(), "package.json");

  if (!existsSync(packageFilePath)) {
    core.setFailed(`Package file not found at ${packageFilePath}`);
    process.exit(1);
  }

  const packageFile = readFileSync(packageFilePath, "utf8");
  const packageJson = JSON.parse(packageFile);

  const dependencies = packageJson.dependencies;
  const devDependencies = packageJson.devDependencies;
  const peerDependencies = packageJson.peerDependencies;
  const optionalDependencies = packageJson.optionalDependencies;

  const unpinnedDependencies = dependencies
    ? checkForUnpinned(Object.entries(dependencies))
    : [];
  const unpinnedDevDependencies = devDependencies
    ? checkForUnpinned(Object.entries(devDependencies))
    : [];
  const unpinnedPeerDependencies = peerDependencies
    ? checkForUnpinned(Object.entries(peerDependencies))
    : [];
  const unpinnedOptionalDependencies = optionalDependencies
    ? checkForUnpinned(Object.entries(optionalDependencies))
    : [];

  const failures = {
    dependencies: unpinnedDependencies,
    devDependencies: unpinnedDevDependencies,
    peerDependencies: unpinnedPeerDependencies,
    optionalDependencies: unpinnedOptionalDependencies,
  };

  if (!checkDevDependencies) {
    delete failures.devDependencies;
  }

  if (!checkPeerDependencies) {
    delete failures.peerDependencies;
  }

  if (!checkOptionalDependencies) {
    delete failures.optionalDependencies;
  }

  if (Object.values(failures).every((array) => array.length === 0)) {
    core.setOutput("success", true);
    process.exit(0);
  } else {
    core.setFailed(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
};
