const { exec } = require('child_process');
const { promisify } = require('util');
const { stat } = require('fs/promises');
const { join } = require('path');
const asyncExec = promisify(exec);
(async () => {
    let failed = false;
    const { stdout } = await asyncExec(`find -iname 'package.json' -not -path '*/node_modules/*'`);
    const files = stdout.split('\n').filter(Boolean);
    console.log(files);
    for (const file of files) {
        const path = join(process.cwd(), file);
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
                    console.log(`::warning file=${file}::devDependencies ${key} version is not fixed: ${value}`);
                    failed = true;
                }
            }
        } else {
            console.log(`::notice file=${file}::No devDependencies found in ${file}`)
        }

        if (dependencies) {
            console.log(`Validating the following dependencies:`)

            for (const [key, value] of Object.entries(dependencies)) {
                console.log(`Checking ${key} - ${value}...`)
                if (/^\^/.test(value) || /^~/.test(value)) {
                    console.log(`::warning file=${file}::dependencies ${key} version is not fixed: ${value}`);
                    failed = true;
                }
            }
        } else {
            console.log(`::notice file=${file}::No dependencies found in ${file}`)
        }
    }
    if (failed) {
        console.log(`::error::Found unpinned dependencies~!`);
        process.exit(1);
    }
})();