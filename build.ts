import { promises as fs } from "fs";
import { parseArgs } from "util";
import { glob } from "glob";

import path from 'path';
import chalk from 'chalk';
import cpy from 'cpy';

console.clear();
console.log(chalk.green('Bulding web app ...'));

const args = parseArgs({
    args: Bun.argv,
    options: {
        serve: {
            type: 'boolean',
            short: 's'
        },
        dry: {
            type: 'boolean',
            short: 'd'
        }
    },
    strict: true,
    allowPositionals: true
}).values;

if (args.dry) printDryHint('Activated');

await cleanUp(async () => {
    if (args.serve) {
        await buildDev();
        await copyStaticFilesToDist();
    } 
    else {
        await buildProd();
        await copyStaticFilesToDist();

        console.log();
        
        await cpy('dist/**/*', 'docs')
        .on('progress', progress => console.log(chalk.blue(`Publishing ${progress.sourcePath} to ${progress.destinationPath}`)));;
    }

    console.log();
});

async function cleanUp(done: Function): Promise<void> {
    await clearDirectory('dist');
    await clearDirectory('docs');

    done();
}

async function buildDev(): Promise<void> {
    console.log(chalk.green('Starting Live Server ...'));

    if (args.dry)
        printDryHint('[COMMAND] bun --outfile=dist/index.js --target=browser --sourcemap=inline --watch build src/main.ts');
    else
        await Bun.$`bun --outfile=dist/index.js --target=browser --sourcemap=inline --watch build src/main.ts`;

    console.log();
}

async function buildProd(): Promise<void> {
    console.log(chalk.green('Publishing ...'));

    if (args.dry)
        printDryHint('[COMMAND] bun --outfile=dist/index.js --target=browser --minify build src/main.ts');
    else
        await Bun.$`bun --outfile=dist/index.js --target=browser --minify build src/main.ts`;

    console.log();
}

async function clearDirectory(directory: string): Promise<void> {
    const dir = path.join(__dirname, directory);

    try {
        const files = await fs.readdir(dir);

        files.forEach(async (next) => {
            const filePath = path.join(dir, next);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory())
                if (args.dry)
                    printDryHint(`Deleting directory ${filePath}`);
                else
                    await fs.rm(filePath, { recursive: true, force: true });
            else
                if (args.dry)
                    printDryHint(`Deleting file ${filePath}`);
                else
                    await fs.unlink(filePath);
        })
    } catch (error) {
        console.error(error);
    }
}

async function copyStaticFilesToDist(): Promise<void> {
    await cpy('src/**/*.html', 'dist')
    .on('progress', progress => console.log(chalk.blue(`Copying ${progress.sourcePath} to ${progress.destinationPath}`)));

    await cpy('src/public/**/*', 'dist')
    .on('progress', progress => console.log(chalk.blue(`Copying ${progress.sourcePath} to ${progress.destinationPath}`)));;
}

function printDryHint(message: string): void {
    console.log(chalk.blue(`[DRY RUN] ${message}`));
}