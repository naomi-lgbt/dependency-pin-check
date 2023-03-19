const { join } = require('path');
(async () => {
    let failed = false;
    const path = join(process.cwd(), 'package.json');
    const packageJson = require(path);
    const { devDependencies, dependencies } = packageJson;

    console.log(`Validating the following development dependencies:`)

    for (const [key, value] of Object.entries(devDependencies)) {
        console.log(`Checking ${key} - ${value}...`)
        if (/^\^/.test(value) || /^~/.test(value)) {
            console.log(`::warning::devDependencies ${key} version is not fixed: ${value}`);
            failed = true;
        }
    }

    console.log(`Validating the following dependencies:`)

    for (const [key, value] of Object.entries(dependencies)) {
        console.log(`Checking ${key} - ${value}...`)
        if (/^\^/.test(value) || /^~/.test(value)) {
            console.log(`::warning::dependencies ${key} version is not fixed: ${value}`);
            failed = true;
        }
    }

    if (failed) {
        console.log(`::error::Found unpinned dependencies~!`);
        process.exit(1);
    }
})();