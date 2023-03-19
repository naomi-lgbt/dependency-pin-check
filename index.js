const { stat } = require('fs/promises');
const { join } = require('path');
(async () => {
    let failed = false;
    const path = join(process.cwd(), 'package.json');
    const pathStat = await stat(path);
    if (!pathStat.isFile()) {
        console.log(`::error::No package.json found in ${process.cwd()}`);
        process.exit(1);
    }
    const packageJson = require(path);
    const { devDependencies, dependencies } = packageJson;

    if (devDependencies) {
        console.log(`Validating the following development dependencies:`)

        for (const [key, value] of Object.entries(devDependencies)) {
            console.log(`Checking ${key} - ${value}...`)
            if (/^\^/.test(value) || /^~/.test(value)) {
                console.log(`::warning::devDependencies ${key} version is not fixed: ${value}`);
                failed = true;
            }
        }
    } else {
        console.log(`::notice file=package.json::No devependencies found in package.json`)
    }

    if (dependencies) {
        console.log(`Validating the following dependencies:`)

        for (const [key, value] of Object.entries(dependencies)) {
            console.log(`Checking ${key} - ${value}...`)
            if (/^\^/.test(value) || /^~/.test(value)) {
                console.log(`::warning::dependencies ${key} version is not fixed: ${value}`);
                failed = true;
            }
        }
    } else {
        console.log(`::notice file=package.json::No dependencies found in package.json`)
    }

    if (failed) {
        console.log(`::error::Found unpinned dependencies~!`);
        process.exit(1);
    }
})();