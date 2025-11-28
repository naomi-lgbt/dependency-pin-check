import core from "@actions/core";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const checkForUnpinned = (dependencies) => {
    return dependencies.filter(([_name, version]) => version.startsWith("^") || version.startsWith("~") || version.startsWith(">") || version.startsWith("="));
}

const checkDevDependencies = core.getBooleanInput("dev-dependencies", { required: true });
const checkPeerDependencies = core.getBooleanInput("peer-dependencies", { required: true });
const checkOptionalDependencies = core.getBooleanInput("optional-dependencies", { required: true });

const packageFile = readFileSync(join(process.cwd(), "package.json"), "utf8");
const packageJson = JSON.parse(packageFile);

const dependencies = packageJson.dependencies;
const devDependencies = packageJson.devDependencies;
const peerDependencies = packageJson.peerDependencies;
const optionalDependencies = packageJson.optionalDependencies;

const unpinnedDependencies = checkForUnpinned(Object.entries(dependencies));
const unpinnedDevDependencies = checkForUnpinned(Object.entries(devDependencies));
const unpinnedPeerDependencies = checkForUnpinned(Object.entries(peerDependencies));
const unpinnedOptionalDependencies = checkForUnpinned(Object.entries(optionalDependencies));

const failures = {
    dependencies: unpinnedDependencies,
    devDependencies: unpinnedDevDependencies,
    peerDependencies: unpinnedPeerDependencies,
    optionalDependencies: unpinnedOptionalDependencies,
}

if (!checkDevDependencies) {
    delete failures.devDependencies;
}

if (!checkPeerDependencies) {
    delete failures.peerDependencies;
}

if (!checkOptionalDependencies) {
    delete failures.optionalDependencies;
}

if (Object.values(failures).every(array => array.length === 0)) {
    core.setSuccess("Found no unpinned dependencies in configured categories.")
} else {
    core.setFailed(JSON.stringify(failures, null, 2));
}
